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
        controller_examples=(
            "DJI RC / RC 2",
            "DJI RC Pro",
            "DJI RC Pro Enterprise",
            "DJI RC Plus / RC Plus 2",
        ),
        capture_modes=("usb-log-import", "official-sdk-export", "cloud-export"),
        import_patterns=("*.csv", "*.json", "*.jsonl", "*.txt"),
        implementation_status="import-only unless an official DJI SDK path is configured",
        passive_boundary="Use official exports or SDK telemetry only; do not decode protected links or alter controllers.",
        notes="Closed DJI controllers are not treated as generic plug-through hardware.",
    ),
    RecorderSource(
        id="mavlink",
        name="MAVLink / ArduPilot / PX4",
        ecosystem="Open autopilot telemetry",
        priority=2,
        controller_examples=(
            "Mission Planner",
            "QGroundControl",
            "Pixhawk",
            "CubePilot",
            "Holybro",
            "CUAV",
        ),
        capture_modes=("usb-log-import", "sd-card-import", "read-only-serial"),
        import_patterns=("*.csv", "*.json", "*.jsonl", "*.tlog", "*.bin", "*.ulg"),
        implementation_status="CSV/JSON import now; binary logs are archived for decoding by approved tooling",
        passive_boundary="Read existing logs or listen on a receive-only telemetry branch; never transmit MAVLink messages.",
        notes="The physical recorder path is realistic here because these systems expose documented telemetry.",
