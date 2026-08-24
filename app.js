const STORAGE_KEY = "daily-focus-board:v1";

const starterTasks = [
  { id: "starter-1", title: "Choose the one thing that would make today count", category: "work", done: false },
  { id: "starter-2", title: "Take a real break away from the screen", category: "personal", done: false },
  { id: "starter-3", title: "Spend 20 minutes learning something useful", category: "learning", done: true },
];

const state = {
  filter: "all",
  tasks: loadTasks(),
};

const elements = {
  form: document.querySelector("#task-form"),
  titleInput: document.querySelector("#task-title"),
  categoryInput: document.querySelector("#task-category"),
  list: document.querySelector("#task-list"),
  empty: document.querySelector("#empty-state"),
  emptyTitle: document.querySelector("#empty-title"),
  emptyCopy: document.querySelector("#empty-copy"),
  progressRing: document.querySelector("#progress-ring"),
  progressPercent: document.querySelector("#progress-percent"),
  progressMessage: document.querySelector("#progress-message"),
  completedCount: document.querySelector("#completed-count"),
  totalCount: document.querySelector("#total-count"),
  openCount: document.querySelector("#open-count"),
  allCount: document.querySelector("#all-count"),
  activeCount: document.querySelector("#active-count"),
  doneCount: document.querySelector("#done-count"),
  todayDate: document.querySelector("#today-date"),
  clearCompleted: document.querySelector("#clear-completed"),
  filterTabs: [...document.querySelectorAll(".filter-tab")],
};

init();

function init() {
  elements.todayDate.textContent = new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  elements.form.addEventListener("submit", handleAddTask);
  elements.list.addEventListener("click", handleTaskAction);
  elements.clearCompleted.addEventListener("click", clearCompleted);

  elements.filterTabs.forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      render();
    });
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
    if (event.key === "/" && !isTyping) {
      event.preventDefault();
      elements.titleInput.focus();
    }
  });

  render();
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : structuredClone(starterTasks);
  } catch {
    return structuredClone(starterTasks);
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function handleAddTask(event) {
  event.preventDefault();
  const title = elements.titleInput.value.trim();
  if (!title) return;

  state.tasks.unshift({
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    title,
    category: elements.categoryInput.value,
    done: false,
  });
  saveTasks();
  elements.form.reset();
  elements.titleInput.focus();
  state.filter = "all";
  render();
}

function handleTaskAction(event) {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const { action, id } = actionButton.dataset;
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  if (action === "toggle") task.done = !task.done;
  if (action === "delete") state.tasks = state.tasks.filter((item) => item.id !== id);
  saveTasks();
  render();
}

function clearCompleted() {
  const completed = state.tasks.filter((task) => task.done).length;
  if (!completed) return;
  state.tasks = state.tasks.filter((task) => !task.done);
  saveTasks();
  render();
}

function render() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((task) => task.done).length;
  const active = total - completed;
  const percentage = total ? Math.round((completed / total) * 100) : 0;

  elements.completedCount.textContent = completed;
  elements.totalCount.textContent = total;
  elements.openCount.textContent = `${active} ${active === 1 ? "task" : "tasks"}`;
  elements.allCount.textContent = total;
  elements.activeCount.textContent = active;
  elements.doneCount.textContent = completed;
  elements.progressPercent.textContent = `${percentage}%`;
  elements.progressRing.style.setProperty("--progress", `${percentage}%`);
  elements.progressRing.setAttribute("aria-label", `${percentage} percent complete`);
  elements.progressMessage.textContent = getProgressMessage(percentage, total);

  elements.filterTabs.forEach((button) => {
    const isActive = button.dataset.filter === state.filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  const visibleTasks = state.tasks.filter((task) => {
    if (state.filter === "active") return !task.done;
    if (state.filter === "done") return task.done;
    return true;
  });

  elements.list.replaceChildren(...visibleTasks.map(createTaskElement));
  const isEmpty = visibleTasks.length === 0;
  elements.empty.hidden = !isEmpty;
  if (isEmpty) updateEmptyState(total, state.filter);
}

function createTaskElement(task) {
  const row = document.createElement("article");
  row.className = `task-row${task.done ? " is-done" : ""}`;

  const toggle = document.createElement("button");
  toggle.className = "task-check";
  toggle.type = "button";
  toggle.dataset.action = "toggle";
  toggle.dataset.id = task.id;
  toggle.setAttribute("aria-label", `${task.done ? "Reopen" : "Complete"} task: ${task.title}`);
  toggle.textContent = task.done ? "✓" : "";

  const content = document.createElement("div");
  content.className = "task-content";

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "task-meta";
  const dot = document.createElement("span");
  dot.className = "category-dot";
  dot.dataset.category = task.category;
  dot.setAttribute("aria-hidden", "true");
  const category = document.createElement("span");
  category.textContent = capitalize(task.category);
  meta.append(dot, category);
  content.append(title, meta);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-task";
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.dataset.id = task.id;
  deleteButton.setAttribute("aria-label", `Delete task: ${task.title}`);
  deleteButton.textContent = "×";

  row.append(toggle, content, deleteButton);
  return row;
}

function updateEmptyState(total, filter) {
  if (filter === "done") {
    elements.emptyTitle.textContent = "Nothing checked off yet.";
    elements.emptyCopy.textContent = "Finish a task and it will appear here as a small receipt for your effort.";
    return;
  }
  if (filter === "active" && total > 0) {
    elements.emptyTitle.textContent = "You cleared the runway.";
    elements.emptyCopy.textContent = "Everything on your board is complete. Enjoy the quiet, or add another task.";
    return;
  }
  elements.emptyTitle.textContent = "A clear page is a powerful start.";
  elements.emptyCopy.textContent = "Add a task above and give your attention somewhere to land.";
}

function getProgressMessage(percentage, total) {
  if (!total) return "Start with one small win.";
  if (percentage === 100) return "Everything is complete. Nice work.";
  if (percentage >= 66) return "The finish line is in sight.";
  if (percentage >= 33) return "A steady rhythm is forming.";
  return "Start with one small win.";
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

