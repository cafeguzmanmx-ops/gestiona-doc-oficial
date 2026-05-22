# Módulo 2 - Organigrama y Usuarios Municipales

## Objetivo

Permitir que el administrador municipal configure la estructura interna mínima para operar el control documental.

## Funciones incluidas

### Organigrama

- Listar áreas activas del municipio.
- Crear áreas.
- Asignar área superior.
- Desactivar área si no tiene usuarios activos.
- Validar que cada área pertenezca al `tenantId` del usuario autenticado.

### Usuarios

- Listar usuarios del municipio.
- Crear usuarios internos.
- Asignar rol.
- Asignar área.
- Activar/desactivar usuario mediante actualización.
- Impedir que un administrador municipal cree `SUPER_ADMIN`.

## Endpoints

```txt
GET    /api/areas
POST   /api/areas
PATCH  /api/areas/:id
DELETE /api/areas/:id

GET    /api/users
POST   /api/users
PATCH  /api/users/:id
```

## Pantallas

```txt
/app/areas
/app/usuarios
```

## Criterios de aceptación

- Solo `ADMIN_MUNICIPAL` puede crear o modificar áreas y usuarios.
- Cada consulta queda restringida al municipio autenticado.
- No se puede asignar un área de otro municipio.
- No se puede crear un usuario con correo duplicado.
- No se puede asignar `SUPER_ADMIN` desde el panel municipal.

## Siguiente módulo recomendado

Módulo 3: Oficios recibidos, folio automático, adjunto PDF y listado operativo.
