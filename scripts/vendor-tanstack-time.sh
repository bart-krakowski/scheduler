#!/bin/sh
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TIME_DIR="${TANSTACK_TIME_DIR:-$ROOT/../tanstack/time}"
VENDOR_DIR="$ROOT/vendor"
TMP_DIR="$(mktemp -d)"

for pkg in time react-time; do
  (cd "$TIME_DIR/packages/$pkg" && npx tsdown && pnpm pack --pack-destination "$TMP_DIR")
  rm -rf "$VENDOR_DIR/$pkg"
  mkdir -p "$VENDOR_DIR/$pkg"
  tar -xzf "$TMP_DIR/tanstack-$pkg-0.0.0.tgz" -C "$VENDOR_DIR/$pkg" --strip-components=1
done

rm -rf "$TMP_DIR"
