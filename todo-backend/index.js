import express from "express";
import morgan from "morgan";

import { logger } from "./util/logger.js";

import {
  connectToDatabase,
  checkConnection,
  createTodo,
  getTodos,
  updateTodo,
} from "./util/db.js";
import { connectToNats, publishTodo } from "./util/nats.js";

const app = express();

app.use(morgan("tiny"));
app.use(express.json());

const PORT = process.env.PORT;
const MAX_CONTENT_LENGTH = 140;

app.get("/healthz", async (_, res) => {
  const isHealthy = await checkConnection();

  res.sendStatus(isHealthy ? 200 : 500);
});

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
    logger.info("todo creation failed: content exceeds maximum length");
    return res.status(400).json({ error: "content exceeds maximum length" });
  }

  const newTodo = await createTodo(content);

  publishTodo("created", newTodo);
  logger.info("todo created", { id: newTodo.id, content: newTodo.content });

  res.status(201).json(newTodo);
});

app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { done } = req.body;

  if (typeof done !== "boolean") {
    return res.status(400).json({ error: "done must be a boolean" });
  }

  const updatedTodo = await updateTodo(id, done);

  if (!updatedTodo) {
    return res.status(404).json({ error: "todo not found" });
  }

  publishTodo("updated", updatedTodo);
  logger.info("todo updated", { id, done });
  res.json(updatedTodo);
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

const start = async () => {
  try {
    await connectToDatabase();
    connectToNats();
  } catch {
    logger.info("DB not ready, retrying in 5 seconds...");
    setTimeout(start, 5000);
  }
};

start();
