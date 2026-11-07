/**
 * Estado del carrito: una lista de { id, qty } persistida en localStorage.
 * Las vistas se suscriben con `onCartChange` y nunca tocan el almacenamiento directamente.
 */
import { readJSON, writeJSON, removeKey } from '../../core/storage.js';
import { ACCESSORIES, findAccessory } from '../../data/products.js';

const CART_KEY = 'inv_cart';
const LEGACY_CART_KEY = 'inv_c';
const MAX_QTY = 99;
const events = new EventTarget();

/** Convierte el carrito antiguo (arreglo de índices repetidos) al formato actual. */
function migrateLegacyCart() {
    const legacy = readJSON(LEGACY_CART_KEY, null);
    if (!Array.isArray(legacy)) return null;
    removeKey(LEGACY_CART_KEY);
    const counts = new Map();
    legacy.filter(index => ACCESSORIES[index]).forEach(index => {
        const { id } = ACCESSORIES[index];
        counts.set(id, (counts.get(id) || 0) + 1);
    });
    return [...counts].map(([id, qty]) => ({ id, qty }));
}

function sanitize(lines) {
    return Array.isArray(lines)
        ? lines.filter(line => findAccessory(line?.id) && Number.isInteger(line.qty) && line.qty > 0)
            .map(line => ({ id: line.id, qty: Math.min(line.qty, MAX_QTY) }))
        : [];
}

let lines = sanitize(readJSON(CART_KEY, null) ?? migrateLegacyCart());

function commit(next, detail = {}) {
    lines = sanitize(next);
    writeJSON(CART_KEY, lines);
    events.dispatchEvent(new CustomEvent('change', { detail }));
}

/** Líneas con los datos del producto y su subtotal. */
export function getCartItems() {
    return lines.map(line => {
        const product = findAccessory(line.id);
        return { ...product, qty: line.qty, subtotal: product.price * line.qty };
    });
}

export function getCartSummary() {
    const items = getCartItems();
    return {
        items,
        count: items.reduce((sum, item) => sum + item.qty, 0),
        total: items.reduce((sum, item) => sum + item.subtotal, 0)
    };
}

export function addToCart(id, qty = 1) {
    if (!findAccessory(id)) return;
    const existing = lines.find(line => line.id === id);
    commit(existing
        ? lines.map(line => (line.id === id ? { ...line, qty: line.qty + qty } : line))
        : [...lines, { id, qty }], { type: 'add', id });
}

export function setQuantity(id, qty) {
    commit(qty <= 0 ? lines.filter(line => line.id !== id) : lines.map(line => (line.id === id ? { ...line, qty } : line)), { type: 'update', id });
}

export const removeFromCart = id => commit(lines.filter(line => line.id !== id), { type: 'remove', id });
export const clearCart = () => commit([], { type: 'clear' });

export function onCartChange(listener) {
    events.addEventListener('change', event => listener(getCartSummary(), event.detail));
}

// Mantiene el carrito sincronizado entre pestañas abiertas.
addEventListener('storage', event => {
    if (event.key !== CART_KEY) return;
    lines = sanitize(readJSON(CART_KEY, []));
    events.dispatchEvent(new CustomEvent('change', { detail: { type: 'sync' } }));
});
