# Research Notes

These notes summarize the target platform priorities as of 2026-05-26. They are intended to guide importer order, schema coverage, and sample-data planning for a passive recorder. They are not instructions for collecting data from third-party systems or interacting with drone links.

## Platform Priorities

### 1. DJI Mavic and Matrice

Target controllers and apps:

- DJI RC.
- DJI RC Pro Enterprise.
- DJI Smart Controller Enterprise.
- DJI app/controller FlightRecord exports.

Why this is first:

- DJI aircraft are common in commercial and enterprise fleets.
- FlightRecord exports are a practical endpoint-side source for review and recordkeeping.
- Controller/app exports can support a useful baseline workflow without interacting with aircraft or radio links.

Documentation and importer work should focus on file intake, source provenance, timestamp handling, aircraft/controller identity fields when present in exports, and preservation of original records.

### 2. FPV Multirotors

Target systems:

- Betaflight flight controllers.
- ELRS, CRSF, or SBUS receiver/control configurations as represented in owned endpoint records.
- EdgeTX radios, including RadioMaster-class transmitters.
- DVR/video files and operator-provided session metadata.

Why this is second:

- FPV workflows often produce useful endpoint artifacts outside proprietary cloud ecosystems.
- Betaflight blackbox-style records and radio-side logs can support maintenance and incident review.
- Video/DVR artifacts are often the only practical context for a session.

Importer work should avoid any live radio behavior. Receiver/control-link fields should be treated as metadata found in logs or operator notes, not as something to inspect from the air.

### 3. Autel EVO Max 4T and Similar Enterprise Platforms

Target controllers and apps:

- Autel Smart Controller V3.
- Autel Enterprise/App exported logs.
- Similar Autel enterprise controller-side exports where the operator can lawfully retrieve files.

Why this is third:

- Autel enterprise aircraft appear in inspection, security, and field operations.
- Smart-controller exports can provide a controlled endpoint-side intake path.
- Platform coverage broadens the recorder beyond DJI without adding active behavior.

Importer work should start with known exported app/controller files and clear provenance fields.

### 4. Fixed-Wing and Larger Recon Drones

Target systems:

- ArduPilot.
- PX4.
- Pixhawk, Cube, Matek, and CUAV-class flight controllers.

Why this is fourth:

- ArduPilot and PX4 ecosystems have mature flight logs and are common on larger airframes.
- Removable-media or endpoint-copied logs fit the passive recorder model.
- Log formats can support deeper maintenance and incident analysis once schemas mature.

Importer work should prioritize copied log files, metadata extraction, and durable links between logs, airframes, and operator-provided session records.

### 5. Fiber-Optic FPV

Target artifacts:

- Flight-controller logs available from the endpoint.
- DVR/video files.
- Operator-provided session metadata.

Why this is fifth:

- The recorder cannot rely on link-side visibility and should not attempt to inspect, interfere with, or characterize the physical link.
- Practical coverage comes from endpoint records only.
- Video and session metadata may be the primary review sources.

Importer work should explicitly model gaps and uncertainty rather than inventing unavailable telemetry.

## Cross-Platform Metadata

The common record model should capture:

- Artifact type and source platform.
- Import time and original file timestamps.
- Operator or organization that supplied the artifact.
- Ownership or authorization basis.
- Original path, content hash, and immutable source reference.
- Parsed metadata confidence and parse warnings.
- Links between flight records, controller logs, FC logs, video, and notes.

## Research Guardrails

Research must remain documentation and schema focused. Do not include instructions for RF interception, proprietary-link bypass, jamming, spoofing, replay, targeting, battlefield collection, or unauthorized acquisition. When a platform does not provide an exported artifact, document the limitation and leave the feature unsupported.
