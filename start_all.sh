#!/bin/bash
#
# Start local stack: auth + SpacetimeDB + deploy module + Vite client.
#
# Usage:
#   ./start_all.sh          # update existing local database (keeps data)
#   ./start_all.sh --clean  # fresh database (wipes broth-bullets-local)
#
# Override Spacetime CLI path:
#   SPACETIME=/path/to/spacetime ./start_all.sh

set -euo pipefail

ROOT="/Users/navy/Documents/Game/2d-multiplayer-survival-mmorpg"
SERVER_DIR="$ROOT/server"
AUTH_DIR="$ROOT/auth-server-openauth"
GENERATED_DIR="$ROOT/client/src/generated"
DATABASE="broth-bullets-local"
SPACETIME="${SPACETIME:-$HOME/.local/bin/spacetime}"

if [[ ! -x "$SPACETIME" ]]; then
  if command -v spacetime >/dev/null 2>&1; then
    SPACETIME="spacetime"
  else
    echo "SpacetimeDB CLI not found. Install: curl -sSf https://install.spacetimedb.com | sh"
    exit 1
  fi
fi

CLEAN_DEPLOY=false
if [[ "${1:-}" == "--clean" ]]; then
  CLEAN_DEPLOY=true
  echo -e "\033[1;33m--clean: fresh deploy will wipe local database data.\033[0m"
elif [[ -n "${1:-}" ]]; then
  echo "Unknown option: $1"
  echo "Usage: $0 [--clean]"
  exit 1
fi

PIDS=()

cleanup() {
  echo -e "\n\033[1;31mStopping all services...\033[0m"
  if ((${#PIDS[@]} > 0)); then
    for pid in "${PIDS[@]}"; do
      if kill -0 "$pid" 2>/dev/null; then
        kill -TERM "$pid" 2>/dev/null || true
      fi
    done
  fi
}

trap cleanup SIGINT SIGTERM EXIT

wait_for_spacetime() {
  echo -e "\033[1;34mWaiting for SpacetimeDB on localhost:3000...\033[0m"
  for _ in $(seq 1 60); do
    if curl -sf "http://localhost:3000" >/dev/null 2>&1; then
      echo -e "\033[1;32mSpacetimeDB is ready.\033[0m"
      return 0
    fi
    if command -v nc >/dev/null 2>&1 && nc -z localhost 3000 2>/dev/null; then
      echo -e "\033[1;32mSpacetimeDB is ready.\033[0m"
      return 0
    fi
    sleep 1
  done
  echo -e "\033[1;31mTimed out waiting for SpacetimeDB (60s).\033[0m"
  return 1
}

deploy_database() {
  echo -e "\033[1;34m[3/4] Deploying database ($DATABASE)...\033[0m"
  cd "$SERVER_DIR"
  if [[ "$CLEAN_DEPLOY" == true ]]; then
    "$SPACETIME" publish -c --no-config -p . "$DATABASE" -y
  else
    "$SPACETIME" publish --no-config -p . "$DATABASE" -y
  fi
  "$SPACETIME" generate --no-config --include-private -p . -l typescript -o "$GENERATED_DIR" -y
  echo -e "\033[1;32mDatabase deploy complete.\033[0m"
}

echo -e "\033[1;34m[1/4] Starting OpenAuth Server...\033[0m"
cd "$AUTH_DIR"
npm run dev &
PIDS+=($!)

echo -e "\033[1;34m[2/4] Starting SpacetimeDB Server...\033[0m"
cd "$SERVER_DIR"
"$SPACETIME" start &
PIDS+=($!)

wait_for_spacetime
deploy_database

echo -e "\033[1;34m[4/4] Starting Game Client Dev Server...\033[0m"
cd "$ROOT"
npm run dev &
PIDS+=($!)

echo -e "\033[1;32mAll services running! Open http://localhost:3008 (or the port Vite prints).\033[0m"
echo -e "\033[1;32mPress Ctrl+C to terminate all services.\033[0m"

wait
