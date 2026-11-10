import express from "express";
import { stat, writeFile } from "node:fs/promises";

import { breakApp, healthMiddleware } from "./middleware/health.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const BACKEND_URL = process.env.BACKEND_URL;
const IMAGE_FILE_PATH = process.env.IMAGE_FILE_PATH;
const IMAGE_MAX_AGE_MS = 10 * 60 * 1000;

const fetchImage = async () => {
  const response = await fetch(process.env.IMAGE_URL);
  await writeFile(IMAGE_FILE_PATH, Buffer.from(await response.arrayBuffer()));
};

const fetchTodos = async () => {
  const response = await fetch(`${BACKEND_URL}/todos`);
  return response.json();
};

const addTodo = async (content) => {
  const response = await fetch(`${BACKEND_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  return response.json();
};

app.use(express.static("public"));
app.use(healthMiddleware);

app.get("/healthz", (_, res) => {
  res.status(200).json({ status: "ok" });
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
  res.status(200).json({ status: "ok" });
});

app.get("/todos", async (_, res) => {
  const todos = await fetchTodos();
  res.json(todos);
});

app.post("/todos", async (req, res) => {
  const { content } = req.body;
  const todo = await addTodo(content);
  res.status(201).json(todo);
});

app.get("/image", async (_, res) => {
  const info = await stat(IMAGE_FILE_PATH).catch(() => null);

  if (!info) await fetchImage();
  else if (Date.now() - info.mtimeMs > IMAGE_MAX_AGE_MS)
    fetchImage().catch(console.error);

  res.sendFile(IMAGE_FILE_PATH);
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
