# To-Do-List

A complete To-Do List web application built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step, no dependencies.

## Features

- **Full CRUD** — create, read, update, and delete tasks
- **localStorage persistence** — tasks survive page reloads and browser restarts
- **Filtering** — view All, Active, or Completed tasks
- **Task completion checkbox** — mark tasks done/undone
- **Edit task** — modal dialog to rename an existing task
- **Delete task** — remove a single task
- **Clear completed** — bulk-remove all completed tasks in one click
- **Dynamic DOM creation** — task list is built entirely with `document.createElement`, never hardcoded or injected via `innerHTML`
- **Event delegation** — one click/change listener on the list handles every task row, including ones created after page load
- **Responsive design** — works cleanly from small phones to desktop
- **Modern UI** — clean card layout, subtle animations, accessible focus states

## Project Structure

```
todo-app/
├── index.html
├── style.css
└── script.js
```

## How It Works

- **State** lives in a single `tasks` array (`{ id, text, completed }`) in `script.js`. Every CRUD action mutates this array, saves it to `localStorage`, then re-renders the list.
- **Persistence** — `loadTasks()` reads from `localStorage` on startup; `saveTasks()` writes after every change.
- **Rendering** — `render()` clears and rebuilds `#task-list` from the current filtered state using a `DocumentFragment`, keeping DOM writes efficient.
- **Event delegation** — instead of attaching listeners to each task's checkbox/edit/delete buttons individually, a single listener on the parent list reads `data-action` attributes to figure out what was clicked. New tasks automatically work with zero extra wiring.
- **Editing** — handled through an accessible modal dialog (`aria-modal`, focus on open, closes on Escape/overlay click/Cancel).

## Tech

- HTML5
- CSS3 (custom properties, Flexbox, animations, media queries)
- Vanilla JavaScript (ES6+, no dependencies)

## License

MIT 

## Author
srividya
