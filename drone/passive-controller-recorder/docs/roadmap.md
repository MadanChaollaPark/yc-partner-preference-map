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

Goals:

- Add Autel Smart Controller V3 and Autel Enterprise/App exported-log intake.
- Add ArduPilot/PX4 copied-log intake for Pixhawk, Cube, Matek, and CUAV-class systems.
- Expand schemas for airframe, controller, sensor, and mission/session metadata when present in owned logs.
- Improve report views for maintenance and incident reconstruction.

Exit criteria:

- Autel and ArduPilot/PX4 records follow the same provenance model as DJI and FPV records.
- Parser limitations are explicit and test-covered.
- The project still performs no live device, network, or link interaction.

## Phase 4: Fiber-Optic FPV Endpoint Artifacts

Goals:

- Support fiber-optic FPV sessions through endpoint artifacts only.
- Link FC logs, DVR/video, and operator-provided session metadata.
- Model uncertainty clearly when telemetry is unavailable.

Exit criteria:

- Fiber-optic sessions can be cataloged without any link-side assumptions.
- Reports clearly separate observed endpoint evidence from missing or unknown data.

## Phase 5: Review, Reporting, and Governance

Goals:

- Add operator-friendly summaries for maintenance, compliance, and incident review.
- Add redaction and export options for sharing reports safely.
- Add retention metadata and optional policy checks.
- Document fixture rules and contribution requirements.

Exit criteria:

- Reports are useful without exposing unnecessary sensitive data.
- Contributions cannot add active collection or non-interference violations without failing review.
- Documentation remains aligned with the safety scope.

## Backlog

- Schema versioning and migration notes.
- Synthetic sample generator.
- Redaction profiles for location, operator, aircraft, and organization identifiers.
- Offline HTML or Markdown report export.
- Import manifests for chain-of-custody style review.
- Cross-artifact timeline reconstruction from owned endpoint records.

## Explicit Non-Goals

- RF capture or interception.
- Proprietary-link bypass.
- Jamming, spoofing, replay, injection, or command/control features.
- Live aircraft or controller integration.
- Third-party collection.
- Targeting or battlefield collection workflows.
