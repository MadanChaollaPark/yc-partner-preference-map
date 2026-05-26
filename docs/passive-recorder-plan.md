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
