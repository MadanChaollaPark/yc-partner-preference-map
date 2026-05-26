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

