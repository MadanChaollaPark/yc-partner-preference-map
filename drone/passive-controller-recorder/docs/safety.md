# Safety Boundaries

Passive Controller Recorder is limited to records the operator already owns, controls, or is explicitly authorized to process. The system must never require interaction with aircraft, controllers, radios, links, networks, or third-party accounts.

## Non-Interference Rules

The recorder must not:

- Transmit to an aircraft, controller, radio, receiver, ground station, or remote service.
- Pair with, bind to, unlock, arm, command, configure, or control any aircraft or controller.
- Intercept, decode, capture, analyze, or characterize RF links or proprietary control links.
- Attempt to bypass encryption, access controls, account boundaries, device locks, or vendor protections.
- Jam, spoof, replay, inject, bridge, relay, or modify signals, telemetry, commands, or network traffic.
- Collect from third-party drones, controllers, accounts, storage, networks, or cloud services without explicit authorization.
- Support targeting, adversary tracking, battlefield collection, surveillance tasking, or operational exploitation.

The recorder may:

- Read files selected by an authorized operator.
- Parse exported logs, copied flight-controller logs, DVR/video files, and explicit metadata forms.
- Generate local normalized metadata, validation reports, and review summaries.
- Preserve originals and record hashes without modifying source artifacts.

## Data Ownership and Consent

Every import should be treated as a consented data-processing event. The operator should be able to answer:

- Who owns or controls this artifact?
- Who authorized processing?
- What system produced it?
- How was it exported or copied?
- Is the artifact safe to retain under the organization's privacy and retention policies?

If those answers are unknown, the recorder should mark the import as blocked or incomplete rather than normalizing the data as trusted.

## Safe Artifact Handling

Implementation should follow these handling rules:

- Open source artifacts read-only.
- Preserve original filenames, sizes, timestamps when available, and content hashes.
- Store generated outputs separately from originals.
- Keep parse errors non-destructive.
- Prefer explicit "unsupported" states over guessing.
- Avoid automatic uploads or network calls.
- Avoid background scanning outside user-selected paths.

## Privacy and Retention

Drone logs can include sensitive locations, people, operators, asset identifiers, and business activities. Documentation, schemas, and reports should assume that imported artifacts may be private.

Recommended defaults:

- Local processing first.
- Minimal derived outputs.
- Clear retention controls.
- Redaction support for reports before sharing.
- No automatic cloud sync.
- No hidden telemetry from the recorder itself.

## Prohibited Documentation Content

Project documentation must not provide operational or offensive instructions, including:

- RF interception methods.
- Proprietary-link bypass details.
- Jamming or spoofing methods.
- Takeover, injection, replay, or pairing abuse.
- Targeting workflows.
- Battlefield collection guidance.
- Advice for acquiring records from systems the operator does not own or administer.

When a requested feature would cross these boundaries, document it as out of scope and, where useful, suggest a passive alternative based on owned exports or endpoint-side files.
