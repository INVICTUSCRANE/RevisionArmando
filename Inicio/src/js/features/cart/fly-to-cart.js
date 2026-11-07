/**
 * Hace "volar" una ficha con la miniatura del producto desde el botón hasta el carrito
 * y, al llegar, hace saltar el carrito. Devuelve una promesa que se cumple al aterrizar.
 */
import { replayClass } from '../../core/dom.js';

export function flyToCart(sourceElement, target, thumbMarkup) {
    if (!sourceElement || !target) return Promise.resolve();
    const from = sourceElement.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const ghost = document.createElement('div');
    ghost.className = 'fly-chip';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.innerHTML = `${thumbMarkup}<b>+1</b>`;
    Object.assign(ghost.style, { left: `${from.left + from.width / 2 - 32}px`, top: `${from.top + from.height / 2 - 32}px` });
    (document.fullscreenElement || document.body).append(ghost);

    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const lift = Math.min(160, Math.abs(dy) * .35 + 70);
    return ghost.animate([
        { transform: 'translate(0, 0) scale(.4)', opacity: 0 },
        { transform: 'translate(0, -16px) scale(1.1)', opacity: 1, offset: .16 },
        { transform: `translate(${dx * .5}px, ${Math.min(dy, 0) * .5 - lift}px) scale(.85) rotate(-10deg)`, opacity: 1, offset: .6 },
        { transform: `translate(${dx}px, ${dy}px) scale(.25) rotate(8deg)`, opacity: .6 }
    ], { duration: 950, easing: 'cubic-bezier(.45,0,.25,1)' }).finished.then(() => {
        ghost.remove();
        replayClass(target, 'is-pinged');
    });
}
