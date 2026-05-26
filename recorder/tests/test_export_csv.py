from __future__ import annotations

import csv
import io
import unittest
from pathlib import Path

from recorder.export_csv import jsonl_to_csv_text, load_jsonl, session_summary


FIXTURE = Path(__file__).resolve().parent / "fixtures" / "sample_session.jsonl"


class ExportCsvTest(unittest.TestCase):
    def test_load_jsonl_and_summary(self) -> None:
        events = load_jsonl(FIXTURE)
        summary = session_summary(events)

        self.assertEqual(len(events), 5)
        self.assertEqual(summary["duration_ms"], 5000)
        self.assertEqual(summary["input_count"], 2)
        self.assertEqual(summary["controller"]["id"], "Xbox Wireless Controller")

    def test_csv_export_flattens_axes_buttons_and_hats(self) -> None:
        csv_text = jsonl_to_csv_text(FIXTURE)
        rows = list(csv.DictReader(io.StringIO(csv_text)))

        input_rows = [row for row in rows if row["event"] == "input"]
        self.assertEqual(input_rows[0]["rt"], "0.64")
        self.assertEqual(input_rows[0]["button_a"], "1")
        self.assertEqual(input_rows[0]["button_rb"], "1")
        self.assertEqual(input_rows[1]["buttons_pressed"], "b")
        self.assertEqual(input_rows[1]["hats"], "[[1,0]]")


if __name__ == "__main__":
    unittest.main()
