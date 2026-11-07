/** Monta los catálogos declarados en el HTML con `data-catalog="gruas|accesorios"`. */
import { $$ } from '../../core/dom.js';
import { accessoryCatalogPages, craneCatalogPages } from './catalog-content.js';
import { createFlipbook } from './flipbook.js';

const CATALOGS = {
    gruas: { pages: craneCatalogPages, options: {} },
    accesorios: { pages: accessoryCatalogPages, options: { cart: true } }
};

export function initCatalogs() {
    $$('[data-catalog]').forEach(root => {
        const catalog = CATALOGS[root.dataset.catalog];
        createFlipbook(root, catalog.pages(), catalog.options);
    });
}
