import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initCount = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS counter (
      id INTEGER PRIMARY KEY,
      count INTEGER NOT NULL
    )
  `);
  await pool.query(
    "INSERT INTO counter (id, count) VALUES (1, 0) ON CONFLICT (id) DO NOTHING"
  );
};

export const connectToDatabase = async () => {
  await pool.query("SELECT 1");
  console.log("connected to database");
  await initCount();
};

export const incrementCount = async () => {
  const result = await pool.query(
    "UPDATE counter SET count = count + 1 WHERE id = 1 RETURNING count"
  );
  return result.rows[0].count;
};

export const getCount = async () => {
  const result = await pool.query("SELECT count FROM counter WHERE id = 1");
  return result.rows[0].count;
};
