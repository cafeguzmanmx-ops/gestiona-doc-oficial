#!/usr/bin/env bash
set -euo pipefail

API_URL="${1:-}"
BOOTSTRAP_TOKEN="${2:-}"
FULL_NAME="${3:-Administrador SaaS}"
EMAIL="${4:-}"
PASSWORD="${5:-}"

if [[ -z "$API_URL" || -z "$BOOTSTRAP_TOKEN" || -z "$EMAIL" || -z "$PASSWORD" ]]; then
  echo "Uso: bash scripts/bootstrap-super-admin.sh <API_URL> <BOOTSTRAP_TOKEN> <FULL_NAME> <EMAIL> <PASSWORD>"
  echo "Ejemplo: bash scripts/bootstrap-super-admin.sh https://api.railway.app/api token 'Administrador SaaS' admin@gestionadoc.com 'PasswordSeguro123'"
  exit 1
fi

curl -sS -X POST "$API_URL/auth/bootstrap-super-admin" \
  -H "Content-Type: application/json" \
  -d "{\"bootstrapToken\":\"$BOOTSTRAP_TOKEN\",\"fullName\":\"$FULL_NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
