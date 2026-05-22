# Módulo 06 — Panel SaaS interno y suscripciones anuales

## Objetivo

Agregar una capa de administración interna para operar Gestiona Doc como SaaS municipal de suscripción anual. Este módulo permite controlar municipios registrados, vigencias, activaciones y suspensiones sin depender todavía de pagos automáticos.

## Backend agregado

### Bootstrap de super administrador

Endpoint:

```txt
POST /api/auth/bootstrap-super-admin
```

Body:

```json
{
  "bootstrapToken": "TOKEN_CONFIGURADO_EN_ENV",
  "fullName": "Administrador Gestiona Doc",
  "email": "admin@gestionadoc.com",
  "password": "ContraseñaSegura123"
}
```

Reglas:

- Requiere variable `BOOTSTRAP_TOKEN`.
- Solo permite crear un `SUPER_ADMIN` si no existe uno previo.
- El super administrador no pertenece a ningún municipio.

### Endpoints de administración SaaS

Todos requieren rol `SUPER_ADMIN`.

- `GET /api/admin/municipios`
  - Lista municipios registrados.
  - Incluye estatus, plan, vigencia, usuarios, áreas y oficios.

- `GET /api/admin/municipios/:id`
  - Muestra detalle del municipio.
  - Incluye usuarios, áreas, suscripciones e indicadores de uso.

- `PATCH /api/admin/municipios/:id/suscripcion`
  - Actualiza suscripción manual.
  - Permite activar anualidad, suspender o regresar a trial.

Body de ejemplo:

```json
{
  "status": "ACTIVE",
  "planCode": "MUNICIPAL_ANNUAL",
  "currentPeriodEndsAt": "2027-05-18T00:00:00.000Z",
  "annualPriceCentsMx": 2400000
}
```

## Frontend agregado

### Nueva pantalla

```txt
/app/admin/municipios
```

Incluye:

- Lista de municipios SaaS.
- Estado del municipio.
- Plan activo.
- Vigencia.
- Usuarios, áreas y oficios registrados.
- Acción rápida para activar anualidad.
- Acción rápida para suspender municipio.

### Navegación por rol

- Si el usuario es `SUPER_ADMIN`, se muestra navegación de panel SaaS.
- Si el usuario es municipal, se muestra navegación operativa municipal.

## Modelo comercial habilitado

Este módulo permite operar ventas manuales por suscripción anual:

1. Municipio se registra o se carga como piloto.
2. Se le da trial.
3. El municipio paga por transferencia.
4. El super administrador activa anualidad.
5. Si no paga o termina vigencia, se suspende manualmente.

## Variables de entorno agregadas

```env
BOOTSTRAP_TOKEN="replace-with-one-time-bootstrap-token"
```

## Nota de seguridad

Para producción, el token `BOOTSTRAP_TOKEN` debe ser largo, aleatorio y solo usarse una vez. Después de crear el primer super administrador, puede removerse de Railway para reducir superficie de riesgo.
