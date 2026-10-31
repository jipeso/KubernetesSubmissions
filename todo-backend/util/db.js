import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initTodos = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      content TEXT NOT NULL
    )
  `);
};

export const connectToDatabase = async () => {
  await pool.query("SELECT 1");
  console.log("connected to database");
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
