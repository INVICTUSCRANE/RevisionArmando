/**
 * Cambia entre las pantallas de la tarjeta (inicio de sesión, recuperar, código, nueva contraseña, listo).
 * Cualquier botón con data-go="vista" navega; con data-back la animación entra desde la izquierda.
 */
import { $, $$ } from '../core/dom.js';
import { play } from '../core/sound.js';
import { sceneEvent } from '../core/ui.js';

const listeners = {};

export function showView(name, { back = false } = {}) {
    $$('[data-view]').forEach(view => {
        const active = view.dataset.view === name;
        view.hidden = !active;
        if (active) {
            view.classList.toggle('is-back', back);
            // Reinicia la animación de entrada
            view.style.animation = 'none';
            void view.offsetWidth;
            view.style.animation = '';
        }
    });
    if (name !== 'done') play(back ? 'back' : 'forward');
    sceneEvent('swap');
    listeners[name]?.forEach(callback => callback());
    const focusTarget = $(`[data-view="${name}"] input:not([type="radio"]):not([type="checkbox"]):not([hidden])`);
    if (focusTarget && matchMedia('(pointer: fine)').matches) focusTarget.focus({ preventScroll: true });
}

/** Ejecuta `callback` cada vez que se muestra la vista. */
export const onShow = (name, callback) => (listeners[name] ||= []).push(callback);

export function initViews() {
    document.addEventListener('click', event => {
        const trigger = event.target.closest('[data-go]');
        if (trigger) showView(trigger.dataset.go, { back: trigger.hasAttribute('data-back') });
    });
}
