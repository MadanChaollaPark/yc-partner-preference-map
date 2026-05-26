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
    artifact_rules: Sequence[ArtifactRule] = ()
    source_metadata: Dict[str, Any] = {}

    def scan(self, path: object) -> AdapterResult:
        root = Path(path).expanduser()
        warnings: List[str] = []
        events: List[EventDict] = []

        if not root.exists():
            warnings.append("Path does not exist: {0}".format(root))
            return self._result(root, events, warnings)

        for candidate in self._iter_regular_files(root, warnings):
            classification = self.classify(candidate)
            if classification is None:
                continue

            try:
                event = self._event_for_file(candidate, root, classification)
            except OSError as exc:
                warnings.append("Could not read {0}: {1}".format(candidate, exc))
                continue
            events.append(event)

        events.sort(key=lambda event: event["artifact"]["path"])
        return self._result(root, events, warnings)

    def iter_events(self, path: object) -> Iterator[EventDict]:
        return iter(self.scan(path).events)

    def classify(self, path: Path) -> Optional[Dict[str, Any]]:
        for rule in self.artifact_rules:
            classification = rule.classify(path)
            if classification is not None:
                return classification
        return None

    def _result(
        self, root: Path, events: List[EventDict], warnings: List[str]
    ) -> AdapterResult:
        return AdapterResult(
            source=self.name,
            path=str(root),
            events=events,
            warnings=warnings,
            metadata={
                "adapter": self.adapter_id,
                "display_name": self.display_name,
                "mode": "imported_exported_log_scan",
                "live_capture_supported": False,
            },
        )

    @property
    def adapter_id(self) -> str:
        return "{0}.{1}".format(self.__module__, self.__class__.__name__)

    def _iter_regular_files(self, root: Path, warnings: List[str]) -> Iterator[Path]:
        if root.is_dir():
            for dirpath, dirnames, filenames in os.walk(
                str(root), topdown=True, followlinks=False
            ):
                dirnames[:] = sorted(dirnames)
                for filename in sorted(filenames):
                    candidate = Path(dirpath) / filename
                    if _is_regular_file(candidate, warnings):
                        yield candidate
            return

        if _is_regular_file(root, warnings):
            yield root

    def _event_for_file(
        self, path: Path, root: Path, classification: Dict[str, Any]
    ) -> EventDict:
        file_stat = path.stat()
        size_bytes = file_stat.st_size
        sha256 = _sha256_file(path)
        relative_path = _relative_to(path, root)

        metadata: Dict[str, Any] = {
            "adapter": self.adapter_id,
            "source_display_name": self.display_name,
            "scan_mode": "imported_exported_log_scan",
            "passive_only": True,
            "live_capture_supported": False,
        }
        metadata.update(self.source_metadata)

        return {
            "schema": "passive_recorder.source_artifact.v1",
            "event_type": "source_artifact_discovered",
            "source": {
                "name": self.name,
                "display_name": self.display_name,
                "mode": "imported_exported_logs",
            },
            "artifact": {
                "path": str(path),
                "relative_path": relative_path,
                "filename": path.name,
                "extension": path.suffix.lower(),
                "size_bytes": size_bytes,
                "sha256": sha256,
                "modified_time": _format_timestamp(file_stat.st_mtime),
            },
            "classification": classification,
            "metadata": metadata,
        }


def scan_with_adapter(adapter: PassiveSourceAdapter, path: object) -> AdapterResult:
    return adapter.scan(path)


def _normalize_extension(extension: str) -> str:
    extension = extension.lower().strip()
    if not extension:
        return extension
    if extension.startswith("."):
        return extension
    return ".{0}".format(extension)


def _is_regular_file(path: Path, warnings: List[str]) -> bool:
    try:
        mode = path.stat().st_mode
    except OSError as exc:
        warnings.append("Could not stat {0}: {1}".format(path, exc))
        return False

    if stat.S_ISREG(mode):
        return True

    warnings.append("Skipped non-regular file: {0}".format(path))
    return False


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(CHUNK_SIZE), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _relative_to(path: Path, root: Path) -> str:
    try:
        if root.is_dir():
            return str(path.relative_to(root))
        return path.name
    except ValueError:
        return path.name


def _format_timestamp(timestamp: float) -> str:
    return datetime.fromtimestamp(timestamp, timezone.utc).isoformat()


def source_scan(adapter: PassiveSourceAdapter, path: object) -> AdapterResult:
    """Compatibility alias for callers that prefer function-style adapters."""

    return adapter.scan(path)
