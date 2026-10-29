import { appendFile } from "node:fs/promises";

const randomString = crypto.randomUUID();

const file = "/usr/src/app/files/log.txt";

setInterval(() => {
  appendFile(file, `${new Date().toISOString()}: ${randomString}\n`);
}, 5000);
