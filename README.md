# BildyApp API — Práctica Final

API REST desarrollada con Node.js y Express para la gestión de clientes, proyectos y albaranes (partes de horas o materiales).

Este proyecto es la continuación de la [Práctica Intermedia](../Práctica%20Intermedia%20Gestión%20de%20Usuarios/) (módulo de usuarios) y añade:

- CRUD de **Clientes**, **Proyectos** y **Albaranes** con paginación, filtros y archivar/restaurar.
- Firma digital de albaranes y generación de PDF (**pdfkit**).
- Subida de imágenes a la nube (**Cloudinary**) con optimización **Sharp**.
- Documentación interactiva **Swagger** en `/api-docs`.
- Tests de integración (**Jest** + **Supertest** + **mongodb-memory-server**).
- Tiempo real con **Socket.IO** (rooms por compañía).
- Envío de emails (**Nodemailer**) para verificación.
- Logging de errores 5XX a **Slack**.
- Contenedores con **Docker** + **Docker Compose** y CI con **GitHub Actions**.
- Healthcheck `/health` y graceful shutdown.

---

## Requisitos

- Node.js **22+**
- MongoDB (local o Atlas)
- (Opcional) Docker + Docker Compose

---

## Instalación

```bash
npm install
cp .env.example .env
# editar .env con tus credenciales
npm run dev
```

Servidor en `http://localhost:3000`. Documentación en `http://localhost:3000/api-docs`.

---

## Tests

```bash
npm test              # ejecuta todos los tests
npm run test:coverage # con cobertura (>=70%)
```

---

## Docker

```bash
docker compose up --build
```

Levanta la API y una instancia de MongoDB.

---

## Planificación del desarrollo

Ver [`PLANNING.md`](./PLANNING.md) para el plan detallado de commits progresivos (20/04 → 23/04/2026).

---

## Estructura

```
src/
├── config/         # DB, swagger, env
├── controllers/    # Lógica de negocio
├── middleware/     # Auth, validate, error, upload, security
├── models/         # Mongoose schemas
├── routes/         # Definición de rutas
├── services/       # Mail, PDF, storage, logger, realtime
├── sockets/        # Socket.IO handlers y auth
├── utils/          # AppError, helpers
├── validators/     # Zod schemas
├── app.js
└── index.js
tests/              # Jest + Supertest
```

---

## Autor

Olmen023 — Práctica Final del bootcamp de desarrollo web backend.
