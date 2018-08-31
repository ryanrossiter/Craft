from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

PORT = 8000

class Handler(SimpleHTTPRequestHandler):
    pass

Handler.extensions_map['.wasm'] = 'application/wasm'

httpd = HTTPServer(("", PORT), Handler)

print("Serving at port %i" % (PORT))
httpd.serve_forever()