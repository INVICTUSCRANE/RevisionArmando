/**
 * Aparición al hacer scroll: cualquier elemento con `data-reveal` entra con animación.
 * Variantes: data-reveal="up" (por defecto) | "left" | "right" | "zoom".
 * Retraso opcional con style="--reveal-delay: 200ms" o en grupo con `data-reveal-stagger`.
 */
import { $$ } from '../core/dom.js';

export function initReveal() {
    $$('[data-reveal-stagger]').forEach(group => {
        const step = Number(group.dataset.revealStagger) || 90;
        $$(':scope > *', group).forEach((child, index) => {
            if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', group.dataset.revealVariant || 'up');
            child.style.setProperty('--reveal-delay', `${index * step}ms`);
        });
    });

    // Se activa un poco antes de que el elemento entre a la pantalla: al hacer scroll rápido
    // el contenido ya está apareciendo y no se ven huecos vacíos.
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
    }), { rootMargin: '0px 0px 12% 0px' });

    $$('[data-reveal]').forEach(element => observer.observe(element));
}

/** Números que cuentan desde 0 al entrar en pantalla: <span data-count-to="75">. */
export function initCounters() {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.countTo);
        const start = performance.now();
        const tick = now => {
            const progress = Math.min(1, (now - start) / 1400);
            element.textContent = Math.round(target * (1 - (1 - progress) ** 3)).toLocaleString('es-MX');
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.unobserve(element);
    }), { threshold: 0.6 });
    $$('[data-count-to]').forEach(element => observer.observe(element));
}
