/** Piezas de plantilla que comparten todas las pantallas. */
import { $, escapeHtml } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { toast } from '../core/toast.js';
import { play } from '../core/sound.js';

/** Tarjeta de sección con encabezado (título, subtítulo y botón principal opcional). */
export const panel = ({ title, sub = '', action = '', body, delay = 0 }) => `
    <section class="panel enter" style="--i:${delay}">
        <header class="panel-head">
            <div class="min-w-0">
                <h2 class="panel-title">${escapeHtml(title)}</h2>
                <p class="panel-sub" data-sub>${sub}</p>
            </div>
            ${action}
        </header>
        <div class="panel-body">${body}</div>
    </section>`;

export const addButton = (label, attrs = '') =>
    `<button type="button" class="btn btn-primary" data-add ${attrs}>${icon('plus')}${escapeHtml(label)}</button>`;

export const searchBox = placeholder => `
    <label class="search">
        ${icon('search')}
        <span class="sr-only">${escapeHtml(placeholder)}</span>
        <input type="search" class="input" placeholder="${escapeHtml(placeholder)}" data-search autocomplete="off">
    </label>`;

/** Botones Editar / Eliminar. `blocked` deja Eliminar atenuado y explica por qué al tocarlo. */
export const rowActions = (id, { blocked = '', compact = false } = {}) => `
    <div class="item-actions">
        <button type="button" class="btn btn-ghost btn-sm ${compact ? 'w-9 px-0' : ''}" data-edit="${id}" ${compact ? 'aria-label="Editar" title="Editar"' : ''}>${icon('edit')}${compact ? '' : 'Editar'}</button>
        <button type="button" class="btn btn-ghost is-danger btn-sm ${compact ? 'w-9 px-0' : ''} ${blocked ? 'opacity-45' : ''}" data-delete="${id}"
            ${blocked ? `aria-disabled="true" data-blocked="${escapeHtml(blocked)}"` : ''} ${compact ? 'aria-label="Eliminar" title="Eliminar"' : ''}>${icon('trash')}${compact ? '' : 'Eliminar'}</button>
    </div>`;

export const emptyState = ({ title, text = '', iconName = 'search' }) => `
    <div class="empty enter">
        <span class="empty-icon">${icon(iconName, 'size-6')}</span>
        <p class="font-semibold text-ink-700 dark:text-ink-200">${escapeHtml(title)}</p>
        ${text ? `<p class="max-w-sm text-sm">${text}</p>` : ''}
    </div>`;

export const noResults = query => emptyState({ title: 'Sin resultados', text: `No encontramos nada con «${escapeHtml(query)}».` });

export const skeletons = (count, className) => Array.from({ length: count }, () => `<div class="skeleton ${className}"></div>`).join('');

/** Mensaje de error de carga con botón para reintentar. */
export const loadError = message => `
    <div class="empty">
        <span class="empty-icon text-red-500">${icon('alert', 'size-6')}</span>
        <p class="font-semibold text-ink-700 dark:text-ink-200">${escapeHtml(message || 'No se pudo cargar la información.')}</p>
        <button type="button" class="btn btn-ghost btn-sm" data-retry>Reintentar</button>
    </div>`;

/** Clase y estilo para la entrada escalonada de cada elemento; `fresh` lo hace destellar. */
export const enterAttrs = (index, fresh) => `class="item enter ${fresh ? 'is-fresh' : ''}" style="--i:${index}"`;

/** Anima la salida de un elemento antes de quitarlo de la lista. */
export function animateOut(node) {
    if (!node) return Promise.resolve();
    play('remove');
    node.classList.add('is-removing');
    return new Promise(resolve => setTimeout(resolve, 420));
}

/** Ejecuta `fn` cuando la persona deja de escribir (el buscador no redibuja la lista en cada tecla). */
export function debounce(fn, ms = 140) {
    let timer = 0;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

/** Conecta un buscador con espera al terminar de escribir; Esc lo limpia. */
export function wireSearch(input, onSearch) {
    if (!input) return;
    const run = debounce(() => onSearch(input.value));
    input.addEventListener('input', run);
    input.addEventListener('keydown', event => {
        if (event.key === 'Escape' && input.value) { event.stopPropagation(); input.value = ''; onSearch(''); }
    });
}

/**
 * Tabla que se acomoda al espacio de su tarjeta (no al de la ventana): con espacio suficiente es tabla;
 * en celulares, tabletas o junto al menú se vuelve una lista de tarjetas (ver .table-wrap en content.css).
 * `single`: las tarjetas siempre en una columna (para filas que se despliegan).
 */
export const dataTable = ({ head, rows, single = false, className = '' }) => `
    <div class="table-wrap ${single ? 'is-single' : ''}">
        <div class="table-scroll">
            <table class="data-table ${className}">
                <thead><tr>${head}</tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    </div>`;

/** Fila de buscador + filtros que se apila en pantallas angostas. */
export const filterBar = (...controls) => `<div class="filters">${controls.join('')}</div>`;

/**
 * Conecta buscador, botón de agregar y botones de cada elemento de una lista.
 * handlers: { onSearch(query), onAdd(), onEdit(id), onDelete(id, node), onRetry() }
 */
export function wireList(root, { onSearch, onAdd, onEdit, onDelete, onRetry }) {
    if (onSearch) wireSearch($('[data-search]', root), onSearch);
    root.addEventListener('click', event => {
        const target = event.target.closest('[data-add], [data-edit], [data-delete], [data-retry]');
        if (!target) return;
        if (target.hasAttribute('data-add')) onAdd?.();
        else if (target.hasAttribute('data-retry')) onRetry?.();
        else if (target.dataset.edit) onEdit?.(target.dataset.edit);
        else if (target.dataset.blocked) {
            toast(target.dataset.blocked, { tone: 'error', duration: 4200 });
            target.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 260 });
        } else onDelete?.(target.dataset.delete, target.closest('[data-item]'));
    });
}

/** Correo escapado que, si no cabe, se corta antes de la arroba y no a media palabra. */
export const emailHtml = email => escapeHtml(email).replace('@', '<wbr>@');

/** Busca por id sin importar si viene como número o texto. */
export const byId = (list, id) => list.find(item => String(item.id) === String(id));
