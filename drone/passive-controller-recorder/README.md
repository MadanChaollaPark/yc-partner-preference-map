# Passive Controller Recorder

Passive Controller Recorder is a safety-first project for organizing drone and controller records from artifacts the operator already owns or can lawfully export. The project scope is endpoint-side only: exported flight records, controller/app logs, onboard flight-controller logs, DVR/video files, and explicit session metadata.

The project does not interact with aircraft, radio links, proprietary control links, network traffic, or third-party systems. It is not a collection, interception, disruption, or targeting tool.

## Scope

In scope:

- Import logs exported from official controller, mobile, or enterprise apps.
- Import flight-controller logs copied from removable storage or device exports.
- Attach endpoint-side media such as DVR/video captures and operator-provided session notes.
- Normalize metadata for review, cataloging, incident reconstruction, maintenance history, and fleet recordkeeping.
- Preserve original artifacts and track provenance, timestamps, source platform, and operator-supplied context.

Out of scope:

- RF interception, protocol capture, link analysis, or bypassing proprietary links.
- Jamming, spoofing, replay, injection, takeover, or command/control interaction.
- Collection from drones, controllers, networks, or accounts without explicit authorization.
- Targeting workflows, battlefield collection, surveillance tasking, or adversary tracking.
- Any feature that requires the recorder to transmit to, pair with, or control an aircraft or controller.

See [docs/safety.md](docs/safety.md) for the project boundaries.

## Quickstart

1. Export or copy records from a system you own or are authorized to manage.
2. Place original artifacts in a local working folder outside the repository.
3. Create a local session manifest with authorization context.
4. Run the importer against that folder.
5. Review normalized records and provenance metadata.
6. Keep originals immutable and store generated outputs separately.

```sh
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -e ".[dev]"

passive-recorder init ./sessions/test-dji \
  --platform-family dji_mavic_matrice \
  --controller-stack "DJI RC / DJI app exported FlightRecord" \
  --authorization-basis "Operator-owned controller export"

passive-recorder import ./sessions/test-dji \
  --source-type dji \
  --input /path/to/owned/DJI/FlightRecord

passive-recorder list-adapters
passive-recorder show ./sessions/test-dji
```

The importer hashes and indexes artifacts by default. It does not copy raw files into the session unless `--copy-raw` is explicitly supplied.

Expected input classes:

- DJI app/controller FlightRecord exports and related controller-side artifacts.
- Betaflight blackbox logs, EdgeTX radio logs, DVR/video files, and operator session metadata.
- Autel Enterprise/App exports and Smart Controller V3 owned logs.
- ArduPilot/PX4 logs copied from Pixhawk/Cube/Matek/CUAV-class systems.
- Fiber-optic FPV endpoint artifacts such as FC logs, DVR/video, and session metadata.

## Supported Platforms Roadmap

Priority 1: DJI Mavic/Matrice ecosystems using DJI RC, DJI RC Pro Enterprise, Smart Controller Enterprise, and exported DJI app/controller FlightRecord logs.

Priority 2: FPV multirotors using Betaflight flight controllers, ELRS/CRSF/SBUS configurations, and EdgeTX radios such as RadioMaster-class transmitters. Collection remains limited to owned endpoint logs and exported files.

Priority 3: Autel EVO Max 4T and similar enterprise aircraft using Autel Smart Controller V3 and Autel Enterprise/App logs.

Priority 4: Fixed-wing and larger recon platforms using ArduPilot/PX4 on Pixhawk, Cube, Matek, or CUAV-class flight controllers.

Priority 5: Fiber-optic FPV systems, limited to endpoint-side artifacts such as FC logs, DVR/video, and operator-provided session metadata.

See [docs/research.md](docs/research.md) and [docs/roadmap.md](docs/roadmap.md) for more detail.

## Design Principles

- Passive by default: the recorder reads files and metadata only.
- Operator-owned data: every import path assumes explicit ownership or authorization.
- Preserve originals: never modify source artifacts during import.
- Provenance first: record where each artifact came from, who supplied it, and how it was processed.
- Practical review: optimize for cataloging, auditability, maintenance, and incident analysis.
- Safety gates: reject workflows that require interference with aircraft, controllers, links, or third-party systems.

## Repository Layout

Current layout:

```text
passive-controller-recorder/
  README.md
  docs/
    research.md
    roadmap.md
    safety.md
  samples/
  schemas/
  src/passive_recorder/
  tests/
```

Documentation in this repository should keep the same safety boundary: owned/exported artifacts only, endpoint-side capture only, and no operational or offensive collection details.
