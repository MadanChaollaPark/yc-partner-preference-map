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

