#!/usr/bin/env python3
from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

try:
    from .export_csv import jsonl_to_csv_text, load_jsonl, session_summary
    from .sources import source_catalog
except ImportError:  # pragma: no cover - supports `python recorder/server.py`.
    from export_csv import jsonl_to_csv_text, load_jsonl, session_summary
    from sources import source_catalog


BASE_DIR = Path(__file__).resolve().parent
SESSIONS_DIR = Path(os.environ.get("VEDAWIKI_SESSIONS_DIR", BASE_DIR / "sessions")).expanduser().resolve()

app = FastAPI(title="Vedawiki Field Recorder API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "https://vedawiki.com",
        "https://www.vedawiki.com",
        "https://9-160-72-121.nip.io",
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/sessions")
def list_sessions() -> dict[str, list[dict[str, Any]]]:
    SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
    summaries = []
    for path in sorted(SESSIONS_DIR.glob("*.jsonl"), reverse=True):
        events = load_jsonl(path, strict=False)
        summary = session_summary(events)
        summaries.append(
            {
                "name": path.name,
                "size_bytes": path.stat().st_size,
                **summary,
            }
        )
    return {"sessions": summaries}


@app.get("/sources")
def list_sources() -> dict[str, list[dict[str, Any]]]:
    return {"sources": source_catalog()}


@app.get("/sessions/{name}", response_model=None)
def get_session(
    name: str, format: str = Query(default="json", pattern="^(json|jsonl)$")
):
    path = safe_session_path(name)
    if format == "jsonl":
        return PlainTextResponse(path.read_text(encoding="utf-8"), media_type="application/x-ndjson")

    events = load_jsonl(path, strict=False)
    return {
        "name": path.name,
        "summary": session_summary(events),
        "events": events,
    }


@app.get("/sessions/{name}/csv")
def get_session_csv(name: str) -> Response:
    path = safe_session_path(name)
    csv_text = jsonl_to_csv_text(path, strict=False)
    headers = {"Content-Disposition": f'attachment; filename="{path.stem}.csv"'}
    return Response(content=csv_text, media_type="text/csv", headers=headers)


def safe_session_path(name: str) -> Path:
    if Path(name).name != name or not name.endswith(".jsonl"):
        raise HTTPException(status_code=404, detail="session not found")
    path = SESSIONS_DIR / name
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="session not found")
    return path


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
