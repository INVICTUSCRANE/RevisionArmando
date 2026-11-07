/**
 * Conecta los sonidos con la interfaz: pasar el cursor, elegir opciones, escribir, el interruptor
 * de tema y el botón para silenciar (#soundToggle, también con la tecla M).
 * Los sonidos de éxito, error y cambio de pantalla se disparan desde sus propios módulos.
 */
import { $ } from '../core/dom.js';
import { isEnabled, onSoundChange, play, setEnabled } from '../core/sound.js';
import { sceneEvent } from '../core/ui.js';

const HOVERABLE = '.role, .btn-primary, .btn-link, .btn-back, .icon-btn, .segmented label, #themeToggle, #soundToggle, [data-demo], summary';
const CLICKABLE = '.btn-link, .btn-back, .icon-btn, #successClose, summary';
const TYPEABLE = 'input.input, #recoverForm select';

function syncToggle(button, on) {
    button.setAttribute('aria-pressed', String(on));
    const label = on ? 'Silenciar sonidos (M)' : 'Activar sonidos (M)';
    button.setAttribute('aria-label', label);
    button.title = label;
}

function initToggle() {
    const button = $('#soundToggle');
    if (!button) return;
    syncToggle(button, isEnabled());
    onSoundChange(on => syncToggle(button, on));
    button.addEventListener('click', () => setEnabled(!isEnabled()));
    // Atajo M, solo cuando no se está escribiendo en un campo
    document.addEventListener('keydown', event => {
        if (event.key.toLowerCase() !== 'm' || event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.target.closest('input, textarea, select, [contenteditable]')) return;
        setEnabled(!isEnabled());
    });
}

export function initSoundFx() {
    initToggle();

    // Pasar el cursor por un elemento interactivo (solo al entrar, no al moverse dentro)
    document.addEventListener('pointerover', event => {
        if (event.pointerType !== 'mouse') return;
        const target = event.target.closest(HOVERABLE);
        if (!target || target.contains(event.relatedTarget)) return;
        play('hover');
    });

    document.addEventListener('change', event => {
        const { type } = event.target;
        if (type === 'radio' || type === 'checkbox') play('select');
    });

    document.addEventListener('click', event => {
        if (event.target.closest('[data-demo]')) return play('select');
        if (event.target.closest(CLICKABLE)) play('click');
    });

    // Escribir: tecleo suave y un paquete de datos en la escena
    document.addEventListener('input', event => {
        if (!event.target.matches(TYPEABLE)) return;
        play('tick');
        sceneEvent('typing');
    });

    $('#themeToggle')?.addEventListener('click', () => {
        play(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
}
