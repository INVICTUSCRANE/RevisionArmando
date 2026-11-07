/** Vista base de las pantallas que todavía no tienen diseño (ver `pending` en data/menu.js). */
import { escapeHtml } from '../core/dom.js';
import { icon } from '../core/icons.js';

// Gancho de grúa colgando de su cable; se balancea con .hook-swing
const HOOK = `
    <svg class="hook-glow h-36 w-28 overflow-visible text-brand-600 dark:text-neon" viewBox="0 0 80 110" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M10 4h60" class="text-ink-300 dark:text-ink-600" stroke="currentColor"/>
        <g class="hook-swing">
            <path d="M40 4v42"/>
            <rect x="30" y="46" width="20" height="14" rx="3"/>
            <path d="M40 60v20a11 11 0 0 1-22 0v-5"/>
            <path d="m14 79 4-4 4 4"/>
        </g>
    </svg>`;

export function renderPending(main, route) {
    main.innerHTML = `
        <section class="panel enter overflow-hidden">
            <div class="grid place-items-center gap-2 px-6 py-14 text-center sm:py-20">
                ${HOOK}
                <span class="tag-muted mt-2"><span class="dot bg-amber-400 shadow-[0_0_8px] shadow-amber-400"></span>Pantalla por definir</span>
                <h2 class="mt-3 text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">${escapeHtml(route.title)}</h2>
                <p class="max-w-lg text-ink-600 dark:text-ink-400">${escapeHtml(route.pending)}</p>
                <p class="mt-4 inline-flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
                    ${icon('clipboard', 'size-4')}La sección ya está en el menú; falta definir sus campos y acciones.
                </p>
            </div>
        </section>`;
}
