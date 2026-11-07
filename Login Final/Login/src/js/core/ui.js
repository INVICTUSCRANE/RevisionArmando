import { replayClass } from './dom.js';
import { play } from './sound.js';

/** Avisa a la escena del panel de marca (inspection-scene.js): typing | error | success | swap. */
export const sceneEvent = type => window.dispatchEvent(new CustomEvent('invictus:scene', { detail: { type } }));

/** Muestra u oculta el aviso de error de un formulario. */
export function showError(element, message) {
    element.textContent = message || '';
    element.hidden = !message;
}

/** Pone el botón en estado "cargando" y devuelve una función para restaurarlo. */
export function setBusy(button, text) {
    const label = button.querySelector('[data-label]');
    const original = label.innerHTML;
    button.disabled = true;
    label.innerHTML = `<span class="flex items-center gap-3"><span class="spinner"></span>${text}</span>`;
    return () => { button.disabled = false; label.innerHTML = original; };
}

/** Sacude la tarjeta para señalar un error (con sonido y alerta en la escena). */
export function shake(element) {
    replayClass(element, 'animate-shake');
    play('error');
    sceneEvent('error');
}
