/** Carrusel del inicio: cambia cada 6.5 s, se pausa al pasar el cursor y admite deslizar en móvil. */
import { $, $$, replayClass } from '../core/dom.js';

const INTERVAL = 6500;

export function initHeroSlider() {
    const hero = $('[data-hero]');
    if (!hero) return;
    const slides = $$('[data-slide]', hero);
    const dots = $('[data-hero-dots]', hero);
    const counter = $('[data-hero-counter]', hero);
    const pad = number => String(number).padStart(2, '0');
    let current = 0;
    let timer;

    dots.innerHTML = slides.map((_, index) => `<button type="button" class="hero-dot" aria-label="Ver diapositiva ${index + 1}"><i></i></button>`).join('');
    const dotButtons = $$('button', dots);

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
            slide.classList.toggle('is-active', i === current);
            slide.setAttribute('aria-hidden', String(i !== current));
        });
        dotButtons.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
        if (counter) counter.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
        restart();
    }
    function restart() {
        clearInterval(timer);
        timer = setInterval(() => show(current + 1), INTERVAL);
    }

    dotButtons.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
    $('[data-hero-prev]', hero).addEventListener('click', () => show(current - 1));
    $('[data-hero-next]', hero).addEventListener('click', () => show(current + 1));
    hero.addEventListener('mouseenter', () => clearInterval(timer));
    hero.addEventListener('mouseleave', () => { replayClass(dotButtons[current], 'is-active'); restart(); });

    let startX = null;
    hero.addEventListener('touchstart', event => { startX = event.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', event => {
        if (startX === null) return;
        const dx = event.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
        startX = null;
    }, { passive: true });

    // Paralaje suave del fondo con el movimiento del cursor (una vez por cuadro y solo en las fotos,
    // para no recalcular los estilos de todo el carrusel en cada movimiento).
    const photos = $$('.hero-photo', hero);
    let frame = 0;
    hero.addEventListener('pointermove', event => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
            frame = 0;
            const rect = hero.getBoundingClientRect();
            const mx = ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3);
            const my = ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3);
            photos.forEach(photo => { photo.style.setProperty('--mx', mx); photo.style.setProperty('--my', my); });
        });
    });

    show(0);
}
