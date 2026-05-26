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
            stripped = line.strip()
            if not stripped:
                continue
            try:
                record = json.loads(stripped)
            except json.JSONDecodeError:
                samples.append(
                    {
                        "event": "source_error",
                        "source_row": line_number,
                        "error": "invalid_json_line",
                        "t_ms": 0,
                    }
                )
                continue
            if isinstance(record, dict):
                samples.append(normalize_record(record, row_index=line_number))
    return samples


def decode_json(input_path: Path) -> list[dict[str, Any]]:
    payload = json.loads(input_path.read_text(encoding="utf-8"))
    if isinstance(payload, list):
        records = payload
    elif isinstance(payload, dict):
        events = payload.get("events") or payload.get("samples") or payload.get("records")
        records = events if isinstance(events, list) else [payload]
    else:
        records = []

    return [
        normalize_record(record, row_index=index)
        for index, record in enumerate(records, start=1)
        if isinstance(record, dict)
    ]


def normalize_record(record: dict[str, Any], row_index: int) -> dict[str, Any]:
    event_name = str(record.get("event") or record.get("type") or "sample")
    t_ms = extract_t_ms(record)
    timestamp = extract_timestamp(record)
    message_type = extract_message_type(record)

    if message_type in CONTROL_MESSAGE_TYPES:
        sample: dict[str, Any] = {
            "event": "sample",
            "source_row": row_index,
            "message_type": message_type,
            "control_payload_redacted": True,
        }
        if t_ms is not None:
            sample["t_ms"] = t_ms
        if timestamp:
            sample["timestamp"] = timestamp
        return sample

    if event_name in {"session_start", "session_end"}:
        return {
            "event": "source_event",
            "source_row": row_index,
            "source_event": event_name,
            "t_ms": t_ms or 0,
        }
    if event_name not in {"sample", "input"} and not has_sample_payload(record):
        return {
            "event": "source_event",
            "source_row": row_index,
            "source_event": event_name,
            "t_ms": t_ms or 0,
        }

    sample = {
        "event": "sample",
        "source_row": row_index,
    }
    if t_ms is not None:
        sample["t_ms"] = t_ms
    if timestamp:
        sample["timestamp"] = timestamp
    if event_name not in {"sample", "input"}:
        sample["source_event"] = event_name
    if message_type:
        sample["message_type"] = message_type

    copy_nested(record, sample)
    for raw_key, raw_value in record.items():
        key = normalize_key(str(raw_key))
        if should_skip_key(key):
            continue
        value = parse_scalar(raw_value)
        if value is None:
            continue
        assign_known_field(sample, key, value)

    return sample


def has_sample_payload(record: dict[str, Any]) -> bool:
    for raw_key, raw_value in record.items():
        key = normalize_key(str(raw_key))
        if should_skip_key(key):
            continue
        if parse_scalar(raw_value) is not None:
            return True
    return any(isinstance(record.get(section), (dict, list)) for section in ("axes", "buttons", "hats"))


def copy_nested(record: dict[str, Any], sample: dict[str, Any]) -> None:
    axes = record.get("axes")
    buttons = record.get("buttons")
    hats = record.get("hats")
    if isinstance(axes, dict) or isinstance(buttons, dict) or isinstance(hats, list):
        controller = sample.setdefault("controller", {})
        if isinstance(axes, dict):
            controller["axes"] = axes
        if isinstance(buttons, dict):
            controller["buttons"] = buttons
        if isinstance(hats, list):
            controller["hats"] = hats

    for section in ("gnss", "attitude", "power", "link", "telemetry"):
        value = record.get(section)
        if isinstance(value, dict):
            sample[section] = value


def assign_known_field(sample: dict[str, Any], key: str, value: Any) -> None:
    gnss_fields = {
        "lat": "lat_deg",
        "latitude": "lat_deg",
        "gps_lat": "lat_deg",
        "gps_latitude": "lat_deg",
        "lon": "lon_deg",
        "lng": "lon_deg",
        "longitude": "lon_deg",
        "gps_lon": "lon_deg",
        "gps_lng": "lon_deg",
        "gps_longitude": "lon_deg",
        "alt": "alt_m",
        "altitude": "alt_m",
        "alt_m": "alt_m",
        "gps_alt": "alt_m",
        "gps_altitude": "alt_m",
        "satellites": "satellites",
        "sats": "satellites",
        "gps_sats": "satellites",
        "hdop": "hdop",
    }
    attitude_fields = {
        "roll": "roll_deg",
        "roll_deg": "roll_deg",
        "pitch": "pitch_deg",
        "pitch_deg": "pitch_deg",
        "yaw": "yaw_deg",
        "yaw_deg": "yaw_deg",
        "heading": "heading_deg",
        "heading_deg": "heading_deg",
    }
    power_fields = {
        "battery": "battery_pct",
        "battery_pct": "battery_pct",
        "battery_percent": "battery_pct",
        "bat": "battery_voltage_v",
        "vbat": "battery_voltage_v",
        "vfas": "battery_voltage_v",
        "voltage": "battery_voltage_v",
        "battery_voltage": "battery_voltage_v",
        "rxbt": "receiver_voltage_v",
        "current": "current_a",
        "current_a": "current_a",
    }
    link_fields = {
        "rssi": "rssi",
        "rxrssi": "rssi",
        "lq": "link_quality",
        "link_quality": "link_quality",
        "uplink_quality": "uplink_quality",
        "downlink_quality": "downlink_quality",
        "snr": "snr_db",
        "noise": "noise_db",
    }

    if key in gnss_fields:
        sample.setdefault("gnss", {})[gnss_fields[key]] = value
    elif key in attitude_fields:
        sample.setdefault("attitude", {})[attitude_fields[key]] = value
    elif key in power_fields:
        sample.setdefault("power", {})[power_fields[key]] = value
    elif key in link_fields:
        sample.setdefault("link", {})[link_fields[key]] = value
    elif key in {"mode", "flight_mode", "flightmode"}:
        sample["flight_mode"] = str(value)
    elif key in {"armed", "is_armed"}:
        sample["armed"] = bool(value)
    elif re.fullmatch(r"(rc|ch|channel)_?\d+", key):
        sample.setdefault("controller", {}).setdefault("channels", {})[key] = value
    elif key in {"lx", "ly", "rx", "ry", "lt", "rt"}:
        sample.setdefault("controller", {}).setdefault("axes", {})[key] = value
    else:
        sample.setdefault("telemetry", {})[key] = value


def raw_only_samples(input_path: Path, reason: str) -> list[dict[str, Any]]:
    return [
        {
            "event": "source_event",
            "source_event": "raw_log_registered",
            "source_row": 1,
            "decode_status": "raw_only",
            "reason": reason,
            "file_name": input_path.name,
            "t_ms": 0,
        }
    ]


def session_start_event(
    input_path: Path,
    source: RecorderSource,
    source_hash: str,
    imported_at: datetime,
    raw_archive_path: Path | None,
    decode_status: str,
    note: str | None,
) -> dict[str, Any]:
    event: dict[str, Any] = {
        "event": "session_start",
        "schema": SCHEMA,
        "product": "Vedawiki Field Recorder",
        "purpose": "authorized passive telemetry import for training, debriefing, QA, and evaluation",
        "record_only": True,
        "imported": True,
        "imported_at": imported_at.isoformat(),
        "started_at": imported_at.isoformat(),
        "t_ms": 0,
        "source": source.to_dict(),
        "input_file": {
            "name": input_path.name,
            "size_bytes": input_path.stat().st_size,
            "sha256": source_hash,
            "decode_status": decode_status,
            "raw_archived_as": str(raw_archive_path) if raw_archive_path else None,
        },
    }
    if note:
        event["note"] = note
    return event


def extract_t_ms(record: dict[str, Any]) -> int | None:
    for key in ("t_ms", "time_ms", "timestamp_ms", "elapsed_ms", "millis"):
        value = record.get(key)
        parsed = parse_scalar(value)
        if isinstance(parsed, (int, float)):
            return max(0, round(float(parsed)))
    for key in ("time_s", "elapsed_s", "seconds"):
        value = record.get(key)
        parsed = parse_scalar(value)
        if isinstance(parsed, (int, float)):
            return max(0, round(float(parsed) * 1000))
    return None


def extract_timestamp(record: dict[str, Any]) -> str | None:
    for key in ("timestamp", "datetime", "date_time", "time_utc", "utc"):
        value = record.get(key)
        parsed = parse_datetime(value)
        if parsed:
            return parsed

    date_value = record.get("Date") or record.get("date")
    time_value = record.get("Time") or record.get("time")
    if date_value and time_value:
        parsed = parse_datetime(f"{date_value} {time_value}")
        if parsed:
            return parsed
    return None


def extract_message_type(record: dict[str, Any]) -> str | None:
    for key in ("message_type", "mavlink_message", "msg_type", "type"):
        value = record.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip().upper()
    return None


def parse_datetime(value: Any) -> str | None:
    if not isinstance(value, str) or not value.strip():
        return None
    candidate = value.strip().replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(candidate)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc).isoformat()
    except ValueError:
        pass

    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y/%m/%d %H:%M:%S", "%d-%m-%Y %H:%M:%S", "%m/%d/%Y %H:%M:%S"):
        try:
            parsed = datetime.strptime(value.strip(), fmt).replace(tzinfo=timezone.utc)
            return parsed.isoformat()
        except ValueError:
            continue
    return None


def parse_scalar(value: Any) -> Any:
    if isinstance(value, (int, float, bool)) or value is None:
        return value
    if isinstance(value, (list, dict)):
        return value
    text = str(value).strip()
    if not text or text.lower() in {"nan", "null", "none"}:
        return None
    lower = text.lower()
    if lower in {"true", "yes", "y"}:
        return True
    if lower in {"false", "no", "n"}:
        return False
    if re.fullmatch(r"[-+]?\d+", text):
        return int(text)
    if re.fullmatch(r"[-+]?(?:\d+\.\d*|\d*\.\d+)(?:e[-+]?\d+)?", text, flags=re.IGNORECASE):
        return float(text)
    return text


def normalize_key(key: str) -> str:
    normalized = key.strip().lower()
    normalized = normalized.replace("%", "pct")
    normalized = re.sub(r"\([^)]*\)", "", normalized)
    normalized = re.sub(r"[^a-z0-9]+", "_", normalized)
    return normalized.strip("_")


def should_skip_key(key: str) -> bool:
    return key in {
        "",
        "event",
        "type",
        "timestamp",
        "datetime",
        "date_time",
        "time_utc",
        "utc",
        "date",
        "time",
        "t_ms",
        "time_ms",
        "timestamp_ms",
        "elapsed_ms",
        "millis",
        "time_s",
        "elapsed_s",
        "seconds",
        "message_type",
        "mavlink_message",
        "msg_type",
        "axes",
        "buttons",
        "hats",
        "gnss",
        "attitude",
        "power",
        "link",
        "telemetry",
    }


def archive_raw_file(input_path: Path, sessions_dir: Path, source_hash: str) -> Path:
    archive_dir = sessions_dir / RAW_ARCHIVE_DIR
    archive_dir.mkdir(parents=True, exist_ok=True)
    safe_name = sanitize_stem(input_path.stem)
    target = archive_dir / f"{source_hash[:16]}-{safe_name}{input_path.suffix.lower()}"
    if not target.exists():
        shutil.copy2(input_path, target)
    return target


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()

