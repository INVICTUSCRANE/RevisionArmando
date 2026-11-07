/**
 * Panel lateral del carrito: lista, cantidades, total y proceso de compra en 3 pasos
 * (carrito → confirmar datos → pedido enviado). El pago real se conectará con el backend.
 */
import { $, $$, html, escapeHtml, prefersReducedMotion, replayClass } from '../../core/dom.js';
import { formatPrice } from '../../core/format.js';
import { pageUrl } from '../../core/paths.js';
import { photoAttrs } from '../../core/photos.js';
import { toast } from '../../core/toast.js';
import { whatsappUrl } from '../../core/whatsapp.js';
import { findAccessory } from '../../data/products.js';
import { getCurrentUser } from '../auth.js';
import { icons } from '../../layout/icons.js';
import { addToCart, clearCart, getCartSummary, onCartChange, removeFromCart, setQuantity } from './cart-store.js';
import { playAddFeedback, productThumb } from './add-feedback.js';

let drawer;
let step = 'cart';

const drawerShell = () => html(`
    <div id="cartDrawer" class="cart-drawer" aria-hidden="true">
        <div class="cart-shade" data-cart-close></div>
        <aside class="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cartTitle">
            <header class="flex items-center justify-between border-b border-ink-100 px-6 py-5">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600" data-cart-step-label>Paso 1 de 2</p>
                    <h2 id="cartTitle" class="font-display text-3xl font-bold uppercase text-ink-900">Tu carrito</h2>
                </div>
                <button type="button" class="grid size-11 place-items-center rounded-full text-ink-500 transition hover:rotate-90 hover:bg-ink-100 hover:text-ink-900" data-cart-close aria-label="Cerrar carrito">
                    <span class="size-6">${icons.close}</span>
                </button>
            </header>
            <div class="flex-1 overflow-y-auto overscroll-contain" data-cart-body></div>
            <footer class="border-t border-ink-100 bg-ink-50/80 px-6 py-5" data-cart-footer></footer>
        </aside>
    </div>`);

const emptyView = () => `
    <div class="flex h-full flex-col items-center justify-center gap-4 px-8 py-16 text-center">
        <div class="relative grid size-28 place-items-center rounded-full bg-brand-50 text-brand-600">
            <span class="size-14 animate-float">${icons.bag}</span>
            <span class="absolute inset-0 animate-ping-slow rounded-full border-2 border-brand-200"></span>
        </div>
        <p class="font-display text-2xl font-semibold uppercase text-ink-800">Tu carrito está vacío.</p>
        <p class="text-ink-500">Explora nuestros accesorios y agrega lo que necesites para tu equipo.</p>
        <a href="${pageUrl('accesorios.html')}" class="btn btn-primary mt-2">Ver accesorios <span class="size-5">${icons.arrowRight}</span></a>
    </div>`;

const itemRow = (item, index) => `
    <li class="cart-line" data-line="${item.id}" style="--i:${index}">
        <div class="photo-slot size-20 shrink-0 rounded-xl ring-1 ring-ink-100">
            <img ${photoAttrs(item.photo, { alt: '' })} loading="lazy">
        </div>
        <div class="min-w-0 flex-1">
            <p class="truncate font-display text-lg font-semibold uppercase leading-tight text-ink-900">${escapeHtml(item.name)}</p>
            <p class="text-sm text-ink-500">${formatPrice(item.price)} MXN c/u</p>
            <div class="mt-2 flex items-center justify-between gap-3">
                <div class="qty-stepper" role="group" aria-label="Cantidad de ${escapeHtml(item.name)}">
                    <button type="button" data-qty="-1" aria-label="Quitar uno"><span class="size-4">${icons.minus}</span></button>
                    <output aria-live="polite">${item.qty}</output>
                    <button type="button" data-qty="1" aria-label="Agregar uno"><span class="size-4">${icons.plus}</span></button>
                </div>
                <p class="font-display text-lg font-bold text-ink-900" data-line-subtotal>${formatPrice(item.subtotal)}</p>
            </div>
        </div>
        <button type="button" class="self-start rounded-full p-2 text-ink-400 transition hover:bg-red-50 hover:text-red-600" data-remove aria-label="Quitar ${escapeHtml(item.name)}">
            <span class="block size-5">${icons.trash}</span>
        </button>
    </li>`;

function cartView(summary, animate) {
    return {
        body: `<ul class="flex flex-col gap-3 p-6 ${animate ? 'is-animated' : ''}">${summary.items.map(itemRow).join('')}</ul>`,
        footer: `
            <dl class="space-y-1 text-ink-600">
                <div class="flex justify-between"><dt>Artículos</dt><dd>${summary.count}</dd></div>
                <div class="flex items-end justify-between text-ink-900"><dt class="font-semibold">Total</dt>
                    <dd class="font-display text-3xl font-bold" data-cart-total>${formatPrice(summary.total)} <small class="text-sm font-medium text-ink-500">MXN</small></dd></div>
            </dl>
            <p class="mt-1 text-right text-xs text-ink-500">IVA incluido</p>
            <button type="button" class="btn btn-primary mt-4 w-full" data-checkout>Finalizar compra <span class="size-5">${icons.arrowRight}</span></button>
            <div class="mt-2 grid grid-cols-2 gap-2">
                <button type="button" class="btn btn-ghost-dark" data-cart-close>Seguir comprando</button>
                <button type="button" class="btn btn-ghost-dark hover:!border-red-300 hover:!text-red-600" data-clear>Vaciar carrito</button>
            </div>`
    };
}

function checkoutView(summary, user) {
    return {
        body: `
            <form id="checkoutForm" class="flex flex-col gap-5 p-6 animate-fade-up">
                <div class="rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
                    Revisa tu pedido. Lo enviaremos por WhatsApp para confirmar existencias y forma de pago.
                    El pago con Mercado Pago se conecta con el backend.
                </div>
                <label class="field"><span>Nombre</span><input name="nombre" required value="${escapeHtml(`${user.nombre} ${user.apellidos || ''}`.trim())}"></label>
                <label class="field"><span>Correo</span><input name="correo" type="email" required value="${escapeHtml(user.correo)}"></label>
                <label class="field"><span>Ciudad de entrega</span><input name="ciudad" required placeholder="Ej. Monterrey, N.L."></label>
                <label class="field"><span>Notas (opcional)</span><textarea name="notas" rows="2"></textarea></label>
                <ul class="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
                    ${summary.items.map(item => `<li class="flex justify-between gap-3 px-4 py-3 text-sm"><span>${item.qty} × ${escapeHtml(item.name)}</span><b>${formatPrice(item.subtotal)}</b></li>`).join('')}
                </ul>
            </form>`,
        footer: `
            <div class="flex items-end justify-between"><span class="font-semibold text-ink-900">Total</span>
                <span class="font-display text-3xl font-bold text-ink-900">${formatPrice(summary.total)} <small class="text-sm text-ink-500">MXN</small></span></div>
            <button type="submit" form="checkoutForm" class="btn btn-primary mt-4 w-full"><span class="size-5">${icons.whatsapp}</span> Enviar pedido por WhatsApp</button>
            <button type="button" class="btn btn-ghost-dark mt-2 w-full" data-back>← Volver al carrito</button>`
    };
}

const successView = orderId => ({
    body: `
        <div class="flex h-full flex-col items-center justify-center gap-4 px-8 py-16 text-center">
            <svg viewBox="0 0 52 52" class="size-28 text-brand-600" aria-hidden="true">
                <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" stroke-width="3" class="draw-circle"/>
                <path d="M15 27l7 7 15-16" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="draw-check"/>
            </svg>
            <p class="font-display text-3xl font-bold uppercase text-ink-900 animate-fade-up">¡Pedido enviado!</p>
            <p class="text-ink-500 animate-fade-up [animation-delay:150ms]">Folio <b class="text-ink-900">${orderId}</b>. Te contactaremos por WhatsApp para confirmar tu compra.</p>
        </div>`,
    footer: `<button type="button" class="btn btn-primary w-full" data-cart-close>Listo</button>`
});

function render(summary = getCartSummary(), { animate = false } = {}) {
    const user = getCurrentUser();
    if (step === 'checkout' && (!summary.count || !user)) step = 'cart';
    const view = step === 'success' ? successView(drawer.dataset.orderId)
        : step === 'checkout' ? checkoutView(summary, user)
        : summary.count ? cartView(summary, animate) : { body: emptyView(), footer: '' };

    $('[data-cart-body]', drawer).innerHTML = view.body;
    const footer = $('[data-cart-footer]', drawer);
    footer.innerHTML = view.footer;
    footer.hidden = !view.footer;
    $('#cartTitle', drawer).textContent = step === 'checkout' ? 'Confirmar pedido' : step === 'success' ? 'Gracias' : 'Tu carrito';
    $('[data-cart-step-label]', drawer).textContent = step === 'checkout' ? 'Paso 2 de 2' : step === 'success' ? 'Compra' : 'Paso 1 de 2';
}

/** Contadores del carrito (encabezado y barra del libro). Al agregar, saltan cuando llega la ficha que vuela. */
function updateBadge(count, bump) {
    $$('[data-cart-count]').forEach(badge => {
        badge.textContent = count;
        badge.dataset.cartCount = count;
    });
    if (!bump) return;
    setTimeout(() => {
        $$('[data-cart-count]').forEach(badge => replayClass(badge, 'animate-bump'));
        $$('.cart-btn[data-cart-open]').forEach(button => replayClass(button, 'animate-wiggle'));
    }, prefersReducedMotion() ? 0 : 850);
}

export function openCart() {
    // El panel vive fuera del libro: si el catálogo está en pantalla completa, se sale primero.
    if (document.fullscreenElement) document.exitFullscreen();
    render(getCartSummary(), { animate: true });
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('overflow-hidden');
    setTimeout(() => $('[data-cart-close]:not(.cart-shade)', drawer)?.focus(), 350);
}

export function closeCart() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('overflow-hidden');
    if (step === 'success') step = 'cart';
}

function startCheckout() {
    if (!getCurrentUser()) {
        const here = location.pathname.split('/').pop() || 'index.html';
        toast('Necesitas una cuenta para comprar. Te llevamos a crearla…');
        setTimeout(() => { location.href = `${pageUrl('cuenta.html')}?next=${encodeURIComponent(here)}#registro`; }, 1500);
        return;
    }
    step = 'checkout';
    render();
}

function submitOrder(form) {
    const data = Object.fromEntries(new FormData(form));
    const summary = getCartSummary();
    const orderId = `INV-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const message = [
        `Pedido ${orderId} - Accesorios Invictus Crane`,
        ...summary.items.map(item => `• ${item.qty} × ${item.name} — ${formatPrice(item.subtotal)} MXN`),
        `Total: ${formatPrice(summary.total)} MXN (IVA incluido)`,
        `Nombre: ${data.nombre}`, `Correo: ${data.correo}`, `Ciudad: ${data.ciudad}`,
        data.notas ? `Notas: ${data.notas}` : ''
    ].filter(Boolean).join('\n');
    window.open(whatsappUrl(message), '_blank', 'noopener');
    drawer.dataset.orderId = orderId;
    step = 'success';
    clearCart();
}

function onDrawerClick(event) {
    const target = event.target;
    if (target.closest('[data-cart-close]')) return closeCart();
    if (target.closest('[data-checkout]')) return startCheckout();
    if (target.closest('[data-back]')) { step = 'cart'; return render(); }
    if (target.closest('[data-clear]')) { clearCart(); return toast('Carrito vacío'); }

    const line = target.closest('[data-line]');
    if (!line) return;
    const id = line.dataset.line;
    const qty = Number($('output', line).textContent);
    const delta = target.closest('[data-qty]')?.dataset.qty;
    if (delta) setQuantity(id, qty + Number(delta));
    if (target.closest('[data-remove]')) {
        line.classList.add('is-removing');
        line.addEventListener('animationend', () => removeFromCart(id), { once: true });
    }
}

/** Botones "Agregar al carrito" en cualquier parte del sitio: `data-add-to-cart="<id>"`. */
function onAddToCartClick(event) {
    const button = event.target.closest('[data-add-to-cart]');
    if (button) {
        const product = findAccessory(button.dataset.addToCart);
        if (!product) return;
        playAddFeedback(button, product);
        addToCart(product.id);
        toast(`${product.name} agregado al carrito`, { tone: 'success', thumb: productThumb(product), action: { label: 'Ver carrito', onClick: openCart } });
        return;
    }
    if (event.target.closest('[data-cart-open]')) { event.preventDefault(); openCart(); }
}

export function initCart() {
    drawer = drawerShell();
    document.body.append(drawer);
    drawer.addEventListener('click', onDrawerClick);
    drawer.addEventListener('submit', event => { event.preventDefault(); submitOrder(event.target); });
    document.addEventListener('click', onAddToCartClick);
    addEventListener('keydown', event => event.key === 'Escape' && drawer.classList.contains('is-open') && closeCart());

    onCartChange((summary, detail) => {
        updateBadge(summary.count, detail.type === 'add');
        if (drawer.classList.contains('is-open')) render(summary);
    });
    updateBadge(getCartSummary().count, false);
    if (location.hash === '#carrito') openCart();
}
