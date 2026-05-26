from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Sequence

from .models import SUPPORTED_SOURCE_TYPES, PassiveRecorderError, __version__
from .storage import create_session, import_source, load_manifest


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="passive-recorder",
        description="Passive recorder for owned/exported drone and controller artifacts.",
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    subparsers = parser.add_subparsers(dest="command", required=True)

    init_parser = subparsers.add_parser("init", help="Create a passive recording session.")
    init_parser.add_argument("session_dir", type=Path)
    init_parser.add_argument("--platform-family", required=True)
    init_parser.add_argument("--controller-stack", required=True)
    init_parser.add_argument("--authorization-basis", required=True)
    init_parser.add_argument(
        "--capture-mode",
        default="exported_log_import",
        choices=("exported_log_import", "owned_endpoint_capture", "manual_session_metadata"),
    )
    init_parser.add_argument("--notes")
    init_parser.set_defaults(func=_cmd_init)

    import_parser = subparsers.add_parser("import", help="Hash and index local exported artifacts.")
    import_parser.add_argument("session_dir", type=Path)
