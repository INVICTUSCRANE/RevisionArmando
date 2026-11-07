/**
 * Configurar catálogo de grúas › Atributos de grúas y Atributos opcionales.
 * Las dos pantallas son tarjetas con imagen, nombre y cuántas grúas los usan;
 * el formulario pide nombre e imagen.
 */
import { $, escapeHtml } from '../core/dom.js';
import { plural, matches } from '../core/format.js';
import { toast } from '../core/toast.js';
import { readImage } from '../core/image.js';
import {
    listCraneAttributes, createCraneAttribute, updateCraneAttribute, deleteCraneAttribute,
    listCraneOptionals, createCraneOptional, updateCraneOptional, deleteCraneOptional
} from '../services/admin-api.js';
import { openFormModal, confirmDialog } from '../features/modal.js';
import { value } from '../features/forms.js';
import { imageField, wireImageField } from '../features/image-field.js';
import { panel, addButton, searchBox, rowActions, emptyState, noResults, skeletons, loadError, enterAttrs, animateOut, wireList, byId } from './shared.js';

const KINDS = {
    attribute: {
        title: 'Atributos de grúas',
        sub: 'Componentes que forman una grúa, como winches o plataformas.',
        noun: 'atributo',
        newTitle: 'Nuevo atributo',
        editTitle: 'Editar atributo',
        placeholder: 'Ej. Winche',
        empty: 'Aún no hay atributos',
        list: listCraneAttributes, create: createCraneAttribute, update: updateCraneAttribute, remove: deleteCraneAttribute
    },
    optional: {
        title: 'Atributos opcionales',
        sub: 'Extras que el cliente puede elegir, como estribos cromados.',
        noun: 'atributo opcional',
        newTitle: 'Nuevo atributo opcional',
        editTitle: 'Editar atributo opcional',
        placeholder: 'Ej. Estribos cromados',
        empty: 'Aún no hay atributos opcionales',
        list: listCraneOptionals, create: createCraneOptional, update: updateCraneOptional, remove: deleteCraneOptional
    }
};

const linkedText = count => plural(count, 'grúa vinculada', 'grúas vinculadas');

function renderExtras(kind, main) {
    const config = KINDS[kind];
    main.innerHTML = panel({
        title: config.title,
        sub: config.sub,
        action: addButton('Agregar'),
        body: `${searchBox('Buscar por nombre…')}<div class="mt-5" data-list></div>`
    });
    const list = $('[data-list]', main);
    const state = { items: [], query: '', fresh: null };

    function draw() {
        const visible = state.items.filter(item => matches(state.query, item.nombre));
        if (!state.items.length) { list.innerHTML = emptyState({ title: config.empty, text: 'Agrega el primero con «Agregar».', iconName: 'image' }); return; }
        if (!visible.length) { list.innerHTML = noResults(state.query); return; }
        list.innerHTML = `<div class="grid gap-5 @lg:grid-cols-2 @4xl:grid-cols-3">${visible.map((item, index) => `
            <article ${enterAttrs(index, item.id === state.fresh)} data-item>
                <div class="slide-media is-plain"><img src="${escapeHtml(item.imagen)}" alt="" loading="lazy"></div>
                <div class="px-4 pt-4 pb-4">
                    <h3 class="font-semibold text-ink-900 dark:text-white">${escapeHtml(item.nombre)}</h3>
                    <p class="mt-1.5"><span class="tag-muted ${item.vinculados ? 'is-linked' : ''}"><span class="dot"></span>${linkedText(item.vinculados)}</span></p>
                    <div class="mt-4">${rowActions(item.id)}</div>
                </div>
            </article>`).join('')}</div>`;
        state.fresh = null;
    }

    async function load() {
        list.innerHTML = `<div class="grid gap-5 @lg:grid-cols-2 @4xl:grid-cols-3">${skeletons(3, 'aspect-[16/14]')}</div>`;
        try { state.items = await config.list(); draw(); } catch (error) { list.innerHTML = loadError(error.message); }
    }

    async function edit(item) {
        let image;
        const result = await openFormModal({
            title: item ? config.editTitle : config.newTitle,
            fields: `
                <div data-field-wrap>
                    <label class="field-label" for="extraNombre">Nombre</label>
                    <input id="extraNombre" name="nombre" class="input" maxlength="60" required autocomplete="off" autofocus
                        placeholder="${escapeHtml(config.placeholder)}" value="${escapeHtml(item?.nombre || '')}">
                </div>
                ${imageField({ current: item?.imagen || '', required: !item })}`,
            editing: Boolean(item),
            onMount: (form, { refresh }) => { image = wireImageField(form, { onChange: refresh }); },
            onSubmit: async form => {
                const file = image.file();
                const data = {
                    nombre: value(form, 'nombre'),
                    imagen: file ? await readImage(file) : null   // SERVIDOR REAL: enviar el File en FormData
                };
                return item ? config.update(item.id, data) : config.create(data);
            }
        });
        if (!result) return;
        toast(item ? `«${result.nombre}» actualizado.` : `«${result.nombre}» agregado.`);
        state.fresh = result.id;
        await load();
    }

    wireList(main, {
        onSearch: query => { state.query = query; draw(); },
        onAdd: () => edit(null),
        onEdit: id => edit(byId(state.items, id)),
        onRetry: load,
        onDelete: async (id, node) => {
            const item = byId(state.items, id);
            const ok = await confirmDialog({
                title: `¿Eliminar «${item.nombre}»?`,
                message: item.vinculados
                    ? `También se quitará de ${plural(item.vinculados, 'grúa que lo usa', 'grúas que lo usan')}.`
                    : 'Dejará de aparecer al editar grúas.',
                action: () => config.remove(item.id)
            });
            if (!ok) return;
            await animateOut(node);
            toast(`«${item.nombre}» eliminado.`);
            await load();
        }
    });
    load();
}

export const renderCraneAttributes = main => renderExtras('attribute', main);
export const renderCraneOptionals = main => renderExtras('optional', main);
