/**
 * Destello de celebración: anillos de luz y partículas que salen de un punto de la pantalla.
 * `burstAt(x, y)` lo dibuja encima de todo (dentro de la pantalla completa, si está activa).
 */
const COLORS = ['var(--color-neon)', 'var(--color-brand-400)', 'var(--color-amber-400)', '#ffffff'];

export function burstAt(x, y, { count = 14, reach = 70 } = {}) {
    const host = document.fullscreenElement || document.body;
    const node = document.createElement('div');
    node.className = 'burst';
    node.setAttribute('aria-hidden', 'true');
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.innerHTML = '<span class="burst-ring"></span><span class="burst-ring" style="--d:.15s"></span>' +
        Array.from({ length: count }, (_, i) => {
            const angle = (360 / count) * i + Math.random() * 14;
            const distance = reach * (.7 + Math.random() * .6);
            return `<span class="burst-dot" style="--a:${angle.toFixed(0)}deg;--r:${distance.toFixed(0)}px;--c:${COLORS[i % COLORS.length]};--d:${(Math.random() * .12).toFixed(2)}s"></span>`;
        }).join('');
    host.append(node);
    setTimeout(() => node.remove(), 1100);
}
