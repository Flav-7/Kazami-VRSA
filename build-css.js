// Converte a unidade "u" (1px do design de 1024px) em calc(var(--u) * N).
// Uso: node build-css.js
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'css/site.src.css'), 'utf8');
const out = src.replace(/(?<![\w.#-])(-?\d*\.?\d+)u(?![a-z%])/g, (_, n) => `calc(var(--u) * ${n})`);

fs.writeFileSync(
  path.join(__dirname, 'css/site.css'),
  '/* GERADO por build-css.js a partir de site.src.css — não editar diretamente */\n' + out
);
console.log('css/site.css gerado');
