/**
 * Confirmación al agregar un accesorio al carrito, para que nunca quede la duda:
 *   1. el botón se ilumina y cambia a "¡Agregado!" con una palomita,
 *   2. sale un destello de luz desde el botón,
 *   3. una ficha con la foto vuela hasta el carrito (el de la barra del libro si está en pantalla completa),
 *   4. el carrito y su contador saltan, y aparece un aviso con la foto y "Ver carrito".
 */
import { $, prefersReducedMotion, replayClass } from '../../core/dom.js';
import { burstAt } from '../../core/burst.js';
import { photoAttrs } from '../../core/photos.js';
import { icons } from '../../layout/icons.js';
import { flyToCart } from './fly-to-cart.js';

const RESET_AFTER = 1800;

export const productThumb = (product, className = 'toast-thumb') =>
    `<span class="${className} photo-slot"><img ${photoAttrs(product.photo, { alt: '' })}></span>`;

/** Carrito visible: el de la barra del libro en pantalla completa; si no, el del encabezado. */
function visibleCart() {
    return document.fullscreenElement?.querySelector('[data-cart-open]') || $('#siteHeader [data-cart-open]');
}

function markButton(button) {
    const label = $('[data-add-label]', button);
    const icon = $('.page-btn-icon', button);
    button.dataset.label ??= label?.textContent ?? '';
    button.dataset.icon ??= icon?.innerHTML ?? '';
    replayClass(button, 'is-added');
    if (label) label.textContent = '¡Agregado!';
    if (icon) icon.innerHTML = icons.check;
    clearTimeout(Number(button.dataset.resetTimer));
    button.dataset.resetTimer = String(setTimeout(() => {
        button.classList.remove('is-added');
        if (label) label.textContent = button.dataset.label;
        if (icon) icon.innerHTML = button.dataset.icon;
    }, RESET_AFTER));
}

export function playAddFeedback(button, product) {
    markButton(button);
    const cart = visibleCart();
    if (prefersReducedMotion()) return;
    const rect = button.getBoundingClientRect();
    burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
    flyToCart(button, cart, productThumb(product, 'fly-chip-thumb'));
}
