/**
 * Animación de celebración: anillos que se expanden y partículas alrededor de un ícono.
 * `playBurst(host, icono)` la dibuja (o la repite) dentro de `host`.
 */
const COLORS = ['var(--color-brand-400)', 'var(--color-neon)', 'var(--color-gold-400)', 'var(--color-brand-600)', 'var(--color-royal-400)', 'var(--color-neon)'];

const CHECK = `
    <svg class="check-draw size-14" viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="28" cy="28" r="25"/><path d="m17 29 7 7 15-15"/>
    </svg>`;

const LOCK = `
    <svg class="size-14 overflow-visible" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path class="lock-shackle" d="M15 21v-6a9 9 0 0 1 18 0v6"/>
        <rect x="9" y="21" width="30" height="22" rx="4"/>
        <circle cx="24" cy="31" r="2.5" fill="currentColor"/>
        <g class="lock-badge"><circle cx="38" cy="40" r="9" fill="currentColor" stroke="none"/><path d="m33.5 40 3 3 5.5-6" stroke="#fff" stroke-width="2.6"/></g>
    </svg>`;

export const ICONS = { check: CHECK, lock: LOCK };

export function playBurst(host, icon = 'check') {
    const dots = Array.from({ length: 14 }, (_, i) => {
        const angle = (360 / 14) * i + Math.random() * 12;
        const reach = 70 + Math.random() * 40;
        return `<span class="burst-dot" style="--a:${angle.toFixed(0)}deg;--r:${reach.toFixed(0)}px;--c:${COLORS[i % COLORS.length]};--d:${(.3 + Math.random() * .15).toFixed(2)}s"></span>`;
    }).join('');
    host.innerHTML = `
        <div class="burst" aria-hidden="true">
            <span class="burst-ring"></span><span class="burst-ring" style="--d:.18s"></span><span class="burst-ring" style="--d:.36s"></span>
            ${dots}
            <span class="burst-core">${ICONS[icon]}</span>
        </div>`;
}
