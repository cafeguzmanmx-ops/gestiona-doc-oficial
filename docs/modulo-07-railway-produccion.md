# Módulo 07 — Preparación real para Railway

## Objetivo

Dejar el MVP preparado para desplegarse en Railway con tres servicios:

1. PostgreSQL.
2. API NestJS.
3. Web React/Vite.

Este módulo agrega configuración operativa para que el despliegue no dependa únicamente de instrucciones manuales.

## Archivos agregados

- `apps/api/railway.json`
- `apps/web/railway.json`
- `.env.railway.example`
- `apps/api/prisma/migrations/20260519000000_init/migration.sql`
- `docs/modulo-07-railway-produccion.md`
- `scripts/bootstrap-super-admin.sh`
- `scripts/smoke-test.sh`

## Decisiones técnicas

### Migración inicial real

Se agregó una migración SQL inicial para que `npx prisma migrate deploy` pueda ejecutarse en Railway.

Sin esta carpeta de migraciones, Railway podría construir la API pero fallar al iniciar el servicio porque Prisma Deploy necesita migraciones versionadas.

### Volumen para PDFs

La API debe montar un volumen persistente de Railway en:

```txt
/app/uploads
```

Y usar esta variable:

```env
UPLOADS_DIR=/app/uploads
```

### Servicios Railway

#### Servicio PostgreSQL

Crear desde Railway usando el template oficial de PostgreSQL.

#### Servicio API

Root directory:

```txt
apps/api
```

Variables mínimas:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<secreto-largo>
JWT_EXPIRES_IN=8h
APP_URL=https://<frontend>.railway.app
API_URL=https://<api>.railway.app/api
UPLOADS_DIR=/app/uploads
BOOTSTRAP_TOKEN=<token-temporal>
```

#### Servicio Web

Root directory:

```txt
apps/web
```

Variables mínimas:

```env
VITE_API_URL=https://<api>.railway.app/api
VITE_APP_NAME=Gestiona Doc
```

## Primer arranque

1. Crear PostgreSQL.
2. Crear API.
3. Montar volumen en `/app/uploads`.
4. Configurar variables API.
5. Desplegar API.
6. Crear Web.
7. Configurar `VITE_API_URL`.
8. Desplegar Web.
9. Crear el primer `SUPER_ADMIN`.
10. Registrar municipio demo.

## Creación de SUPER_ADMIN

Usar:

```bash
bash scripts/bootstrap-super-admin.sh \
  https://<api>.railway.app/api \
  <BOOTSTRAP_TOKEN> \
  "Administrador SaaS" \
  admin@gestionadoc.com \
  "ContraseñaSegura123"
```

Después de crearlo, cambiar o eliminar `BOOTSTRAP_TOKEN` desde Railway para evitar reutilización.

## Prueba rápida de API

```bash
bash scripts/smoke-test.sh https://<api>.railway.app/api
```

Debe responder correctamente `/health`.

## Checklist de demo municipal

- Crear municipio demo.
- Crear 3 áreas municipales.
- Crear 2 usuarios internos.
- Registrar 3 oficios.
- Turnar un oficio.
- Agregar seguimiento.
- Cerrar un oficio.
- Descargar reporte Excel.
- Descargar reporte PDF.
- Activar suscripción anual desde panel SaaS.

## Pendientes posteriores

- Backups automáticos de PostgreSQL.
- Almacenamiento externo en Cloudflare R2 cuando haya clientes activos.
- Correo transaccional para alertas.
- Endurecimiento de seguridad de producción.
