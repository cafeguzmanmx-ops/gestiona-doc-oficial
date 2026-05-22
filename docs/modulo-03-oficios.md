# Módulo 3 - Oficios Recibidos

## Objetivo

Construir el núcleo operativo de Gestiona Doc: registro de correspondencia oficial recibida, folio automático, turnado inicial y adjunto PDF.

## Funciones incluidas

- Crear oficio recibido.
- Generar folio automático por municipio: `GD-AAAA-000001`.
- Validar unicidad por `tenantId + folio`.
- Capturar número de oficio externo.
- Capturar remitente y dependencia remitente.
- Capturar asunto, descripción, prioridad y fecha límite.
- Asignar área responsable desde el registro.
- Determinar estatus inicial:
  - `RECIBIDO` si no tiene área responsable.
  - `TURNADO` si tiene área responsable.
- Adjuntar PDF de oficio recibido.
- Guardar archivo en ruta local configurable por `UPLOADS_DIR`.
- Crear seguimiento automático inicial.
- Listar bandeja de oficios.
- Consultar detalle de oficio.
- Cambiar estatus con comentario.

## Endpoints

```txt
GET   /api/oficios
GET   /api/oficios/:id
POST  /api/oficios
PATCH /api/oficios/:id/status
```

## Pantalla

```txt
/app/oficios
```

## Reglas técnicas

- Cada oficio pertenece a un municipio mediante `tenantId`.
- El folio no es único global, es único por municipio.
- Solo se permiten PDF de hasta 10 MB.
- El almacenamiento actual es local/volumen Railway para MVP.
- En producción posterior se recomienda migrar a Cloudflare R2.

## Pendientes siguientes

- Detalle visual del oficio.
- Descarga segura de PDF.
- Seguimientos con adjunto.
- Cierre documental con respuesta.
- Dashboard real con conteos.
- Alertas de vencimiento.
