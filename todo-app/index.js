import express from "express";
import { stat, writeFile, rename } from "node:fs/promises";

const app = express();
const PORT = process.env.PORT || 3000;

const imageFile = "/usr/src/app/files/image.jpg";
const maxAge = 10 * 60 * 1000;

const fetchImage = async () => {
  const response = await fetch("https://picsum.photos/300");
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(imageFile + ".tmp", buffer);
  await rename(imageFile + ".tmp", imageFile);
};

app.get("/image", async (_, res) => {
  const info = await stat(imageFile).catch(() => null);

  if (!info) await fetchImage();
  else if (Date.now() - info.mtimeMs > maxAge) fetchImage();

  res.sendFile(imageFile);
});

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
