"""Shared primitives for passive imported/exported log source adapters.

These adapters only inspect regular files already present on disk. They do not
open sockets, radio devices, USB serial ports, or live telemetry endpoints.
"""

from __future__ import annotations

import hashlib
import os
import stat
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterator, List, Optional, Sequence, Tuple


EventDict = Dict[str, Any]

CHUNK_SIZE = 1024 * 1024


@dataclass(frozen=True)
class ArtifactRule:
    """A lightweight file classification rule for exported log artifacts."""

    artifact_type: str
    extensions: Tuple[str, ...] = ()
    name_keywords: Tuple[str, ...] = ()
    path_keywords: Tuple[str, ...] = ()
    confidence: str = "medium"
    require_keyword: bool = False
    require_extension: bool = True

    def __post_init__(self) -> None:
        object.__setattr__(
            self,
            "extensions",
            tuple(_normalize_extension(extension) for extension in self.extensions),
        )
        object.__setattr__(
            self,
            "name_keywords",
            tuple(keyword.lower() for keyword in self.name_keywords),
        )
        object.__setattr__(
            self,
            "path_keywords",
            tuple(keyword.lower() for keyword in self.path_keywords),
        )

    def classify(self, path: Path) -> Optional[Dict[str, Any]]:
        suffix = path.suffix.lower()
        filename = path.name.lower()
        full_path = str(path).lower()
