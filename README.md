# Gestiona Doc 1.0

SaaS municipal mexicano para digitalizar el control de correspondencia oficial.

## Alcance inicial

Este repositorio reconstruye Gestiona Doc con enfoque MVP vendible:

- Registro de municipio.
- Alta automática de administrador municipal.
- Login con JWT.
- Modelo multi-tenant por `tenant_id`.
- Base PostgreSQL con Prisma.
- Frontend React/Vite.
- Oficios, turnado, seguimiento, cierre, reportes y alertas.
- Panel SaaS para suscripción anual manual.
- Landing comercial y solicitudes de demo.
- Preparación para despliegue económico en Railway.

## Estructura

```txt
gestiona-doc/
├── apps/
│   ├── api/   # NestJS + Prisma + PostgreSQL
│   └── web/   # React + Vite + Tailwind
├── docs/      # Documentación funcional, técnica y comercial
├── scripts/   # Utilerías de validación, despliegue y respaldo
└── backups/   # Respaldos generados por módulo
```

## Estado actual

- Módulo 0: estructura base del proyecto.
- Módulo 1: autenticación, municipio inicial, tenant, usuario administrador y suscripción trial.
- Módulo 2: organigrama y usuarios municipales.
- Módulo 3: oficios recibidos, folio automático y carga de PDF.
- Módulo 4: seguimiento, cierre documental y dashboard.
- Módulo 5: reportes Excel/PDF.
- Módulo 6: panel SaaS y suscripciones anuales manuales.
- Módulo 7: preparación real para Railway, migración inicial versionada, scripts operativos y checklist de despliegue.
- Módulo 8: alertas internas por asignación, próximos vencimientos, oficios vencidos y cierres.
- Módulo 9: seguridad por suscripción, permisos por área, auditoría ampliada y demo comercial.
- Módulo 10: landing comercial, solicitudes de demo y preparación de venta.
- Módulo 11: validación técnica, hardening de entorno, seguridad de PDFs, healthcheck de readiness y checklists previos a Railway.

## Validación local recomendada

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm run validate
```

Ese comando valida estructura, instala dependencias si hacen falta, genera Prisma Client y compila API + Web.

## Flujo local manual

```bash
cd apps/api
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```

```bash
cd apps/web
cp .env.example .env
npm install
npm run dev
```

## Flujo Railway esperado

Crear un proyecto en Railway con tres servicios:

1. PostgreSQL.
2. API usando `apps/api` como root directory.
3. Web usando `apps/web` como root directory.

Ver:

- `docs/despliegue-railway.md`
- `docs/checklist-railway-produccion.md`
- `docs/checklist-pruebas-funcionales.md`

Para crear datos demo desde la API desplegada:

```bash
API_URL=https://tu-api.railway.app/api \
SUPER_ADMIN_EMAIL=tu-super-admin@dominio.com \
SUPER_ADMIN_PASSWORD=tu-password \
./scripts/create-demo-municipio.sh
```

## Seguridad MVP

La versión actual incluye:

- validación de variables de entorno en producción;
- `JWT_SECRET` mínimo de 32 caracteres;
- CORS basado en `APP_URL`;
- límite de payload JSON;
- validación de PDF por MIME, extensión, tamaño y firma `%PDF-`;
- bloqueo temporal ante intentos fallidos de login;
- healthcheck `/api/health/ready` para base de datos y almacenamiento.

## Nota

La firma avanzada con e.firma y la facturación automática quedan fuera del MVP inicial. Se recomienda vender primero control documental, trazabilidad, reportes y suscripción anual manual.
