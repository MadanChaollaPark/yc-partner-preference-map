#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import io
import json
from pathlib import Path
from typing import Any


DEFAULT_AXES = ["lx", "ly", "rx", "ry", "lt", "rt"]


def load_jsonl(path: Path, strict: bool = True) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            stripped = line.strip()
            if not stripped:
                continue
            try:
                event = json.loads(stripped)
            except json.JSONDecodeError:
                if strict:
                    raise ValueError(f"invalid JSON on line {line_number} of {path}") from None
                continue
            if isinstance(event, dict):
                events.append(event)
    return events


def session_summary(events: list[dict[str, Any]]) -> dict[str, Any]:
    input_events = [event for event in events if event.get("event") == "input"]
    sample_events = [event for event in events if event.get("event") == "sample"]
    start_event = next((event for event in events if event.get("event") == "session_start"), {})
    end_event = next((event for event in reversed(events) if event.get("event") == "session_end"), {})
    duration_ms = max((int(event.get("t_ms", 0) or 0) for event in events), default=0)
    controller = start_event.get("controller", {})
    return {
        "schema": start_event.get("schema"),
        "started_at": start_event.get("started_at"),
        "ended_at": end_event.get("ended_at"),
        "duration_ms": duration_ms,
        "event_count": len(events),
        "input_count": len(input_events),
        "sample_count": len(sample_events),
        "controller": controller if isinstance(controller, dict) else {},
        "source": start_event.get("source", {}),
        "input_file": start_event.get("input_file", {}),
    }


def jsonl_to_csv_text(path: Path, strict: bool = True) -> str:
    return events_to_csv_text(load_jsonl(path, strict=strict))


def events_to_csv_text(events: list[dict[str, Any]]) -> str:
    if any(event.get("event") == "sample" for event in events):
        return telemetry_events_to_csv_text(events)
    return controller_events_to_csv_text(events)


def controller_events_to_csv_text(events: list[dict[str, Any]]) -> str:
    button_names = collect_button_names(events)
    fieldnames = [
        "t_ms",
        "event",
        *DEFAULT_AXES,
        "buttons_pressed",
        "hats",
        *[f"button_{name}" for name in button_names],
    ]

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()

    for event in events:
        axes = event.get("axes", {})
        buttons = event.get("buttons", {})
        hats = event.get("hats", [])
        row: dict[str, Any] = {
            "t_ms": event.get("t_ms", ""),
            "event": event.get("event", ""),
            "buttons_pressed": "|".join(pressed_buttons(buttons)),
            "hats": json.dumps(hats, separators=(",", ":")),
        }
        for axis in DEFAULT_AXES:
            row[axis] = axes.get(axis, "") if isinstance(axes, dict) else ""
        for name in button_names:
            row[f"button_{name}"] = button_value(buttons, name)
        writer.writerow(row)

    return output.getvalue()


def telemetry_events_to_csv_text(events: list[dict[str, Any]]) -> str:
    rows = [flatten_event(event) for event in events]
    preferred = ["t_ms", "timestamp", "event", "source_row", "source_event", "message_type"]
    fields = sorted({field for row in rows for field in row})
    fieldnames = [field for field in preferred if field in fields]
    fieldnames.extend(field for field in fields if field not in fieldnames)

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    return output.getvalue()


def flatten_event(event: dict[str, Any]) -> dict[str, Any]:
    flattened: dict[str, Any] = {}

    def visit(prefix: str, value: Any) -> None:
        if isinstance(value, dict):
            for child_key, child_value in value.items():
                visit(f"{prefix}.{child_key}" if prefix else str(child_key), child_value)
        elif isinstance(value, list):
            flattened[prefix] = json.dumps(value, separators=(",", ":"))
        elif value is None:
            flattened[prefix] = ""
        else:
            flattened[prefix] = value

    visit("", event)
    return flattened


def collect_button_names(events: list[dict[str, Any]]) -> list[str]:
    names: set[str] = set()
    for event in events:
        buttons = event.get("buttons", {})
        if isinstance(buttons, dict):
            names.update(str(name) for name in buttons)
    return sorted(names)


def pressed_buttons(buttons: Any) -> list[str]:
    if not isinstance(buttons, dict):
        return []
    return [str(name) for name, pressed in buttons.items() if bool(pressed)]


def button_value(buttons: Any, name: str) -> str:
    if not isinstance(buttons, dict) or name not in buttons:
        return ""
    return "1" if bool(buttons[name]) else "0"


def main() -> int:
    parser = argparse.ArgumentParser(description="Export a Vedawiki JSONL controller session to CSV.")
    parser.add_argument("session", type=Path)
    parser.add_argument("-o", "--output", type=Path)
    args = parser.parse_args()

    csv_text = jsonl_to_csv_text(args.session)
    if args.output:
        args.output.write_text(csv_text, encoding="utf-8")
    else:
        print(csv_text, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
