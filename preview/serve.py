"""Allowlist-only local fixture server. Never proxies requests or reads arbitrary paths."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
ROOT = Path(__file__).resolve().parents[1]
FILES = {'/': ('preview/index.html','text/html'), '/haier-fridge-card.js': ('haier-fridge-card.js','text/javascript'), **{'/preview/'+p: ('preview/'+p, 'text/css' if p.endswith('.css') else 'text/javascript') for p in ['style.css','guard.js','fixture.js']}}
CSP = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'none'; font-src 'none'; connect-src 'none'; worker-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        entry = FILES.get(self.path)
        if not entry:
            self.send_error(404); return
        body = (ROOT / entry[0]).read_bytes()
        self.send_response(200)
        self.send_header('Content-Type',entry[1]+'; charset=utf-8')
        self.send_header('Content-Length',str(len(body)))
        self.send_header('Content-Security-Policy',CSP)
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.end_headers(); self.wfile.write(body)
if __name__ == '__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--port',type=int,default=8123)
    args=parser.parse_args()
    print(f'Offline preview: http://127.0.0.1:{args.port}',flush=True)
    ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
