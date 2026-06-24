#!/bin/bash

# Array to keep track of background process IDs
PIDS=()

# Cleanup function to kill all background jobs when exiting
cleanup() {
    echo -e "\n\033[1;31mStopping all services...\033[0m"
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill -TERM "$pid" 2>/dev/null
        fi
    done
    exit 0
}

# Trap Ctrl+C (SIGINT), SIGTERM, and EXIT
trap cleanup SIGINT SIGTERM EXIT

echo -e "\033[1;34m[1/3] Starting OpenAuth Server...\033[0m"
cd /Users/navy/Documents/Game/2d-multiplayer-survival-mmorpg/auth-server-openauth
npm run dev &
PIDS+=($!)

echo -e "\033[1;34m[2/3] Starting SpacetimeDB Server...\033[0m"
cd /Users/navy/Documents/Game/2d-multiplayer-survival-mmorpg/server
~/.local/bin/spacetime start &
PIDS+=($!)

# Wait a brief moment before starting frontend
sleep 2

echo -e "\033[1;34m[3/3] Starting Game Client Dev Server...\033[0m"
cd /Users/navy/Documents/Game/2d-multiplayer-survival-mmorpg
npm run dev &
PIDS+=($!)

echo -e "\033[1;32mAll services running! Press Ctrl+C to terminate all of them.\033[0m"

# Wait for background jobs to finish (keeps script running)
wait
