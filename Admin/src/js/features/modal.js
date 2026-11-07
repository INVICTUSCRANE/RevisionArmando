/**
 * Cuadros de diálogo del panel.
 *   openFormModal(...)  formulario de alta o edición (Guardar se habilita cuando el formulario es válido)
 *   confirmDialog(...)  confirmación, con acción opcional que se ejecuta con el botón en "cargando"
 * Ambos cierran con Esc, con la X o tocando fuera, devuelven el foco a donde estaba y
 * mantienen el tabulador dentro del cuadro.
 */
import { $, $$, html, escapeHtml } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { play } from '../core/sound.js';

const SIZES = { md: 'sm:max-w-xl', lg: 'sm:max-w-2xl' };
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function mount({ panel, size = 'md', onDismiss }) {
    const previousFocus = document.activeElement;
    const backdrop = html('<div class="modal-backdrop"></div>');
    const wrap = html(`<div class="modal-wrap" role="presentation"></div>`);
    panel.classList.add('modal', ...SIZES[size].split(' '));
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.prepend(html('<div class="neon-topline absolute inset-x-0 top-0 h-[3px]"></div>'));
    wrap.append(panel);
    $('#modalRoot').append(backdrop, wrap);
    document.body.classList.add('is-locked');
    play('open');

    const state = { busy: false, closed: false };
    /** `quiet`: al terminar bien, el aviso que sigue ya trae su propio sonido. */
    const close = ({ quiet = false } = {}) => {
        if (state.closed) return;
        state.closed = true;
        if (!quiet) play('close');
        document.removeEventListener('keydown', onKey, true);
        panel.classList.add('is-leaving');
        backdrop.classList.add('is-leaving');
        setTimeout(() => {
            backdrop.remove();
            wrap.remove();
            if (!$('#modalRoot').children.length) document.body.classList.remove('is-locked');
            previousFocus?.focus?.({ preventScroll: true });
        }, 230);
    };
    const dismiss = () => { if (!state.busy) { close(); onDismiss?.(); } };

    function onKey(event) {
        if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
        if (event.key !== 'Tab') return;
        const items = $$(FOCUSABLE, panel).filter(node => node.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey, true);
    wrap.addEventListener('mousedown', event => { if (event.target === wrap) dismiss(); });
    $$('[data-dismiss]', panel).forEach(button => button.addEventListener('click', dismiss));

    requestAnimationFrame(() => {
        const target = $('[autofocus]', panel) || $(FOCUSABLE.replace('a[href], button:not([disabled]), ', ''), panel) || $('button', panel);
        target?.focus({ preventScroll: true });
    });
    return { close, state };
}

const closeButton = () => `<button type="button" class="modal-close icon-btn ml-auto" data-dismiss aria-label="Cerrar">${icon('close')}</button>`;

/** Botón con estado "cargando". Devuelve la función para restaurarlo. */
export function setBusy(button, text = 'Guardando…') {
    const original = button.innerHTML;
    const wasDisabled = button.disabled;
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span>${text}`;
    return () => { button.disabled = wasDisabled; button.innerHTML = original; };
}

/** Muestra un error junto al campo `name` (o en el aviso general del formulario). */
export function showFieldError(form, name, message) {
    const field = name && (form.elements[name] || $(`[data-field="${name}"]`, form));
    const holder = field && (field.closest?.('[data-field-wrap]') || (field instanceof RadioNodeList ? null : field.parentElement));
    if (!holder) {
        const alert = $('[data-form-alert]', form);
        alert.textContent = message;
        alert.hidden = false;
        return;
    }
    $('.field-error', holder)?.remove();
    holder.append(html(`<p class="field-error">${icon('alert', 'size-4 shrink-0')}<span>${escapeHtml(message)}</span></p>`));
    const control = field instanceof RadioNodeList ? null : (field.matches?.('input, select, textarea') ? field : $('input, select, textarea', field));
    control?.setAttribute('aria-invalid', 'true');
    if (control && matchMedia('(pointer: fine)').matches) control.focus({ preventScroll: false });
    holder.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function clearErrors(form, target) {
    const holder = target?.closest?.('[data-field-wrap]') || target?.parentElement;
    if (target) {
        $('.field-error', holder)?.remove();
        target.removeAttribute?.('aria-invalid');
    }
    const alert = $('[data-form-alert]', form);
    if (alert) alert.hidden = true;
}

/**
 * Formulario en un cuadro de diálogo.
 * @param {object} options
 *   title, size ('md' | 'lg'), fields (HTML), submitText, submitTone ('primary' | 'danger'), busyText,
 *   editing (en edición Guardar pide al menos un cambio),
 *   isValid(form) → bool  regla extra para habilitar Guardar,
 *   onMount(form, { refresh, markDirty })  para conectar campos especiales,
 *   onSubmit(form) → Promise  guarda; si lanza ApiError con `field`, el error aparece en ese campo.
 * @returns Promise con lo que devuelva onSubmit, o null si se canceló.
 */
export function openFormModal({ title, size = 'md', intro = '', fields, submitText = 'Guardar', submitTone = 'primary', busyText = 'Guardando…', editing = false, isValid = () => true, onMount, onSubmit }) {
    return new Promise(resolve => {
        const form = html(`
            <form novalidate aria-labelledby="modalTitle">
                <div class="modal-head">
                    <h2 id="modalTitle" class="text-xl font-semibold tracking-tight text-ink-900 dark:text-white">${escapeHtml(title)}</h2>
                    ${closeButton()}
                </div>
                <div class="modal-body">
                    ${intro ? `<p class="-mt-1 text-sm text-ink-500 dark:text-ink-400">${intro}</p>` : ''}
                    ${fields}
                    <p class="alert" data-tone="error" data-form-alert role="alert" hidden></p>
                </div>
                <div class="modal-foot">
                    <button type="button" class="btn btn-ghost" data-dismiss>Cancelar</button>
                    <button type="submit" class="btn ${submitTone === 'danger' ? 'btn-danger' : 'btn-primary'} min-w-32" data-submit>${submitText}</button>
                </div>
            </form>`);
        const { close, state } = mount({ panel: form, size, onDismiss: () => resolve(null) });
        const submit = $('[data-submit]', form);
        let dirty = false;

        const refresh = () => { submit.disabled = !(form.checkValidity() && isValid(form) && (!editing || dirty)); };
        const markDirty = () => { dirty = true; refresh(); };
        form.addEventListener('input', event => { clearErrors(form, event.target); markDirty(); });
        form.addEventListener('change', event => { clearErrors(form, event.target); markDirty(); });

        form.addEventListener('submit', async event => {
            event.preventDefault();
            refresh();
            if (submit.disabled || state.busy) return;
            state.busy = true;
            const restore = setBusy(submit, busyText);
            try {
                const result = await onSubmit(form);
                state.busy = false;
                close({ quiet: true });
                resolve(result);
            } catch (error) {
                state.busy = false;
                restore();
                play('error');
                form.closest('.modal')?.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 320 });
                showFieldError(form, error.field, error.message || 'No se pudo guardar. Intenta de nuevo.');
            }
        });

        onMount?.(form, { refresh, markDirty });
        refresh();
    });
}

/**
 * Confirmación. Con `action`, el botón muestra "cargando" mientras corre y, si falla,
 * el mensaje aparece dentro del cuadro. Resuelve true si se confirmó (y la acción terminó bien).
 */
export function confirmDialog({ title, message, note = '', confirmText = 'Eliminar', tone = 'danger', action }) {
    return new Promise(resolve => {
        const danger = tone === 'danger';
        const panel = html(`
            <div aria-labelledby="confirmTitle">
                <div class="modal-body flex gap-4 pt-8">
                    <span class="grid size-12 shrink-0 place-items-center rounded-2xl ${danger ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300 dark:ring-1 dark:ring-red-400/30' : 'bg-brand-50 text-brand-600 dark:bg-neon/10 dark:text-neon dark:ring-1 dark:ring-neon/30'}" style="animation: var(--animate-pop)">
                        ${icon(danger ? 'trash' : (tone === 'primary' && note ? 'database' : 'alert'), 'size-6')}
                    </span>
                    <div class="min-w-0 flex-1">
                        <h2 id="confirmTitle" class="text-xl font-semibold tracking-tight text-ink-900 dark:text-white">${escapeHtml(title)}</h2>
                        <p class="mt-1.5 text-ink-600 dark:text-ink-400">${escapeHtml(message)}</p>
                        ${note ? `<p class="note-warn mt-4">${icon('alert', 'size-4 mt-0.5 shrink-0')}<span>${escapeHtml(note)}</span></p>` : ''}
                        <p class="alert mt-4" data-tone="error" data-form-alert role="alert" hidden></p>
                    </div>
                </div>
                <div class="modal-foot">
                    <button type="button" class="btn btn-ghost" data-dismiss>Cancelar</button>
                    <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'} min-w-32" data-confirm autofocus>${escapeHtml(confirmText)}</button>
                </div>
            </div>`);
        const { close, state } = mount({ panel, onDismiss: () => resolve(false) });
        const button = $('[data-confirm]', panel);
        button.addEventListener('click', async () => {
            if (!action) { close({ quiet: true }); resolve(true); return; }
            state.busy = true;
            const restore = setBusy(button, danger ? 'Eliminando…' : 'Un momento…');
            try {
                await action();
                state.busy = false;
                close({ quiet: true });
                resolve(true);
            } catch (error) {
                state.busy = false;
                restore();
                play('error');
                button.disabled = true;   // el motivo no cambia hasta que la persona corrija algo
                const alert = $('[data-form-alert]', panel);
                alert.textContent = error.message || 'No se pudo completar la operación.';
                alert.hidden = false;
            }
        });
    });
}

/** Cuadro de solo lectura con un botón Cerrar (por ejemplo, el mensaje de un cliente). */
export function openInfoModal({ title, body, size = 'md' }) {
    return new Promise(resolve => {
        const panel = html(`
            <div aria-labelledby="infoTitle">
                <div class="modal-head">
                    <h2 id="infoTitle" class="text-xl font-semibold tracking-tight text-ink-900 dark:text-white">${escapeHtml(title)}</h2>
                    ${closeButton()}
                </div>
                <div class="modal-body">${body}</div>
                <div class="modal-foot">
                    <button type="button" class="btn btn-primary min-w-28" data-dismiss autofocus>Cerrar</button>
                </div>
            </div>`);
        mount({ panel, size, onDismiss: () => resolve() });
    });
}
