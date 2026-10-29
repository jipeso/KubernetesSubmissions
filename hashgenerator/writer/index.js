import { appendFile } from "node:fs/promises";

const randomString = crypto.randomUUID();

setInterval(() => {
  appendFile(
    "/usr/src/app/files/log.txt",
    `${new Date().toISOString()}: ${randomString}\n`,
  );
}, 5000);
