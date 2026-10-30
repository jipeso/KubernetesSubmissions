const form = document.getElementById("todo-form");
const list = document.getElementById("todo-list");

const addItem = (todo) => {
  const li = document.createElement("li");
  li.textContent = todo.content;
  list.append(li);
};

const todos = await (await fetch("/todos")).json();
todos.forEach(addItem);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const response = await fetch("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: form.content.value }),
  });
  addItem(await response.json());
  form.reset();
});
