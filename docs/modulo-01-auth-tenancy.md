# Módulo 1 - Autenticación y Multi-tenant

## Objetivo

Permitir que un municipio se registre y obtenga acceso inmediato a una instancia lógica del SaaS.

## Flujo

1. Usuario entra a `/registro`.
2. Captura municipio, estado, administrador, correo, teléfono y contraseña.
3. API crea:
   - Tenant municipal.
   - Área inicial `Presidencia Municipal`.
   - Usuario `ADMIN_MUNICIPAL`.
   - Suscripción `TRIAL` por 30 días.
   - Registros de auditoría.
4. API devuelve JWT.
5. Web guarda token y manda a `/app/dashboard`.

## Endpoints

```txt
GET  /api/health
POST /api/auth/register-municipio
POST /api/auth/login
GET  /api/auth/me
GET  /api/tenants/current
```

## Criterios de aceptación

- Un correo no puede registrar dos usuarios.
- El slug del municipio se genera automáticamente y evita duplicados.
- El usuario creado puede iniciar sesión.
- `auth/me` requiere JWT.
- Un municipio suspendido no puede autenticar usuarios.
- Cada municipio queda asociado a `tenantId`.

## Pendientes para siguientes módulos

- Crear CRUD de áreas.
- Crear CRUD de usuarios municipales.
- Crear módulo de oficios.
- Crear carga de PDF.
- Crear dashboard real.
