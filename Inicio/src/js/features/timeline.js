/** Trayectoria por años (Nosotros): pestañas, flechas, barra de progreso y fundido entre hitos. */
import { $, $$ } from '../core/dom.js';

export function initTimeline() {
    const root = $('[data-timeline]');
    if (!root) return;
    const tabs = $$('[role=tab]', root);
    const cards = $$('[data-event-year]', root);
    const status = $('#yearStatus', root);
    const progress = $('[data-timeline-progress]', root);
    let current = 0;

    function show(index, direction = 1) {
        current = Math.max(0, Math.min(cards.length - 1, index));
        tabs.forEach((tab, i) => {
            tab.setAttribute('aria-selected', String(i === current));
            tab.tabIndex = i === current ? 0 : -1;
        });
        // Todas las tarjetas comparten la misma celda: la altura no cambia y los botones no se mueven.
        cards.forEach((card, i) => {
            card.toggleAttribute('data-active', i === current);
            card.setAttribute('aria-hidden', String(i !== current));
            card.style.setProperty('--dir', direction);
        });
        status.textContent = `Evento ${current + 1} de ${cards.length}`;
        progress.style.width = `${(current / (cards.length - 1)) * 100}%`;
        $('#yearPrev', root).disabled = current === 0;
        $('#yearNext', root).disabled = current === cards.length - 1;
    }

    tabs.forEach((tab, index) => tab.addEventListener('click', () => show(index, index >= current ? 1 : -1)));
    $('#yearPrev', root).addEventListener('click', () => show(current - 1, -1));
    $('#yearNext', root).addEventListener('click', () => show(current + 1, 1));
    root.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight') { show(current + 1, 1); tabs[current].focus(); }
        if (event.key === 'ArrowLeft') { show(current - 1, -1); tabs[current].focus(); }
    });
    show(0);
}
