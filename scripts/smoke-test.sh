#!/usr/bin/env bash
set -euo pipefail

API_URL="${1:-http://localhost:3000/api}"

echo "Probando API: $API_URL"
curl -fsS "$API_URL/health"
echo "OK: API responde correctamente."
