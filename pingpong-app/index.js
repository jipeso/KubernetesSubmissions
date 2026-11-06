import express from "express";
import {
  connectToDatabase,
  checkConnection,
  incrementCount,
  getCount,
} from "./util/db.js";

const app = express();

const PORT = process.env.PORT;

app.get("/healthz", async (_, res) => {
  const isConnected = await checkConnection();
  res.sendStatus(isConnected ? 200 : 500);
});

app.get("/", async (_, res) => {
  const count = await incrementCount();
  res.send(`pong ${count}`);
});

app.get("/pongs", async (_, res) => {
  const count = await getCount();
  res.json({ count });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const start = async () => {
  try {
    await connectToDatabase();
  } catch {
    console.log("DB not ready, retrying in 5 seconds...");
    setTimeout(start, 5000);
  }
};

start();
