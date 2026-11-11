import pg from "pg";

import { logger } from "./logger.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (e) => {
  logger.error("pg pool error", { error: e.message });
});

const initTodos = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      content TEXT NOT NULL
    )
  `);

  await pool.query(`
    ALTER TABLE todos
    ADD COLUMN IF NOT EXISTS done BOOLEAN NOT NULL DEFAULT FALSE
  `);
};

export const checkConnection = async () => {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
};

export const connectToDatabase = async () => {
  if (!(await checkConnection())) {
    throw new Error("cannot reach database");
  }
  logger.info("connected to database");
  await initTodos();
};

export const createTodo = async (content) => {
  const result = await pool.query(
    "INSERT INTO todos (content) VALUES ($1) RETURNING *",
    [content],
  );
  return result.rows[0];
};

export const getTodos = async () => {
  const result = await pool.query("SELECT * FROM todos ORDER BY id");
  return result.rows;
};

export const updateTodo = async (id, done) => {
  const result = await pool.query(
    "UPDATE todos SET done = $2 WHERE id = $1 RETURNING *",
    [id, done],
  );
  return result.rows[0];
};
