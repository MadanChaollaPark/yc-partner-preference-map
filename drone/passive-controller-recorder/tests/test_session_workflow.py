from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


HASH_RE = re.compile(r"^[0-9a-f]{64}$")


def _assert_success(result, command: tuple[str, ...]) -> None:
    assert result.returncode == 0, (
        f"command failed: {' '.join(command)}\nstdout:\n{result.stdout}\nstderr:\n{result.stderr}"
    )


def _run_first_success(cli_runner, commands: list[tuple[str, ...]]):
    failures = []
    for command in commands:
        result = cli_runner(*command)
        if result.returncode == 0:
            return result, command
        failures.append(
            f"$ python -m passive_recorder.cli {' '.join(command)}\n"
            f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
        )
    raise AssertionError("no CLI command variant succeeded:\n\n" + "\n\n".join(failures))


def _init_session(cli_runner, session_dir: Path):
    metadata = (
        "--platform-family",
        "synthetic-test-platform",
        "--controller-stack",
        "pytest-controller-stack",
        "--authorization-basis",
        "pytest-created temporary fixture owned by the test",
    )
    return _run_first_success(
        cli_runner,
        [
            ("init", str(session_dir), *metadata),
            ("session", "init", str(session_dir), *metadata),
        ],
    )


def _import_sample_log(cli_runner, session_dir: Path, sample_log: Path):
    return _run_first_success(
        cli_runner,
        [
            ("import", str(session_dir), "--input", str(sample_log), "--source-type", "dji"),
            ("import", str(sample_log), "--session", str(session_dir), "--source", "sample"),
            ("import", str(sample_log), "--session", str(session_dir), "--source", "jsonl"),
            ("import", str(sample_log), "--session", str(session_dir)),
            ("session", "import", str(session_dir), str(sample_log)),
        ],
    )


def _load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def _find_manifest(session_dir: Path) -> Path:
    manifests = sorted(
        path
        for path in session_dir.rglob("*.json")
        if path.name in {"manifest.json", "session.json"}
    )
    assert manifests, f"no manifest/session JSON found under {session_dir}"
    assert len(manifests) == 1, f"expected one manifest/session JSON, found {manifests}"
    return manifests[0]


def _event_candidates(session_dir: Path):
    for path in sorted(session_dir.rglob("*")):
        if not path.is_file() or path.name == "manifest.json":
            continue
        if path.suffix in {".jsonl", ".ndjson"}:
            rows = [
                json.loads(line)
                for line in path.read_text(encoding="utf-8").splitlines()
                if line.strip()
            ]
            if rows:
                yield path, rows
        elif path.suffix == ".json":
            payload = _load_json(path)
            if isinstance(payload, list):
                yield path, payload
            elif isinstance(payload, dict) and isinstance(payload.get("events"), list):
                yield path, payload["events"]


def _load_recorded_events(session_dir: Path) -> tuple[Path, list[dict]]:
    for path, events in _event_candidates(session_dir):
        if all(isinstance(event, dict) for event in events) and any(
            _event_hash(event) for event in events
        ):
            return path, events
    raise AssertionError(f"no hashed recorded event file found under {session_dir}")


def _event_hash(event: dict) -> str | None:
    artifact = event.get("artifact")
    artifact_hash = artifact.get("sha256") if isinstance(artifact, dict) else None
    return event.get("hash") or event.get("event_hash") or artifact_hash


def test_session_init_creates_manifest_with_safety_fields(cli_runner, tmp_path):
    session_dir = tmp_path / "session"

    result, command = _init_session(cli_runner, session_dir)
    _assert_success(result, command)

    manifest = _load_json(_find_manifest(session_dir))
    assert manifest["schema_version"]
    assert manifest["session_id"]
    assert manifest["created_at"]

    safety = manifest["safety"]
    assert safety["passive_only"] is True
    assert safety["no_transmit"] is True
    assert safety["no_rf_interception"] is True
    assert safety["owned_or_authorized_sources_only"] is True


def test_importing_sample_log_writes_normalized_hashed_events(cli_runner, tmp_path):
    session_dir = tmp_path / "session"
    sample_log = tmp_path / "DJIFlightRecord_test.txt"
    sample_log.write_text(
        "\n".join(
            [
                json.dumps(
                    {
                        "ts": "2026-05-26T12:00:00.000000+00:00",
                        "event": "controller.connected",
                        "data": {"controller_id": "temp-controller"},
                    },
                    sort_keys=True,
                ),
                json.dumps(
                    {
                        "ts": "2026-05-26T12:00:01.250000+00:00",
                        "event": "axis.changed",
                        "data": {"axis": "yaw", "value": 0.5},
                    },
                    sort_keys=True,
                ),
            ]
        )
        + "\n",
        encoding="utf-8",
    )

    result, command = _init_session(cli_runner, session_dir)
    _assert_success(result, command)
    result, command = _import_sample_log(cli_runner, session_dir, sample_log)
    _assert_success(result, command)

    expected_sha256 = hashlib.sha256(sample_log.read_bytes()).hexdigest()
    events_path, events = _load_recorded_events(session_dir)
    assert events_path.is_relative_to(session_dir)
    assert len(events) == 1

    event = events[0]
    assert event["session_id"]
    assert event["event_type"] == "source_artifact_discovered"
    assert event["recorded_at"].endswith("Z")
    assert event["schema"] == "passive_recorder.source_artifact.v1"
    assert event["source"]["name"] == "dji"
    assert event["source"]["mode"] == "imported_exported_logs"
    assert event["metadata"]["passive_only"] is True
    assert event["metadata"]["live_capture_supported"] is False

    artifact = event["artifact"]
    assert artifact["filename"] == sample_log.name
    assert artifact["path"].endswith(sample_log.name)
    assert artifact["sha256"] == expected_sha256
    assert artifact["size_bytes"] == sample_log.stat().st_size
    assert artifact["extension"] == ".txt"
    assert HASH_RE.match(_event_hash(event) or "")
    assert event["classification"]["artifact_type"] == "dji_flight_record"
    assert event["classification"]["confidence"] in {"medium", "high"}
