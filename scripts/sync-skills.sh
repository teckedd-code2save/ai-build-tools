#!/usr/bin/env bash
set -euo pipefail

# Sync root skills/ → cli/skills/
# Run this after editing a skill in root skills/
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Syncing skills/ → cli/skills/ ==="

# rsync mirror: delete orphans in cli/skills that no longer exist in root skills/
rsync -a --delete "${ROOT_DIR}/skills/" "${ROOT_DIR}/cli/skills/"

echo "Done. Skills synced."
