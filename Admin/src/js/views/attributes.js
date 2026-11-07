/** Configurar catálogo de accesorios › Atributos (cada uno pertenece a una categoría de atributo). */
import { $, escapeHtml } from '../core/dom.js';
import { plural, matches } from '../core/format.js';
import { toast } from '../core/toast.js';
import { listAttributes, listAttributeCategories, createAttribute, updateAttribute, deleteAttribute } from '../services/admin-api.js';
import { openFormModal, confirmDialog } from '../features/modal.js';
import { value } from '../features/forms.js';
import { panel, addButton, searchBox, rowActions, emptyState, noResults, skeletons, loadError, enterAttrs, animateOut, wireList, byId } from './shared.js';

const attributeFields = (attribute, categories, preselected) => `
    <div data-field-wrap>
        <label class="field-label" for="atributoNombre">Nombre</label>
        <input id="atributoNombre" name="nombre" class="input" maxlength="60" required placeholder="Ej. Hasta 5 toneladas" value="${escapeHtml(attribute?.nombre || '')}" autocomplete="off" autofocus>
    </div>
    <div data-field-wrap>
        <label class="field-label" for="atributoCategoria">Categoría de atributo</label>
        <select id="atributoCategoria" name="categoriaId" class="select" required>
            <option value="">Seleccionar…</option>
            ${categories.map(category => `<option value="${category.id}" ${String(attribute?.categoriaId ?? preselected) === String(category.id) ? 'selected' : ''}>${escapeHtml(category.nombre)}</option>`).join('')}
        </select>
        ${categories.length ? '' : '<p class="field-hint">Primero crea una categoría en «Categorías de atributos».</p>'}
    </div>`;

export function renderAttributes(main) {
    main.innerHTML = panel({
        title: 'Atributos de accesorios',
        sub: '&nbsp;',
        action: addButton('Agregar atributo'),
        body: `${searchBox('Buscar por nombre o categoría…')}<div class="mt-4 flex flex-wrap gap-2" data-chips role="group" aria-label="Filtrar por categoría"></div><div class="mt-5" data-list></div>`
    });
    const list = $('[data-list]', main);
    const chips = $('[data-chips]', main);
    const sub = $('[data-sub]', main);
    const state = { items: [], categories: [], query: '', category: 'all', fresh: null };

    function drawChips() {
        const options = [{ id: 'all', nombre: 'Todas', count: state.items.length }, ...state.categories.map(category => ({ ...category, count: category.atributos.length }))];
        chips.innerHTML = options.map(option => `
            <button type="button" class="chip" data-chip="${option.id}" aria-pressed="${String(option.id) === String(state.category)}">
                ${escapeHtml(option.nombre)}<span class="chip-count">${option.count}</span>
            </button>`).join('');
    }

    function draw() {
        sub.textContent = `${plural(state.items.length, 'atributo registrado', 'atributos registrados')}.`;
        const visible = state.items.filter(attribute =>
            (state.category === 'all' || String(attribute.categoriaId) === String(state.category)) && matches(state.query, attribute.nombre, attribute.categoriaNombre));
        if (!state.items.length) { list.innerHTML = emptyState({ title: 'Aún no hay atributos', text: 'Agrega características como capacidad, voltaje o material.', iconName: 'tag' }); return; }
        if (!visible.length) { list.innerHTML = state.query ? noResults(state.query) : emptyState({ title: 'Esta categoría no tiene atributos', iconName: 'tag' }); return; }
        list.innerHTML = `<div class="space-y-3">${visible.map((attribute, index) => `
            <article ${enterAttrs(index, attribute.id === state.fresh)} data-item>
                <div class="item-row">
                    <div class="min-w-0 flex-1 basis-48">
                        <h3 class="text-ink-900 dark:text-white">${escapeHtml(attribute.nombre)}</h3>
                        <p class="text-sm text-ink-500 dark:text-ink-400">${attribute.usos ? `En ${plural(attribute.usos, 'accesorio')}` : 'Sin usar todavía'}</p>
                    </div>
                    <span class="tag">${escapeHtml(attribute.categoriaNombre)}</span>
                    ${rowActions(attribute.id)}
                </div>
            </article>`).join('')}</div>`;
        state.fresh = null;
    }

    async function load() {
        list.innerHTML = `<div class="space-y-3">${skeletons(5, 'h-[4.5rem]')}</div>`;
        try {
            [state.items, state.categories] = await Promise.all([listAttributes(), listAttributeCategories()]);
            if (state.category !== 'all' && !byId(state.categories, state.category)) state.category = 'all';
            drawChips();
            draw();
        } catch (error) { list.innerHTML = loadError(error.message); }
    }

    async function edit(attribute) {
        const result = await openFormModal({
            title: attribute ? 'Editar atributo' : 'Nuevo atributo',
            fields: attributeFields(attribute, state.categories, state.category === 'all' ? '' : state.category),
            editing: Boolean(attribute),
            onSubmit: form => {
                const data = { nombre: value(form, 'nombre'), categoriaId: value(form, 'categoriaId') };
                return attribute ? updateAttribute(attribute.id, data) : createAttribute(data);
            }
        });
        if (!result) return;
        toast(attribute ? `Atributo «${result.nombre}» actualizado.` : `Atributo «${result.nombre}» agregado.`);
        state.fresh = result.id;
        await load();
    }

    chips.addEventListener('click', event => {
        const chip = event.target.closest('[data-chip]');
        if (!chip) return;
        state.category = chip.dataset.chip;
        drawChips();
        draw();
    });

    wireList(main, {
        onSearch: query => { state.query = query; draw(); },
        onAdd: () => edit(null),
        onEdit: id => edit(byId(state.items, id)),
        onRetry: load,
        onDelete: async (id, node) => {
            const attribute = byId(state.items, id);
            const ok = await confirmDialog({
                title: `¿Eliminar «${attribute.nombre}»?`,
                message: attribute.usos
                    ? `También se quitará de ${plural(attribute.usos, 'accesorio que lo tiene', 'accesorios que lo tienen')}.`
                    : 'Dejará de aparecer al crear accesorios.',
                action: () => deleteAttribute(attribute.id)
            });
            if (!ok) return;
            await animateOut(node);
            toast(`Atributo «${attribute.nombre}» eliminado.`);
            await load();
        }
    });
    load();
}
