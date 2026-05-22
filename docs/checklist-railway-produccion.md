# Checklist Railway — Primera publicación MVP

## Servicios

- [ ] Crear proyecto Railway `gestiona-doc`.
- [ ] Agregar servicio PostgreSQL.
- [ ] Agregar servicio API desde `apps/api`.
- [ ] Agregar servicio Web desde `apps/web`.
- [ ] Configurar volumen persistente para API en `/app/uploads`.

## Variables API

- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- [ ] `JWT_SECRET` con mínimo 32 caracteres.
- [ ] `JWT_EXPIRES_IN=8h`
- [ ] `APP_URL=https://url-del-frontend`
- [ ] `API_URL=https://url-de-api/api`
- [ ] `UPLOADS_DIR=/app/uploads`
- [ ] `MAX_UPLOAD_MB=10`
- [ ] `BOOTSTRAP_TOKEN` temporal y robusto.

## Variables Web

- [ ] `VITE_API_URL=https://url-de-api/api`
- [ ] `VITE_APP_NAME=Gestiona Doc`

## Validación

- [ ] API responde `/api/health`.
- [ ] API responde `/api/health/ready` con database y storage en `ok`.
- [ ] Web carga landing.
- [ ] Login funciona.
- [ ] Registro de municipio funciona.
- [ ] Carga y descarga de PDF funciona.
- [ ] Reportes Excel/PDF funcionan.

## Seguridad operativa

- [ ] Cambiar o eliminar `BOOTSTRAP_TOKEN` después de crear super admin.
- [ ] Descargar backup inicial de base de datos.
- [ ] Confirmar que el volumen no se reinicia al redeploy.
- [ ] Probar cuenta demo y cuenta real separadas.
