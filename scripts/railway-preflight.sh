#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?Falta DATABASE_URL}"
: "${JWT_SECRET:?Falta JWT_SECRET}"
: "${APP_URL:?Falta APP_URL}"
: "${UPLOADS_DIR:?Falta UPLOADS_DIR}"

if [ "${#JWT_SECRET}" -lt 32 ]; then
  echo "JWT_SECRET debe tener al menos 32 caracteres" >&2
  exit 1
fi

mkdir -p "$UPLOADS_DIR"
probe="$UPLOADS_DIR/.preflight"
echo ok > "$probe"
rm -f "$probe"

echo "Variables mínimas y almacenamiento verificados."
