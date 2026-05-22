#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3000/api}"
EMAIL="${SUPER_ADMIN_EMAIL:-admin@gestionadoc.local}"
PASSWORD="${SUPER_ADMIN_PASSWORD:-ChangeMe123!}"

TOKEN=$(curl -sS -X POST "$API_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d); if(!j.accessToken){console.error(d); process.exit(1)} console.log(j.accessToken)})")

curl -sS -X POST "$API_URL/demo/municipio" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json'

echo
