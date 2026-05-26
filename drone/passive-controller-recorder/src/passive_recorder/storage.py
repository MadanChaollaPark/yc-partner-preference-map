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
