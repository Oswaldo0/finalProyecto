# Sistema Académico USO

Sistema web para gestionar procesos administrativos de coordinación académica en la Universidad de Sonsonate. Incluye autenticación, control de acceso, auditoría, consultas, anotaciones, equivalencias, absorciones, retiros de ciclo, penalidades, usuarios e informes.

## Tecnologías

- React y Vite para la interfaz web.
- Node.js y Express para la API REST.
- MySQL para persistencia.
- JWT y `crypto.scrypt` para autenticación y protección de contraseñas.
- PDFKit para generar documentos e informes.

## Estructura

```text
backend/
  scripts/                 Migraciones y utilidades operativas
  src/
    application/           Reglas de negocio y servicios
    infrastructure/        Base de datos, repositorios y seguridad
    presentation/          Servidor HTTP, middleware y rutas
frontend/
  src/
    application/           Casos de uso del cliente
    assets/                Recursos visuales
    infrastructure/        Comunicación con la API
    presentation/          Componentes, páginas y rutas
```

## Requisitos

- Node.js y npm.
- MySQL 8 o una versión compatible.

## Configuración

1. Instale las dependencias del backend y frontend:

```bash
cd backend
npm ci

cd ../frontend
npm ci
```

2. Cree `backend/.env` a partir de `backend/.env.example` y configure la conexión a MySQL, el secreto JWT y los orígenes permitidos.

```env
PORT=3000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DB_SERVER=localhost
DB_PORT=3306
DB_USER=usuario_mysql
DB_PASSWORD=contrasena_mysql
DB_NAME=bd_uso_sonsonate
JWT_SECRET=secreto_aleatorio_de_al_menos_32_caracteres
AUTH_SEED_ADMIN_USERNAME=admin
AUTH_SEED_ADMIN_PASSWORD=contrasena_inicial_segura
```

Si el frontend se abre desde otro equipo o mediante una IP de red, agregue ese origen completo a `CORS_ORIGINS`, incluido el puerto.

3. Importe `backend/scripts/mysql_universidad_schema.sql` mediante MySQL Workbench o el cliente MySQL.

4. Aplique las migraciones complementarias e inicie el backend:

```bash
cd backend
npm run migrate:all
npm run dev
```

5. Inicie el frontend en otra terminal:

```bash
cd frontend
npm run dev
```

El frontend queda disponible en `http://localhost:5173` y la API en `http://localhost:3000` por defecto.

## Comandos

Backend:

- `npm run dev`: inicia la API con recarga automática.
- `npm start`: inicia la API sin recarga automática.
- `npm test`: ejecuta las pruebas automatizadas.
- `npm run migrate:all`: aplica las migraciones en el orden requerido.

Frontend:

- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: genera la compilación de producción.
- `npm run preview`: sirve localmente la compilación generada.

## Seguridad

La API restringe sus rutas mediante autenticación JWT y autorización por roles. Las acciones sensibles se registran en la auditoría. Las credenciales reales y secretos deben permanecer únicamente en archivos `.env`, que están excluidos del control de versiones.
