#!/usr/bin/env bash
# Dynamically update devcontainer.json with all detected backend ports

set -e

WORKSPACE_DIR="$(dirname "$0")/.."
BACKEND_SRC="$WORKSPACE_DIR/backend/src"
DEVCONTAINER_JSON="$WORKSPACE_DIR/.devcontainer/devcontainer.json"

# Find all port numbers in backend source files
PORTS=$(grep -Eo 'port\s*=\s*[0-9]+' "$BACKEND_SRC/index.ts" | grep -Eo '[0-9]+' | sort -u)

# If no ports found, default to 3000
if [ -z "$PORTS" ]; then
  PORTS="3000"
fi

# Build JSON array of ports
PORTS_JSON=$(echo "$PORTS" | awk '{printf "%s,", $1}' | sed 's/,$//')

cat > "$DEVCONTAINER_JSON" <<EOF
{
  "name": "CSIT314Crashout Codespace",
  "forwardPorts": [${PORTS_JSON}],
  "postCreateCommand": "node backend/src/index.ts"
}
EOF

echo "Updated devcontainer.json with ports: $PORTS_JSON"
