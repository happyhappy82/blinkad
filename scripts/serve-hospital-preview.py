"""Serve only the frozen review directory, without a development server or APIs."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / '.hospital-preview-share' / 'public'
assert (PUBLIC / 'hospital-marketing-preview/index.html').exists(), 'Run export-hospital-preview.py first'

class ReviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def do_GET(self):
        if self.path == '/':
            self.send_response(302)
            self.send_header('Location', '/hospital-marketing-preview/')
            self.end_headers()
            return
        super().do_GET()

    def list_directory(self, path):
        self.send_error(404)
        return None

    def end_headers(self):
        self.send_header('X-Robots-Tag', 'noindex, nofollow, noarchive')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

print('Hospital review only: http://127.0.0.1:18897/hospital-marketing-preview/', flush=True)
ThreadingHTTPServer(('127.0.0.1', 18897), ReviewHandler).serve_forever()
