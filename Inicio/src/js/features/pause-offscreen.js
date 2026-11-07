/**
 * Congela las animaciones CSS de las secciones que no están en pantalla (clase `is-offscreen`,
 * ver styles/base.css): las luces, destellos y fondos LED solo trabajan donde el usuario mira.
 */
import { $$ } from '../core/dom.js';

export function initPauseOffscreen() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.target.classList.toggle('is-offscreen', !entry.isIntersecting));
    }, { rootMargin: '150px 0px' });
    $$('main > *, body > footer').forEach(section => observer.observe(section));
}
