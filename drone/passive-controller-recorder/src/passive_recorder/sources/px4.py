"""Passive adapter for PX4 exported log artifacts."""

from __future__ import annotations

from .base import ArtifactRule, AdapterResult, PassiveSourceAdapter


class PX4Adapter(PassiveSourceAdapter):
    name = "px4"
    display_name = "PX4"
    source_metadata = {"project": "PX4"}
    artifact_rules = (
        ArtifactRule(
            artifact_type="px4_ulog",
            extensions=(".ulg",),
            name_keywords=("px4", "ulog", "flightreview", "flight_review"),
            path_keywords=("px4", "ulog", "flightreview", "flight_review"),
            confidence="high",
            require_keyword=False,
        ),
        ArtifactRule(
            artifact_type="px4_exported_telemetry",
            extensions=(".csv", ".json"),
            name_keywords=("px4", "ulog", "flightreview", "flight_review"),
            path_keywords=("px4", "ulog", "flightreview", "flight_review"),
            confidence="medium",
            require_keyword=True,
        ),
    )


ADAPTER = PX4Adapter()


def scan(path: object) -> AdapterResult:
    return ADAPTER.scan(path)


def iter_events(path: object):
    return ADAPTER.iter_events(path)


__all__ = ["ADAPTER", "PX4Adapter", "scan", "iter_events"]
