import express from "express";

const app = express();

app.use(express.json());

const PORT = process.env.PORT;

const todos = [
  { id: 1, content: "Learn Kubernetes" },
  { id: 2, content: "Build a Node.js app" },
  { id: 3, content: "Deploy to the cloud" },
];

app.get("/todos", (_, res) => {
  res.json(todos);
});

app.post("/todos", (req, res) => {
  const { content } = req.body;

  const newTodo = {
    id: todos.length + 1,
    content,
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
