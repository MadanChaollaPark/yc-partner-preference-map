from __future__ import annotations

import re


ANSI_RE = re.compile(r"\x1b\[[0-9;]*m")


def _plain_text(value: str) -> str:
    return ANSI_RE.sub("", value).lower()


def test_cli_help_describes_passive_recorder_commands(cli_runner):
    result = cli_runner("--help")

    assert result.returncode == 0, result.stderr or result.stdout
    help_text = _plain_text(result.stdout + result.stderr)
    assert "passive" in help_text
    assert "session" in help_text
    assert "import" in help_text
    assert "adapter" in help_text
