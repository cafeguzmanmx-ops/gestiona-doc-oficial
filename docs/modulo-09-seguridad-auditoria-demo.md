# Módulo 09 — Seguridad, auditoría ampliada y demo comercial

## Objetivo

Cerrar el MVP con controles mínimos para una demostración comercial seria ante municipios: permisos por rol/área, validación de suscripción activa, bitácora ampliada y generación de un municipio demo con datos operativos.

## Cambios principales

### 1. Validación de suscripción activa

Se agregó `SubscriptionGuard` para proteger módulos operativos:

- Áreas
- Usuarios
- Oficios
- Reportes
- Notificaciones
- Datos actuales del municipio
- Auditoría municipal

Reglas aplicadas:

- `SUPER_ADMIN` puede operar el panel SaaS aunque no pertenezca a un municipio.
- Municipios `SUSPENDED` o `CANCELLED` no pueden operar.
- Suscripción `TRIAL` vencida bloquea operación.
- Suscripción `ACTIVE` vencida bloquea operación.

### 2. Permisos por área

En oficios y reportes se refuerza el acceso:

- `ADMIN_MUNICIPAL` y `CAPTURISTA`: visibilidad municipal completa.
- `DIRECTOR_AREA` y `CONSULTA`: visibilidad restringida a su área o a oficios creados por el propio usuario.
- Cierre y cambios críticos de oficio: solo `ADMIN_MUNICIPAL` o `DIRECTOR_AREA` del área responsable.

### 3. Auditoría ampliada

Se agregó el módulo `/api/auditoria` y la pantalla `/app/auditoria`.

Acciones nuevas registradas:

- Creación/actualización/desactivación de áreas.
- Creación/actualización/desactivación de usuarios.
- Creación de oficios.
- Creación de seguimientos.
- Cambio de estatus.
- Cierre de oficio.
- Descarga de archivos.
- Actualización de suscripciones.
- Creación de datos demo.

### 4. Demo comercial

Se agregó endpoint:

```txt
POST /api/demo/municipio
```

Requiere `SUPER_ADMIN`.

Crea:

- Municipio Demo de San Miguel.
- Áreas municipales básicas.
- Usuarios demo.
- Suscripción anual activa.
- Oficios con distintos estatus.
- Seguimientos iniciales.

Credenciales demo:

```txt
admin.demo@gestionadoc.mx / Demo12345!
captura.demo@gestionadoc.mx / Demo12345!
obras.demo@gestionadoc.mx / Demo12345!
```

## Archivos agregados

```txt
apps/api/src/auditoria/*
apps/api/src/common/security/*
apps/api/src/demo/*
apps/api/prisma/migrations/20260521090000_security_audit_demo/migration.sql
apps/web/src/pages/AuditoriaPage.tsx
scripts/create-demo-municipio.sh
```

## Nota de instalación

Se consolidaron migraciones duplicadas para evitar que `prisma migrate deploy` falle en Railway por creación repetida de enums/tablas.
