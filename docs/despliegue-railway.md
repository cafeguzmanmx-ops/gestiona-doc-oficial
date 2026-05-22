# Despliegue de Gestiona Doc 1.0 en Railway

Esta guía describe el despliegue económico inicial usando Railway como plataforma todo en uno.

## Servicios requeridos

Crear un proyecto Railway llamado:

```txt
gestiona-doc
```

Dentro del proyecto crear:

1. PostgreSQL.
2. API `gestiona-doc-api`.
3. Web `gestiona-doc-web`.

## 1. Crear PostgreSQL

En Railway:

1. New Project.
2. Add PostgreSQL.
3. Esperar a que Railway genere `DATABASE_URL`.

La API debe usar esa variable mediante referencia interna:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

El nombre exacto del servicio puede variar. Si el servicio PostgreSQL se llama diferente, ajustar la referencia.

## 2. Crear servicio API

Crear un servicio desde GitHub usando:

```txt
Root Directory: apps/api
```

Railway detectará el `Dockerfile` y usará `apps/api/railway.json`.

### Variables de la API

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<secreto-largo-y-aleatorio>
JWT_EXPIRES_IN=8h
APP_URL=https://<url-del-frontend>
API_URL=https://<url-de-la-api>/api
UPLOADS_DIR=/app/uploads
MAX_UPLOAD_MB=10
BOOTSTRAP_TOKEN=<token-temporal-para-crear-super-admin>
```

### Volumen para PDFs

Agregar volumen persistente al servicio API:

```txt
Mount path: /app/uploads
```

Ese volumen guardará los PDFs y anexos del MVP.

## 3. Crear servicio Web

Crear otro servicio desde GitHub usando:

```txt
Root Directory: apps/web
```

Railway detectará el `Dockerfile` y usará `apps/web/railway.json`.

### Variables del Web

```env
VITE_API_URL=https://<url-de-la-api>/api
VITE_APP_NAME=Gestiona Doc
```

Importante: si cambia `VITE_API_URL`, hay que redeployar el frontend porque Vite inyecta variables en build time.

## 4. Orden correcto de despliegue

1. Desplegar PostgreSQL.
2. Desplegar API.
3. Revisar `/api/health` y `/api/health/ready`.
4. Crear Web.
5. Desplegar Web con `VITE_API_URL` apuntando a la API.
6. Crear el primer super administrador.
7. Registrar municipio demo.
8. Ejecutar prueba de captura de oficio con PDF.

## 5. Healthcheck

La API debe responder:

```txt
GET https://<api>/api/health
GET https://<api>/api/health/ready
```

Respuesta esperada en `/api/health`:

```json
{
  "status": "ok",
  "service": "gestiona-doc-api",
  "timestamp": "..."
}
```

Respuesta esperada en `/api/health/ready`:

```json
{
  "status": "ready",
  "checks": {
    "database": { "status": "ok" },
    "storage": { "status": "ok", "uploadsDir": "/app/uploads" }
  }
}
```

## 6. Crear primer SUPER_ADMIN

Desde una terminal:

```bash
bash scripts/bootstrap-super-admin.sh \
  https://<api>.railway.app/api \
  <BOOTSTRAP_TOKEN> \
  "Administrador SaaS" \
  admin@gestionadoc.com \
  "ContraseñaSegura123"
```

Después de crear el super administrador:

1. Cambiar `BOOTSTRAP_TOKEN` por otro valor largo, o eliminarlo.
2. Redeployar API si Railway lo requiere.
3. Guardar el acceso en un gestor seguro de contraseñas.

## 7. Prueba mínima

```bash
bash scripts/smoke-test.sh https://<api>.railway.app/api
```

## 8. Checklist para demo comercial

Crear un municipio de prueba con:

- Presidencia Municipal.
- Secretaría del Ayuntamiento.
- Obras Públicas.
- Tesorería.
- Contraloría.

Después probar:

1. Alta de usuario capturista.
2. Alta de usuario director de área.
3. Registro de oficio recibido.
4. Carga de PDF.
5. Turnado a Obras Públicas.
6. Seguimiento del director.
7. Cierre con documento de respuesta.
8. Reporte Excel.
9. Reporte PDF.
10. Activación anual desde panel SaaS.

## 9. Observaciones de costo

Para el MVP se mantiene todo en Railway:

- API.
- Web.
- PostgreSQL.
- Volumen de PDFs.

Cuando existan clientes activos, se recomienda evaluar:

- Cloudflare R2 para PDFs.
- Backups externos de PostgreSQL.
- Servicio transaccional de correo.
- Dominio propio.

## 10. Crear demo comercial automática

Con el `SUPER_ADMIN` ya creado, se puede generar un municipio demo con datos precargados desde el panel SaaS o por terminal:

```bash
API_URL=https://<api>.railway.app/api \
SUPER_ADMIN_EMAIL=admin@gestionadoc.com \
SUPER_ADMIN_PASSWORD="ContraseñaSegura123" \
./scripts/create-demo-municipio.sh
```

Esto crea:

- Municipio Demo de San Miguel.
- Áreas municipales.
- Usuarios demo.
- Oficios en distintos estatus.
- Suscripción anual activa.
- Eventos iniciales en bitácora.

Credenciales principales:

```txt
admin.demo@gestionadoc.mx / Demo12345!
captura.demo@gestionadoc.mx / Demo12345!
obras.demo@gestionadoc.mx / Demo12345!
```

## 11. Validación de seguridad del MVP

Antes de presentar una demo comercial, validar:

1. Un director de área no debe ver oficios de otra área.
2. Un usuario consulta no debe crear ni cerrar oficios.
3. Un municipio suspendido no debe poder operar.
4. Una suscripción vencida debe bloquear operaciones.
5. La descarga de PDFs debe quedar registrada en bitácora.
6. Los cambios de suscripción deben verse en `/app/auditoria`.


## 12. Validación técnica previa al primer deploy comercial

Antes de subir a Railway o después de clonar el repositorio en una máquina local con internet:

```bash
npm run validate
```

Este comando instala dependencias si faltan, genera Prisma Client y compila API + Web.

Para verificar variables mínimas y escritura en almacenamiento:

```bash
DATABASE_URL=<url> JWT_SECRET=<secreto-32-caracteres> APP_URL=https://<frontend> UPLOADS_DIR=/app/uploads npm run railway:preflight
```
