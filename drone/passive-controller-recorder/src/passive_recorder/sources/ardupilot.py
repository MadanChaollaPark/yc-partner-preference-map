"""Passive adapter for ArduPilot exported and copied log artifacts."""

from __future__ import annotations

from .base import ArtifactRule, AdapterResult, PassiveSourceAdapter


class ArduPilotAdapter(PassiveSourceAdapter):
    name = "ardupilot"
    display_name = "ArduPilot"
    source_metadata = {"project": "ArduPilot"}
    artifact_rules = (
        ArtifactRule(
            artifact_type="ardupilot_dataflash_bin",
            extensions=(".bin",),
            name_keywords=(
                "ardupilot",
                "arducopter",
                "arduplane",
                "ardurover",
                "dataflash",
            ),
            path_keywords=(
                "ardupilot",
                "arducopter",
                "arduplane",
                "ardurover",
                "dataflash",
                "apm/logs",
                "apm\\logs",
            ),
            confidence="medium",
            require_keyword=False,
        ),
        ArtifactRule(
            artifact_type="ardupilot_dataflash_log",
            extensions=(".log",),
            name_keywords=(
                "ardupilot",
                "arducopter",
                "arduplane",
                "ardurover",
                "dataflash",
            ),
            path_keywords=(
                "ardupilot",
                "arducopter",
                "arduplane",
                "ardurover",
                "dataflash",
                "apm/logs",
                "apm\\logs",
            ),
            confidence="medium",
            require_keyword=True,
        ),
        ArtifactRule(
            artifact_type="ardupilot_mavlink_tlog",
            extensions=(".tlog",),
            name_keywords=("ardupilot", "mavlink", "missionplanner"),
            path_keywords=("ardupilot", "mavlink", "missionplanner"),
            confidence="high",
            require_keyword=False,
        ),
    )


ADAPTER = ArduPilotAdapter()


def scan(path: object) -> AdapterResult:
    return ADAPTER.scan(path)


def iter_events(path: object):
    return ADAPTER.iter_events(path)


__all__ = ["ADAPTER", "ArduPilotAdapter", "scan", "iter_events"]
