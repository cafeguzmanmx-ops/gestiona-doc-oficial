# Checklist de pruebas funcionales — Gestiona Doc MVP

## 1. Autenticación y SaaS

- [ ] Crear primer `SUPER_ADMIN` con `BOOTSTRAP_TOKEN`.
- [ ] Iniciar sesión como `SUPER_ADMIN`.
- [ ] Crear demo comercial desde panel SaaS.
- [ ] Activar un municipio por un año.
- [ ] Suspender un municipio.
- [ ] Verificar que el municipio suspendido no pueda operar módulos críticos.

## 2. Municipio y usuarios

- [ ] Iniciar sesión como administrador municipal.
- [ ] Crear área municipal.
- [ ] Editar área municipal.
- [ ] Crear usuario capturista.
- [ ] Crear usuario director de área.
- [ ] Crear usuario consulta.
- [ ] Desactivar usuario.

## 3. Oficios

- [ ] Registrar oficio sin PDF.
- [ ] Registrar oficio con PDF válido.
- [ ] Rechazar archivo no PDF.
- [ ] Rechazar PDF que exceda `MAX_UPLOAD_MB`.
- [ ] Rechazar fecha límite anterior a recepción.
- [ ] Listar oficios por estatus.
- [ ] Buscar por folio, remitente o asunto.
- [ ] Consultar detalle del oficio.
- [ ] Descargar PDF adjunto.

## 4. Seguimiento y cierre

- [ ] Agregar seguimiento sin archivo.
- [ ] Agregar seguimiento con PDF.
- [ ] Cambiar estatus a `EN_PROCESO`.
- [ ] Cambiar estatus a `ATENDIDO`.
- [ ] Cerrar oficio con comentario.
- [ ] Cerrar oficio con archivo de respuesta.
- [ ] Verificar que un oficio cerrado no acepte nuevos avances.

## 5. Permisos

- [ ] Director de área solo ve oficios de su área o creados por él.
- [ ] Capturista ve operación municipal general.
- [ ] Consulta no puede crear ni cerrar oficios.
- [ ] Super admin no entra a operación documental municipal.

## 6. Dashboard, reportes y alertas

- [ ] Ver dashboard operativo.
- [ ] Ver conteos de pendientes, vencidos y cerrados.
- [ ] Exportar reporte Excel.
- [ ] Exportar reporte PDF.
- [ ] Ver alertas internas.
- [ ] Marcar una alerta como leída.
- [ ] Marcar todas las alertas como leídas.

## 7. Auditoría

- [ ] Ver bitácora como administrador municipal.
- [ ] Ver bitácora como `SUPER_ADMIN`.
- [ ] Confirmar registros de creación de oficio.
- [ ] Confirmar registros de descarga de archivo.
- [ ] Confirmar registros de cambio de suscripción.

## 8. Landing y ventas

- [ ] Abrir landing pública.
- [ ] Enviar solicitud de demo.
- [ ] Ver solicitud en panel SaaS.
- [ ] Cambiar estatus de solicitud.
- [ ] Agregar notas comerciales.
