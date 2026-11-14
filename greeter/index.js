import express from "express";

const app = express();

const { PORT, GREETING } = process.env;

app.get("/healthz", async (_, res) => {
  res.sendStatus(200);
});

app.get("/", async (_, res) => {
  res.send({ greeting: GREETING });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
