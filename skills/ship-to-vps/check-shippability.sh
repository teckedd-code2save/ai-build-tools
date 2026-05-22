#!/usr/bin/env bash
# Walks shippability-contract.md checklist against a repo dir.
set -u
REPO="${1:-.}"
FAIL=0

pass() { echo "  PASS: $1"; }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }

check_env_files() {
  local hits
  hits=$(cd "$REPO" && git ls-files 2>/dev/null | grep -E '^\.env(\..+)?$' | grep -vE '\.(example|sample|template)$' || true)
  if [ -z "$hits" ]; then pass "no real .env files committed"; else fail "real .env file(s) committed: $hits"; fi
}

cd "$REPO" || { echo "no such dir: $REPO"; exit 2; }
echo "=== Shippability check: $REPO ==="

[ -f Dockerfile ] && pass "Dockerfile at root" || fail "Dockerfile at root"
grep -q 'org.opencontainers.image.source' Dockerfile 2>/dev/null && pass "Dockerfile has OCI source label" || fail "Dockerfile has OCI source label"
awk '/FROM .* AS runner/,0' Dockerfile 2>/dev/null | grep -qE 'COPY.*node_modules \./node_modules' && pass "runner stage copies full node_modules" || fail "runner stage copies full node_modules"
[ -f .eslintrc.json ] && pass ".eslintrc.json present" || fail ".eslintrc.json present"
[ -f .dockerignore ] && pass ".dockerignore present" || fail ".dockerignore present"
if [ -f .dockerignore ]; then
  ! grep -qE '^prisma/?$' .dockerignore && pass ".dockerignore allows prisma/" || fail ".dockerignore excludes prisma/"
  ! grep -qE '^public/?$' .dockerignore && pass ".dockerignore allows public/" || fail ".dockerignore excludes public/"
fi
if [ -d public ]; then
  [ -n "$(find public -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ] && pass "public/ tracked file present (e.g. .gitkeep)" || fail "public/ exists but is empty (add .gitkeep)"
fi
[ -f .infisical.json ] && grep -q workspaceId .infisical.json && pass ".infisical.json with workspaceId" || fail ".infisical.json with workspaceId"
[ -f AGENTS.md ] && pass "AGENTS.md present" || fail "AGENTS.md present"
grep -qE '"lint":' package.json 2>/dev/null && pass "package.json has lint script" || fail "package.json has lint script"
grep -qE '"build":' package.json 2>/dev/null && pass "package.json has build script" || fail "package.json has build script"
check_env_files

echo
if [ $FAIL -eq 0 ]; then echo "RESULT: PASS"; else echo "RESULT: $FAIL failures"; exit 1; fi
