#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "== Gestiona Doc :: validación local =="
echo "Node: $(node --version 2>/dev/null || echo 'node no encontrado')"
echo "npm:  $(npm --version 2>/dev/null || echo 'npm no encontrado')"

echo "\n1) Validando estructura mínima..."
test -f apps/api/package.json
test -f apps/api/prisma/schema.prisma
test -d apps/api/prisma/migrations
test -f apps/web/package.json
test -f apps/web/vite.config.ts
test -f apps/api/src/main.ts
test -f apps/web/src/App.tsx

echo "\n2) Validando migraciones Prisma..."
find apps/api/prisma/migrations -maxdepth 2 -name migration.sql -print | sort

if grep -R "TODO\|FIXME\|dev-secret" apps/api/src apps/web/src apps/api/prisma >/tmp/gestiona-doc-validation-grep.txt 2>/dev/null; then
  echo "Advertencia: se encontraron TODO/FIXME/dev-secret. Revisar /tmp/gestiona-doc-validation-grep.txt"
fi

echo "\n3) Instalando dependencias si no existen node_modules..."
if [ ! -d node_modules ]; then
  npm install
fi

echo "\n4) Generando Prisma Client..."
npm --workspace apps/api run prisma:generate

echo "\n5) Compilando API..."
npm --workspace apps/api run build

echo "\n6) Compilando Web..."
npm --workspace apps/web run build

echo "\nValidación terminada correctamente."
