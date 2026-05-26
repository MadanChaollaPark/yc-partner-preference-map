from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

import pytest


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_ROOT = PROJECT_ROOT / "src"

if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))


@pytest.fixture
def cli_runner():
    def run_cli(*args: str, cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
        env = os.environ.copy()
        env["PYTHONPATH"] = (
            str(SRC_ROOT)
            if not env.get("PYTHONPATH")
            else str(SRC_ROOT) + os.pathsep + env["PYTHONPATH"]
        )
        return subprocess.run(
            [sys.executable, "-m", "passive_recorder.cli", *args],
            cwd=cwd or PROJECT_ROOT,
            env=env,
            text=True,
            capture_output=True,
            check=False,
        )

    return run_cli
