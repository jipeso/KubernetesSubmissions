import express from "express";

import { connectToDatabase, createTodo, getTodos } from "./util/db.js";
const app = express();

app.use(express.json());

const PORT = process.env.PORT;

app.get("/todos", async (_, res) => {
  const todos = await getTodos();
  res.json(todos);
});

app.post("/todos", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "content is required" });
  }

  const newTodo = await createTodo(content);
  res.status(201).json(newTodo);
});

const start = async () => {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
