/** Configurar catálogo de grúas › Categorías de grúas. */
import { $, escapeHtml } from '../core/dom.js';
import { plural, matches } from '../core/format.js';
import { toast } from '../core/toast.js';
import { listCraneCategories, createCraneCategory, updateCraneCategory, deleteCraneCategory } from '../services/admin-api.js';
import { openFormModal, confirmDialog } from '../features/modal.js';
import { value } from '../features/forms.js';
import { panel, addButton, searchBox, rowActions, emptyState, noResults, skeletons, loadError, enterAttrs, animateOut, wireList, byId } from './shared.js';
import { nameField, lockNote } from './category-fields.js';

export function renderCraneCategories(main) {
    main.innerHTML = panel({
        title: 'Categorías de grúas',
        sub: 'Clasifican las grúas del catálogo.',
        action: addButton('Agregar'),
        body: `${searchBox('Buscar por nombre…')}<div class="mt-5" data-list></div>${lockNote('Las categorías con elementos vinculados no se pueden eliminar.')}`
    });
    const list = $('[data-list]', main);
    const state = { items: [], query: '', fresh: null };

    function draw() {
        const visible = state.items.filter(category => matches(state.query, category.nombre));
        if (!state.items.length) { list.innerHTML = emptyState({ title: 'Aún no hay categorías', text: 'Crea la primera para empezar a clasificar grúas.', iconName: 'truck' }); return; }
        if (!visible.length) { list.innerHTML = noResults(state.query); return; }
        list.innerHTML = `<div class="space-y-3">${visible.map((category, index) => `
            <article ${enterAttrs(index, category.id === state.fresh)} data-item>
                <div class="item-row">
                    <h3 class="min-w-0 flex-1 font-semibold text-ink-900 dark:text-white">${escapeHtml(category.nombre)}</h3>
                    <span class="tag-muted ${category.vinculados ? 'is-linked' : ''}"><span class="dot"></span>${plural(category.vinculados, 'vinculado')}</span>
                    ${rowActions(category.id, { blocked: category.vinculados ? `«${category.nombre}» tiene ${plural(category.vinculados, 'grúa vinculada', 'grúas vinculadas')}; no se puede eliminar.` : '' })}
                </div>
            </article>`).join('')}</div>`;
        state.fresh = null;
    }

    async function load() {
        list.innerHTML = `<div class="space-y-3">${skeletons(4, 'h-[4.5rem]')}</div>`;
        try { state.items = await listCraneCategories(); draw(); } catch (error) { list.innerHTML = loadError(error.message); }
    }

    async function edit(category) {
        const result = await openFormModal({
            title: category ? 'Editar categoría de grúa' : 'Nueva categoría de grúa',
            fields: nameField(category, 'Ej. Rescate'),
            editing: Boolean(category),
            onSubmit: form => {
                const data = { nombre: value(form, 'nombre') };
                return category ? updateCraneCategory(category.id, data) : createCraneCategory(data);
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
                message: 'La categoría dejará de aparecer al crear grúas.',
                action: () => deleteCraneCategory(category.id)
            });
            if (!ok) return;
            await animateOut(node);
            toast(`Categoría «${category.nombre}» eliminada.`);
            await load();
        }
    });
    load();
}
