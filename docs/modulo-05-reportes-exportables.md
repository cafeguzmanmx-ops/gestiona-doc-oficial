# Módulo 05 — Reportes exportables

## Objetivo

Agregar una capa directiva para que el municipio pueda consultar, filtrar y exportar la información de oficios. Este módulo fortalece la venta SaaS porque permite demostrar control, trazabilidad y rendición de cuentas.

## Backend agregado

### Nuevo módulo

```txt
apps/api/src/reportes
```

### Endpoints

- `GET /api/reportes/oficios`
  - Devuelve datos del reporte en JSON.
  - Incluye resumen de conteos.
  - Incluye listado filtrado de oficios.

- `GET /api/reportes/oficios/excel`
  - Exporta archivo `.xlsx`.
  - Hoja `Oficios` con detalle documental.
  - Hoja `Resumen` con indicadores principales.

- `GET /api/reportes/oficios/pdf`
  - Exporta archivo `.pdf` ejecutivo.
  - Incluye municipio, fecha de generación, resumen y listado inicial.

### Filtros soportados

```txt
from
 to
 status
 areaId
 priority
 search
```

### Dependencias agregadas al backend

```json
"exceljs": "^4.4.0",
"pdfkit": "^0.15.2"
```

## Frontend agregado

### Nueva pantalla

```txt
/app/reportes
```

Incluye:

- Filtro por rango de fechas.
- Filtro por estatus.
- Filtro por prioridad.
- Filtro por área.
- Búsqueda por folio, asunto o remitente.
- Resumen de conteos.
- Tabla de resultados.
- Botones para descargar Excel y PDF.

### Navegación

Se agregó el acceso `Reportes` en el menú lateral de la aplicación.

## Alcance comercial logrado

Con este módulo ya se puede mostrar al municipio:

- Cuántos oficios se han recibido.
- Cuántos están pendientes.
- Cuántos se cerraron.
- Cuántos están vencidos.
- Qué área concentra mayor carga documental.
- Exportación para revisión directiva o auditoría interna.

## Nota de MVP

El PDF muestra un resumen ejecutivo y los primeros 80 registros para evitar documentos muy pesados. El Excel conserva el detalle completo del reporte filtrado.
