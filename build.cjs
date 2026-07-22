// build.js — concatenates src/ modules into a single dist/index.html
// No bundler, no dependencies: this app has no imports to resolve, so a
// plain string-concat is all that's needed. Run with: node build.js

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

function read(file) {
  return fs.readFileSync(path.join(SRC, file), 'utf8');
}

const shell = read('index.html');
const css = read('styles.css');
const body = read('body.html');

// JS module order matters: state.js defines data + helpers used by
// ui.js and actions.js, so it must load first. init.js must load last
// since it calls load()/render() which depend on everything above it.
const js = ['state.js', 'ui.js', 'actions.js', 'init.js']
  .map(read)
  .join('\n\n');

const out = shell
  .replace('<!--BODY-->', body)
  .replace('/*STYLES*/', css)
  .replace('/*SCRIPT*/', js);

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST);
fs.writeFileSync(path.join(DIST, 'index.html'), out);

console.log(`Built dist/index.html (${out.length} bytes) from ${4} JS modules + styles.css + body.html`);
