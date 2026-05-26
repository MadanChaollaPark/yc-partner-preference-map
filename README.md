# Vedawiki Field Recorder

Vedawiki Field Recorder is an authorized controller-side telemetry recorder for
training, debriefing, QA, and evaluation. The recorder of record is a native local
Python process. The Vite/React app is the public download and instructions site.

The prototype records Xbox-compatible controller input through `pygame`, imports
passive CSV/JSON telemetry logs from approved controller ecosystems, writes
append-only JSONL sessions, exposes those sessions through a local FastAPI server,
and includes manual CSV export tooling for review workflows.

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

## Import Passive Logs

Use the importer for official exports, SD-card logs, simulator logs, or
read-only telemetry captures from authorized non-weaponized UAV programs.

```sh
python3 recorder/import_logs.py --list-sources
python3 recorder/import_logs.py path/to/log.csv --source edgetx --archive-raw
python3 recorder/import_logs.py path/to/qgroundcontrol.csv --source mavlink
```

Supported passive source families:

- DJI controller exports: import/API only unless an official SDK path is configured.
- MAVLink / ArduPilot / PX4: CSV/JSON import now, with physical read-only serial as the realistic hardware path.
- EdgeTX / ELRS / Crossfire: SD-card CSV and approved telemetry exports.
- Betaflight / iNav Blackbox: CSV/JSON imports; binary logs are registered for approved offline decoding.
- Skydio, Autel, and Parrot: official export, cloud, SDK, or GUTMA-style imports.

Closed platforms are not treated as generic physical dongles. Vedawiki does not
decode protected links, modify firmware, or inject commands.

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
- `GET /sources`

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

## Passive Hardware

This repo is the working local prototype. A physical device still needs
dedicated hardware with receive-only telemetry inputs, local storage hardening,
latency testing, failure handling, and tamper-evident packaging.

The safer hardware product path is a USB-C passive recorder with a separate
read-only telemetry input for open systems such as MAVLink. Closed ecosystems
should stay software/API/import based unless the manufacturer provides an
official hardware interface.
