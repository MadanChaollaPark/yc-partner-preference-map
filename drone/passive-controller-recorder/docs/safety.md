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

