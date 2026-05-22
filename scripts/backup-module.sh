#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: npm run backup:module -- <nombre-modulo>"
  exit 1
fi

MODULE_NAME="$1"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$ROOT_DIR/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/${STAMP}-${MODULE_NAME}.tar.gz"

mkdir -p "$BACKUP_DIR"
tar \
  --exclude="node_modules" \
  --exclude="dist" \
  --exclude="build" \
  --exclude=".git" \
  --exclude="backups/*.tar.gz" \
  -czf "$OUT" \
  -C "$(dirname "$ROOT_DIR")" "$(basename "$ROOT_DIR")"

echo "$OUT"
