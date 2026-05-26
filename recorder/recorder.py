#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import pygame
except ImportError as exc:  # pragma: no cover - depends on local install state.
    raise SystemExit(
        "pygame is required for the native recorder. "
        "Run: pip install -r recorder/requirements.txt"
    ) from exc


BASE_DIR = Path(__file__).resolve().parent
SESSIONS_DIR = BASE_DIR / "sessions"
POLL_HZ = 50
DEADZONE = 0.04
BUTTON_NAMES = [
    "a",
    "b",
    "x",
    "y",
    "lb",
    "rb",
    "back",
    "start",
    "guide",
    "left_stick",
    "right_stick",
]
XBOX_NAME_MARKERS = ("xbox", "x-input", "xinput", "microsoft", "xbox 360", "xbox one")


@dataclass
class ActiveSession:
    joystick: Any
    path: Path
    handle: Any
    started_at: datetime
    monotonic_start: float
    last_state: dict[str, Any] | None = None
    closed: bool = False

    @property
    def controller_name(self) -> str:
        return self.joystick.get_name()

    @property
    def instance_id(self) -> int:
        try:
            return int(self.joystick.get_instance_id())
        except (AttributeError, pygame.error):
            return int(self.joystick.get_id())

    def elapsed_ms(self) -> int:
        return max(0, round((time.monotonic() - self.monotonic_start) * 1000))

    def write(self, event: dict[str, Any]) -> None:
        if self.closed:
            return
        event.setdefault("t_ms", self.elapsed_ms())
        self.handle.write(json.dumps(event, separators=(",", ":"), sort_keys=True) + "\n")
        self.handle.flush()
        os.fsync(self.handle.fileno())

    def close(self, reason: str) -> None:
        if self.closed:
            return
        self.write(
            {
                "event": "session_end",
                "reason": reason,
                "ended_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        self.handle.close()
        self.closed = True


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Vedawiki Field Recorder native controller telemetry capture."
    )
    parser.add_argument("--sessions-dir", type=Path, default=SESSIONS_DIR)
    parser.add_argument("--poll-hz", type=int, default=POLL_HZ)
    args = parser.parse_args()

    run_recorder(args.sessions_dir, max(1, args.poll_hz))
    return 0


def run_recorder(sessions_dir: Path, poll_hz: int) -> None:
    sessions_dir.mkdir(parents=True, exist_ok=True)
    pygame.init()
    pygame.joystick.init()

    sessions: dict[int, ActiveSession] = {}
    poll_seconds = 1 / poll_hz

    print("Vedawiki Field Recorder")
    print("Record-only controller telemetry. No outputs are sent to a drone or controller.")
    print(f"Writing sessions to {sessions_dir}")
    print("Plug in an Xbox-compatible controller. Press Ctrl+C to stop.")

    try:
        for index in range(pygame.joystick.get_count()):
            start_session_for_index(index, sessions, sessions_dir)

        while True:
            for event in pygame.event.get():
                if event.type == pygame.JOYDEVICEADDED:
                    start_session_for_index(event.device_index, sessions, sessions_dir)
                elif event.type == pygame.JOYDEVICEREMOVED:
                    session = sessions.pop(event.instance_id, None)
                    if session:
                        session.write({"event": "controller_disconnected"})
                        session.close("controller_disconnected")
                        print(f"closed {session.path.name}")

            for instance_id, session in list(sessions.items()):
                try:
                    state = read_controller_state(session.joystick)
                except pygame.error:
                    sessions.pop(instance_id, None)
                    session.write({"event": "controller_disconnected"})
                    session.close("controller_error")
                    continue

                if state != session.last_state:
                    session.write({"event": "input", **state})
                    session.last_state = state

            time.sleep(poll_seconds)
    except KeyboardInterrupt:
        print("\nstopping recorder")
    finally:
        for session in list(sessions.values()):
            session.close("recorder_stopped")
        pygame.joystick.quit()
        pygame.quit()


def start_session_for_index(
    joystick_index: int, sessions: dict[int, ActiveSession], sessions_dir: Path
) -> None:
    joystick = pygame.joystick.Joystick(joystick_index)
    joystick.init()
    instance_id = get_instance_id(joystick)
    if instance_id in sessions:
        return

    now = datetime.now(timezone.utc)
    path = sessions_dir / session_filename(now, joystick.get_name(), joystick_index)
    handle = path.open("a", encoding="utf-8")
    session = ActiveSession(
        joystick=joystick,
        path=path,
        handle=handle,
        started_at=now,
        monotonic_start=time.monotonic(),
    )
    sessions[instance_id] = session

    session.write(
        {
            "event": "session_start",
            "schema": "vedawiki.controller.v1",
            "product": "Vedawiki Field Recorder",
            "purpose": "authorized controller-side telemetry recorder for training, debriefing, QA, and evaluation",
            "started_at": now.isoformat(),
            "controller": {
                "id": joystick.get_name(),
                "index": joystick_index,
                "instance_id": instance_id,
                "xbox_compatible": is_xbox_compatible(joystick.get_name()),
                "axes": joystick.get_numaxes(),
                "buttons": joystick.get_numbuttons(),
                "hats": joystick.get_numhats(),
            },
            "record_only": True,
        }
    )
    session.write({"event": "controller_connected"})
    print(f"recording {joystick.get_name()} -> {path.name}")


def read_controller_state(joystick: Any) -> dict[str, Any]:
    raw_axes = [normalize_axis(joystick.get_axis(index)) for index in range(joystick.get_numaxes())]
    buttons = {
        button_name(index): bool(joystick.get_button(index))
        for index in range(joystick.get_numbuttons())
    }
    hats = [list(joystick.get_hat(index)) for index in range(joystick.get_numhats())]

    return {
        "axes": map_axes(raw_axes),
        "buttons": buttons,
        "hats": hats,
        "raw_axes": raw_axes,
    }


def map_axes(raw_axes: list[float]) -> dict[str, float]:
    return {
        "lx": value_at(raw_axes, 0),
        "ly": value_at(raw_axes, 1),
        "rx": value_at(raw_axes, 2),
        "ry": value_at(raw_axes, 3),
        "lt": trigger_value(value_at(raw_axes, 4)),
        "rt": trigger_value(value_at(raw_axes, 5)),
    }


def value_at(values: list[float], index: int) -> float:
    return values[index] if index < len(values) else 0.0


def trigger_value(value: float) -> float:
    if value < -0.001:
        return round((value + 1) / 2, 4)
    return round(max(0.0, value), 4)


def normalize_axis(value: float) -> float:
    if abs(value) < DEADZONE:
        return 0.0
    return round(float(value), 4)


def button_name(index: int) -> str:
    if index < len(BUTTON_NAMES):
        return BUTTON_NAMES[index]
    return f"button_{index}"


def get_instance_id(joystick: Any) -> int:
    try:
        return int(joystick.get_instance_id())
    except (AttributeError, pygame.error):
        return int(joystick.get_id())


def is_xbox_compatible(name: str) -> bool:
    normalized = name.lower()
    return any(marker in normalized for marker in XBOX_NAME_MARKERS)


def session_filename(started_at: datetime, controller_name: str, joystick_index: int) -> str:
    timestamp = started_at.strftime("%Y%m%dT%H%M%SZ")
    safe_name = re.sub(r"[^a-zA-Z0-9]+", "-", controller_name).strip("-").lower()
    safe_name = safe_name[:42] or "controller"
    return f"{timestamp}-{safe_name}-{joystick_index}.jsonl"


if __name__ == "__main__":
    raise SystemExit(main())
