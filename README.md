# Daily Focus Board

A calm, dependency-free daily task board built with plain HTML, CSS, and JavaScript.

## What it does

- Add tasks and sort them into Work, Personal, or Learning.
- Mark tasks complete with an accessible keyboard-friendly control.
- Filter the board by All, Active, or Done.
- See completion progress at a glance.
- Delete individual tasks or clear all completed tasks.
- Persist tasks in `localStorage`, so the board works without an account or backend.
- Stay responsive on small screens and respect reduced-motion preferences.

## Run it locally

No build step is needed. Open `index.html` directly in a browser, or serve the folder with any static file server:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Project structure

```text
.
├── app.js       # State, rendering, events, and local persistence
├── index.html   # Semantic page structure
├── styles.css   # Responsive visual design
└── README.md
```

## Notes

The first visit includes three example tasks so the interface is immediately understandable. Once you change the board, the updated list is saved locally under the `daily-focus-board:v1` storage key.

## License

MIT

