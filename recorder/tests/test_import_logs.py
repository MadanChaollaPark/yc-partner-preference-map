from __future__ import annotations

import csv
import io
import tempfile
import unittest
from pathlib import Path

from recorder.export_csv import events_to_csv_text, load_jsonl, session_summary
from recorder.import_logs import import_log
from recorder.sources import detect_source, get_source, source_catalog


FIXTURES = Path(__file__).resolve().parent / "fixtures"


class ImportLogsTest(unittest.TestCase):
    def test_source_catalog_prioritizes_expected_ecosystems(self) -> None:
