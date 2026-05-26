Vedawiki Field Recorder
Portable USB app prototype

What this is
------------
This folder runs Vedawiki as a portable recorder app from a USB drive or local
working folder. It records Xbox-compatible controller input from the laptop or
ground station and writes timestamped JSONL session files into the sessions/
folder.

What this is not
----------------
A normal USB flash drive cannot record Xbox controller commands by itself. USB is
not like an audio splitter. A flash drive plugged into a computer cannot listen
to another USB port, and an Xbox controller usually cannot host or read a flash
drive. Something has to run recorder software or sit inline between the
controller and host.

Quick start
-----------
1. Move this Vedawiki-Recorder folder onto a USB drive or local working folder.
2. Windows: double-click start-recorder-windows.bat.
3. macOS: double-click start-recorder-mac.command.
4. Plug in the Xbox-compatible controller.
5. Keep the recorder terminal open while recording.
6. Session files appear in sessions/.
7. Open https://vedawiki.com/#dashboard to replay sessions and export CSV.

Requirements
------------
This prototype requires Python 3.10+ and Internet access on first run so pip can
install dependencies into the local .venv folder. The next production step is a
PyInstaller build so users do not need to install Python.

Data posture
------------
The recorder is telemetry-only. It does not control a drone, does not send
controller outputs, and writes local session files for authorized review.
