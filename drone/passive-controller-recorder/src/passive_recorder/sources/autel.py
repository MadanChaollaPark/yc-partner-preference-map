"""Passive adapter for Autel exported flight logs."""

from __future__ import annotations

from .base import ArtifactRule, AdapterResult, PassiveSourceAdapter


class AutelAdapter(PassiveSourceAdapter):
    name = "autel"
    display_name = "Autel"
    source_metadata = {"vendor": "Autel Robotics"}
    artifact_rules = (
        ArtifactRule(
            artifact_type="autel_flight_record",
            extensions=(".txt", ".csv", ".log", ".json", ".kml"),
            name_keywords=(
                "autel",
                "evo",
                "dragonfish",
                "flightrecord",
                "flight_record",
                "flight-record",
                "flight record",
            ),
            path_keywords=("autel", "evo", "dragonfish", "flightrecord"),
            confidence="high",
            require_keyword=True,
        ),
        ArtifactRule(
            artifact_type="autel_telemetry_sidecar",
            extensions=(".srt", ".gpx"),
            name_keywords=("autel", "evo", "dragonfish", "telemetry"),
            path_keywords=("autel", "evo", "dragonfish"),
            confidence="medium",
            require_keyword=True,
        ),
    )


ADAPTER = AutelAdapter()


def scan(path: object) -> AdapterResult:
    return ADAPTER.scan(path)


def iter_events(path: object):
    return ADAPTER.iter_events(path)


__all__ = ["ADAPTER", "AutelAdapter", "scan", "iter_events"]
