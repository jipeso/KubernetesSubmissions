import express from "express";
import morgan from "morgan";

import { logger } from "./util/logger.js";

import { connectToDatabase, createTodo, getTodos } from "./util/db.js";
const app = express();

app.use(morgan("tiny"));
app.use(express.json());

const PORT = process.env.PORT;
const MAX_CONTENT_LENGTH = 140;

app.get("/todos", async (_, res) => {
  const todos = await getTodos();
  res.json(todos);
});

app.post("/todos", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    logger.info("todo creation failed: content is required");
    return res.status(400).json({ error: "content is required" });
  }

  logger.info("todo received", { content });

  if (content.length > MAX_CONTENT_LENGTH) {
    logger.info("todo creation failed: content exceeds maximum length", {
      length: content.length,
    });
    return res.status(400).json({ error: "content exceeds maximum length" });
  }

  const newTodo = await createTodo(content);

  logger.info("todo created", { id: newTodo.id, content: newTodo.content });

  res.status(201).json(newTodo);
});

const start = async () => {
  await connectToDatabase();

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

start();
