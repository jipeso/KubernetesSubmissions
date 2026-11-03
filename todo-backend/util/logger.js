import { createLogger, format, transports } from "winston";

const options = {
  format: format.json(),
  transports: [new transports.Console()],
};

export const logger = createLogger(options);
