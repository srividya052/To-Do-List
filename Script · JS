/* ===========================================================
   script.js — To-Do List App
   Full CRUD + localStorage persistence + filtering
   Built with dynamic DOM creation and event delegation
   (no inline onclick handlers, no per-item listeners)
   =========================================================== */

(function () {
  "use strict";

  /* ---------------- State ---------------- */
  const STORAGE_KEY = "todo-app-tasks";
  let tasks = loadTasks();          // [{ id, text, completed }]
  let currentFilter = "all";        // "all" | "active" | "completed"
  let editingTaskId = null;         // id of task currently open in edit dialog

  /* ---------------- DOM references ---------------- */
  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const taskList = document.getElementById("task-list");
  const emptyState = document.getElementById("empty-state");
  const itemsLeftEl = document.getElementById("items-left");
  const clearCompletedBtn = document.getElementById("clear-completed");
  const filterButtons = document.querySelectorAll(".filter-btn");

  const editDialog = document.getElementById("edit-dialog");
  const editForm = document.getElementById("edit-form");
  const editInput = document.getElementById("edit-input");
  const cancelEditBtn = document.getElementById("cancel-edit");

  /* ---------------- Persistence (localStorage) ---------------- */
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Failed to load tasks from localStorage:", err);
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error("Failed to save tasks to localStorage:", err);
    }
  }

  /* ---------------- CRUD operations ---------------- */
  function createTask(text) {
    const newTask = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      text: text.trim(),
      completed: false,
    };
    tasks.push(newTask);
    saveTasks();
    render();
  }

  function updateTaskText(id, newText) {
    const task = tasks.find((t) => t.id === id);
    if (task && newText.trim()) {
      task.text = newText.trim();
      saveTasks();
      render();
    }
  }

  function toggleTaskCompleted(id) {
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

  function clearCompletedTasks() {
    tasks = tasks.filter((t) => !t.completed);
    saveTasks();
    render();
  }

  /* ---------------- Filtering ---------------- */
  function getFilteredTasks() {
    if (currentFilter === "active") {
      return tasks.filter((t) => !t.completed);
    }
    if (currentFilter === "completed") {
      return tasks.filter((t) => t.completed);
    }
    return tasks;
  }

  function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach((btn) => {
      const isActive = btn.dataset.filter === filter;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    render();
  }

  /* ---------------- Dynamic DOM creation ---------------- */
  function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " is-completed" : "");
    li.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark \"" + task.text + "\" as " + (task.completed ? "active" : "completed"));
    checkbox.dataset.action = "toggle";

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "icon-btn edit-btn";
    editBtn.dataset.action = "edit";
    editBtn.setAttribute("aria-label", "Edit \"" + task.text + "\"");
    editBtn.textContent = "\u270E"; // pencil icon

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "icon-btn delete-btn";
    deleteBtn.dataset.action = "delete";
    deleteBtn.setAttribute("aria-label", "Delete \"" + task.text + "\"");
    deleteBtn.textContent = "\u2715"; // X icon

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actions);

    return li;
  }

  function render() {
    const filtered = getFilteredTasks();

    // Rebuild the list (simple + safe for a list this size)
    taskList.innerHTML = "";
    const fragment = document.createDocumentFragment();
    filtered.forEach((task) => {
      fragment.appendChild(createTaskElement(task));
    });
    taskList.appendChild(fragment);

    // Empty state
    emptyState.hidden = filtered.length !== 0;

    // Footer counter
    const activeCount = tasks.filter((t) => !t.completed).length;
    itemsLeftEl.textContent = activeCount + (activeCount === 1 ? " item left" : " items left");

    // Disable "clear completed" if nothing to clear
    const hasCompleted = tasks.some((t) => t.completed);
    clearCompletedBtn.disabled = !hasCompleted;
    clearCompletedBtn.style.opacity = hasCompleted ? "1" : "0.5";
    clearCompletedBtn.style.cursor = hasCompleted ? "pointer" : "default";
  }

  /* ---------------- Edit dialog ---------------- */
  function openEditDialog(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    editingTaskId = id;
    editInput.value = task.text;
    editDialog.hidden = false;
    editInput.focus();
    editInput.select();
  }

  function closeEditDialog() {
    editDialog.hidden = true;
    editingTaskId = null;
    editForm.reset();
  }

  /* ---------------- Event listeners ---------------- */

  // Add task
  taskForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const value = taskInput.value.trim();
    if (!value) return;
    createTask(value);
    taskInput.value = "";
    taskInput.focus();
  });

  // Filter buttons
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      setFilter(btn.dataset.filter);
    });
  });

  // Clear completed
  clearCompletedBtn.addEventListener("click", function () {
    if (!clearCompletedBtn.disabled) {
      clearCompletedTasks();
    }
  });

  // Event delegation: one listener on the list handles toggle/edit/delete
  // for every task item, including ones created dynamically later.
  taskList.addEventListener("click", function (event) {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) return;

    const li = event.target.closest(".task-item");
    if (!li) return;
    const id = li.dataset.id;
    const action = actionEl.dataset.action;

    if (action === "edit") {
      openEditDialog(id);
    } else if (action === "delete") {
      deleteTask(id);
    }
  });

  // Checkbox "change" events also need delegation (change doesn't bubble in old IE,
  // but it does in all modern browsers, so this is safe)
  taskList.addEventListener("change", function (event) {
    const checkbox = event.target.closest('[data-action="toggle"]');
    if (!checkbox) return;
    const li = event.target.closest(".task-item");
    if (!li) return;
    toggleTaskCompleted(li.dataset.id);
  });

  // Edit dialog: save
  editForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (editingTaskId) {
      updateTaskText(editingTaskId, editInput.value);
    }
    closeEditDialog();
  });

  // Edit dialog: cancel
  cancelEditBtn.addEventListener("click", closeEditDialog);

  // Edit dialog: close on overlay click (but not when clicking inside the dialog box)
  editDialog.addEventListener("click", function (event) {
    if (event.target === editDialog) {
      closeEditDialog();
    }
  });

  // Edit dialog: close on Escape
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !editDialog.hidden) {
      closeEditDialog();
    }
  });

  /* ---------------- Initial render ---------------- */
  render();
})();
