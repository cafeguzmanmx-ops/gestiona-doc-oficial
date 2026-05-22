# Módulo 08 — Alertas internas y notificaciones

## Objetivo

Agregar un sistema de alertas internas para que Gestiona Doc avise a los usuarios municipales sobre eventos relevantes del control documental.

Este módulo fortalece la propuesta comercial del SaaS porque convierte al sistema en una bandeja de trabajo activa, no solo en un registro de oficios.

## Funcionalidades agregadas

### Backend

Nuevo módulo:

```txt
apps/api/src/notifications
```

Endpoints:

```txt
GET   /api/notificaciones
GET   /api/notificaciones/resumen
PATCH /api/notificaciones/:id/leida
PATCH /api/notificaciones/marcar-todas-leidas
```

### Base de datos

Nueva tabla:

```txt
notifications
```

Nuevo enum:

```txt
NotificationType
```

Tipos iniciales:

```txt
OFICIO_ASIGNADO
OFICIO_PROXIMO_VENCER
OFICIO_VENCIDO
OFICIO_CERRADO
SUSCRIPCION_PROXIMA_VENCER
```

### Frontend

Nueva pantalla:

```txt
/app/notificaciones
```

Se agregó acceso en el menú lateral como:

```txt
Alertas
```

## Reglas funcionales

### Oficio asignado

Cuando un oficio se registra con área responsable, el sistema genera notificación para:

- Administradores municipales.
- Director del área responsable.
- Capturistas del área responsable.

### Oficio próximo a vencer

Cuando el usuario abre notificaciones, el sistema revisa oficios abiertos con vencimiento en los próximos 3 días y genera alerta interna.

### Oficio vencido

Cuando existe un oficio abierto con fecha límite vencida, el sistema genera alerta interna para los usuarios responsables.

### Oficio cerrado

Cuando un oficio se cierra documentalmente, el sistema genera notificación de cierre a usuarios relacionados.

## Control de duplicados

Se agregó restricción única para evitar alertas repetidas por usuario, tipo y oficio:

```txt
tenantId + userId + type + oficioId
```

Esto evita que al abrir la pantalla varias veces se dupliquen las mismas alertas.

## Consideraciones para producción

En el MVP las alertas se generan bajo demanda al consultar notificaciones. Más adelante conviene mover esta lógica a un proceso programado:

```txt
Cron diario / Worker Railway
```

Ese worker podrá:

- Generar alertas de vencimiento automáticamente.
- Enviar correos.
- Enviar recordatorios diarios.
- Generar avisos de suscripción por vencer.

## Pendientes posteriores

- Badge visual con número de alertas no leídas en el menú.
- Correo transaccional.
- Preferencias de notificación por usuario.
- Worker programado en Railway.
- Alertas para suscripción anual próxima a vencer.
