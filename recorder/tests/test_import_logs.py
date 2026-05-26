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
        catalog = source_catalog()
        self.assertEqual(catalog[0]["id"], "dji")
        self.assertEqual(get_source("mavlink").ecosystem, "Open autopilot telemetry")
        self.assertEqual(detect_source(Path("radio-edgetx-telemetry.csv")).id, "edgetx")
        self.assertEqual(detect_source(Path("flight.ulg")).id, "mavlink")

    def test_import_edgetx_csv_to_normalized_jsonl(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = import_log(
                FIXTURES / "edgetx_sample.csv",
                sessions_dir=Path(tmp),
                source_id="edgetx",
                archive_raw=True,
            )
            events = load_jsonl(result.output_path)
            summary = session_summary(events)

            self.assertEqual(result.source_id, "edgetx")
