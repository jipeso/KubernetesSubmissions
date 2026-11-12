import { connect } from "@nats-io/transport-node";

import { logger } from "./logger.js";

let nc;

export const connectToNats = async () => {
  nc = await connect({
    servers: process.env.NATS_URL,
    waitOnFirstConnect: true,
    maxReconnectAttempts: -1,
  });

  logger.info("connected to nats");
};

export const publishTodo = (action, todo) => {
  if (!nc || nc.isClosed()) return;
  nc.publish("todos", JSON.stringify({ action, todo }));
};
