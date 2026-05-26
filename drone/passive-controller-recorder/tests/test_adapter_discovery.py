from __future__ import annotations

import importlib
import json
import socket
import subprocess
import urllib.request

import pytest


def _adapter_names(adapters):
    if isinstance(adapters, dict):
        return {str(name).lower() for name in adapters}

    names = set()
    for adapter in adapters:
        if isinstance(adapter, str):
            names.add(adapter.lower())
            continue
        name = getattr(adapter, "name", None) or getattr(adapter, "id", None)
        if name:
            names.add(str(name).lower())
    return names


def _discover_adapters(sources_module):
    for name in (
        "discover_adapters",
        "available_adapters",
        "list_adapters",
        "get_adapters",
    ):
        discover = getattr(sources_module, name, None)
        if callable(discover):
            return discover()
    models = importlib.import_module("passive_recorder.models")
    supported = getattr(models, "SUPPORTED_SOURCE_TYPES", None)
    if supported:
        return supported
    pytest.fail("passive_recorder must expose adapter discovery or supported source types")


def test_adapter_discovery_does_not_touch_hardware_or_network(monkeypatch):
    def forbidden(*args, **kwargs):  # pragma: no cover - only runs on a violation
        raise AssertionError("adapter discovery must not probe hardware, network, or shell commands")

    monkeypatch.setattr(socket, "socket", forbidden)
    monkeypatch.setattr(socket, "create_connection", forbidden)
    monkeypatch.setattr(urllib.request, "urlopen", forbidden)
    monkeypatch.setattr(subprocess, "Popen", forbidden)
    monkeypatch.setattr(subprocess, "run", forbidden)

    sources = importlib.import_module("passive_recorder.sources")
    adapters = _discover_adapters(sources)

    names = _adapter_names(adapters)
    assert names, "adapter discovery should return at least one import-capable adapter"
    assert any(name in names for name in {"dji", "autel", "betaflight", "ardupilot", "px4"})


def test_cli_adapter_listing_does_not_touch_hardware_or_network(monkeypatch, capsys):
    def forbidden(*args, **kwargs):  # pragma: no cover - only runs on a violation
        raise AssertionError("adapter listing must not probe hardware, network, or shell commands")

    monkeypatch.setattr(socket, "socket", forbidden)
    monkeypatch.setattr(socket, "create_connection", forbidden)
    monkeypatch.setattr(urllib.request, "urlopen", forbidden)
    monkeypatch.setattr(subprocess, "Popen", forbidden)
    monkeypatch.setattr(subprocess, "run", forbidden)

    cli = importlib.import_module("passive_recorder.cli")
    assert cli.main(["list-adapters"]) == 0

    output = capsys.readouterr().out
    payload = json.loads(output)
    names = _adapter_names(payload["adapters"])
    assert names
    assert any(name in names for name in {"generic", "dji", "autel", "betaflight", "ardupilot", "px4"})
