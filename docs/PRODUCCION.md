# Guía de preparación para producción

Esta guía resume los pasos para desplegar el Sistema Académico USO en un entorno productivo.

## 1. Requisitos

- Node.js LTS.
- MySQL 8 o compatible.
- Dominio o IP del servidor.
- HTTPS configurado en proxy inverso o plataforma de despliegue.
- Variables de entorno seguras.

## 2. Variables de entorno del backend

Crear `backend/.env` basado en `backend/.env.example`.

Valores obligatorios:

```env
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://tu-dominio.com
JSON_BODY_LIMIT=1mb
DB_SERVER=localhost
DB_PORT=3306
DB_USER=usuario_app
DB_PASSWORD=contrasena_segura
DB_NAME=bd_uso_sonsonate
JWT_SECRET=secreto_aleatorio_de_32_o_mas_caracteres
AUTH_SEED_ADMIN_USERNAME=admin
AUTH_SEED_ADMIN_PASSWORD=contrasena_inicial_segura
```

[IMPORTANTE] No usar `AdminUso2026!` como contraseña en producción.

[IMPORTANTE] `JWT_SECRET` debe tener al menos 32 caracteres y no debe compartirse.

## 3. Variables de entorno del frontend

Si backend y frontend se sirven desde el mismo dominio, no se requiere variable adicional porque el cliente usa `/api`.

Si el frontend se sirve desde otro dominio, crear `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://api.tu-dominio.com
```

## 4. Instalación

Backend:

```bash
cd backend
npm ci
```

Frontend:

```bash
cd frontend
npm ci
```

## 5. Migraciones

Ejecutar desde `backend`:

```bash
npm run migrate:all
```

Este comando aplica migraciones de autenticación, auditoría, anotaciones, consultas, correlativos, estados e informes.

## 6. Compilar frontend

Ejecutar desde `frontend`:

```bash
npm run build
```

El resultado queda en `frontend/dist`.

## 7. Arranque en producción

Ejecutar desde `backend`:

```bash
NODE_ENV=production npm run start:prod
```

En Windows PowerShell:

```powershell
$env:NODE_ENV="production"; npm run start:prod
```

El backend sirve:

- API en `/api`.
- Frontend compilado desde `frontend/dist`.
- Healthcheck en `/health`.

## 8. Verificación rápida

1. Abrir `https://tu-dominio.com/health`.
2. Confirmar respuesta:

```json
{ "status": "ok" }
```

3. Abrir la aplicación.
4. Iniciar sesión.
5. Crear un documento de prueba.
6. Verificar informes.
7. Generar un PDF.

## 9. Seguridad aplicada en la aplicación

El backend aplica:

- Validación de variables de entorno.
- CORS restringido por `CORS_ORIGINS`.
- Límite de JSON por `JSON_BODY_LIMIT`.
- Ocultamiento de errores internos en producción.
- Headers de seguridad:
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Content-Security-Policy`
  - `Strict-Transport-Security`

## 10. Recomendaciones adicionales

- Usar HTTPS.
- No exponer MySQL públicamente.
- Crear usuario MySQL con permisos mínimos.
- Rotar `JWT_SECRET` si se sospecha exposición.
- Cambiar la contraseña inicial del administrador después del primer ingreso.
- Hacer respaldos periódicos de la base de datos.
- Ejecutar el backend con un gestor de procesos como PM2, systemd o servicio equivalente.
- Configurar logs del servidor y monitoreo básico.

## 11. Checklist final

- [ ] `NODE_ENV=production`.
- [ ] `CORS_ORIGINS` contiene solo dominios reales.
- [ ] `JWT_SECRET` seguro.
- [ ] Contraseña inicial cambiada.
- [ ] `npm run migrate:all` ejecutado.
- [ ] `npm run build` ejecutado en frontend.
- [ ] `/health` responde correctamente.
- [ ] Login probado.
- [ ] Creación, modificación e impresión probadas.
- [ ] Reportes y PDF probados.

