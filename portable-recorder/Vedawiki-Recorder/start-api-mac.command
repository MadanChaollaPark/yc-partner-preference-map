#!/bin/bash
set -e

cd "$(dirname "$0")"
source .venv/bin/activate
export VEDAWIKI_SESSIONS_DIR="$(pwd)/sessions"
python recorder/server.py
