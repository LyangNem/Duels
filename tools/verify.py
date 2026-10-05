"""Regression checks for the initial split: HTML structure, resource bytes, rules and load graph."""
from html.parser import HTMLParser
from pathlib import Path
import json,hashlib,sys,re
from project import ROOT,manifest,assemble,inventory

def sha(text):return hashlib.sha256(text.encode('utf-8')).hexdigest()
class Document(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=False);self.text=text;self.tokens=[];self.blocks=[];self.active=None
  self.offsets=[0]+[i+1 for i,c in enumerate(text) if c=='\n'];self.feed(text);self.close()
 def position(self):
  line,col=self.getpos();return self.offsets[line-1]+col
 def handle_starttag(self,tag,attrs):
  self.tokens.append(['start',tag,sorted(attrs)])
  if tag in ('style','script'):self.active=(tag,attrs,self.position(),self.position()+len(self.get_starttag_text()))
 def handle_startendtag(self,tag,attrs):self.tokens.append(['empty',tag,sorted(attrs)])
 def handle_endtag(self,tag):
  self.tokens.append(['end',tag])
  if self.active and tag==self.active[0]:
   t,a,start,body=self.active;end=self.position();self.blocks.append({'tag':t,'attrs':a,'start':start,'body':self.text[body:end],'end':self.text.index('>',end)+1});self.active=None
 def handle_data(self,data):
  if not data.strip():return
  if self.active:self.tokens.append(['text',data]);return
  data=re.sub(r'\s+',' ',data).strip()
  if self.tokens and self.tokens[-1][0]=='text':self.tokens[-1][1]+=' '+data
  else:self.tokens.append(['text',data])
 def handle_decl(self,decl):self.tokens.append(['decl',decl])
 def handle_entityref(self,name):self.tokens.append(['entity',name])
 def handle_charref(self,name):self.tokens.append(['char',name])

def document_hash(text):return sha(json.dumps(Document(text).tokens,ensure_ascii=False,separators=(',',':')))

def layout_hash(text):
 # Compare markup/content separately from script/style bodies, checked by resource hashes.
 tokens=[];raw=False
 for token in Document(text).tokens:
  if token[0]=='start' and token[1] in ('script','style'):raw=True
  if not(raw and token[0]=='text'):tokens.append(token)
  if token[0]=='end' and token[1] in ('script','style'):raw=False
 return sha(json.dumps(tokens,ensure_ascii=False,separators=(',',':')))

def verify(baseline=False):
 m=manifest();inventory();order=m['load_order'];assert len(order)==len(set(order)),'중복 소스 로딩'
 registered={e['path'] for e in m['files']};assert set(order)<=registered,'미등록 실행 소스'
 for p in order:
  assert (ROOT/p).is_file(),p
  assert (ROOT/p).resolve().is_relative_to(ROOT),'프로젝트 외부 소스'
 data=json.loads((ROOT/'src/data/characters/index.json').read_text(encoding='utf-8'))
 paths=[c['path'] for c in data['characters']];assert len(paths)==59 and len(set(paths))==59,'캐릭터 중복/누락'
 assert all(p in registered and (ROOT/p).is_file() for p in paths),'미등록 캐릭터'
 runtime=assemble();assert sha(runtime)==m['original_script_sha256' if baseline else 'current_script_sha256'],'기준 JavaScript와 불일치'
 assert (ROOT/'runtime.js').read_text(encoding='utf-8')==runtime,'배포 runtime.js가 소스와 불일치'
 html=(ROOT/'Duels.html').read_text(encoding='utf-8')
 # Replace only actual resource elements, not examples inside comments/raw-text blocks.
 doc=Document(html);changes=[];used=[]
 resources=m['baseline_resources'];by_path={r['path']:r for r in resources}
 class Links(HTMLParser):
  def __init__(self):super().__init__();self.items=[];self.offsets=doc.offsets;self.feed(html)
  def handle_starttag(self,tag,attrs):
   attrs=dict(attrs);path=attrs.get('href' if tag=='link' else 'src','').removeprefix('./')
   if path in by_path:
    line,col=self.getpos();a=self.offsets[line-1]+col;self.items.append((tag,attrs,path,a,a+len(self.get_starttag_text())))
 for tag,attrs,path,start,end in Links().items:
  r=by_path[path];used.append(path);body=runtime if path=='runtime.js' else (ROOT/path).read_text(encoding='utf-8');assert sha(body)==(m['current_script_sha256'] if path=='runtime.js' and not baseline else (r['sha256'] if baseline else m.get('current_resource_sha256',{}).get(path,r['sha256']))),f'기준 리소스 불일치: {path}'
  expected=dict(r['attrs']);actual={k:v for k,v in attrs.items() if k not in ('src','href','rel')};assert actual==expected,f'태그 속성 불일치: {path}'
  if tag=='script':end=next(b['end'] for b in doc.blocks if b['start']==start)
  original='<'+r['tag']+''.join(f' {k}="{v}"' for k,v in r['attrs'])+'>'+body+'</'+r['tag']+'>'
  changes.append((start,end,original))
 assert used==[r['path'] for r in resources],'리소스 누락·중복·실행 순서 변경'
 for a,b,t in sorted(changes,reverse=True):html=html[:a]+t+html[b:]
 if baseline:assert document_hash(html)==m['baseline_document_sha256'],'원본 DOM/내용과 불일치'
 else:assert layout_hash(html)==m['baseline_layout_sha256'],'기준 DOM/내용과 불일치'
 legacy=(ROOT/'docs/LEGACY RULES.md').read_text(encoding='utf-8');assert sha(legacy)==m['baseline_rules_sha256'],'기존 규칙 보존 실패'
 readme=(ROOT/'README.md').read_text(encoding='utf-8');assert all(f'{i}. ' in readme for i in range(25)),'규칙 번호 누락'
 normalized=legacy.strip().replace(m['old_rule_16'],m['new_rule_16']);assert normalized in readme,'전체 규칙 이관 실패'
 print('PASS: HTML 구조·리소스 5개·스크립트 실행 순서·59명 등록·전체 규칙 이관·배포 결과·소스 목록')
if __name__=='__main__':verify('--baseline' in sys.argv)
