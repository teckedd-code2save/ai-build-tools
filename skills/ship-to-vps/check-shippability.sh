#!/usr/bin/env bash
# Static legacy Next.js/Prisma/Infisical scaffold check for direct VPS only.
set -u
if [ "${1:-}" = "--target" ]; then
  case "${2:-}" in
    direct-vps) shift 2 ;;
    groundcontrol|gc)
      echo "NOT CHECKED: GroundControl uses references/shippability-contract.md and real build/release evidence; this legacy direct-VPS checker cannot certify it."
      exit 2 ;;
    *) echo "Usage: $0 [--target direct-vps] [repo-path]"; exit 2 ;;
  esac
fi
REPO="${1:-.}"
FAIL=0

pass() { echo "  PASS: $1"; }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }

check_env_files() {
  local hits
  hits=$(git ls-files 2>/dev/null | grep -E '(^|/)\.env(\..+)?$' | grep -vE '\.(example|sample|template)$' || true)
  if [ -z "$hits" ]; then pass "no real .env files committed"; else fail "real .env file(s) committed: $hits"; fi
}

cd "$REPO" || { echo "no such dir: $REPO"; exit 2; }
echo "=== Direct VPS static scaffold check: $REPO (not deployment proof) ==="

[ -f Dockerfile ] && pass "Dockerfile at root" || fail "Dockerfile at root"
grep -q 'org.opencontainers.image.source' Dockerfile 2>/dev/null && pass "Dockerfile has OCI source label" || fail "Dockerfile has OCI source label"
awk '/FROM .* AS runner/,0' Dockerfile 2>/dev/null | grep -qE 'COPY.*node_modules \./node_modules' && pass "runner stage copies full node_modules" || fail "runner stage copies full node_modules"
if [ -f .eslintrc.json ] || [ -f eslint.config.js ] || [ -f eslint.config.mjs ] || [ -f eslint.config.cjs ] || [ -f eslint.config.ts ]; then
  pass "ESLint configuration present (execute lint separately)"
else
  fail "ESLint configuration missing; adapt this legacy check for another stack"
fi
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
if [ $FAIL -eq 0 ]; then echo "RESULT: STATIC CHECK PASS (build, migrations and live acceptance still required)"; else echo "RESULT: $FAIL failures"; exit 1; fi
