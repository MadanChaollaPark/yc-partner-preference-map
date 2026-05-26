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
    write_jsonl(output_path, events)
    return ImportResult(
        output_path=output_path,
        raw_archive_path=raw_archive_path,
        source_id=source.id,
        source_sha256=source_hash,
        event_count=len(events),
        sample_count=len(samples),
        decode_status=decode_status,
    )


def decode_log(input_path: Path) -> tuple[list[dict[str, Any]], str]:
    suffix = input_path.suffix.lower()
    if suffix == ".csv":
        return decode_csv(input_path), "decoded"
    if suffix in {".jsonl", ".ndjson"}:
        return decode_jsonl(input_path), "decoded"
    if suffix in {".json", ".gutma"}:
        return decode_json(input_path), "decoded"
    if suffix == ".txt":
        try:
            return decode_csv(input_path), "decoded"
        except csv.Error:
            return raw_only_samples(input_path, "text log is archived without a native parser"), "raw_only"
    if suffix in BINARY_SUFFIXES:
        return raw_only_samples(input_path, "binary log is archived for approved offline decoding"), "raw_only"
    return raw_only_samples(input_path, f"unsupported log suffix: {suffix or '<none>'}"), "raw_only"


def decode_csv(input_path: Path) -> list[dict[str, Any]]:
    text = input_path.read_text(encoding="utf-8-sig")
    sample = text[:2048]
    dialect = csv.Sniffer().sniff(sample) if "," not in sample[:200] and "\t" in sample[:200] else csv.excel
    reader = csv.DictReader(io.StringIO(text), dialect=dialect)
    if not reader.fieldnames:
        raise csv.Error(f"no CSV header found in {input_path}")
    return [
        normalize_record(row, row_index=index)
        for index, row in enumerate(reader, start=1)
        if any(str(value).strip() for value in row.values() if value is not None)
    ]


def decode_jsonl(input_path: Path) -> list[dict[str, Any]]:
    samples: list[dict[str, Any]] = []
    with input_path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
