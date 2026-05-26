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
            self.assertEqual(result.sample_count, 2)
            self.assertIsNotNone(result.raw_archive_path)
            self.assertEqual(summary["schema"], "vedawiki.telemetry.v1")
            self.assertEqual(summary["sample_count"], 2)
            self.assertEqual(events[1]["link"]["rssi"], 87)
            self.assertEqual(events[1]["power"]["receiver_voltage_v"], 5.1)
            self.assertEqual(events[1]["gnss"]["lat_deg"], 37.4219999)
            self.assertEqual(events[1]["flight_mode"], "Stabilize")

    def test_csv_export_flattens_telemetry_samples(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = import_log(FIXTURES / "edgetx_sample.csv", sessions_dir=Path(tmp), source_id="edgetx")
            rows = list(csv.DictReader(io.StringIO(events_to_csv_text(load_jsonl(result.output_path)))))

            sample_rows = [row for row in rows if row["event"] == "sample"]
            self.assertEqual(sample_rows[0]["link.rssi"], "87")
            self.assertEqual(sample_rows[0]["power.receiver_voltage_v"], "5.1")
            self.assertEqual(sample_rows[0]["gnss.lon_deg"], "-122.0840575")

    def test_import_existing_controller_jsonl(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = import_log(
                FIXTURES / "sample_session.jsonl",
                sessions_dir=Path(tmp),
                source_id="generic",
            )
            events = load_jsonl(result.output_path)
            samples = [event for event in events if event.get("event") == "sample"]

            self.assertEqual(len(samples), 2)
            self.assertEqual(samples[0]["controller"]["axes"]["rt"], 0.64)
            self.assertTrue(samples[0]["controller"]["buttons"]["a"])

    def test_control_message_payload_is_redacted(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = import_log(
                FIXTURES / "mavlink_command_sample.csv",
                sessions_dir=Path(tmp),
                source_id="mavlink",
            )
            events = load_jsonl(result.output_path)
            sample = next(event for event in events if event.get("event") == "sample")

            self.assertEqual(sample["message_type"], "COMMAND_LONG")
            self.assertTrue(sample["control_payload_redacted"])
            self.assertNotIn("command", sample.get("telemetry", {}))
            self.assertNotIn("param1", sample.get("telemetry", {}))


if __name__ == "__main__":
    unittest.main()

