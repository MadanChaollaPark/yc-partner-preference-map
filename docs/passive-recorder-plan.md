# Passive Recorder Product Plan

Vedawiki should ship as a passive recorder for authorized, non-weaponized UAV
evaluation. The product must never transmit commands, bypass protected links, or
sit in a control path unless the hardware has been independently validated as
read-only or fail-open.

## Product Layers

1. USB/log-import recorder
   - Runs on a laptop, ground station, or USB working folder.
   - Imports official exports, SD-card CSV/JSON logs, simulator logs, and existing
     Vedawiki controller JSONL.
   - Normalizes data into `vedawiki.telemetry.v1` JSONL.
   - This is the first shippable product.

2. Read-only physical recorder
   - USB-C for power, configuration, firmware update, and log export.
   - Separate receive-only telemetry input for open systems such as MAVLink.
   - No transmit path on the telemetry input.
   - Electrical isolation, storage-full handling, status LEDs, and signed logs.
   - Not a universal inline dongle for closed controllers.

3. Official API/export connectors
   - DJI, Skydio, Autel, and Parrot stay import/API based unless their
     manufacturer provides a documented hardware interface.
   - The connector should preserve original exported logs and store hashes before
     normalization.

## Source Priority

| Priority | Ecosystem | Common Controllers / Stack | Safe Capture Mode |
| --- | --- | --- | --- |
| 1 | DJI | RC, RC 2, RC Pro, RC Pro Enterprise, RC Plus / Plus 2 | Official export, SDK, or cloud/API |
| 2 | MAVLink / ArduPilot / PX4 | Mission Planner, QGroundControl, Pixhawk, CubePilot, Holybro, CUAV | USB import, SD-card import, read-only serial |
| 3 | EdgeTX / ELRS / Crossfire | RadioMaster Boxer, TX16S, ExpressLRS, TBS Crossfire | SD-card CSV, approved telemetry export |
| 4 | Betaflight / iNav | Blackbox-capable FPV controllers | Blackbox CSV/JSON import |
| 5 | Skydio | X10 Controller, Flight Deck, Skydio Cloud | Official cloud/API export |
| 6 | Autel | Smart Controller V3, EVO Max, Dragonfish, SkyCommand | Official log/cloud export |
| 7 | Parrot | Skycontroller, FreeFlight, ANAFI Ai/USA | SDK, GUTMA, or log export |

## Current Implementation

- `recorder/sources.py` defines the source catalog and passive boundaries.
- `recorder/import_logs.py` imports CSV, JSON, JSONL, NDJSON, and GUTMA-style JSON.
- Binary logs such as `.tlog`, `.bin`, `.ulg`, and `.bbl` are registered as
  raw-only until an approved decoder is added.
- Command-style MAVLink records are redacted by default during normalization.
- `GET /sources` exposes the source catalog to local tooling.

## Next Hardware Milestones

1. Bench prototype with USB-C power/export and microSD storage.
2. Receive-only UART telemetry input with no TX pin populated.
3. MAVLink simulator validation using ArduPilot SITL and PX4 SITL.
4. Storage-full, power-loss, and timestamp-drift tests.
5. Signed log manifest and tamper-evident enclosure.
6. Field pilot with written authorization and non-weaponized test aircraft.

