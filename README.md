# Sistema Académico USO

Aplicación web para gestionar documentos administrativos académicos: penalidades, retiros de ciclo, equivalencias y absorciones.

## Arquitectura

- `backend/src/presentation`: servidor Express, rutas y middleware.
- `backend/src/application`: servicios y casos de uso.
- `backend/src/infrastructure`: MySQL, repositorios y seguridad.
- `frontend/src/presentation`: páginas, rutas y componentes React.
- `frontend/src/application`: casos de uso del cliente.
- `frontend/src/infrastructure`: clientes HTTP.
- `frontend/src/domain`: modelos de dominio por módulo.

## Seguridad

- Autenticación por JWT firmado con HS256.
- Contraseñas hasheadas con `crypto.scrypt`.
- Middleware `requireAuth` para proteger APIs.
- Middleware `requireRoles` para autorización por rol.
- Auditoría de acciones sensibles: crear, actualizar, eliminar e imprimir.

Roles soportados:

- `ADMIN`
- `DECANO`
- `SECRETARIO`
- `OPERADOR`
- `CONSULTA`

## Instalación

Backend:

```bash
cd backend
npm install
npm run migrate:all
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Variables De Entorno

Crear `backend/.env` basado en `backend/.env.example`.

Variables mínimas:

```env
PORT=3000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DB_SERVER=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=admin
DB_NAME=bd_uso_sonsonate
JWT_SECRET=change_this_to_a_random_secret_with_at_least_32_chars
AUTH_SEED_ADMIN_USERNAME=admin
AUTH_SEED_ADMIN_PASSWORD=cambia_esta_contrasena_inicial
```

## Usuario Inicial

Si la tabla `usuarios` está vacía, `npm run migrate:auth` crea:

- Usuario: `admin`
- Contraseña: el valor configurado en `AUTH_SEED_ADMIN_PASSWORD`

Cambiar esta contraseña antes de presentar o desplegar el sistema.

## Verificación

```bash
cd backend
npm run start
```

```bash
cd frontend
npm run build
```

## Producción

La guía de despliegue está en `docs/PRODUCCION.md`.

Resumen:

```bash
cd backend
npm ci
npm run migrate:all
NODE_ENV=production npm run start:prod
```

```bash
cd frontend
npm ci
npm run build
```

## Observaciones Para Defensa

Fortalezas actuales:

- Separación clara por capas.
- Persistencia real en MySQL.
- Autenticación y autorización.
- Auditoría de acciones críticas.
- Migraciones ejecutables.
- Informes con filtros, gráficos y resumen sincronizado por triggers.
- Generación de documentos PDF/impresión en módulos clave.

Mejoras recomendadas para una versión final:

- Completar el módulo `anotaciones`.
- Agregar pruebas automatizadas de servicios y repositorios.
- Incorporar bitácora visible con filtros por fecha, usuario y entidad.
- Reemplazar almacenamiento de JWT en `localStorage` por cookie `httpOnly` en producción.
- Agregar recuperación/cambio de contraseña desde UI.
- Documentar casos de uso y diagramas ER/UML en el informe de tesis.
