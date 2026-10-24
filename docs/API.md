# Documentación de la API - Control de Gastos Personales

URL base: `http://localhost:3000`

Todas las rutas, excepto registro y login, requieren el encabezado:
`Authorization: Bearer <token>`

## Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/auth/register | Registra un usuario (nombre, email, password) |
| POST | /api/auth/login | Inicia sesión y devuelve el token JWT |
| GET | /api/auth/perfil | Devuelve los datos del usuario autenticado |

## Transacciones (entidad principal)

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/transacciones | Lista las transacciones del usuario. Filtros opcionales: id_categoria, id_tipo, desde, hasta |
| GET | /api/transacciones/:id | Obtiene una transacción por id |
| POST | /api/transacciones | Crea una transacción (id_categoria, id_tipo, monto, fecha, descripcion) |
| PUT | /api/transacciones/:id | Actualiza una transacción |
| DELETE | /api/transacciones/:id | Elimina una transacción |

## Categorías (catálogo)

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/categorias | Lista las categorías |
| GET | /api/categorias/:id | Obtiene una categoría por id |
| POST | /api/categorias | Crea una categoría (nombre, descripcion) |
| PUT | /api/categorias/:id | Actualiza una categoría |
| DELETE | /api/categorias/:id | Elimina una categoría (si no tiene transacciones asociadas) |

## Tipos de transacción (catálogo)

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/tipos-transaccion | Lista los tipos (Ingreso, Gasto) |
| GET | /api/tipos-transaccion/:id | Obtiene un tipo por id |
| POST | /api/tipos-transaccion | Crea un tipo (nombre) |
| PUT | /api/tipos-transaccion/:id | Actualiza un tipo |
| DELETE | /api/tipos-transaccion/:id | Elimina un tipo (si no tiene transacciones asociadas) |

## Reportes

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/reportes/totales-por-categoria | Totales agrupados por categoría y tipo. Filtros opcionales: desde, hasta |
| GET | /api/reportes/resumen | Total de ingresos, total de gastos y balance |

## Códigos de respuesta

| Código | Significado |
|---|---|
| 200 | Operación correcta |
| 201 | Recurso creado |
| 400 | Datos inválidos o faltantes |
| 401 | Token ausente, inválido o credenciales incorrectas |
| 404 | Recurso no encontrado |
| 409 | Conflicto (duplicado o registro con dependencias) |
| 500 | Error del servidor |
