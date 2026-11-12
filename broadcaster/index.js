import { connect } from "@nats-io/transport-node";

const nc = await connect({
  servers: process.env.NATS_URL,
  waitOnFirstConnect: true,
  maxReconnectAttempts: -1,
});

console.log("connected to nats");

const sub = nc.subscribe("todos", { queue: "broadcaster" });

for await (const msg of sub) {
  const { action, todo } = msg.json();
  const message = `Todo ${action}: ${todo.content}${todo.done ? " (done)" : ""}`;

  try {
    const response = await fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: "bot", message }),
    });

    console.log(`sent "${message}" (${response.status})`);
  } catch (err) {
    console.error("webhook failed:", err.message);
  }
}
