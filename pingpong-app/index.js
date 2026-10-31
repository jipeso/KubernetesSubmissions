import express from "express";
import { connectToDatabase, incrementCount, getCount } from "./util/db.js";

const app = express();

const PORT = process.env.PORT;

app.get("/pingpong", async (_, res) => {
  const count = await incrementCount();
  res.send(`pong ${count}`);
});

app.get("/pongs", async (_, res) => {
  const count = await getCount();
  res.json({ count });
});

const start = async () => {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
