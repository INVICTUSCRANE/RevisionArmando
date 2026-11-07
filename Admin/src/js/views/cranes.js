/**
 * Configurar catálogo de grúas › Grúas.
 * Cada grúa tiene nombre, categoría, imagen, atributos con cantidad (2 × Winche) y atributos opcionales.
 * En el formulario los atributos y opcionales son renglones que se agregan y se quitan; un atributo
 * ya elegido no se puede repetir en otro renglón.
 */
import { $, $$, html, escapeHtml } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { plural, matches } from '../core/format.js';
import { toast } from '../core/toast.js';
import { readImage } from '../core/image.js';
import { CRANE_MAX_QUANTITY, listCranes, getCraneFormOptions, createCrane, updateCrane, deleteCrane } from '../services/admin-api.js';
import { openFormModal, confirmDialog } from '../features/modal.js';
import { value } from '../features/forms.js';
import { imageField, wireImageField } from '../features/image-field.js';
import { panel, addButton, searchBox, rowActions, emptyState, noResults, skeletons, loadError, enterAttrs, animateOut, wireList, byId } from './shared.js';

/* ───────── Tarjeta ───────── */

function craneCard(crane, index, fresh) {
    const specs = crane.atributos.map((entry, chip) =>
        `<span class="spec-chip" style="--c:${chip}"><b>${entry.cantidad} ×</b>${escapeHtml(entry.nombre)}</span>`).join('');
    const extras = crane.opcionales.length
        ? crane.opcionales.map((entry, chip) => `<span class="opt-chip" style="--c:${chip + crane.atributos.length}">${escapeHtml(entry.nombre)}</span>`).join('')
        : '<span class="text-sm text-ink-400 dark:text-ink-500">Sin atributos opcionales</span>';
    return `
        <article ${enterAttrs(index, fresh)} data-item>
            <div class="slide-media is-plain">
                <span class="crane-ribbon">${escapeHtml(crane.categoriaNombre)}</span>
                <img src="${escapeHtml(crane.imagen)}" alt="" loading="lazy">
            </div>
            <div class="px-5 pt-4 pb-5">
                <h3 class="text-lg font-semibold tracking-tight text-ink-900 dark:text-white">${escapeHtml(crane.nombre)}</h3>
                <div class="mt-3 flex flex-wrap gap-2" aria-label="Atributos">${specs || '<span class="text-sm text-amber-600 dark:text-amber-400">Sin atributos: edítala para agregarlos.</span>'}</div>
                <div class="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-4 dark:border-white/[.06]" aria-label="Atributos opcionales">${extras}</div>
            </div>
            <div class="border-t border-ink-100 px-5 py-3 dark:border-white/[.06]">${rowActions(crane.id)}</div>
        </article>`;
}

/* ───────── Formulario ───────── */

const options = (list, selected, placeholder) =>
    `<option value="">${placeholder}</option>${list.map(item => `<option value="${item.id}" ${item.id === selected ? 'selected' : ''}>${escapeHtml(item.nombre)}</option>`).join('')}`;

const removeButton = label =>
    `<button type="button" class="icon-btn row-remove" data-remove-row aria-label="${label}" title="${label}">${icon('close', 'size-4')}</button>`;

const ROWS = {
    atributos: {
        add: 'Agregar atributo',
        none: 'Aún no hay atributos registrados. Créalos en «Atributos de grúas».',
        empty: 'Agrega al menos un atributo con su cantidad.',
        row: (list, entry = {}) => `
            <div class="repeat-row is-qty" data-row>
                <select class="select" data-pick required aria-label="Atributo">${options(list, entry.atributoId, 'Seleccionar atributo…')}</select>
                <input class="input px-2 text-center tabular-nums" type="number" min="1" max="${CRANE_MAX_QUANTITY}" step="1" inputmode="numeric" required
                    value="${entry.cantidad || 1}" data-qty aria-label="Cantidad">
                ${removeButton('Quitar atributo')}
            </div>`
    },
    opcionales: {
        add: 'Agregar opcional',
        none: 'Aún no hay atributos opcionales. Créalos en «Atributos opcionales».',
        empty: 'Sin atributos opcionales.',
        row: (list, entry = {}) => `
            <div class="repeat-row" data-row>
                <select class="select" data-pick required aria-label="Atributo opcional">${options(list, entry.id, 'Seleccionar opcional…')}</select>
                ${removeButton('Quitar opcional')}
            </div>`
    }
};

function craneFields(crane, catalog) {
    const section = (key, label, hint = '') => `
        <div data-field-wrap data-field="${key}">
            <span class="field-label">${label}</span>
            <div class="space-y-2.5" data-rows="${key}"></div>
            <p class="row-empty" data-rows-empty="${key}" hidden></p>
            <button type="button" class="btn btn-ghost btn-sm mt-3" data-add-row="${key}">${icon('plus', 'size-4')}${ROWS[key].add}</button>
            ${hint ? `<p class="field-hint">${hint}</p>` : ''}
        </div>`;
    return `
        <div data-field-wrap>
            <label class="field-label" for="craneNombre">Nombre</label>
            <input id="craneNombre" name="nombre" class="input" maxlength="80" required autocomplete="off" autofocus
                placeholder="Ej. Rescate IR-50" value="${escapeHtml(crane?.nombre || '')}">
        </div>
        <div data-field-wrap>
            <label class="field-label" for="craneCategoria">Categoría</label>
            <select id="craneCategoria" name="categoriaId" class="select" required>${options(catalog.categorias, crane?.categoriaId, 'Seleccionar…')}</select>
        </div>
        ${imageField({ current: crane?.imagen || '', required: !crane })}
        ${section('atributos', 'Atributos y cantidad', 'Los detalles se generan automáticamente al guardar.')}
        ${section('opcionales', 'Atributos opcionales <small>(si aplica)</small>')}`;
}

/** Renglones de atributos u opcionales: agregar, quitar y no repetir. */
function wireRows(form, key, list, initial, markDirty) {
    const box = $(`[data-rows="${key}"]`, form);
    const addButtonNode = $(`[data-add-row="${key}"]`, form);
    const emptyNote = $(`[data-rows-empty="${key}"]`, form);

    function sync() {
        const rows = $$('[data-row]', box).filter(row => !row.classList.contains('is-leaving'));
        const chosen = rows.map(row => $('[data-pick]', row).value).filter(Boolean);
        rows.forEach(row => {
            const select = $('[data-pick]', row);
            $$('option[value]:not([value=""])', select).forEach(option => {
                option.disabled = option.value !== select.value && chosen.includes(option.value);
            });
        });
        addButtonNode.disabled = rows.length >= list.length;
        addButtonNode.title = !list.length ? ROWS[key].none : rows.length >= list.length ? 'Ya están todos en la lista.' : '';
        emptyNote.hidden = rows.length > 0;
        emptyNote.textContent = list.length ? ROWS[key].empty : ROWS[key].none;
    }

    function add(entry, animate) {
        const row = html(ROWS[key].row(list, entry));
        if (!animate) row.style.animation = 'none';
        box.append(row);
        return row;
    }

    initial.forEach(entry => add(entry, false));
    sync();

    addButtonNode.addEventListener('click', () => {
        const row = add(undefined, true);
        sync();
        markDirty();
        $('[data-pick]', row).focus({ preventScroll: true });
        row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    box.addEventListener('change', event => { if (event.target.matches('[data-pick]')) sync(); });
    box.addEventListener('click', event => {
        const button = event.target.closest('[data-remove-row]');
        if (!button) return;
        const row = button.closest('[data-row]');
        row.classList.add('is-leaving');
        sync();
        setTimeout(() => { row.remove(); sync(); markDirty(); }, 240);
    });

    return {
        count: () => $$('[data-row]:not(.is-leaving)', box).length,
        values: () => $$('[data-row]:not(.is-leaving)', box).map(row => ({ id: $('[data-pick]', row).value, cantidad: $('[data-qty]', row)?.value }))
    };
}

/* ───────── Pantalla ───────── */

export function renderCranes(main) {
    main.innerHTML = panel({
        title: 'Grúas',
        sub: '&nbsp;',
        action: addButton('Agregar grúa'),
        body: `
            <div class="filters">
                ${searchBox('Buscar por nombre, atributo u opcional…')}
                <select class="select" data-category aria-label="Filtrar por categoría"><option value="">Todas las categorías</option></select>
            </div>
            <div class="mt-5" data-list></div>`
    });
    const list = $('[data-list]', main);
    const sub = $('[data-sub]', main);
    const categoryFilter = $('[data-category]', main);
    const state = { items: [], query: '', fresh: null };

    function drawCategories() {
        const selected = categoryFilter.value;
        const names = [...new Map(state.items.map(crane => [crane.categoriaId, crane.categoriaNombre])).entries()]
            .sort((a, b) => a[1].localeCompare(b[1], 'es'));
        categoryFilter.innerHTML = `<option value="">Todas las categorías</option>${names.map(([id, nombre]) =>
            `<option value="${id}" ${String(id) === selected ? 'selected' : ''}>${escapeHtml(nombre)}</option>`).join('')}`;
    }

    function draw() {
        sub.textContent = `${plural(state.items.length, 'grúa', 'grúas')} en el catálogo.`;
        const visible = state.items.filter(crane =>
            (!categoryFilter.value || String(crane.categoriaId) === categoryFilter.value)
            && matches(state.query, crane.nombre, crane.categoriaNombre, ...crane.atributos.map(entry => entry.nombre), ...crane.opcionales.map(entry => entry.nombre)));
        if (!state.items.length) { list.innerHTML = emptyState({ title: 'Aún no hay grúas', text: 'Agrega la primera con «Agregar grúa».', iconName: 'truck' }); return; }
        if (!visible.length) { list.innerHTML = state.query ? noResults(state.query) : emptyState({ title: 'No hay grúas en esa categoría', iconName: 'truck' }); return; }
        list.innerHTML = `<div class="grid gap-5 @xl:grid-cols-2 @5xl:grid-cols-3">${visible.map((crane, index) => craneCard(crane, index, crane.id === state.fresh)).join('')}</div>`;
        state.fresh = null;
    }

    async function load() {
        list.innerHTML = `<div class="grid gap-5 @xl:grid-cols-2 @5xl:grid-cols-3">${skeletons(4, 'h-[26rem]')}</div>`;
        try { state.items = await listCranes(); drawCategories(); draw(); } catch (error) { list.innerHTML = loadError(error.message); }
    }

    async function edit(crane) {
        let catalog;
        try { catalog = await getCraneFormOptions(); } catch { toast('No se pudieron cargar las categorías y atributos.', { tone: 'error' }); return; }
        let image, attributes, optionals;
        const result = await openFormModal({
            title: crane ? 'Editar grúa' : 'Nueva grúa',
            size: 'lg',
            fields: craneFields(crane, catalog),
            editing: Boolean(crane),
            isValid: () => attributes.count() > 0,
            onMount: (form, { refresh, markDirty }) => {
                image = wireImageField(form, { onChange: refresh });
                attributes = wireRows(form, 'atributos', catalog.atributos, crane ? crane.atributos : [{}], markDirty);
                optionals = wireRows(form, 'opcionales', catalog.opcionales, crane ? crane.opcionales : [], markDirty);
            },
            onSubmit: async form => {
                const file = image.file();
                const data = {
                    nombre: value(form, 'nombre'),
                    categoriaId: value(form, 'categoriaId'),
                    atributos: attributes.values().map(entry => ({ atributoId: entry.id, cantidad: entry.cantidad })),
                    opcionales: optionals.values().map(entry => entry.id),
                    imagen: file ? await readImage(file) : null   // SERVIDOR REAL: enviar el File en FormData
                };
                return crane ? updateCrane(crane.id, data) : createCrane(data);
            }
        });
        if (!result) return;
        toast(crane ? `«${result.nombre}» actualizada.` : `«${result.nombre}» agregada al catálogo.`);
        state.fresh = result.id;
        await load();
    }

    categoryFilter.addEventListener('change', draw);
    wireList(main, {
        onSearch: query => { state.query = query; draw(); },
        onAdd: () => edit(null),
        onEdit: id => edit(byId(state.items, id)),
        onRetry: load,
        onDelete: async (id, node) => {
            const crane = byId(state.items, id);
            const ok = await confirmDialog({
                title: `¿Eliminar «${crane.nombre}»?`,
                message: 'Dejará de aparecer en el catálogo del sitio. Las solicitudes de cotización que la mencionan se conservan.',
                action: () => deleteCrane(crane.id)
            });
            if (!ok) return;
            await animateOut(node);
            toast(`«${crane.nombre}» eliminada del catálogo.`);
            await load();
        }
    });
    load();
}
