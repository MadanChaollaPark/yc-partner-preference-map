# Vedawiki Field Recorder

Vedawiki Field Recorder is an authorized controller-side telemetry recorder for
training, debriefing, QA, and evaluation. The recorder of record is a native local
Python process. The Vite/React app is only the replay and dashboard UI.

The prototype records Xbox-compatible controller input through `pygame`, writes
append-only JSONL sessions, exposes those sessions through a local FastAPI server,
and lets the dashboard replay/export them.

## Run The Native Recorder

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r recorder/requirements.txt
python recorder/recorder.py
```

Use `python3` instead of `python` on systems where `python` is not on `PATH`.

Plug in an Xbox-compatible controller, then move sticks or press buttons. Session
files are written to `recorder/sessions/`.

The recorder is telemetry-only. It never sends controller outputs or controls a
drone.

## Run The Local API

In a second terminal with the same virtualenv active:

```sh
python recorder/server.py
```

The API runs at `http://127.0.0.1:8000`.

Endpoints:

- `GET /sessions`
- `GET /sessions/{name}`
- `GET /sessions/{name}?format=jsonl`
- `GET /sessions/{name}/csv`

## Run The Dashboard

In a third terminal:

```sh
npm install
npm run dev
```

Open the Vite URL, usually `http://localhost:5173`, and use the Recorder Dashboard
section. If the FastAPI server is not running, the dashboard shows a warning.

To point the dashboard at a different recorder API:

```sh
VITE_RECORDER_API_URL=http://127.0.0.1:8000 npm run dev
```

## Export CSV Manually

```sh
python recorder/export_csv.py recorder/sessions/example.jsonl -o example.csv
```

## Tests

The Python tests use fixture sessions and do not require a physical controller.

```sh
python -m unittest discover recorder/tests
npm run build
```

## Inline USB Hardware

This repo is the working local prototype. A true inline USB device still needs
dedicated hardware that can act as USB host to the controller and USB device to
the ground station, with latency testing, passthrough failure handling, local
storage hardening, and tamper-evident packaging.
