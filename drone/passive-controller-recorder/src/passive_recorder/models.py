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
        source_type: str,
        artifact_role: str = "raw_log",
        parser: str = "generic",
        notes: str | None = None,
    ) -> "ArtifactRecord":
        return cls(
            source_type=source_type,
            path=path,
            sha256=sha256_file(path),
            size_bytes=path.stat().st_size,
            mime_type=guess_mime(path),
            artifact_role=artifact_role,
            parser=parser,
            notes=notes,
        )

    def to_event(self, *, session_id: str, relative_path: str | None = None) -> dict[str, Any]:
        return {
            "event_id": new_id("event"),
            "session_id": session_id,
            "event_type": "artifact_observed",
            "recorded_at": utc_now(),
            "source_type": self.source_type,
            "artifact": {
                "path": relative_path or str(self.path),
                "sha256": self.sha256,
                "size_bytes": self.size_bytes,
                "mime_type": self.mime_type,
                "role": self.artifact_role,
                "parser": self.parser,
            },
            "normalized": {},
            "safety": PASSIVE_SAFETY_FLAGS.copy(),
            "notes": self.notes,
        }


def make_manifest(
    *,
    platform_family: str,
    controller_stack: str,
    authorization_basis: str,
    capture_mode: str,
    notes: str | None = None,
) -> dict[str, Any]:
    if not authorization_basis.strip():
        raise PassiveRecorderError("authorization_basis is required")
    if capture_mode not in {
        "exported_log_import",
        "owned_endpoint_capture",
        "manual_session_metadata",
    }:
        raise PassiveRecorderError(f"Unsupported capture_mode: {capture_mode}")

    return {
        "schema_version": "0.1.0",
        "session_id": new_id("session"),
        "created_at": utc_now(),
        "platform_family": platform_family,
        "controller_stack": controller_stack,
        "authorization_basis": authorization_basis,
        "capture_mode": capture_mode,
        "redaction": {
            "default": "redact_sensitive",
            "redact_precise_location": True,
            "redact_operator_identity": True,
            "redact_unit_or_customer_identity": True,
        },
        "time_sync": {
            "method": "unspecified",
            "clock_source": "host_utc",
            "offset_ms": None,
        },
        "safety": PASSIVE_SAFETY_FLAGS.copy(),
        "notes": notes,
        "artifacts": [],
    }
