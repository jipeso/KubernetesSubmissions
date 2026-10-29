import express from "express";
import { readFile } from "node:fs/promises";

const app = express();
const PORT = process.env.PORT || 6000;

const hashFile = "/usr/src/app/files/log.txt";
const pingpongFile = "/usr/src/app/files/pingpong.txt";

app.get("/hashgenerator", async (_, res) => {
  const hash = await readFile(hashFile, "utf8").catch(() => "");
  const pongs = await readFile(pingpongFile, "utf8").catch(() => "0");

  const mostRecentHash =
    hash.trim().split("\n").at(-1) || "No hash generated yet";

  res.send(
    `${mostRecentHash} <br>
    Ping / Pong: ${pongs}`,
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
