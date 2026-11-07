import { html, escapeHtml } from './dom.js';

/** Pila de avisos dentro del elemento en pantalla completa (si lo hay) para que siempre se vean. */
function stackFor(host) {
    let stack = host.querySelector(':scope > .toast-stack');
    if (!stack) {
        stack = html('<div class="toast-stack" aria-live="polite"></div>');
        host.append(stack);
    }
    return stack;
}

/**
 * Notificación flotante. Opcionales: `action` { label, onClick } y `thumb` (HTML de una miniatura).
 */
export function toast(message, { action, duration = 3200, tone = 'default', thumb = '' } = {}) {
    const icon = tone === 'success' ? '✓' : tone === 'error' ? '!' : 'i';
    const node = html(`
        <div class="toast" data-tone="${tone}">
            ${thumb || `<span class="toast-icon">${icon}</span>`}
            <span class="min-w-0">${escapeHtml(message)}</span>
            ${action ? `<button type="button" class="toast-action">${escapeHtml(action.label)}</button>` : ''}
        </div>`);
    if (action) node.querySelector('button').addEventListener('click', () => { action.onClick(); dismiss(); });
    stackFor(document.fullscreenElement || document.body).append(node);

    function dismiss() {
        node.classList.add('is-leaving');
        node.addEventListener('animationend', () => node.remove(), { once: true });
    }
    setTimeout(dismiss, duration);
}
