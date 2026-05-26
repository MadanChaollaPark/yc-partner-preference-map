from __future__ import annotations

import hashlib
import mimetypes
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

__version__ = "0.1.0"

PASSIVE_SAFETY_FLAGS = {
    "passive_only": True,
    "no_transmit": True,
    "no_rf_interception": True,
    "owned_or_authorized_sources_only": True,
}

SUPPORTED_SOURCE_TYPES = (
    "dji",
    "autel",
    "betaflight",
    "ardupilot",
    "px4",
    "generic",
)


class PassiveRecorderError(RuntimeError):
    """Raised when recorder input is invalid or unsafe."""


def utc_now() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex}"


def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(chunk_size), b""):
            digest.update(chunk)
    return digest.hexdigest()


def iter_files(path: Path) -> list[Path]:
    if path.is_file():
        return [path]
    if path.is_dir():
        return sorted(item for item in path.rglob("*") if item.is_file())
    raise PassiveRecorderError(f"Input path does not exist: {path}")


def guess_mime(path: Path) -> str:
    return mimetypes.guess_type(path.name)[0] or "application/octet-stream"


@dataclass(frozen=True)
class ArtifactRecord:
    source_type: str
    path: Path
    sha256: str
    size_bytes: int
    mime_type: str
    artifact_role: str = "raw_log"
    parser: str = "generic"
    notes: str | None = None

    @classmethod
    def from_path(
        cls,
        path: Path,
        *,
