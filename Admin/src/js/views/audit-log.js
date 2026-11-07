/**
 * Pantalla base de todas las bitácoras (solo lectura): buscador, filtros, contador, «Mostrar más» para
 * historiales largos y, si la bitácora lo pide, un detalle que se despliega debajo de la fila («Ver cambios»).
 * Cada bitácora solo describe sus columnas en un objeto de configuración (ver audits.js y content-audits.js):
 *   { title, sub, search, list, filters, filterValue?, fields, empty, iconName, head, row, single?, detail? }
 * Aquí también están las piezas que comparten: celdas de fecha, persona y acción, y el detalle antes / después.
 */
import { $, html, escapeHtml } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { matches, formatDateTime, plural } from '../core/format.js';
import { play } from '../core/sound.js';
import { USER_CHANGE_ACTIONS, roleLabel } from '../services/admin-api.js';
import { panel, searchBox, emailHtml, emptyState, noResults, skeletons, loadError, dataTable, filterBar, wireSearch } from './shared.js';

const PAGE_SIZE = 20;

export const byKey = list => Object.fromEntries(list.map(item => [item.id, item]));
const ACTIONS = byKey(USER_CHANGE_ACTIONS);

/* ───────── Piezas de las filas ───────── */

export const selectHtml = (name, label, all, list) => `
    <select class="select" data-filter="${name}" aria-label="${escapeHtml(label)}">
        <option value="">${escapeHtml(all)}</option>
        ${list.map(item => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.nombre)}</option>`).join('')}
    </select>`;

/** Filtro por acción, en mayúsculas como en la tabla. */
export const actionFilter = actions => ({
    name: 'accion',
    html: selectHtml('accion', 'Filtrar por acción', 'Todas las acciones', actions.map(action => ({ ...action, nombre: action.nombre.toUpperCase() })))
});

export const fullName = person => `${person.nombre} ${person.apellidos}`.trim();
export const actionName = accion => ACTIONS[accion]?.nombre || accion;

export const dateCell = (entry, attrs = '') => `<td data-label="Fecha" class="whitespace-nowrap tabular-nums" ${attrs}><span class="cell-date">${escapeHtml(formatDateTime(entry.fecha))}</span></td>`;

/** Nombre en negritas con sus datos debajo; cada renglón de `lines` ya viene como HTML. */
export const personCell = (label, title, ...lines) => `
    <td data-label="${escapeHtml(label)}">
        <span class="cell-person"><b>${escapeHtml(title)}</b>${lines.map(line => `<small>${line}</small>`).join('')}</span>
    </td>`;

/** Quién hizo el cambio (nombre y correo) y su rol: dos columnas. */
export const authorCells = (autor, label = 'Realizado por') =>
    `${personCell(label, fullName(autor), emailHtml(autor.correo))}<td data-label="Rol">${escapeHtml(roleLabel(autor.rol))}</td>`;

/** CREAR, ACTUALIZAR, ELIMINAR, ACTIVAR, DESACTIVAR */
export const actionCell = accion =>
    `<td data-label="Acción" data-aside><span class="action-badge" data-action="${escapeHtml(accion)}">${escapeHtml(actionName(accion).toUpperCase())}</span></td>`;

/** Botón «Ver cambios» que despliega el detalle de la fila (config.detail). */
export const detailCell = entry => `
    <td data-keep data-label="">
        <div class="row-actions">
            <button type="button" class="btn btn-ghost btn-sm diff-toggle" data-diff="${entry.id}" aria-expanded="false" data-sound="none">
                ${icon('eye', 'size-4')}<span>Ver cambios</span>
            </button>
        </div>
    </td>`;

/* ───────── Detalle antes / después ───────── */

/**
 * Campo del detalle. options:
 *   show(valor) → HTML del valor (por omisión, el texto escapado)
 *   block: texto largo que va debajo de su etiqueta · image: miniatura
 *   list: arreglo de textos como etiquetas; lo que se quitó se tacha y lo que se agregó se resalta
 */
export const field = (key, label, options = {}) => ({ key, label, ...options });

const sameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function chips(items, other, side) {
    if (!items.length) return '<span class="diff-none">Ninguno</span>';
    return `<span class="diff-chips">${items.map(item => {
        const text = escapeHtml(item);
        if (!other || other.includes(item)) return `<span class="diff-chip">${text}</span>`;
        return side === 'antes' ? `<del class="diff-chip">${text}</del>` : `<ins class="diff-chip">${text}</ins>`;
    }).join('')}</span>`;
}

const thumb = (src, side) => src
    ? `<span class="diff-thumb"><img src="${escapeHtml(src)}" alt="Imagen ${side === 'antes' ? 'anterior' : 'nueva'}" loading="lazy"></span>`
    : '—';

function fieldHtml(spec, data, other, side) {
    const value = data[spec.key];
    const otherValue = other?.[spec.key];
    const changed = Boolean(other) && spec.key in other && !sameValue(otherValue, value);
    let shown;
    if (spec.list) shown = chips(value || [], other && (otherValue || []), side);
    else if (spec.image) shown = thumb(value, side);
    else {
        shown = spec.show ? spec.show(value) : escapeHtml(value ?? '—');
        if (changed && side === 'antes') shown = `<del>${shown}</del>`;
    }
    return `<div class="diff-field ${changed ? 'is-changed' : ''} ${spec.block || spec.list ? 'is-block' : ''}"><dt>${spec.label}</dt><dd>${shown}</dd></div>`;
}

function diffSide(entry, side, fields, empty) {
    const data = entry[side];
    const title = side === 'antes' ? 'Datos anteriores' : 'Datos nuevos';
    if (!data) {
        return `<div class="diff-side" data-side="${side}"><h4 class="diff-title">${title}</h4><p class="diff-empty">${icon(side === 'antes' ? 'plus' : 'trash', 'size-4 shrink-0')}${empty[side]}</p></div>`;
    }
    const other = entry[side === 'antes' ? 'despues' : 'antes'];
    const rows = fields.filter(spec => spec.key in data).map(spec => fieldHtml(spec, data, other, side));
    return `<div class="diff-side" data-side="${side}"><h4 class="diff-title">${title}</h4><dl>${rows.join('')}</dl></div>`;
}

/**
 * Datos anteriores a la izquierda y nuevos a la derecha: lo que cambió se tacha en rojo a la izquierda y se
 * resalta en verde a la derecha. `empty` explica el lado sin datos ({ antes: alta, despues: baja }) y
 * `notes` agrega avisos debajo: [[ícono, texto HTML]].
 */
export const diffDetail = (entry, { fields, empty, notes = [] }) => `
    <div class="diff-grid">${diffSide(entry, 'antes', fields, empty)}${diffSide(entry, 'despues', fields, empty)}</div>
    ${notes.map(([iconName, text]) => `<p class="diff-note">${icon(iconName, 'size-4 shrink-0')}${text}</p>`).join('')}`;

/* ───────── Pantalla ───────── */

export function renderLog(config, main) {
    main.innerHTML = panel({
        title: config.title,
        sub: config.sub,
        body: `
            ${filterBar(searchBox(config.search), ...config.filters.map(filter => filter.html))}
            <p class="list-count" data-count aria-live="polite">&nbsp;</p>
            <div data-list></div>
            <div class="mt-5 flex justify-center" data-more hidden>
                <button type="button" class="btn btn-ghost btn-sm" data-more-button>${icon('chevron', 'size-4')}<span></span></button>
            </div>`
    });
    const list = $('[data-list]', main);
    const count = $('[data-count]', main);
    const more = $('[data-more]', main);
    const filters = config.filters.map(filter => ({ ...filter, node: $(`[data-filter="${filter.name}"]`, main) }));
    const columns = config.head.match(/<th/g).length;
    const state = { items: [], query: '', limit: PAGE_SIZE };

    // Un registro puede pertenecer a varias opciones del filtro (por ejemplo, un cambio de misión y WhatsApp)
    const passes = (entry, filter) => {
        if (!filter.node.value) return true;
        const value = (config.filterValue?.[filter.name] || (item => item[filter.name]))(entry);
        return Array.isArray(value) ? value.includes(filter.node.value) : value === filter.node.value;
    };

    function draw() {
        const visible = state.items.filter(entry => filters.every(filter => passes(entry, filter)) && matches(state.query, ...config.fields(entry)));
        const shown = visible.slice(0, state.limit);
        const filtered = visible.length !== state.items.length;
        count.textContent = state.items.length
            ? (filtered ? `${plural(visible.length, 'registro')} de ${state.items.length}` : plural(state.items.length, 'registro'))
                + (shown.length < visible.length ? ` · mostrando los ${shown.length} más recientes` : '')
            : '';
        more.hidden = shown.length >= visible.length;
        $('span', more).textContent = `Mostrar ${Math.min(PAGE_SIZE, visible.length - shown.length)} más`;

        if (!state.items.length) { list.innerHTML = emptyState({ title: config.empty, text: 'Los registros aparecerán aquí conforme ocurran.', iconName: config.iconName }); return; }
        if (!visible.length) { list.innerHTML = state.query ? noResults(state.query) : emptyState({ title: 'Ningún registro coincide con esos filtros', iconName: config.iconName }); return; }
        list.innerHTML = dataTable({
            head: config.head,
            single: config.single,
            className: 'is-log',
            rows: shown.map((entry, index) => `<tr class="enter" style="--i:${index}" data-item data-id="${entry.id}">${config.row(entry)}</tr>`).join('')
        });
    }

    async function load() {
        list.innerHTML = `<div class="space-y-3">${skeletons(5, 'h-14')}</div>`;
        try { state.items = await config.list(); draw(); } catch (error) { list.innerHTML = loadError(error.message); }
    }

    /** «Ver cambios» / «Ocultar»: despliega debajo de la fila el detalle del registro. */
    function toggleDetail(button) {
        const row = button.closest('tr');
        const open = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(open));
        $('span', button).textContent = open ? 'Ocultar' : 'Ver cambios';
        button.firstElementChild.outerHTML = icon(open ? 'eyeOff' : 'eye', 'size-4');
        row.classList.toggle('is-expanded', open);
        play(open ? 'expand' : 'collapse');
        let detail = row.nextElementSibling?.matches('.diff-row') ? row.nextElementSibling : null;
        if (open) {
            if (!detail) {
                const entry = state.items.find(item => String(item.id) === button.dataset.diff);
                detail = html(`<table><tbody>
                    <tr class="diff-row" data-diff-for="${entry.id}">
                        <td colspan="${columns}" data-label=""><div class="diff-collapse"><div class="diff-inner">${config.detail(entry)}</div></div></td>
                    </tr></tbody></table>`).querySelector('tr');
                row.after(detail);
            }
            requestAnimationFrame(() => requestAnimationFrame(() => detail.classList.add('is-open')));
        } else if (detail) {
            detail.classList.remove('is-open');
            setTimeout(() => { if (!detail.classList.contains('is-open')) detail.remove(); }, 380);
        }
    }

    list.addEventListener('click', event => {
        const button = event.target.closest('[data-diff]');
        if (button) toggleDetail(button);
    });
    // Una imagen que ya no existe (por ejemplo, borrada del almacenamiento) deja un aviso en lugar del ícono roto
    list.addEventListener('error', event => event.target.closest?.('.diff-thumb')?.classList.add('is-missing'), true);
    more.addEventListener('click', () => { state.limit += PAGE_SIZE; draw(); });
    filters.forEach(filter => filter.node.addEventListener('change', () => { state.limit = PAGE_SIZE; draw(); }));
    wireSearch($('[data-search]', main), query => { state.query = query; state.limit = PAGE_SIZE; draw(); });
    main.addEventListener('click', event => { if (event.target.closest('[data-retry]')) load(); });
    load();
}
