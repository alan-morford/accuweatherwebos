#!/bin/bash
#
# Build script for AccuWeather webOS (com.accuweather.accuweather).
#
# Repacks the edited app source in extracted/ back into an installable .ipk.
# Same pattern as ../usatoday/build.sh: debian-binary and control.tar.gz are
# reused unchanged from the original ipk (in ipk/), only data.tar.gz is
# rebuilt from extracted/usr.
#
# Note: this replaced an earlier, wrong app (com.accuweather.palm.purchased,
# the older Mojo-framework build) that this folder was mistakenly built
# against before -- com.accuweather.accuweather (Enyo, "Game Lion Studios")
# is the actual current app.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

APP_ID="com.accuweather.accuweather"
APPINFO="extracted/usr/palm/applications/$APP_ID/appinfo.json"
VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$APPINFO" | cut -d'"' -f4)
IPK_FILE="${APP_ID}_${VERSION}_all.ipk"
BUILD_DIR="$(mktemp -d)"

echo "Building version: $VERSION"

cp ipk/debian-binary "$BUILD_DIR/"
cp ipk/control.tar.gz "$BUILD_DIR/"
( cd extracted && tar -czf "$BUILD_DIR/data.tar.gz" ./usr )

rm -f "$IPK_FILE"
( cd "$BUILD_DIR" && ar -r "$IPK_FILE" debian-binary control.tar.gz data.tar.gz )
mv "$BUILD_DIR/$IPK_FILE" "$SCRIPT_DIR/"
rm -rf "$BUILD_DIR"

echo ""
echo "Build successful: $IPK_FILE"
ls -lh "$IPK_FILE"
echo ""
echo "Install using webOS Quick Install."
