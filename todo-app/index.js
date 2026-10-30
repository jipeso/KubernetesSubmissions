import express from "express";
import { stat, writeFile } from "node:fs/promises";

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

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
