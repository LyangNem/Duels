from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
import os,sys
from project import ROOT,assemble,inventory,documentation_current
# Missing sources still block startup; outdated documentation is an advisory.
try:
 inventory()
 assemble()
 current=documentation_current()
except (OSError,ValueError,KeyError) as error:
 raise SystemExit(f'프로젝트 파일을 확인해 주세요: {error}') from None
if not current:
 print('안내: DIVIDE TASKS 갱신이 필요합니다. 서버는 정상 실행합니다.\n'
       '개발 작업자는 역할/변경 기록 확인 후 python tools/project.py docs를 실행하세요.',flush=True)
os.chdir(ROOT)
class Handler(SimpleHTTPRequestHandler):
 def end_headers(self):
  self.send_header('Cache-Control','no-store')
  super().end_headers()
 def runtime(self,head=False):
  body=assemble().encode('utf-8');self.send_response(200);self.send_header('Content-Type','application/javascript; charset=utf-8');self.send_header('Content-Length',str(len(body)));self.end_headers()
  if not head:self.wfile.write(body)
 def do_GET(self):
  if self.path.split('?')[0]=='/runtime.js':self.runtime()
  else:
   if self.path=='/':self.path='/Duels.html'
   super().do_GET()
 def do_HEAD(self):
  if self.path.split('?')[0]=='/runtime.js':self.runtime(head=True)
  else:
   if self.path=='/':self.path='/Duels.html'
   super().do_HEAD()
port=int(sys.argv[1]) if len(sys.argv)>1 else 8000
print(f'DUELS 3.0: http://localhost:{port}/',flush=True)
ThreadingHTTPServer(('127.0.0.1',port),Handler).serve_forever()
