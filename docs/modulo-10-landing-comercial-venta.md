# Módulo 10 — Landing comercial y preparación de venta

## Objetivo

Convertir Gestiona Doc en un MVP demostrable comercialmente, con una página pública orientada a municipios mexicanos y un flujo real para captar solicitudes de demo.

## Alcance desarrollado

### Frontend público

- Landing comercial en `/` con propuesta de valor clara.
- Nueva página pública `/solicitar-demo`.
- Secciones comerciales:
  - problema que resuelve,
  - beneficios,
  - módulos del MVP,
  - planes anuales sugeridos,
  - llamada a solicitar demo.

### Captura de prospectos

Se agregó el endpoint público:

```http
POST /api/contacto/solicitar-demo
```

Campos:

- municipioName
- state
- contactName
- position
- email
- phone
- estimatedUsers
- message
- source

### Panel SaaS interno

Se agregó una nueva pantalla protegida para `SUPER_ADMIN`:

```txt
/app/admin/solicitudes-demo
```

Permite:

- ver solicitudes de demo,
- filtrar por estatus,
- registrar notas comerciales internas,
- actualizar etapa comercial.

### Estatus comerciales

```txt
NEW
CONTACTED
DEMO_SCHEDULED
WON
LOST
```

### Base de datos

Nueva tabla:

```txt
demo_requests
```

Nueva migración:

```txt
20260521100000_landing_demo_requests
```

Nuevas acciones de auditoría:

```txt
DEMO_REQUEST_CREATED
DEMO_REQUEST_UPDATED
```

## Flujo comercial recomendado

1. Prospecto entra a la landing.
2. Solicita demo desde `/solicitar-demo`.
3. El `SUPER_ADMIN` revisa la solicitud en el panel.
4. Se marca como `CONTACTED` cuando se hace el primer contacto.
5. Se marca como `DEMO_SCHEDULED` cuando se agenda presentación.
6. Se marca como `WON` si se convierte en municipio activo.
7. Se marca como `LOST` si no avanza.

## Valor para venta

Este módulo permite que el producto ya no sea solo una aplicación interna, sino una plataforma con embudo comercial básico para vender suscripciones anuales.
