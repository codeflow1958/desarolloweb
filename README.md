# Control de Gastos Personales - Backend

API REST hecha con Node.js, Express y MySQL. Proyecto final de Desarrollo Web, Fase 2.

## Requisitos
- Node.js 18 o superior
- MySQL 8

## Instalación
1. Instalar dependencias:
   ```
   npm install
   ```
2. Crear la base de datos y las tablas ejecutando `database/schema.sql` en MySQL:
   ```
   mysql -u root -p < database/schema.sql
   ```
3. Copiar `.env.example` a `.env` y ajustar usuario y contraseña de MySQL.
4. Iniciar el servidor:
   ```
   npm start
   ```
   El servidor queda en `http://localhost:3000`.

## Estructura
```
database/schema.sql      tablas y datos iniciales de catálogos
docs/API.md              documentación de endpoints
postman/                 colección para probar el CRUD
src/server.js            arranque de la aplicación
src/db.js                conexión a MySQL
src/middleware/auth.js   validación del token JWT
src/routes/              rutas de auth, transacciones, catálogos y reportes
```

## Probar con Postman
Importar `postman/gastos-personales.postman_collection.json`. Ejecutar primero Register y Login; la colección guarda el token automáticamente.

La lista de endpoints está en `docs/API.md`.
