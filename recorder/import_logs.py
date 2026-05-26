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

