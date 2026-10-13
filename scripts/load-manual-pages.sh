#!/usr/bin/env bash
# Upload every Library page from the two private manuals in one go.
# Put the PDFs in reference-source/ first (they're the Google Drive files shared with the owner):
#   reference-source/system-wiring.pdf   = "System Wiring Diagram.pdf"  (cardiagn.com set, 94 pages)
#   reference-source/fuse-grounds.pdf    = "Wiring Diagrams (Fuse Block, Grounds).pdf" (Mercedes format, 111 pages)
# Usage: scripts/load-manual-pages.sh [--local|--remote]
set -euo pipefail
MODE="${1:---local}"
SYS=reference-source/system-wiring.pdf
FG=reference-source/fuse-grounds.pdf
run() { scripts/pdf-to-images "$1" "$2" "$3" "$4" "$MODE"; }
run "$SYS" ref-horn          42 42   # Fig. 30 Horn circuit
run "$SYS" ref-trailer       33 33   # Fig. 24 Trailer tow circuit
run "$SYS" ref-power         54 58   # Figs. 38-42 Power distribution
run "$SYS" ref-ac             2  4   # Figs. 1-3 Automatic A/C
run "$SYS" ref-grounds-a     35 37   # Figs. 25-27 Ground distribution
run "$SYS" ref-body-control  14 15   # Figs. 10-11 Body computer / special module
run "$FG"  ref-grounds-b      6 32   # Figs. 1-20 Ground points (location drawings)
run "$FG"  ref-fuse-box      63 66   # Figs. 37-41 Fuse and relay box
