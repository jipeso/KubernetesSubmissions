import express from "express";
import { readFile, writeFile } from "node:fs/promises";

const app = express();

const PORT = process.env.PORT || 3001;

const file = "/usr/src/app/files/pingpong.txt";

app.get("/pingpong", async (_, res) => {
  const currentCount = await readFile(file, "utf8").catch(() => "0");
  const newCount = parseInt(currentCount) + 1;
  await writeFile(file, newCount.toString());
  res.send(`pong ${newCount}`);
});

app.listen(PORT, () => {
  console.log(`pingpong app started in port ${PORT}`);
});
