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
    import_parser.add_argument("--input", required=True, type=Path)
    import_parser.add_argument("--source-type", required=True, choices=SUPPORTED_SOURCE_TYPES)
    import_parser.add_argument(
        "--copy-raw",
        action="store_true",
        help="Copy raw artifacts into the session raw/ directory. Disabled by default.",
    )
    import_parser.set_defaults(func=_cmd_import)

    show_parser = subparsers.add_parser("show", help="Print the session manifest.")
    show_parser.add_argument("session_dir", type=Path)
    show_parser.set_defaults(func=_cmd_show)

    adapters_parser = subparsers.add_parser("list-adapters", help="List known passive import adapters.")
    adapters_parser.set_defaults(func=_cmd_list_adapters)
    return parser


def _cmd_init(args: argparse.Namespace) -> int:
    manifest = create_session(
        args.session_dir,
        platform_family=args.platform_family,
        controller_stack=args.controller_stack,
        authorization_basis=args.authorization_basis,
        capture_mode=args.capture_mode,
        notes=args.notes,
    )
    print(json.dumps({"session_id": manifest["session_id"], "session_dir": str(args.session_dir)}, indent=2))
    return 0


def _cmd_import(args: argparse.Namespace) -> int:
    events = import_source(
        args.session_dir,
        args.input,
