from __future__ import annotations

from dataclasses import asdict, dataclass
from fnmatch import fnmatch
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class RecorderSource:
    id: str
    name: str
    ecosystem: str
    priority: int
    controller_examples: tuple[str, ...]
    capture_modes: tuple[str, ...]
    import_patterns: tuple[str, ...]
    implementation_status: str
    passive_boundary: str
    notes: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


SOURCE_CATALOG: tuple[RecorderSource, ...] = (
    RecorderSource(
        id="dji",
        name="DJI controller exports",
        ecosystem="DJI Enterprise / prosumer",
        priority=1,
