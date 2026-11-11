import express from "express";
import { stat, writeFile } from "node:fs/promises";

import { errorHandler } from "./middleware/error.js";
import { breakApp, healthMiddleware } from "./middleware/health.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const BACKEND_URL = process.env.BACKEND_URL;
const IMAGE_FILE_PATH = process.env.IMAGE_FILE_PATH;
const IMAGE_MAX_AGE_MS = 10 * 60 * 1000;
const BACKEND_TIMEOUT_MS = 5000;

const fetchImage = async () => {
  const response = await fetch(process.env.IMAGE_URL);
  await writeFile(IMAGE_FILE_PATH, Buffer.from(await response.arrayBuffer()));
};

const proxyToBackend = async (req, res) => {
  const response = await fetch(`${BACKEND_URL}${req.originalUrl}`, {
    method: req.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
  });

  res
    .status(response.status)
    .type("json")
    .send(await response.text());
};

app.use(express.static("public"));
app.use(healthMiddleware);

app.get("/healthz", (_, res) => {
  res.json({ status: "ok" });
});

app.get("/backendready", async (_, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/healthz`, {
      signal: AbortSignal.timeout(2000),
    });
    res.sendStatus(response.ok ? 200 : 500);
  } catch {
    res.sendStatus(500);
  }
});

app.post("/break", (_, res) => {
  breakApp();
  res.json({ status: "ok" });
});

app.get("/todos", proxyToBackend);
app.post("/todos", proxyToBackend);
app.put("/todos/:id", proxyToBackend);

app.get("/image", async (_, res) => {
  const info = await stat(IMAGE_FILE_PATH).catch(() => null);

  if (!info) await fetchImage();
  else if (Date.now() - info.mtimeMs > IMAGE_MAX_AGE_MS)
    fetchImage().catch(console.error);

  res.sendFile(IMAGE_FILE_PATH);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
