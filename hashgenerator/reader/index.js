import express from "express";
import { readFile } from "node:fs/promises";

const app = express();

const { PORT, MESSAGE, LOG_FILE_PATH, INFO_FILE_PATH, PINGPONG_URL } =
  process.env;

app.get("/hashgenerator", async (_, res) => {
  const hash = await readFile(LOG_FILE_PATH, "utf8").catch(() => "");
  const info = await readFile(INFO_FILE_PATH, "utf8").catch(() => "");

  const { count } = await fetch(PINGPONG_URL)
    .then((r) => r.json())
    .catch(() => ({ count: 0 }));

  const mostRecentHash = hash.trim().split("\n").at(-1);

  res.send(
    `file content: ${info} <br>
    env variable: MESSAGE=${MESSAGE} <br>
    ${mostRecentHash} <br>
    Ping / Pong: ${count}`,
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
