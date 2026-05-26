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
    ),
    RecorderSource(
        id="edgetx",
        name="EdgeTX / ELRS / Crossfire telemetry",
        ecosystem="FPV and hobby RC telemetry",
        priority=3,
        controller_examples=(
            "RadioMaster Boxer",
            "RadioMaster TX16S",
            "Jumper radios",
            "ExpressLRS",
            "TBS Crossfire",
        ),
        capture_modes=("sd-card-import", "usb-log-import", "read-only-serial"),
        import_patterns=("*.csv", "*.json", "*.jsonl"),
        implementation_status="CSV/JSON import now",
        passive_boundary="Import radio SD-card logs or approved telemetry streams; do not inject RC channel data.",
        notes="EdgeTX CSV files are the safest first integration for this ecosystem.",
    ),
    RecorderSource(
        id="blackbox",
        name="Betaflight / iNav Blackbox",
        ecosystem="FPV flight-controller logs",
        priority=4,
        controller_examples=("Betaflight Blackbox", "iNav Blackbox"),
        capture_modes=("sd-card-import", "usb-log-import"),
        import_patterns=("*.csv", "*.json", "*.jsonl", "*.bbl"),
        implementation_status="CSV/JSON import now; native Blackbox binaries are archived for approved decoders",
        passive_boundary="Import recorded Blackbox logs only; no live control bus placement.",
        notes="Use Blackbox Explorer or approved decoders to convert binary logs to CSV before normalization.",
    ),
    RecorderSource(
        id="skydio",
        name="Skydio controller/cloud exports",
        ecosystem="Skydio enterprise",
        priority=5,
        controller_examples=("Skydio X10 Controller", "Skydio Flight Deck", "Skydio Cloud"),
        capture_modes=("official-api-export", "cloud-export", "usb-log-import"),
        import_patterns=("*.csv", "*.json", "*.jsonl"),
        implementation_status="import-only unless an official Skydio API export is configured",
        passive_boundary="Use Skydio-provided export/API paths; do not bypass device protections.",
        notes="Closed enterprise platforms stay software/API based.",
    ),
    RecorderSource(
        id="autel",
        name="Autel controller exports",
        ecosystem="Autel enterprise / prosumer",
        priority=6,
        controller_examples=("Autel Smart Controller V3", "EVO Max", "Dragonfish", "SkyCommand"),
        capture_modes=("official-export", "cloud-export", "usb-log-import"),
        import_patterns=("*.csv", "*.json", "*.jsonl", "*.txt"),
        implementation_status="import-only unless an official Autel export path is configured",
        passive_boundary="Use Autel-provided exports only; no protected-link decoding.",
        notes="Treat as closed-platform import until manufacturer interfaces are available.",
    ),
    RecorderSource(
        id="parrot",
        name="Parrot SDK / GUTMA exports",
        ecosystem="Parrot ANAFI",
        priority=7,
        controller_examples=("Parrot Skycontroller", "FreeFlight", "ANAFI Ai", "ANAFI USA"),
