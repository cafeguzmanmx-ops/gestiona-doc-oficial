# Módulo 04 — Seguimiento, cierre documental y dashboard

## Objetivo

Completar el flujo operativo de un oficio recibido: consulta de detalle, historial de avances, adjuntos de seguimiento, cierre documental y tablero inicial de indicadores.

## Backend agregado

### Endpoints

- `GET /api/oficios/dashboard/resumen`
  - Resumen operativo por municipio.
  - Total de oficios, pendientes, vencidos, atendidos, cerrados y próximos a vencer.
  - Distribución por estatus, prioridad y área.
  - Últimos oficios registrados.

- `GET /api/oficios/:id`
  - Detalle completo del oficio.
  - Área responsable, usuario creador, usuario de cierre.
  - Archivos asociados.
  - Historial de seguimientos.

- `POST /api/oficios/:id/seguimientos`
  - Agrega comentario de avance.
  - Permite adjuntar PDF de soporte.
  - Permite cambiar estatus a `EN_PROCESO` o `ATENDIDO`.

- `POST /api/oficios/:id/cerrar`
  - Cierra el oficio.
  - Registra comentario final.
  - Permite adjuntar PDF de respuesta.
  - Marca `closedAt` y `closedById`.

- `GET /api/oficios/archivos/:archivoId/descargar`
  - Descarga segura de archivos por `tenant_id`.
  - No expone rutas físicas del servidor.

### Reglas implementadas

- No se pueden agregar avances a un oficio cerrado.
- La acción de cierre se maneja en endpoint separado.
- Solo se aceptan PDFs de máximo 10 MB.
- Los archivos se guardan bajo `UPLOADS_DIR/tenant/oficios/oficioId`.
- El dashboard actualiza automáticamente oficios vencidos cuando `dueAt` ya pasó y el oficio sigue abierto.

## Frontend agregado

### Dashboard operativo

Ruta:

```txt
/app/dashboard
```

Incluye:

- Total de oficios.
- Pendientes.
- Vencidos.
- Próximos a vencer.
- Cerrados.
- Últimos oficios.
- Distribución por área.

### Detalle de oficio

Ruta:

```txt
/app/oficios/:id
```

Incluye:

- Datos generales del oficio.
- Estatus y prioridad.
- Área responsable.
- Fecha límite.
- Historial de seguimiento.
- Archivos del oficio.
- Descarga autenticada de PDFs.
- Formulario para agregar seguimiento.
- Formulario para cerrar oficio.

### Bandeja de oficios mejorada

Ruta:

```txt
/app/oficios
```

Mejoras:

- Liga del folio al detalle.
- Filtro por estatus.
- Filtro por área.
- Búsqueda por folio, asunto, remitente o dependencia.
- Fecha límite visible.
- Badges visuales de estatus y prioridad.

## Alcance comercial logrado

Con este módulo el MVP ya permite demostrar el flujo completo:

1. Registrar municipio.
2. Crear áreas y usuarios.
3. Capturar oficio recibido.
4. Adjuntar PDF.
5. Turnar a área responsable.
6. Agregar avances.
7. Adjuntar soportes.
8. Cerrar oficio con respuesta.
9. Ver dashboard de control.

Este bloque ya permite preparar una demo funcional para un municipio piloto.
