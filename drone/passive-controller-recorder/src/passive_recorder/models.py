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
