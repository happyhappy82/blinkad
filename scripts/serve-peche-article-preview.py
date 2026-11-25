"""Serve the frozen article review; never expose the application or directory lists."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / '.peche-article-share/public'
assert (PUBLIC / 'blog/index.html').is_file()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def do_GET(self):
        if self.path == '/':
            self.send_response(302)
            self.send_header('Location', '/blog/')
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


print('Article review: http://127.0.0.1:18952/blog/', flush=True)
ThreadingHTTPServer(('127.0.0.1', 18952), Handler).serve_forever()
