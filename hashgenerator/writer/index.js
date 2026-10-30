import { appendFile } from "node:fs/promises";

const randomString = crypto.randomUUID();

const WRITE_INTERVAL_MS = 5000;

setInterval(() => {
  appendFile(
    process.env.LOG_FILE_PATH,
    `${new Date().toISOString()}: ${randomString}\n`,
  );
}, WRITE_INTERVAL_MS);
