"""Serve the local app and persist its built-in backup inside the project."""

from __future__ import annotations

import json
import os
import threading
import webbrowser
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
BACKUP_PATH = ROOT / "data" / "catalog-backup.json"
HOST = "127.0.0.1"
PORT = 5180
MAX_BACKUP_BYTES = 10 * 1024 * 1024


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status: HTTPStatus, payload: object) -> None:
        body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802 - required by BaseHTTPRequestHandler
        request_path = urlparse(self.path).path
        if request_path == "/api/backup":
            if not BACKUP_PATH.exists():
                self.send_json(HTTPStatus.NOT_FOUND, {"error": "Sauvegarde introuvable"})
                return
            try:
                payload = json.loads(BACKUP_PATH.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                self.send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Sauvegarde illisible"})
                return
            self.send_json(HTTPStatus.OK, payload)
            return
        if request_path in {"/", "/index.html", "/app.js", "/styles.css"} or request_path.startswith("/assets/"):
            super().do_GET()
            return
        self.send_error(HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:  # noqa: N802 - required by BaseHTTPRequestHandler
        if urlparse(self.path).path != "/api/backup":
            self.send_json(HTTPStatus.NOT_FOUND, {"error": "Route inconnue"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            content_length = 0
        if content_length <= 0 or content_length > MAX_BACKUP_BYTES:
            self.send_json(HTTPStatus.BAD_REQUEST, {"error": "Taille de sauvegarde invalide"})
            return

        try:
            payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_json(HTTPStatus.BAD_REQUEST, {"error": "JSON invalide"})
            return

        if (
            not isinstance(payload, dict)
            or payload.get("app") != "juste-ce-quil-faut"
            or not isinstance(payload.get("products"), list)
            or not isinstance(payload.get("categories"), list)
            or not isinstance(payload.get("needed", []), list)
        ):
            self.send_json(HTTPStatus.BAD_REQUEST, {"error": "Format de sauvegarde invalide"})
            return

        BACKUP_PATH.parent.mkdir(parents=True, exist_ok=True)
        temporary_path = BACKUP_PATH.with_suffix(".json.tmp")
        try:
            temporary_path.write_text(
                json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            os.replace(temporary_path, BACKUP_PATH)
        except OSError:
            self.send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Écriture impossible"})
            return

        self.send_json(HTTPStatus.OK, {"saved": True, "path": "data/catalog-backup.json"})

    def log_message(self, message: str, *args: object) -> None:
        print(f"[app] {self.address_string()} - {message % args}")


def main() -> None:
    url = f"http://{HOST}:{PORT}/"
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    print("Juste ce qu'il faut est prêt.")
    print(f"Ouvrez {url} si le navigateur ne s'ouvre pas automatiquement.")
    print("Gardez cette fenêtre ouverte pendant l'utilisation.")
    if os.environ.get("APP_NO_BROWSER") != "1":
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
