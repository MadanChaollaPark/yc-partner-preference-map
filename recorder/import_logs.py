#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
import shutil
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

try:
    from .sources import RecorderSource, detect_source, get_source, source_catalog
except ImportError:  # pragma: no cover - supports `python recorder/import_logs.py`.
    from sources import RecorderSource, detect_source, get_source, source_catalog


BASE_DIR = Path(__file__).resolve().parent
SESSIONS_DIR = BASE_DIR / "sessions"
RAW_ARCHIVE_DIR = "raw"
SCHEMA = "vedawiki.telemetry.v1"
TEXT_SUFFIXES = {".csv", ".json", ".jsonl", ".ndjson", ".txt", ".gutma"}
BINARY_SUFFIXES = {".tlog", ".bin", ".ulg", ".bbl"}
CONTROL_MESSAGE_TYPES = {
    "COMMAND_INT",
    "COMMAND_LONG",
    "MANUAL_CONTROL",
    "RC_CHANNELS_OVERRIDE",
    "SET_ACTUATOR_CONTROL_TARGET",
    "SET_ATTITUDE_TARGET",
    "SET_POSITION_TARGET_GLOBAL_INT",
    "SET_POSITION_TARGET_LOCAL_NED",
}


@dataclass(frozen=True)
class ImportResult:
    output_path: Path
    raw_archive_path: Path | None
    source_id: str
    source_sha256: str
    event_count: int
    sample_count: int
    decode_status: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "output_path": str(self.output_path),
            "raw_archive_path": str(self.raw_archive_path) if self.raw_archive_path else None,
            "source_id": self.source_id,
            "source_sha256": self.source_sha256,
            "event_count": self.event_count,
            "sample_count": self.sample_count,
            "decode_status": self.decode_status,
        }


def import_log(
    input_path: Path,
    sessions_dir: Path = SESSIONS_DIR,
    source_id: str = "auto",
    archive_raw: bool = False,
    note: str | None = None,
) -> ImportResult:
    input_path = input_path.expanduser().resolve()
    if not input_path.exists() or not input_path.is_file():
        raise FileNotFoundError(f"log file not found: {input_path}")

    source = detect_source(input_path) if source_id == "auto" else get_source(source_id)
    source_hash = sha256_file(input_path)
    raw_archive_path = archive_raw_file(input_path, sessions_dir, source_hash) if archive_raw else None
    imported_at = datetime.now(timezone.utc)

    samples, decode_status = decode_log(input_path)
    start_event = session_start_event(
        input_path=input_path,
        source=source,
        source_hash=source_hash,
        imported_at=imported_at,
        raw_archive_path=raw_archive_path,
        decode_status=decode_status,
        note=note,
    )
    end_event = {
        "event": "session_end",
        "reason": "import_complete",
        "ended_at": datetime.now(timezone.utc).isoformat(),
        "t_ms": max((int(sample.get("t_ms", 0) or 0) for sample in samples), default=0),
    }
    events = [start_event, *samples, end_event]

    sessions_dir.mkdir(parents=True, exist_ok=True)
    output_path = sessions_dir / imported_session_filename(imported_at, source.id, input_path.stem)
