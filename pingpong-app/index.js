import express from "express";

const app = express();

const PORT = process.env.PORT || 3001;

let count = 0;

app.get("/pingpong", async (_, res) => {
  count++;
  res.send(`pong ${count}`);
});

app.get("/pongs", async (_, res) => {
  res.json({ count });
});

app.listen(PORT, () => {
  console.log(`pingpong app started in port ${PORT}`);
});
