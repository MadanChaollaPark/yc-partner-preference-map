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
