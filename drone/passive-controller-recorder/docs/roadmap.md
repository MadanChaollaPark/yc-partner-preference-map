# Roadmap

This roadmap keeps the project focused on passive, authorized, endpoint-side artifacts. Each phase should preserve the non-interference boundaries in [safety.md](safety.md).

## Phase 0: Project Skeleton and Safety Baseline

Goals:

- Establish README, safety rules, research priorities, and roadmap.
- Define the project as a file-import and metadata-normalization tool.
- Add placeholders for samples, schemas, source, and tests without implying live collection.

Exit criteria:

- Safety boundaries are documented.
- Supported-platform priorities are documented.
- Future implementation work has a clear passive scope.

## Phase 1: Core Artifact Intake

Goals:

- Implement a local import workflow for operator-selected folders.
- Preserve original artifacts read-only.
- Compute content hashes and basic file metadata.
- Record source platform, artifact type, operator-provided authorization notes, and import timestamp.
- Produce validation output that distinguishes parsed, unsupported, incomplete, and rejected artifacts.

Initial artifact classes:

- DJI FlightRecord exports.
- Betaflight flight-controller logs.
- EdgeTX radio-side logs where exported by the operator.
- DVR/video files.
- Session metadata forms.

Exit criteria:

- Imports never modify originals.
- No network or device interaction is required.
- Unsupported artifacts are reported without destructive behavior.

## Phase 2: DJI and FPV Baseline Coverage

Goals:

- Add practical DJI Mavic/Matrice import coverage for exported app/controller FlightRecord logs.
- Add FPV multirotor coverage for Betaflight logs and operator-supplied EdgeTX/DVR metadata.
- Normalize common fields across flight records, FC logs, video, and session notes.
- Add sample fixtures that are synthetic, anonymized, or explicitly permitted.

Exit criteria:

- DJI and FPV records can be cataloged with provenance and parse confidence.
- Generated reports identify gaps without inventing missing telemetry.
- Tests cover safe handling of malformed and unsupported files.

## Phase 3: Autel and ArduPilot/PX4 Coverage

