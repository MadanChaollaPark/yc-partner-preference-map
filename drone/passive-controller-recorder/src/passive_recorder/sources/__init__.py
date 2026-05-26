"""Passive source adapter registry for imported/exported controller logs."""

from __future__ import annotations

from typing import Dict, Iterable, List, Optional, Tuple

from .ardupilot import ADAPTER as ARDUPILOT_ADAPTER
from .ardupilot import ArduPilotAdapter
from .autel import ADAPTER as AUTEL_ADAPTER
from .autel import AutelAdapter
from .base import AdapterResult, ArtifactRule, PassiveSourceAdapter
from .betaflight import ADAPTER as BETAFLIGHT_ADAPTER
from .betaflight import BetaflightAdapter
from .dji import ADAPTER as DJI_ADAPTER
from .dji import DJIAdapter
from .px4 import ADAPTER as PX4_ADAPTER
from .px4 import PX4Adapter


ADAPTERS: Dict[str, PassiveSourceAdapter] = {
    adapter.name: adapter
    for adapter in (
        DJI_ADAPTER,
        AUTEL_ADAPTER,
        BETAFLIGHT_ADAPTER,
        ARDUPILOT_ADAPTER,
        PX4_ADAPTER,
    )
}

ADAPTER_CLASSES = {
    DJIAdapter.name: DJIAdapter,
    AutelAdapter.name: AutelAdapter,
    BetaflightAdapter.name: BetaflightAdapter,
    ArduPilotAdapter.name: ArduPilotAdapter,
    PX4Adapter.name: PX4Adapter,
}

FALLBACK_IMPORT_TYPES = ("generic",)


def available_adapters() -> Tuple[str, ...]:
    return tuple(sorted(set(ADAPTERS).union(FALLBACK_IMPORT_TYPES)))


def list_adapters() -> Tuple[str, ...]:
    return available_adapters()


def discover_adapters() -> Tuple[str, ...]:
    return available_adapters()


def get_adapters() -> Dict[str, PassiveSourceAdapter]:
    return dict(ADAPTERS)


def get_adapter(name: str) -> Optional[PassiveSourceAdapter]:
    normalized = name.lower().strip()
    adapter = ADAPTERS.get(normalized)
    if adapter is not None or normalized in FALLBACK_IMPORT_TYPES:
        return adapter

    return None


def scan_source(name: str, path: object) -> AdapterResult:
    adapter = get_adapter(name)
    if adapter is None:
        if name.lower().strip() in FALLBACK_IMPORT_TYPES:
            raise KeyError(
                "Source type {0!r} is handled by the generic artifact importer, "
                "not a source-specific adapter.".format(name)
            )
        raise KeyError(
            "Unknown source adapter {0!r}. Available adapters: {1}".format(
                name, ", ".join(available_adapters())
            )
        )
    return adapter.scan(path)


def scan_all(path: object, names: Optional[Iterable[str]] = None) -> List[AdapterResult]:
    selected = names if names is not None else ADAPTERS
    results: List[AdapterResult] = []
    for name in selected:
        adapter = get_adapter(name)
        if adapter is not None:
            results.append(adapter.scan(path))
    return results


__all__ = [
    "ADAPTERS",
    "ADAPTER_CLASSES",
    "AdapterResult",
    "ArtifactRule",
    "PassiveSourceAdapter",
    "available_adapters",
    "discover_adapters",
    "get_adapter",
    "get_adapters",
    "list_adapters",
    "scan_all",
    "scan_source",
    "ArduPilotAdapter",
    "AutelAdapter",
    "BetaflightAdapter",
    "DJIAdapter",
    "PX4Adapter",
]
