"""Passive adapter for DJI exported flight logs."""

from __future__ import annotations

from .base import ArtifactRule, AdapterResult, PassiveSourceAdapter


class DJIAdapter(PassiveSourceAdapter):
    name = "dji"
    display_name = "DJI"
    source_metadata = {"vendor": "DJI"}
    artifact_rules = (
        ArtifactRule(
            artifact_type="dji_flight_record",
            extensions=(".txt", ".csv"),
            name_keywords=(
                "dji",
                "djiflightrecord",
                "flightrecord",
                "flight_record",
                "flight-record",
                "flight record",
            ),
            path_keywords=("dji", "flightrecord", "flightrecords"),
            confidence="high",
            require_keyword=True,
        ),
        ArtifactRule(
            artifact_type="dji_dat_log",
            extensions=(".dat",),
            name_keywords=("dji", "fly", "flightrecord", "flight_record"),
            path_keywords=("dji", "flightrecord", "flightrecords"),
            confidence="medium",
            require_keyword=True,
        ),
        ArtifactRule(
            artifact_type="dji_telemetry_sidecar",
            extensions=(".json", ".kml", ".srt"),
            name_keywords=("dji", "flightrecord", "flight_record", "telemetry"),
            path_keywords=("dji", "flightrecord", "flightrecords"),
            confidence="medium",
            require_keyword=True,
        ),
    )


ADAPTER = DJIAdapter()


def scan(path: object) -> AdapterResult:
    return ADAPTER.scan(path)


def iter_events(path: object):
    return ADAPTER.iter_events(path)


__all__ = ["ADAPTER", "DJIAdapter", "scan", "iter_events"]
