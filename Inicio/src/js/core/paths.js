/**
 * Rutas relativas para que el sitio funcione abierto desde el disco (file://)
 * o desde cualquier subcarpeta de un servidor. Cada página declara
 * `data-root` en <body>: "." en la raíz y ".." dentro de /pages.
 */
const root = () => document.body.dataset.root || '.';
const inPagesDir = () => root() !== '.';

export const assetUrl = file => `${root()}/assets/img/${file}`;
export const pageUrl = file => (file === 'index.html' ? `${root()}/index.html` : inPagesDir() ? file : `pages/${file}`);
export const currentPage = () => document.body.dataset.page || 'inicio';
