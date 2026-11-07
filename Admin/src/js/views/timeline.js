/** Configurar datos de la empresa › Línea del tiempo: acontecimientos de la historia, uno por año. */
import { $, escapeHtml } from '../core/dom.js';
import { plural, matches } from '../core/format.js';
import { readImage } from '../core/image.js';
import { toast } from '../core/toast.js';
import { listEvents, createEvent, updateEvent, deleteEvent } from '../services/admin-api.js';
import { openFormModal, confirmDialog } from '../features/modal.js';
import { wireCounters, value } from '../features/forms.js';
import { imageField, wireImageField } from '../features/image-field.js';
import { panel, addButton, searchBox, rowActions, emptyState, noResults, skeletons, loadError, animateOut, wireList, byId } from './shared.js';

const eventFields = event => `
    <div data-field-wrap class="max-w-[12rem]">
        <label class="field-label" for="eventoAnio">Año</label>
        <input id="eventoAnio" name="anio" class="input font-display text-xl font-semibold tracking-wider" inputmode="numeric" maxlength="4" pattern="\\d{4}" required
            placeholder="${new Date().getFullYear()}" value="${event?.anio ?? ''}" autocomplete="off">
        <p class="field-hint">Solo el año, 4 dígitos.</p>
    </div>
    <div data-field-wrap>
        <label class="field-label" for="eventoDescripcion">Descripción</label>
        <textarea id="eventoDescripcion" name="descripcion" class="textarea" rows="4" maxlength="5000" required data-counter placeholder="Qué pasó ese año en Invictus.">${escapeHtml(event?.descripcion || '')}</textarea>
    </div>
    ${imageField({ current: event?.imagen, required: !event })}`;

export function renderTimeline(main) {
    main.innerHTML = panel({
        title: 'Acontecimientos',
        sub: '&nbsp;',
        action: addButton('Agregar acontecimiento'),
        body: `${searchBox('Buscar por año o descripción…')}<div class="mt-6" data-list></div>`
    });
    const list = $('[data-list]', main);
    const sub = $('[data-sub]', main);
    const state = { items: [], query: '', fresh: null };

    function draw() {
        sub.textContent = `${plural(state.items.length, 'hito ordenado', 'hitos ordenados')} por año.`;
        const visible = state.items.filter(event => matches(state.query, event.anio, event.descripcion));
        if (!state.items.length) { list.innerHTML = emptyState({ title: 'La línea del tiempo está vacía', text: 'Agrega el primer acontecimiento de la historia de Invictus.', iconName: 'scroll' }); return; }
        if (!visible.length) { list.innerHTML = noResults(state.query); return; }
        list.innerHTML = `<ol class="timeline">${visible.map((event, index) => `
            <li class="relative enter" style="--i:${index}" data-item>
                <span class="timeline-node" style="--i:${index}" aria-hidden="true"></span>
                <article class="item ${event.id === state.fresh ? 'is-fresh' : ''} flex flex-col gap-5 p-4 @xl:flex-row @xl:p-5">
                    <div class="thumb w-full @xl:w-60"><img src="${escapeHtml(event.imagen)}" alt="" loading="lazy"></div>
                    <div class="flex min-w-0 flex-1 flex-col">
                        <h3 class="year">${event.anio}</h3>
                        <p class="mt-2 flex-1 text-ink-700 dark:text-ink-300">${escapeHtml(event.descripcion)}</p>
                        <div class="mt-4">${rowActions(event.id)}</div>
                    </div>
                </article>
            </li>`).join('')}</ol>`;
        state.fresh = null;
    }

    async function load() {
        list.innerHTML = `<div class="space-y-5">${skeletons(3, 'h-44')}</div>`;
        try { state.items = await listEvents(); draw(); } catch (error) { list.innerHTML = loadError(error.message); }
    }

    async function edit(event) {
        let image;
        const result = await openFormModal({
            title: event ? `Editar acontecimiento de ${event.anio}` : 'Nuevo acontecimiento',
            fields: eventFields(event),
            editing: Boolean(event),
            onMount: (form, { refresh }) => {
                wireCounters(form);
                image = wireImageField(form, { onChange: refresh });
                // El año solo acepta dígitos
                form.elements.anio.addEventListener('input', () => { form.elements.anio.value = form.elements.anio.value.replace(/\D/g, '').slice(0, 4); });
            },
            onSubmit: async form => {
                const file = image.file();
                const data = {
                    anio: value(form, 'anio'),
                    descripcion: value(form, 'descripcion'),
                    imagen: file ? await readImage(file) : null   // SERVIDOR REAL: enviar el File en FormData (campo "imagen")
                };
                return event ? updateEvent(event.id, data) : createEvent(data);
            }
        });
        if (!result) return;
        toast(event ? `Acontecimiento de ${result.anio} actualizado.` : `Acontecimiento de ${result.anio} agregado.`);
        state.fresh = result.id;
        await load();
        list.querySelector('.is-fresh')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    wireList(main, {
        onSearch: query => { state.query = query; draw(); },
        onAdd: () => edit(null),
        onEdit: id => edit(byId(state.items, id)),
        onRetry: load,
        onDelete: async (id, node) => {
            const event = byId(state.items, id);
            const ok = await confirmDialog({
                title: `¿Eliminar el acontecimiento de ${event.anio}?`,
                message: 'Se quitará de la trayectoria en la página Nosotros, junto con su imagen.',
                action: () => deleteEvent(event.id)
            });
            if (!ok) return;
            await animateOut(node);
            toast(`Acontecimiento de ${event.anio} eliminado.`);
            await load();
        }
    });
    load();
}
