#!/bin/bash
set -e

cd "$(dirname "$0")"
mkdir -p sessions

PYTHON="${PYTHON:-python3}"

echo "Vedawiki Field Recorder"
echo "Creating local Python environment if needed..."
"$PYTHON" -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r recorder/requirements.txt

export VEDAWIKI_SESSIONS_DIR="$(pwd)/sessions"
./start-api-mac.command &
API_PID=$!
trap 'kill "$API_PID" 2>/dev/null || true' EXIT

open "https://vedawiki.com/#dashboard" 2>/dev/null || true

echo
echo "Plug in an Xbox-compatible controller."
echo "Logs will be written to: $VEDAWIKI_SESSIONS_DIR"
echo "Press Ctrl+C in this window to stop recording."
echo
python recorder/recorder.py --sessions-dir "$VEDAWIKI_SESSIONS_DIR"
