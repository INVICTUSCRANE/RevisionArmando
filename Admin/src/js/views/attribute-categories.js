/** Configurar catálogo de accesorios › Categorías de atributos (agrupan los atributos). */
import { $, escapeHtml } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { plural, matches } from '../core/format.js';
import { toast } from '../core/toast.js';
import { listAttributeCategories, createAttributeCategory, updateAttributeCategory, deleteAttributeCategory } from '../services/admin-api.js';
import { openFormModal, confirmDialog } from '../features/modal.js';
import { value } from '../features/forms.js';
import { panel, addButton, searchBox, rowActions, emptyState, noResults, skeletons, loadError, enterAttrs, animateOut, wireList, byId } from './shared.js';
import { nameField, lockNote } from './category-fields.js';

const linked = category => category.atributos.length
    ? `<details class="linked mt-1.5">
            <summary>${icon('chevronRight')}Ver atributos ligados</summary>
            <div class="linked-list mt-3 flex flex-wrap gap-2">${category.atributos.map(attribute => `<span class="tag">${escapeHtml(attribute.nombre)}</span>`).join('')}</div>
        </details>`
    : '<p class="mt-1 text-sm text-ink-400 dark:text-ink-500">Sin atributos ligados</p>';

export function renderAttributeCategories(main) {
    main.innerHTML = panel({
        title: 'Categorías de atributos',
        sub: 'Agrupan los atributos para encontrarlos rápido al crear un accesorio.',
        action: addButton('Agregar'),
        body: `${searchBox('Buscar por nombre o atributo…')}<div class="mt-5" data-list></div>${lockNote('Las categorías con elementos vinculados no se pueden eliminar.')}`
    });
    const list = $('[data-list]', main);
    const state = { items: [], query: '', fresh: null };

    function draw() {
        const visible = state.items.filter(category => matches(state.query, category.nombre, ...category.atributos.map(attribute => attribute.nombre)));
        if (!state.items.length) { list.innerHTML = emptyState({ title: 'Aún no hay categorías de atributos', text: 'Crea una, por ejemplo «Capacidad» o «Material».', iconName: 'tag' }); return; }
        if (!visible.length) { list.innerHTML = noResults(state.query); return; }
        list.innerHTML = `<div class="space-y-3">${visible.map((category, index) => `
            <article ${enterAttrs(index, category.id === state.fresh)} data-item>
                <div class="item-row items-start">
                    <div class="min-w-0 flex-1 basis-60">
                        <h3 class="font-semibold text-ink-900 dark:text-white">${escapeHtml(category.nombre)}</h3>
                        ${linked(category)}
                    </div>
                    <span class="tag-muted mt-1 ${category.atributos.length ? 'is-linked' : ''}"><span class="dot"></span>${plural(category.atributos.length, 'vinculado')}</span>
                    ${rowActions(category.id, { blocked: category.atributos.length ? `«${category.nombre}» tiene ${plural(category.atributos.length, 'atributo ligado', 'atributos ligados')}; no se puede eliminar.` : '' })}
                </div>
            </article>`).join('')}</div>`;
        state.fresh = null;
    }

    async function load() {
        list.innerHTML = `<div class="space-y-3">${skeletons(4, 'h-24')}</div>`;
        try { state.items = await listAttributeCategories(); draw(); } catch (error) { list.innerHTML = loadError(error.message); }
    }

    async function edit(category) {
        const result = await openFormModal({
            title: category ? 'Editar categoría de atributo' : 'Nueva categoría de atributo',
            fields: nameField(category, 'Ej. Capacidad'),
            editing: Boolean(category),
            onSubmit: form => {
                const data = { nombre: value(form, 'nombre') };
                return category ? updateAttributeCategory(category.id, data) : createAttributeCategory(data);
            }
        });
        if (!result) return;
        toast(category ? `Categoría «${result.nombre}» actualizada.` : `Categoría «${result.nombre}» agregada.`);
        state.fresh = result.id;
        await load();
    }

    wireList(main, {
        onSearch: query => { state.query = query; draw(); },
        onAdd: () => edit(null),
        onEdit: id => edit(byId(state.items, id)),
        onRetry: load,
        onDelete: async (id, node) => {
            const category = byId(state.items, id);
            const ok = await confirmDialog({
                title: `¿Eliminar «${category.nombre}»?`,
                message: 'La categoría dejará de aparecer al crear atributos.',
                action: () => deleteAttributeCategory(category.id)
            });
            if (!ok) return;
            await animateOut(node);
            toast(`Categoría «${category.nombre}» eliminada.`);
            await load();
        }
    });
    load();
}
