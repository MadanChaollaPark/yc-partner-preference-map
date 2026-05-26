from __future__ import annotations

import importlib


def test_project_public_modules_import_without_side_effects():
    assert importlib.import_module("passive_recorder") is not None
    assert importlib.import_module("passive_recorder.cli") is not None
    assert importlib.import_module("passive_recorder.sources") is not None
