(function () {
  "use strict";

  /* ---- State ---- */
  const STORAGE_KEY = "todo-app-tasks";
  let tasks = loadTasks();       // [{ id, text, completed }]
  let currentFilter = "all";    // "all" | "active" | "completed"
  let editingId = null;         // id of task being edited

  /* ---- DOM refs ---- */
  const taskForm        = document.getElementById("task-form");
  const taskInput       = document.getElementById("task-input");
  const taskList        = document.getElementById("task-list");
  const emptyState      = document.getElementById("empty-state");
  const itemsLeftEl     = document.getElementById("items-left");
  const clearBtn        = document.getElementById("clear-completed");
  const filterBtns      = document.querySelectorAll(".filter-btn");
  const editDialog      = document.getElementById("edit-dialog");
  const editForm        = document.getElementById("edit-form");
  const editInput       = document.getElementById("edit-input");
  const cancelEditBtn   = document.getElementById("cancel-edit");

  /* ---- localStorage ---- */
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error("Could not save tasks:", e);
    }
  }

  /* ---- CRUD ---- */
  function createTask(text) {
    tasks.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      text: text.trim(),
      completed: false,
    });
    saveTasks();
    render();
  }

  function updateTask(id, newText) {
    const task = tasks.find((t) => t.id === id);
    if (task && newText.trim()) {
      task.text = newText.trim();
      saveTasks();
      render();
    }
  }

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      render();
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter((t) => !t.completed);
    saveTasks();
    render();
  }

  /* ---- Filtering ---- */
  function getFiltered() {
    if (currentFilter === "active")    return tasks.filter((t) => !t.completed);
    if (currentFilter === "completed") return tasks.filter((t) =>  t.completed);
    return tasks;
  }

  function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach((btn) => {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    render();
  }

  /* ---- Build a single <li> ---- */
  function makeTaskEl(task) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " is-completed" : "");
    li.dataset.id = task.id;

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "task-checkbox";
    cb.checked = task.completed;
    cb.dataset.action = "toggle";
    cb.setAttribute("aria-label", (task.completed ? "Mark active: " : "Mark done: ") + task.text);

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "icon-btn edit-btn";
    editBtn.dataset.action = "edit";
    editBtn.setAttribute("aria-label", "Edit: " + task.text);
    editBtn.textContent = "✎";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "icon-btn delete-btn";
    delBtn.dataset.action = "delete";
    delBtn.setAttribute("aria-label", "Delete: " + task.text);
    delBtn.textContent = "✕";

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    li.appendChild(cb);
    li.appendChild(span);
    li.appendChild(actions);
    return li;
  }

  /* ---- Render ---- */
  function render() {
    const filtered = getFiltered();

    // Rebuild list
    taskList.innerHTML = "";
    const frag = document.createDocumentFragment();
    filtered.forEach((t) => frag.appendChild(makeTaskEl(t)));
    taskList.appendChild(frag);

    // Empty state
    emptyState.classList.toggle("is-visible", filtered.length === 0);

    // Counter
    const activeCount = tasks.filter((t) => !t.completed).length;
    itemsLeftEl.textContent = activeCount + (activeCount === 1 ? " item left" : " items left");

    // Clear completed button
    const hasCompleted = tasks.some((t) => t.completed);
    clearBtn.disabled = !hasCompleted;
  }

  /* ---- Edit dialog open / close ---- */
  function openEdit(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    editingId = id;
    editInput.value = task.text;
    editDialog.classList.add("is-open");
    editDialog.setAttribute("aria-hidden", "false");
    // Small delay so the element is visible before focusing
    setTimeout(() => {
      editInput.focus();
      editInput.select();
    }, 50);
  }

  function closeEdit() {
    editDialog.classList.remove("is-open");
    editDialog.setAttribute("aria-hidden", "true");
    editingId = null;
    editForm.reset();
  }

  /* ---- Event listeners ---- */

  // Submit new task
  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const val = taskInput.value.trim();
    if (!val) return;
    createTask(val);
    taskInput.value = "";
    taskInput.focus();
  });

  // Filter buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  // Clear completed
  clearBtn.addEventListener("click", clearCompleted);

  // Delegated click: edit / delete
  taskList.addEventListener("click", function (e) {
    const actionEl = e.target.closest("[data-action]");
    if (!actionEl) return;
    const li = e.target.closest(".task-item");
    if (!li) return;
    const { id } = li.dataset;
    const { action } = actionEl.dataset;

    if (action === "edit")   openEdit(id);
    if (action === "delete") deleteTask(id);
  });

  // Delegated change: checkbox toggle
  taskList.addEventListener("change", function (e) {
    const cb = e.target.closest('[data-action="toggle"]');
    if (!cb) return;
    const li = e.target.closest(".task-item");
    if (!li) return;
    toggleTask(li.dataset.id);
  });

  // Save edit
  editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (editingId) updateTask(editingId, editInput.value);
    closeEdit();
  });

  // Cancel edit
  cancelEditBtn.addEventListener("click", closeEdit);

  // Close on overlay backdrop click
  editDialog.addEventListener("click", function (e) {
    if (e.target === editDialog) closeEdit();
  });

  // Close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && editDialog.classList.contains("is-open")) {
      closeEdit();
    }
  });

  /* ---- Initial render ---- */
  render();
})();
