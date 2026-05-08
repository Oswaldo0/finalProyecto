import express from "express";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.all("/api/*", (_req, res) => {
  res.status(503).json({
    status: "paused",
    message: "API temporalmente deshabilitada.",
  });
});

const server = app.listen(port, async () => {
  console.log(`Backend escuchando en puerto ${port}`);
});

async function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
