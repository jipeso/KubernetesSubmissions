import express from "express";
import { readFile } from "node:fs/promises";

const app = express();

app.get("/hashgenerator", async (_, res) => {
  const fileContent = await readFile("/usr/src/app/files/log.txt", "utf8");
  res.send(fileContent);
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
