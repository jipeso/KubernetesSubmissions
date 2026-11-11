const headers = { "Content-Type": "application/json" };

export const getTodos = () => fetch("/todos");

export const createTodo = (content) =>
  fetch("/todos", {
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
  });

export const markTodoDone = (id) =>
  fetch(`/todos/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ done: true }),
  });

export const breakApp = () => fetch("/break", { method: "POST" });
