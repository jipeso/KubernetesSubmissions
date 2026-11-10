const form = document.getElementById("todo-form");
const list = document.getElementById("todo-list");
const breakButton = document.getElementById("break-button");

const showFailure = () => {
  document.getElementById("app").hidden = true;
  document.getElementById("failure").hidden = false;
};

const addItem = (todo) => {
  const li = document.createElement("li");
  li.textContent = todo.content;
  list.append(li);
};

breakButton.addEventListener("click", async () => {
  await fetch("/break", { method: "POST" }).catch(() => null);
  showFailure();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const response = await fetch("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: form.content.value }),
  });
  if (!response.ok) return showFailure();
  addItem(await response.json());
  form.reset();
});

const response = await fetch("/todos").catch(() => null);
if (response?.ok) {
  (await response.json()).forEach(addItem);
} else {
  showFailure();
}
