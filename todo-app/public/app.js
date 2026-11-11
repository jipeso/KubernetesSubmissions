import { breakApp, createTodo, getTodos, markTodoDone } from "./api.js";

const form = document.getElementById("todo-form");
const list = document.getElementById("todo-list");

const showFailure = () => {
  document.getElementById("app").hidden = true;
  document.getElementById("failure").hidden = false;
};

const addItem = (todo) => {
  const li = document.createElement("li");
  const button = document.createElement("button");
  const done = document.createElement("span");
  li.textContent = todo.content;
  button.textContent = "Mark done";
  done.textContent = "Done";

  button.addEventListener("click", async () => {
    const response = await markTodoDone(todo.id);
    if (!response.ok) return showFailure();
    button.replaceWith(done);
  });

  li.append(todo.done ? done : button);
  list.append(li);
};

document.getElementById("break-button").addEventListener("click", async () => {
  await breakApp().catch(() => null);
  showFailure();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const response = await createTodo(form.content.value);
  if (!response.ok) return showFailure();
  addItem(await response.json());
  form.reset();
});

const response = await getTodos().catch(() => null);
if (response?.ok) {
  (await response.json()).forEach(addItem);
} else {
  showFailure();
}
