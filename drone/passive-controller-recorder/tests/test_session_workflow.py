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
