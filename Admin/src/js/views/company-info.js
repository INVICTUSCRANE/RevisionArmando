/** Configurar datos de la empresa › Información de la empresa: misión, visión, WhatsApp y valores. */
import { $, escapeHtml } from '../core/dom.js';
import { icon, checkDraw } from '../core/icons.js';
import { pad2, plural, matches } from '../core/format.js';
import { toast } from '../core/toast.js';
import { getCompanyInfo, updateCompanyInfo, listValues, createValue, updateValue, deleteValue } from '../services/admin-api.js';
import { openFormModal, confirmDialog, setBusy, showFieldError } from '../features/modal.js';
import { wireCounters, value } from '../features/forms.js';
import { panel, addButton, searchBox, rowActions, emptyState, noResults, skeletons, loadError, enterAttrs, animateOut, wireList, byId } from './shared.js';

/* ───────────── Misión, visión y contacto ───────────── */

const infoForm = `
    <form id="companyForm" class="space-y-6" novalidate>
        <div data-field-wrap>
            <label class="field-label" for="mision">Misión</label>
            <textarea id="mision" name="mision" class="textarea" rows="3" maxlength="1000" required data-counter disabled></textarea>
        </div>
        <div data-field-wrap>
            <label class="field-label" for="vision">Visión</label>
            <textarea id="vision" name="vision" class="textarea" rows="3" maxlength="1000" required data-counter disabled></textarea>
        </div>
        <div data-field-wrap class="max-w-md">
            <label class="field-label" for="whatsapp">WhatsApp de contacto</label>
            <div class="search">
                ${icon('phone')}
                <input id="whatsapp" name="whatsapp" class="input" type="tel" inputmode="tel" placeholder="+52 81 1234 5600" maxlength="20" required disabled>
            </div>
            <p class="field-hint">Número con el que los clientes te contactan desde el sitio. <a id="waTest" class="font-semibold text-brand-600 hover:underline dark:text-neon" target="_blank" rel="noopener">Probar enlace</a></p>
        </div>
        <p class="alert" data-tone="error" data-form-alert role="alert" hidden></p>
        <div class="flex flex-wrap items-center gap-3 pt-1">
            <button type="submit" class="btn btn-primary" data-save disabled>Guardar cambios</button>
            <button type="button" class="btn btn-ghost" data-discard hidden>Descartar</button>
            <span data-status aria-live="polite"></span>
        </div>
    </form>`;

function initInfo(root) {
    const form = $('#companyForm', root);
    const save = $('[data-save]', form);
    const discard = $('[data-discard]', form);
    const status = $('[data-status]', form);
    const waTest = $('#waTest', form);
    let saved = null;
    let statusTimer = 0;

    const current = () => ({ mision: value(form, 'mision'), vision: value(form, 'vision'), whatsapp: value(form, 'whatsapp') });
    const isDirty = () => saved && JSON.stringify(current()) !== JSON.stringify(saved);

    function fill(data) {
        ['mision', 'vision', 'whatsapp'].forEach(name => { form.elements[name].value = data[name]; form.elements[name].dispatchEvent(new Event('input')); });
        sync();
    }

    function setStatus(state) {
        clearTimeout(statusTimer);
        status.innerHTML = state === 'dirty'
            ? '<span class="status-pill" data-state="dirty">Cambios sin guardar</span>'
            : state === 'saved' ? `<span class="status-pill" data-state="saved">${checkDraw('size-5')}Cambios guardados</span>` : '';
        if (state === 'saved') statusTimer = setTimeout(() => setStatus(''), 4000);
    }

    function sync() {
        const dirty = isDirty();
        save.disabled = !dirty || !form.checkValidity();
        discard.hidden = !dirty;
        if (dirty) setStatus('dirty');
        else if (status.querySelector('[data-state="dirty"]')) setStatus('');
        waTest.href = `https://wa.me/${value(form, 'whatsapp').replace(/\D/g, '')}`;
    }

    form.addEventListener('input', event => {
        event.target.removeAttribute?.('aria-invalid');
        event.target.closest('[data-field-wrap]')?.querySelector('.field-error')?.remove();
        $('[data-form-alert]', form).hidden = true;
        sync();
    });
    discard.addEventListener('click', () => fill(saved));

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (save.disabled) return;
        const restore = setBusy(save);
        try {
            saved = await updateCompanyInfo(current());
            restore();
            fill(saved);
            setStatus('saved');
            toast('Información de la empresa actualizada.');
        } catch (error) {
            restore();
            showFieldError(form, error.field, error.message);
        }
    });

    wireCounters(form);
    getCompanyInfo().then(data => {
        saved = data;
        [...form.elements].forEach(element => { element.disabled = false; });
        fill(data);
    }).catch(() => toast('No se pudo cargar la información de la empresa.', { tone: 'error' }));
}

/* ───────────── Valores de la empresa ───────────── */

const valueFields = item => `
    <div data-field-wrap>
        <label class="field-label" for="valorTitulo">Título</label>
        <input id="valorTitulo" name="titulo" class="input" maxlength="60" placeholder="Ej. Seguridad" required value="${escapeHtml(item?.titulo || '')}" autocomplete="off">
    </div>
    <div data-field-wrap>
        <label class="field-label" for="valorDescripcion">Descripción</label>
        <textarea id="valorDescripcion" name="descripcion" class="textarea" rows="4" maxlength="300" required data-counter placeholder="Qué significa este valor para Invictus.">${escapeHtml(item?.descripcion || '')}</textarea>
    </div>`;

function initValues(root) {
    const list = $('[data-list]', root);
    const sub = $('[data-sub]', root);
    const state = { items: [], query: '', fresh: null };

    function draw() {
        sub.textContent = `${plural(state.items.length, 'valor publicado', 'valores publicados')} · puedes agregar, modificar o eliminar.`;
        const visible = state.items.map((item, index) => ({ ...item, number: index + 1 })).filter(item => matches(state.query, item.titulo, item.descripcion));
        if (!state.items.length) { list.innerHTML = emptyState({ title: 'Aún no hay valores', text: 'Agrega el primero con «Agregar valor».', iconName: 'sparkle' }); return; }
        if (!visible.length) { list.innerHTML = noResults(state.query); return; }
        list.innerHTML = `<div class="grid gap-4 @xl:grid-cols-2">${visible.map((item, index) => `
            <article ${enterAttrs(index, item.id === state.fresh)} data-item>
                <div class="flex h-full flex-col p-5 @xl:p-6">
                    <span class="big-number">${pad2(item.number)}</span>
                    <h3 class="mt-3 text-lg font-semibold text-ink-900 dark:text-white">${escapeHtml(item.titulo)}</h3>
                    <p class="mt-1.5 flex-1 text-ink-600 dark:text-ink-400">${escapeHtml(item.descripcion)}</p>
                    <div class="mt-5">${rowActions(item.id)}</div>
                </div>
            </article>`).join('')}</div>`;
        state.fresh = null;
    }

    async function load() {
        list.innerHTML = `<div class="grid gap-4 @xl:grid-cols-2">${skeletons(2, 'h-48')}</div>`;
        try { state.items = await listValues(); draw(); } catch (error) { list.innerHTML = loadError(error.message); }
    }

    async function edit(item) {
        const result = await openFormModal({
            title: item ? 'Editar valor' : 'Nuevo valor',
            fields: valueFields(item),
            editing: Boolean(item),
            onMount: form => wireCounters(form),
            onSubmit: form => {
                const data = { titulo: value(form, 'titulo'), descripcion: value(form, 'descripcion') };
                return item ? updateValue(item.id, data) : createValue(data);
            }
        });
        if (!result) return;
        toast(item ? `Valor «${result.titulo}» actualizado.` : `Valor «${result.titulo}» agregado.`);
        state.fresh = result.id;
        await load();
    }

    wireList(root, {
        onSearch: query => { state.query = query; draw(); },
        onAdd: () => edit(null),
        onEdit: id => edit(byId(state.items, id)),
        onRetry: load,
        onDelete: async (id, node) => {
            const item = byId(state.items, id);
            const ok = await confirmDialog({
                title: `¿Eliminar «${item.titulo}»?`,
                message: 'Dejará de mostrarse en la página Nosotros. Esta acción no se puede deshacer.',
                action: () => deleteValue(item.id)
            });
            if (!ok) return;
            await animateOut(node);
            toast(`Valor «${item.titulo}» eliminado.`);
            await load();
        }
    });
    load();
}

export function renderCompanyInfo(main) {
    main.innerHTML = `<div class="space-y-8">
        ${panel({ title: 'Misión, visión y contacto', sub: 'Estos campos son únicamente editables; no se pueden crear ni eliminar.', body: infoForm })}
        <div id="valuesPanel">${panel({ title: 'Valores de la empresa', sub: '&nbsp;', action: addButton('Agregar valor'), body: `${searchBox('Buscar valor por título o descripción…')}<div class="mt-5" data-list></div>`, delay: 2 })}</div>
    </div>`;
    initInfo(main);
    initValues($('#valuesPanel', main));
}
