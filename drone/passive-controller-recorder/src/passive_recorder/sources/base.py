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

        extension_matches = bool(self.extensions) and suffix in self.extensions
        name_terms = tuple(term for term in self.name_keywords if term in filename)
        path_terms = tuple(term for term in self.path_keywords if term in full_path)
        keyword_matches = bool(name_terms or path_terms)

        if self.require_extension and not extension_matches:
            return None
        if self.require_keyword and not keyword_matches:
            return None
        if not self.require_extension and not (extension_matches or keyword_matches):
            return None

        matched_by: List[str] = []
        if extension_matches:
            matched_by.append("extension")
        if name_terms:
            matched_by.append("name")
        if path_terms:
            matched_by.append("path")

        return {
            "artifact_type": self.artifact_type,
            "confidence": self.confidence,
            "matched_by": matched_by,
            "matched_extensions": [suffix] if extension_matches else [],
            "matched_terms": sorted(set(name_terms + path_terms)),
        }


@dataclass
class AdapterResult:
    """Result returned by all passive source adapters."""

    source: str
    path: str
    events: List[EventDict] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "source": self.source,
            "path": self.path,
            "events": self.events,
            "warnings": self.warnings,
            "metadata": self.metadata,
        }


class PassiveSourceAdapter:
    """Base class for adapters that scan already-exported local log files."""

    name = "unknown"
    display_name = "Unknown"
