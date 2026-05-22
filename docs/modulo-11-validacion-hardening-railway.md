# Módulo 11 — Validación técnica, pruebas funcionales y hardening previo a Railway

Este módulo prepara Gestiona Doc para una primera validación técnica real antes de subirlo a Railway y mostrarlo a prospectos municipales.

## Cambios incluidos

### 1. Validación de variables de entorno

Se agregó `validateEnv` en la API para evitar despliegues productivos inseguros o incompletos.

En `NODE_ENV=production` son obligatorias:

- `DATABASE_URL`
- `JWT_SECRET`
- `APP_URL`
- `UPLOADS_DIR`

Además:

- `JWT_SECRET` debe tener al menos 32 caracteres.
- `APP_URL` y `API_URL` deben ser URLs válidas.
- `PORT` y `MAX_UPLOAD_MB` deben ser enteros positivos si se definen.

### 2. CORS más controlado

`APP_URL` ahora acepta una o varias URLs separadas por coma. Esto permite usar, por ejemplo:

```env
APP_URL=https://gestionadoc.mx,https://web-produccion.railway.app
```

### 3. Límite de payload HTTP

Se agregaron límites de 1 MB para JSON y formularios URL encoded. Los archivos PDF siguen manejándose por `multipart/form-data`.

### 4. Carga segura de PDFs

La carga de PDFs ahora valida:

- MIME `application/pdf`.
- Extensión `.pdf`.
- Límite configurable con `MAX_UPLOAD_MB`.
- Firma interna `%PDF-` al inicio del archivo.
- Limpieza del archivo temporal si la validación falla.
- Nombre físico aleatorio con `randomUUID()` para reducir colisiones.

### 5. Validación de fechas de oficios

El backend ya no acepta que la fecha límite sea anterior a la fecha de recepción.

### 6. Protección básica contra fuerza bruta en login

El login ahora bloquea temporalmente combinaciones de correo + IP después de varios intentos fallidos.

> Para producción con mucho tráfico se recomienda reemplazar esta protección en memoria por Redis o una protección administrada, pero para el MVP en Railway es suficiente como primera barrera.

### 7. Healthcheck de preparación

Se agregó:

```txt
GET /api/health/ready
```

Valida:

- conexión a PostgreSQL;
- escritura en `UPLOADS_DIR`.

Railway ahora puede usar este endpoint como healthcheck real.

### 8. Scripts nuevos

```bash
npm run validate
npm run railway:preflight
```

`npm run validate` ejecuta validaciones locales, instalación si falta `node_modules`, generación de Prisma Client y builds.

`npm run railway:preflight` valida variables mínimas y escritura en almacenamiento.

## Validación recomendada antes de vender

1. Ejecutar `npm run validate` en una máquina local con internet.
2. Subir API, Web y PostgreSQL a Railway.
3. Configurar volumen persistente en `/app/uploads`.
4. Crear `SUPER_ADMIN`.
5. Crear demo comercial.
6. Ejecutar checklist funcional.
7. Probar carga, descarga, seguimiento y cierre de oficios con PDFs reales.

## Limitación pendiente

No se sustituyó la protección en memoria de login por Redis porque el objetivo del MVP es mantener costos bajos en Railway. Cuando existan clientes reales, conviene agregar Redis, rate limiting distribuido o protección WAF/CDN.
