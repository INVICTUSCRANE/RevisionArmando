import { $, html, escapeHtml } from './dom.js';
import { play } from './sound.js';

/** Notificación flotante. tone: default | success | error. Suena según el tono (si no está silenciado). */
export function toast(message, { duration = 3200, tone = 'success' } = {}) {
    const stack = $('#toastStack');
    const icon = { success: '✓', error: '!' }[tone] || 'i';
    const node = html(`
        <div class="toast" data-tone="${tone}" role="${tone === 'error' ? 'alert' : 'status'}">
            <span class="toast-icon">${icon}</span>
            <span>${escapeHtml(message)}</span>
        </div>`);
    stack.append(node);
    play({ success: 'success', error: 'error' }[tone] || 'info');
    setTimeout(() => {
        node.classList.add('is-leaving');
        node.addEventListener('animationend', () => node.remove(), { once: true });
    }, duration);
}
