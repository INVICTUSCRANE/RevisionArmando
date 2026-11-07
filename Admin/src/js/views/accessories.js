/** Configurar catálogo de accesorios › Accesorios: nombre, categoría, precio, descripción y atributos. */
import { $, escapeHtml } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { formatMoney, plural, matches } from '../core/format.js';
import { toast } from '../core/toast.js';
import { listAccessories, listAccessoryCategories, listAttributes, listAttributeCategories, createAccessory, updateAccessory, deleteAccessory } from '../services/admin-api.js';
import { openFormModal, confirmDialog } from '../features/modal.js';
import { wireCounters, value } from '../features/forms.js';
import { panel, addButton, searchBox, rowActions, emptyState, noResults, skeletons, loadError, enterAttrs, animateOut, wireList, byId } from './shared.js';

function accessoryFields(item, catalog) {
    return `
        <div data-field-wrap>
            <label class="field-label" for="accNombre">Nombre</label>
            <input id="accNombre" name="nombre" class="input" maxlength="80" required placeholder="Ej. Cadena grado 80" value="${escapeHtml(item?.nombre || '')}" autocomplete="off" autofocus>
        </div>
        <div class="grid gap-5 sm:grid-cols-2">
            <div data-field-wrap>
                <label class="field-label" for="accCategoria">Categoría de accesorio</label>
                <select id="accCategoria" name="categoriaId" class="select" required>
                    <option value="">Seleccionar…</option>
                    ${catalog.categories.map(category => `<option value="${category.id}" ${item?.categoriaId === category.id ? 'selected' : ''}>${escapeHtml(category.nombre)}</option>`).join('')}
                </select>
            </div>
            <div data-field-wrap>
                <label class="field-label" for="accPrecio">Precio (MXN)</label>
                <div class="search">
                    <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-ink-400">$</span>
                    <input id="accPrecio" name="precio" class="input pl-9 tabular-nums" inputmode="decimal" required placeholder="0.00" pattern="\\d{1,8}(\\.\\d{1,2})?" value="${item ? item.precio.toFixed(2) : ''}" autocomplete="off">
                </div>
            </div>
        </div>
        <div data-field-wrap>
            <label class="field-label" for="accDescripcion">Descripción</label>
            <textarea id="accDescripcion" name="descripcion" class="textarea" rows="3" maxlength="500" required data-counter placeholder="Para qué sirve y qué incluye.">${escapeHtml(item?.descripcion || '')}</textarea>
        </div>
        <div data-field-wrap data-field="atributos">
            <span class="field-label">Atributos (<span data-attr-count>0</span>)</span>
            <div class="mb-3 flex min-h-9 flex-wrap gap-2" data-attr-selected></div>
            <div class="picker">
                <div class="grid gap-2 sm:grid-cols-2">
                    <select class="select h-11 bg-white dark:bg-ink-900" data-attr-category aria-label="Filtrar atributos por categoría">
                        <option value="">Todas las categorías</option>
                        ${catalog.attributeCategories.map(category => `<option value="${category.id}">${escapeHtml(category.nombre)}</option>`).join('')}
                    </select>
                    <label class="search">${icon('search')}<input type="search" class="input h-11" placeholder="Buscar atributo…" data-attr-search aria-label="Buscar atributo"></label>
                </div>
                <div class="picker-list" data-attr-options></div>
            </div>
        </div>`;
}

/** Selector de atributos: los elegidos aparecen como etiquetas con ×; la lista solo muestra los que faltan. */
function wireAttributePicker(form, attributes, initial, markDirty) {
    const selected = new Set(initial);
    const box = $('[data-attr-selected]', form);
    const options = $('[data-attr-options]', form);
    const category = $('[data-attr-category]', form);
    const search = $('[data-attr-search]', form);

    function draw() {
        $('[data-attr-count]', form).textContent = selected.size;
        const chosen = attributes.filter(attribute => selected.has(attribute.id));
        box.innerHTML = chosen.length
            ? chosen.map(attribute => `<span class="tag" style="animation: var(--animate-pop)">${escapeHtml(attribute.nombre)}<button type="button" data-remove="${attribute.id}" aria-label="Quitar ${escapeHtml(attribute.nombre)}">${icon('close', 'size-3.5')}</button></span>`).join('')
            : '<p class="text-sm text-ink-400 dark:text-ink-500">Sin atributos. Agrégalos desde la lista.</p>';
        const available = attributes.filter(attribute => !selected.has(attribute.id)
            && (!category.value || String(attribute.categoriaId) === category.value)
            && matches(search.value, attribute.nombre, attribute.categoriaNombre));
        options.innerHTML = available.length
            ? available.map((attribute, index) => `
                <button type="button" class="picker-option enter" style="--i:${index}" data-pick="${attribute.id}">
                    <span>${escapeHtml(attribute.nombre)}</span>
                    <span class="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">${escapeHtml(attribute.categoriaNombre)}<span class="plus">${icon('plus', 'size-4')}</span></span>
                </button>`).join('')
            : `<p class="px-2 py-4 text-center text-sm text-ink-500">${attributes.length ? 'No hay más atributos con ese filtro.' : 'Aún no hay atributos registrados.'}</p>`;
    }

    form.addEventListener('click', event => {
        const pick = event.target.closest('[data-pick]');
        const remove = event.target.closest('[data-remove]');
        if (!pick && !remove) return;
        if (pick) selected.add(Number(pick.dataset.pick));
        else selected.delete(Number(remove.dataset.remove));
        draw();
        markDirty();
    });
    // Los filtros del selector no cuentan como cambios del accesorio
    [category, search].forEach(control => control.addEventListener('input', event => { event.stopPropagation(); draw(); }));
    category.addEventListener('change', event => event.stopPropagation());
    draw();
    return () => [...selected];
}

export function renderAccessories(main) {
    main.innerHTML = panel({
        title: 'Accesorios',
        sub: '&nbsp;',
        action: addButton('Agregar accesorio'),
        body: `
            <div class="filters">
                ${searchBox('Buscar por nombre o descripción…')}
                <select class="select" data-filter aria-label="Filtrar por categoría"><option value="">Todas las categorías</option></select>
            </div>
            <div class="mt-5" data-list></div>`
    });
    const list = $('[data-list]', main);
    const filter = $('[data-filter]', main);
    const sub = $('[data-sub]', main);
    const state = { items: [], categories: [], query: '', fresh: null };

    function draw() {
        sub.textContent = `${plural(state.items.length, 'accesorio', 'accesorios')} en el catálogo.`;
        const visible = state.items.filter(item => (!filter.value || String(item.categoriaId) === filter.value)
            && matches(state.query, item.nombre, item.descripcion, ...item.atributos.map(attribute => attribute.nombre)));
        if (!state.items.length) { list.innerHTML = emptyState({ title: 'El catálogo está vacío', text: 'Agrega el primer accesorio con «Agregar accesorio».', iconName: 'box' }); return; }
        if (!visible.length) { list.innerHTML = state.query ? noResults(state.query) : emptyState({ title: 'No hay accesorios en esta categoría', iconName: 'box' }); return; }
        list.innerHTML = `<div class="grid gap-4 @xl:grid-cols-2">${visible.map((item, index) => `
            <article ${enterAttrs(index, item.id === state.fresh)} data-item>
                <div class="flex h-full flex-col">
                    <div class="flex-1 p-5 @xl:p-6">
                        <p class="eyebrow text-xs">${escapeHtml(item.categoriaNombre)}</p>
                        <h3 class="mt-2 text-lg font-semibold text-ink-900 dark:text-white">${escapeHtml(item.nombre)}</h3>
                        <p class="price mt-1">${formatMoney(item.precio)}</p>
                        <p class="mt-2 text-ink-600 dark:text-ink-400">${escapeHtml(item.descripcion)}</p>
                    </div>
                    <div class="flex min-h-14 flex-wrap items-center gap-2 border-t border-ink-100 px-5 py-3 @xl:px-6 dark:border-white/[.06]">
                        ${item.atributos.length ? item.atributos.map(attribute => `<span class="tag" title="${escapeHtml(attribute.categoriaNombre)}">${escapeHtml(attribute.nombre)}</span>`).join('') : '<span class="text-sm text-ink-400 dark:text-ink-500">Sin atributos</span>'}
                    </div>
                    <div class="border-t border-ink-100 px-5 py-3 @xl:px-6 dark:border-white/[.06]">${rowActions(item.id)}</div>
                </div>
            </article>`).join('')}</div>`;
        state.fresh = null;
    }

    async function load() {
        list.innerHTML = `<div class="grid gap-4 @xl:grid-cols-2">${skeletons(4, 'h-72')}</div>`;
        try {
            [state.items, state.categories] = await Promise.all([listAccessories(), listAccessoryCategories()]);
            const chosen = filter.value;
            filter.innerHTML = `<option value="">Todas las categorías</option>${state.categories.map(category => `<option value="${category.id}">${escapeHtml(category.nombre)}</option>`).join('')}`;
            filter.value = byId(state.categories, chosen) ? chosen : '';
            draw();
        } catch (error) { list.innerHTML = loadError(error.message); }
    }

    async function edit(item) {
        let catalog;
        try {
            const [attributes, attributeCategories] = await Promise.all([listAttributes(), listAttributeCategories()]);
            catalog = { categories: state.categories, attributes, attributeCategories };
        } catch { toast('No se pudieron cargar los atributos.', { tone: 'error' }); return; }
        let selectedAttributes;
        const result = await openFormModal({
            title: item ? 'Editar accesorio' : 'Nuevo accesorio',
            size: 'lg',
            fields: accessoryFields(item, catalog),
            editing: Boolean(item),
            onMount: (form, { markDirty }) => {
                wireCounters(form);
                selectedAttributes = wireAttributePicker(form, catalog.attributes, item?.atributos.map(attribute => attribute.id) || [], markDirty);
                // El precio solo acepta números y un punto decimal
                form.elements.precio.addEventListener('input', () => {
                    form.elements.precio.value = form.elements.precio.value.replace(',', '.').replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
                });
            },
            onSubmit: form => {
                const data = {
                    nombre: value(form, 'nombre'),
                    categoriaId: value(form, 'categoriaId'),
                    precio: value(form, 'precio'),
                    descripcion: value(form, 'descripcion'),
                    atributos: selectedAttributes()
                };
                return item ? updateAccessory(item.id, data) : createAccessory(data);
            }
        });
        if (!result) return;
        toast(item ? `Accesorio «${result.nombre}» actualizado.` : `Accesorio «${result.nombre}» agregado.`);
        state.fresh = result.id;
        await load();
    }

    filter.addEventListener('change', draw);
    wireList(main, {
        onSearch: query => { state.query = query; draw(); },
        onAdd: () => edit(null),
        onEdit: id => edit(byId(state.items, id)),
        onRetry: load,
        onDelete: async (id, node) => {
            const item = byId(state.items, id);
            const ok = await confirmDialog({
                title: `¿Eliminar «${item.nombre}»?`,
                message: 'Dejará de mostrarse en el catálogo y la tienda en línea. Esta acción no se puede deshacer.',
                action: () => deleteAccessory(item.id)
            });
            if (!ok) return;
            await animateOut(node);
            toast(`Accesorio «${item.nombre}» eliminado.`);
            await load();
        }
    });
    load();
}
