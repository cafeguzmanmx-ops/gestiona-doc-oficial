# Arquitectura Gestiona Doc 1.0

## Decisión base

La primera versión usará una arquitectura SaaS multi-tenant con una sola base PostgreSQL y separación lógica por `tenant_id`.

## Componentes

- Web: React + Vite + Tailwind.
- API: NestJS.
- ORM: Prisma.
- DB: PostgreSQL.
- Hosting MVP: Railway.
- Archivos MVP: volumen persistente Railway en fase posterior.

## Principios

1. Cada municipio es un `Tenant`.
2. Cada dato operativo debe pertenecer a un `tenantId`.
3. El administrador municipal se crea durante el registro.
4. Todo acceso autenticado usa JWT.
5. La suscripción inicial es `TRIAL` por 30 días.
6. La activación anual será manual al inicio.

## Módulos concluidos

### Módulo 0 - Base técnica

- Monorepo.
- API.
- Web.
- Documentación.
- Script de backup por módulo.

### Módulo 1 - Registro/Login/Multi-tenant

- Registro de municipio.
- Usuario administrador municipal.
- Área inicial Presidencia Municipal.
- Suscripción trial.
- Login JWT.
- Endpoint `auth/me`.
- Endpoint `tenants/current`.
- Auditoría inicial.

### Módulo 2 - Organigrama y usuarios municipales

- CRUD básico de áreas municipales.
- Jerarquía simple por área superior.
- CRUD básico de usuarios municipales.
- Asignación de roles.
- Asignación de áreas.
- Pantallas `/app/areas` y `/app/usuarios`.

### Módulo 3 - Oficios recibidos

- Modelo `Oficio`.
- Modelo `Archivo`.
- Modelo `Seguimiento`.
- Folio automático por municipio.
- Captura de oficio recibido con PDF.
- Bandeja `/app/oficios`.
- Cambio de estatus con comentario.
