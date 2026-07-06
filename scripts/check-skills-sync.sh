#!/usr/bin/env bash
set -euo pipefail

# CI guard: verify root skills/ and cli/skills/ are in sync.
# The root skills/ is the single source of truth.
# cli/skills/ must be a superset of root skills/ — any missing skill is a build error.

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color
PASS=true
ERRORS=()

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Checking skills directory sync ==="
echo "  root:   ${ROOT_DIR}/skills"
echo "  cli:    ${ROOT_DIR}/cli/skills"
echo ""

# Check all root skills exist in cli/skills/
for skill_dir in "${ROOT_DIR}"/skills/*/; do
  skill_name="$(basename "$skill_dir")"
  cli_skill="${ROOT_DIR}/cli/skills/${skill_name}"

  if [ ! -d "$cli_skill" ]; then
    ERRORS+=("MISSING: cli/skills/${skill_name}/ — present in root skills/ but not in cli/skills/")
    PASS=false
  elif ! diff -rq "$skill_dir" "$cli_skill" > /dev/null 2>&1; then
    ERRORS+=("DRIFT: cli/skills/${skill_name}/ differs from skills/${skill_name}/ — run \`scripts/sync-skills.sh\`")
    PASS=false
  fi
done

# Check for orphaned cli skills (not in root)
for cli_dir in "${ROOT_DIR}"/cli/skills/*/; do
  cli_name="$(basename "$cli_dir")"
  root_skill="${ROOT_DIR}/skills/${cli_name}"
  if [ ! -d "$root_skill" ]; then
    ERRORS+=("ORPHAN: cli/skills/${cli_name}/ — exists in cli/ but not in root skills/")
    PASS=false
  fi
done

if [ "$PASS" = true ]; then
  echo -e "${GREEN}✓ All skills are in sync.${NC}"
  exit 0
else
  echo -e "${RED}✖ Skills drift detected:${NC}"
  for err in "${ERRORS[@]}"; do
    echo -e "${RED}  • ${err}${NC}"
  done
  echo ""
  exit 1
fi
