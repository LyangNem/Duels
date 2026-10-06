"""DUELS source assembly and documentation freshness checks (Python standard library)."""
from pathlib import Path
import json,hashlib,sys
ROOT=Path(__file__).resolve().parents[1]
def digest(p):
 # Text files are compared by content, independent of LF/CRLF line endings.
 data=(ROOT/p).read_bytes()
 try:data=data.decode('utf-8-sig').replace('\r\n','\n').replace('\r','\n').encode('utf-8')
 except UnicodeDecodeError:pass
 return hashlib.sha256(data).hexdigest()
def manifest():return json.loads((ROOT/'project.json').read_text(encoding='utf-8'))
def assemble():
 m=manifest();d=json.loads((ROOT/'src/data/characters/index.json').read_text(encoding='utf-8'));chars=d['prefix']+''.join(c['before']+(ROOT/c['path']).read_text(encoding='utf-8').rstrip('\n') for c in d['characters'])+d['suffix']
 return ''.join((ROOT/p).read_text(encoding='utf-8').replace('/* @CHARACTER_DATA */',chars) for p in m['load_order'])
def inventory():
 m=manifest();known={e['path']:e for e in m['files']}
 extra={'README.md':'작업 전 필독 규칙·실행 안내·현 상태와 제약','AGENTS.md':'AI 작업자에게 README 정독·문서 갱신 의무 안내','DIVIDE TASKS.md':'전체 파일 역할·심볼·해시 목록','PATCH LOG.md':'버전별 변경·검증·잔여 작업 기록','project.json':'원본 기준·실행 순서·역할 메타데이터','docs/LEGACY RULES.md':'이전 규칙 전체 원문 보존(단일 파일 제한은 폐기)','docs/LEGACY PATCH LOG.md':'기존 HTML의 과거 수정 주석 전체 보존','docs/CHARACTER CONTRACT.md':'공식 데이터 구조와 향후 값 입력·모듈 조합 데이터의 연결 계약','tools/project.py':'소스 조립·역할 문서·최신화 검사; 루트 graphify-out 분석 생성물 제외','tools/serve.py':'로컬 서버와 시작 전 검사·자동 조립','START.bat':'Windows 로컬 서버 실행','START.sh':'Linux/macOS 로컬 서버 실행'}
 for p,r in extra.items():known[p]={'path':p,'role':r,'symbols':[]}
 actual={p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.name!='runtime.js' and p.relative_to(ROOT).parts[0]!='graphify-out'}
 actual.add('DIVIDE TASKS.md')
 if set(known)-actual:raise ValueError('등록 파일 누락: '+str(sorted(set(known)-actual)))
 if actual-set(known):raise ValueError('역할 등록 누락: '+str(sorted(actual-set(known))))
 return [known[p] for p in sorted(actual)]
def tasks():
 text='# DIVIDE TASKS\n\n버전: '+manifest()['version']+'\n\n역할 변경 시 project.json의 role/symbols도 수정하고 `python tools/project.py docs`로 이 문서를 갱신한다. 해시 검사는 역할 의미의 정확성을 대신하지 않는다. runtime.js는 생성 결과이며 직접 편집하지 않는다.\n\n| 파일 | 담당 역할 | 선언/등록 | SHA-256 |\n|---|---|---|---|\n'
 for e in inventory():
  p=e['path'];sha='자기 참조 제외' if p=='DIVIDE TASKS.md' else digest(p);text+=f"| `{p}` | {e['role'].replace('|','/')} | {', '.join(e['symbols'])} | {sha} |\n"
 return text
def documentation_current():
 path=ROOT/'DIVIDE TASKS.md'
 return path.is_file() and path.read_text(encoding='utf-8-sig')==tasks()

if __name__=='__main__':
 action=sys.argv[1] if len(sys.argv)>1 else 'check'
 if action=='docs':(ROOT/'DIVIDE TASKS.md').write_text(tasks(),encoding='utf-8',newline='\n');print('DIVIDE TASKS 갱신 완료')
 elif action=='check':
  if not documentation_current():raise SystemExit('DIVIDE TASKS가 오래되었습니다. 역할/변경 기록을 수정한 뒤 docs 실행 필요.')
  print('전체 파일 역할 등록·문서 최신화 확인 완료')
 elif action=='build':(ROOT/'runtime.js').write_text(assemble(),encoding='utf-8',newline='\n');print('runtime.js 생성 완료')
 elif action=='baseline':
  assert hashlib.sha256(assemble().encode()).hexdigest()==manifest()['original_script_sha256'];print('원본 메인 JavaScript와 바이트 단위 동일')
 else:raise SystemExit('docs | check | build | baseline')
