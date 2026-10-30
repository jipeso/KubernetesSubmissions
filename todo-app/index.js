import express from "express";
import { stat, writeFile } from "node:fs/promises";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

const imageFile = "/usr/src/app/files/image.jpg";
const backendUrl = "http://todobackend-svc:7878/todos";
const maxAge = 10 * 60 * 1000;

const fetchImage = async () => {
  const response = await fetch("https://picsum.photos/300");
  await writeFile(imageFile, Buffer.from(await response.arrayBuffer()));
};

const fetchTodos = async () => {
  const response = await fetch(backendUrl);
  return response.json();
};

const addTodo = async (content) => {
  const response = await fetch(backendUrl, {
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
  const info = await stat(imageFile).catch(() => null);

  if (!info) await fetchImage();
  else if (Date.now() - info.mtimeMs > maxAge)
    fetchImage().catch(console.error);

  res.sendFile(imageFile);
});

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
