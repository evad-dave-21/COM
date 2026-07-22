# The Chronicles of Minja — dev setup

This app must ship as a single self-contained `index.html` (no external
requests, works offline in iOS Safari as a home-screen app). To keep that
without hand-editing one 1100-line file, the source is split into modules
under `src/` and glued back into one file by `build.js`.

## Structure

```
src/
  index.html   — head boilerplate + placeholders (/*STYLES*/, <!--BODY-->, /*SCRIPT*/)
  styles.css   — all CSS
  body.html    — the <body> markup (header, views, panels)
  state.js     — data model, load/save, streak & progress calculations
  ui.js        — render(), renderTaskList(), escHtml()
  actions.js   — toggleTask, addCustomTask, switchView, etc. (event handlers)
  init.js      — startup sequence (load(), render())
dist/
  index.html   — GENERATED. This is the file you deploy / add to homescreen.
build.js        — concatenates src/ into dist/index.html
```

## Usage

```
node build.cjs
```

This regenerates `dist/index.html`. That file — and only that file — is
what you deploy to GitHub Pages / open in Safari / add to your home screen.
Never hand-edit `dist/index.html` directly; edit the files in `src/` and
rebuild.

Note: the file is named `build.cjs` (not `.js`) so Node always treats it
as CommonJS, even if a `package.json` somewhere above this folder sets
`"type": "module"`.

## Adding a feature

- New calculation or data field → `state.js`
- New screen/section or changes to how something renders → `ui.js`
- New button/user action → `actions.js`, then wire it up in `body.html`
  with an `onclick="..."` calling the new function (same pattern as before)
- Run `node build.cjs` and open `dist/index.html` to test
