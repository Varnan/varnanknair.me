#!/usr/bin/env python3
"""Local preview server that behaves like GitHub Pages.

Serves the site from this folder and returns the custom 404.html (with a
404 status) for unknown paths, which `python3 -m http.server` does not do.

Usage:  python3 serve.py            -> http://localhost:8000
        python3 serve.py 9000       -> http://localhost:9000
"""
import errno
import http.server
import os
import sys
from functools import partial

ROOT = os.path.dirname(os.path.abspath(__file__))


class PagesHandler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        page = os.path.join(ROOT, "404.html")
        if code == 404 and os.path.exists(page):
            with open(page, "rb") as f:
                body = f.read()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)


def start(port, handler, attempts=10):
    """Bind to `port`, or the next free port if it is already in use."""
    for candidate in range(port, port + attempts):
        try:
            return http.server.ThreadingHTTPServer(("", candidate), handler), candidate
        except OSError as exc:
            if exc.errno != errno.EADDRINUSE:
                raise
            print(f"Port {candidate} is busy, trying {candidate + 1}...")
    sys.exit(f"No free port between {port} and {port + attempts - 1}. "
             f"Stop the other server (lsof -i :{port}) or pass a port: python3 serve.py 9000")


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = partial(PagesHandler, directory=ROOT)
    httpd, port = start(port, handler)
    with httpd:
        print(f"Serving varnanknair.me at http://localhost:{port}  (Ctrl+C to stop)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")
