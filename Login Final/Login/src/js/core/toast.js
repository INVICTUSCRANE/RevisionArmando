import { $, html, escapeHtml } from './dom.js';
import { play } from './sound.js';

/** Notificación flotante. tone: default | success | error | code. */
export function toast(message, { duration = 3600, tone = 'default' } = {}) {
    const stack = $('#toastStack');
    const icon = { success: '✓', error: '!', code: '#' }[tone] || 'i';
    const node = html(`
        <div class="toast" data-tone="${tone}">
            <span class="toast-icon">${icon}</span>
            <span>${escapeHtml(message)}</span>
        </div>`);
    stack.append(node);
    play('toast');
    setTimeout(() => {
        node.classList.add('is-leaving');
        node.addEventListener('animationend', () => node.remove(), { once: true });
    }, duration);
}
