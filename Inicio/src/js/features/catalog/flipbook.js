/**
 * Libro hojeable con curvatura de hoja real (StPageFlip) y estilo LED.
 * La hoja cambia SOLO con clic: sobre la hoja derecha avanza y sobre la izquierda regresa
 * (en celular, el borde izquierdo de la hoja regresa). No se arrastra ni se desliza con el dedo.
 * Esta capa añade el marco de luz, el lomo LED, la barra de herramientas, el canto de hojas,
 * el centrado de las tapas y el teclado.
 */
import { PageFlip } from 'page-flip';
import { $, $$, prefersReducedMotion } from '../../core/dom.js';
import { icons } from '../../layout/icons.js';

const INTERACTIVE = 'a, button, input, label, select, textarea, [data-go]';

let activeBook = null;

function toolbar({ cart }) {
    const button = (action, icon, label, extra = '') =>
        `<button type="button" class="book-tool ${extra}" data-book="${action}" aria-label="${label}" title="${label}"><span class="size-5">${icons[icon]}</span><span class="hidden lg:inline">${label}</span></button>`;
    return `
        <div class="book-toolbar">
            ${button('prev', 'chevronLeft', 'Anterior')}
            ${button('index', 'list', 'Índice')}
            <div class="flex min-w-0 flex-1 flex-col items-center gap-1.5 px-2">
                <span class="book-counter" aria-live="polite" data-book-counter></span>
                <input type="range" min="1" value="1" class="book-slider" data-book-slider aria-label="Ir a la página">
            </div>
            ${cart ? `<button type="button" class="book-tool is-cart" data-cart-open aria-label="Ver mi carrito" title="Ver mi carrito"><span class="relative size-5">${icons.cart}<span class="book-cart-badge" data-cart-count="0">0</span></span><span class="hidden lg:inline">Carrito</span></button>` : ''}
            ${button('fullscreen', 'expand', 'Pantalla completa', 'hidden sm:inline-flex')}
            ${button('next', 'chevronRight', 'Siguiente')}
        </div>`;
}

/**
 * @param {HTMLElement} root  Contenedor donde se dibuja el libro.
 * @param {string[]} pages    HTML de cada hoja (número par, portada y contraportada duras).
 * @param {{cart?: boolean}} options  `cart`: agrega el botón del carrito a la barra (catálogo de accesorios).
 */
export function createFlipbook(root, pages, { cart = false } = {}) {
    root.classList.add('book');
    root.innerHTML = `
        <div class="book-stage">
            <button type="button" class="book-arrow is-prev" data-book="prev" aria-label="Página anterior"><span class="size-7">${icons.chevronLeft}</span></button>
            <div class="book-frame">
                <div class="book-glow" aria-hidden="true"></div>
                <div class="book-edges" aria-hidden="true"><i class="book-edge is-left"></i><i class="book-edge is-right"></i></div>
                <div class="book-pages">${pages.join('')}</div>
                <div class="book-spine" aria-hidden="true"></div>
                <div class="book-zone is-prev" aria-hidden="true"><span>‹</span></div>
                <div class="book-zone is-next" aria-hidden="true"><span>›</span></div>
            </div>
            <button type="button" class="book-arrow is-next" data-book="next" aria-label="Página siguiente"><span class="size-7">${icons.chevronRight}</span></button>
        </div>
        ${toolbar({ cart })}`;

    const frame = $('.book-frame', root);
    frame.tabIndex = -1;
    const bookEl = $('.book-pages', root);
    const total = pages.length;
    const flip = new PageFlip(bookEl, {
        width: 560,
        height: 740,
        size: 'stretch',
        minWidth: 300,
        maxWidth: 1000,
        minHeight: 396,
        maxHeight: 1322,
        showCover: true,
        maxShadowOpacity: 0.6,
        flippingTime: prefersReducedMotion() ? 300 : 900,
        // Sin arrastre ni deslizamiento: la hoja solo cambia con clic (ver `sideAt`).
        useMouseEvents: false
    });
    flip.loadFromHTML($$('.page', bookEl));
    const block = $('.stf__block', bookEl);

    const counter = $('[data-book-counter]', root);
    const slider = $('[data-book-slider]', root);
    if (slider) slider.max = total;

    const isPortrait = () => flip.getOrientation() === 'portrait';
    const currentIndex = () => flip.getCurrentPageIndex();
    const isFirst = () => currentIndex() === 0;
    const isLast = () => currentIndex() >= total - 1;

    /** Zona visible del libro dentro del marco: una tapa sola, una hoja (celular) o el par abierto. */
    function visibleArea() {
        const rect = flip.getBoundsRect();
        const single = isPortrait() || isFirst() || isLast();
        const startsRight = isPortrait() || isFirst();
        return { rect, single, x: rect.left + (single && startsRight ? rect.pageWidth : 0), width: single ? rect.pageWidth : rect.pageWidth * 2 };
    }

    /** Centra el libro cuando solo se ve una tapa, como un libro cerrado sobre la mesa. */
    function updateLayout() {
        const index = currentIndex();
        const { rect, single, x, width } = visibleArea();
        let shift = 0;
        if (!isPortrait()) shift = isFirst() ? -rect.pageWidth / 2 : isLast() ? rect.pageWidth / 2 : 0;
        frame.style.setProperty('--book-shift', `${shift}px`);
        root.classList.toggle('is-closed', !isPortrait() && (isFirst() || isLast()));
        root.classList.toggle('is-spread', !single);

        // Marco de luz, lomo y zonas de clic siguen a la parte visible del libro.
        frame.style.setProperty('--vis-x', `${x}px`);
        frame.style.setProperty('--vis-w', `${width}px`);
        frame.style.setProperty('--bk-y', `${rect.top}px`);
        frame.style.setProperty('--bk-h', `${rect.height}px`);
        frame.style.setProperty('--page-w', `${rect.pageWidth}px`);
        frame.style.setProperty('--spine-x', `${rect.left + rect.pageWidth}px`);

        // Canto de hojas: más grueso del lado donde quedan más páginas.
        const leftPages = isPortrait() ? 0 : index;
        const rightPages = isPortrait() ? 0 : Math.max(0, total - index - 2);
        frame.style.setProperty('--edge-left', `${Math.min(14, Math.ceil(leftPages / 2))}px`);
        frame.style.setProperty('--edge-right', `${Math.min(14, Math.ceil(rightPages / 2))}px`);
        frame.classList.toggle('has-left-page', !isPortrait() && index > 0);
        frame.classList.toggle('has-right-page', !isPortrait() && index < total - 1);
    }

    function updateControls() {
        const index = currentIndex();
        const first = index + 1;
        const spread = !isPortrait() && index > 0 && index < total - 1;
        const pad = number => String(number).padStart(2, '0');
        counter.textContent = index === 0 ? 'Portada'
            : index >= total - 1 ? 'Contraportada'
            : spread ? `Páginas ${pad(first - (first % 2 === 1 ? 1 : 0))}–${pad(first + (first % 2 === 0 ? 1 : 0))} de ${total}`
            : `Página ${pad(first)} de ${total}`;
        if (slider) slider.value = first;
        $$('[data-book=prev]', root).forEach(button => { button.disabled = index === 0; });
        $$('[data-book=next]', root).forEach(button => { button.disabled = index >= total - 1; });

        // Las hojas visibles reproducen sus animaciones internas (barras, filas del índice).
        $$('.page', bookEl).forEach(page => page.classList.remove('is-visible'));
        const visible = isPortrait() ? [index] : index % 2 === 0 && index > 0 ? [index - 1, index] : [index, index + 1];
        visible.forEach(i => $(`.page[data-page-number="${i + 1}"]`, bookEl)?.classList.add('is-visible'));
    }

    const goToNumber = number => {
        const target = Math.max(0, Math.min(total - 1, number - 1));
        if (target === currentIndex()) return;
        if (prefersReducedMotion()) flip.turnToPage(target); else flip.flip(target);
    };
    const next = () => flip.flipNext('bottom');
    const prev = () => flip.flipPrev('bottom');

    /** ¿El punto cae sobre la parte del libro que regresa o sobre la que avanza? */
    function sideAt(clientX) {
        const { rect } = visibleArea();
        const x = clientX - block.getBoundingClientRect().left - rect.left;
        if (isPortrait()) return x < rect.pageWidth * 1.3 ? 'prev' : 'next';
        return x < rect.pageWidth ? 'prev' : 'next';
    }
    const canGo = side => (side === 'prev' ? !isFirst() : !isLast());

    flip.on('flip', () => { updateLayout(); updateControls(); });
    flip.on('changeOrientation', () => { updateLayout(); updateControls(); });
    flip.on('init', () => { updateLayout(); updateControls(); });
    flip.on('changeState', event => root.classList.toggle('is-flipping', event.data !== 'read'));
    addEventListener('resize', () => requestAnimationFrame(updateLayout));

    // Clic sobre la hoja: avanza o regresa. Los botones y enlaces impresos funcionan normal.
    bookEl.addEventListener('click', event => {
        if (event.target.closest(INTERACTIVE) || !event.target.closest('.page')) return;
        const side = sideAt(event.clientX);
        if (canGo(side)) side === 'prev' ? prev() : next();
    });
    // Al pasar el cursor se ilumina el borde de la hoja que se va a pasar.
    bookEl.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        const side = event.target.closest(INTERACTIVE) || !event.target.closest('.page') ? '' : sideAt(event.clientX);
        frame.dataset.zone = side && canGo(side) ? side : '';
    });
    bookEl.addEventListener('pointerleave', () => { frame.dataset.zone = ''; });

    root.addEventListener('click', event => {
        const go = event.target.closest('[data-go]');
        if (go) {
            // Un botón enfocado dentro de una hoja que gira hace que el navegador desplace la página.
            if (bookEl.contains(go)) frame.focus({ preventScroll: true });
            return goToNumber(Number(go.dataset.go));
        }
        const action = event.target.closest('[data-book]')?.dataset.book;
        if (action === 'next') next();
        else if (action === 'prev') prev();
        else if (action === 'index') goToNumber(2);
        else if (action === 'fullscreen') toggleFullscreen(root);
    });
    slider?.addEventListener('change', () => goToNumber(Number(slider.value)));
    slider?.addEventListener('input', () => { counter.textContent = `Ir a la página ${slider.value} de ${total}`; });

    // Solo el libro más visible responde a las flechas del teclado.
    new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) activeBook = api;
        else if (activeBook === api) activeBook = null;
    }, { threshold: 0.6 }).observe(frame);

    const api = { next, prev, goToNumber, root };
    requestAnimationFrame(() => { updateLayout(); updateControls(); });
    return api;
}

function toggleFullscreen(element) {
    if (document.fullscreenElement) document.exitFullscreen();
    else element.requestFullscreen?.();
}

addEventListener('keydown', event => {
    if (!activeBook || /input|textarea|select/i.test(event.target.tagName)) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); activeBook.next(); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); activeBook.prev(); }
    if (event.key === 'Home') activeBook.goToNumber(1);
});
