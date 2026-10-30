import express from "express";
import { readFile } from "node:fs/promises";

const app = express();
const PORT = process.env.PORT || 6000;
const MESSAGE = process.env.MESSAGE || "";

const hashFile = "/usr/src/app/files/log.txt";
const infoFile = "/usr/src/app/config/information.txt";
const pingpongUrl = "http://pingpong-svc:4545/pongs";

app.get("/hashgenerator", async (_, res) => {
  const hash = await readFile(hashFile, "utf8").catch(() => "");
  const info = await readFile(infoFile, "utf8").catch(() => "");

  const { count } = await fetch(pingpongUrl)
    .then((r) => r.json())
    .catch(() => ({ count: 0 }));

  const mostRecentHash =
    hash.trim().split("\n").at(-1) || "No hash generated yet";

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
