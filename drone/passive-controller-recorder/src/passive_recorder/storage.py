from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

from .models import (
    PASSIVE_SAFETY_FLAGS,
    SUPPORTED_SOURCE_TYPES,
    ArtifactRecord,
    PassiveRecorderError,
    new_id,
    iter_files,
    make_manifest,
    utc_now,
)

MANIFEST_NAME = "session.json"
EVENTS_NAME = "events.jsonl"
RAW_DIR_NAME = "raw"


def create_session(
    session_dir: Path,
    *,
    platform_family: str,
    controller_stack: str,
    authorization_basis: str,
    capture_mode: str,
    notes: str | None = None,
) -> dict[str, Any]:
    session_dir.mkdir(parents=True, exist_ok=True)
    raw_dir(session_dir).mkdir(exist_ok=True)
    manifest_path = session_dir / MANIFEST_NAME
    if manifest_path.exists():
        raise PassiveRecorderError(f"Session already exists: {manifest_path}")

    manifest = make_manifest(
        platform_family=platform_family,
        controller_stack=controller_stack,
        authorization_basis=authorization_basis,
        capture_mode=capture_mode,
        notes=notes,
    )
    write_json(manifest_path, manifest)
    (session_dir / EVENTS_NAME).touch()
    return manifest


def raw_dir(session_dir: Path) -> Path:
    return session_dir / RAW_DIR_NAME


def load_manifest(session_dir: Path) -> dict[str, Any]:
    manifest_path = session_dir / MANIFEST_NAME
    if not manifest_path.exists():
        raise PassiveRecorderError(f"Missing session manifest: {manifest_path}")
    with manifest_path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def save_manifest(session_dir: Path, manifest: dict[str, Any]) -> None:
    manifest["updated_at"] = utc_now()
    write_json(session_dir / MANIFEST_NAME, manifest)


def write_json(path: Path, payload: dict[str, Any]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, sort_keys=True)
        handle.write("\n")


def append_events(session_dir: Path, events: list[dict[str, Any]]) -> None:
    with (session_dir / EVENTS_NAME).open("a", encoding="utf-8") as handle:
        for event in events:
            handle.write(json.dumps(event, sort_keys=True))
            handle.write("\n")


def import_source(
    session_dir: Path,
    input_path: Path,
    *,
    source_type: str,
    copy_raw: bool = False,
) -> list[dict[str, Any]]:
    if source_type not in SUPPORTED_SOURCE_TYPES:
        raise PassiveRecorderError(f"Unsupported source_type: {source_type}")
    manifest = load_manifest(session_dir)
    input_path = input_path.expanduser().resolve()

    events = _adapter_events(
        input_path,
        source_type=source_type,
        session_id=manifest["session_id"],
    )
    if events is None:
        events = _generic_artifact_events(
            input_path,
            source_type=source_type,
            session_id=manifest["session_id"],
        )

    if copy_raw:
        copied = _copy_raw_artifacts(session_dir, input_path)
        manifest.setdefault("artifacts", []).extend(copied)
    else:
        manifest.setdefault("artifacts", []).extend(_artifact_summaries_from_events(events))

    append_events(session_dir, events)
    save_manifest(session_dir, manifest)
    return events


def _adapter_events(input_path: Path, *, source_type: str, session_id: str) -> list[dict[str, Any]] | None:
    try:
        from .sources import get_adapter
    except ImportError:
        return None

    try:
        adapter = get_adapter(source_type)
    except (KeyError, PassiveRecorderError):
        return None
    result = adapter.scan(input_path)
    if hasattr(result, "events"):
        events = result.events
    else:
        events = result
    normalized: list[dict[str, Any]] = []
    for event in events:
        event.setdefault("event_id", new_id("event"))
        event.setdefault("session_id", session_id)
        event.setdefault("recorded_at", utc_now())
        event.setdefault("source_type", source_type)
        event.setdefault("normalized", {})
        event.setdefault("safety", PASSIVE_SAFETY_FLAGS.copy())
        normalized.append(event)
    return normalized


def _generic_artifact_events(input_path: Path, *, source_type: str, session_id: str) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    for file_path in iter_files(input_path):
        record = ArtifactRecord.from_path(
            file_path,
            source_type=source_type,
            parser="generic",
            notes="Artifact hashed from local owned/exported input path.",
        )
        events.append(record.to_event(session_id=session_id))
    return events


def _copy_raw_artifacts(session_dir: Path, input_path: Path) -> list[dict[str, Any]]:
    copied: list[dict[str, Any]] = []
    destination_root = raw_dir(session_dir)
    for file_path in iter_files(input_path):
        if input_path.is_dir():
            relative = file_path.relative_to(input_path)
        else:
            relative = Path(file_path.name)
        destination = _unique_destination(destination_root / relative)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(file_path, destination)
        record = ArtifactRecord.from_path(
            destination,
            source_type="raw_copy",
            artifact_role="raw_copy",
            parser="filesystem",
        )
        copied.append(
            {
                "path": str(destination.relative_to(session_dir)),
                "sha256": record.sha256,
                "size_bytes": record.size_bytes,
                "copied_at": utc_now(),
            }
        )
    return copied


def _unique_destination(path: Path) -> Path:
    if not path.exists():
        return path
    stem = path.stem
    suffix = path.suffix
    parent = path.parent
    for index in range(1, 10_000):
        candidate = parent / f"{stem}-{index}{suffix}"
        if not candidate.exists():
            return candidate
    raise PassiveRecorderError(f"Could not create unique destination under {parent}")


def _artifact_summaries_from_events(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    summaries: list[dict[str, Any]] = []
    for event in events:
        artifact = event.get("artifact")
        if isinstance(artifact, dict):
            summaries.append(
                {
                    "path": artifact.get("path"),
                    "sha256": artifact.get("sha256"),
                    "size_bytes": artifact.get("size_bytes"),
                    "observed_at": event.get("recorded_at"),
                }
            )
    return summaries
