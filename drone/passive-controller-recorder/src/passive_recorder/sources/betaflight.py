"""Passive adapter for Betaflight Blackbox exports."""

from __future__ import annotations

from .base import ArtifactRule, AdapterResult, PassiveSourceAdapter


class BetaflightAdapter(PassiveSourceAdapter):
    name = "betaflight"
    display_name = "Betaflight"
    source_metadata = {"project": "Betaflight"}
    artifact_rules = (
        ArtifactRule(
            artifact_type="betaflight_blackbox_binary",
            extensions=(".bbl", ".bfl"),
            name_keywords=("blackbox", "betaflight", "btfl"),
            path_keywords=("blackbox", "betaflight", "btfl"),
            confidence="high",
            require_keyword=False,
        ),
        ArtifactRule(
            artifact_type="betaflight_blackbox_text",
            extensions=(".csv", ".txt", ".log"),
            name_keywords=("blackbox", "betaflight", "btfl"),
            path_keywords=("blackbox", "betaflight", "btfl"),
            confidence="medium",
            require_keyword=True,
        ),
    )


ADAPTER = BetaflightAdapter()


def scan(path: object) -> AdapterResult:
    return ADAPTER.scan(path)


def iter_events(path: object):
    return ADAPTER.iter_events(path)


__all__ = ["ADAPTER", "BetaflightAdapter", "scan", "iter_events"]
