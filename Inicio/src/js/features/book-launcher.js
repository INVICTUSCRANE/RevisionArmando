/**
 * Libros cerrados del inicio: al hacer clic (en el libro o en su botón) la tapa se abre
 * en 3D, el libro se acerca y la página lleva al catálogo completo.
 *   <a href="pages/catalogo.html" data-book-launch="gruas"></a>   → dibuja el libro
 *   <a href="pages/catalogo.html" data-book-trigger="gruas">…</a> → botón que lo abre
 * Mientras espera, el libro flota, se mece, sigue al cursor y cada tanto entreabre la tapa
 * dejando ver el índice iluminado. La portada es la misma del catálogo (catalog/cover-art.js).
 * Cada libro solo se anima mientras está en pantalla (clase `is-playing` en su base).
 */
import { $, $$, escapeHtml as esc, prefersReducedMotion } from '../core/dom.js';
import { assetUrl } from '../core/paths.js';
import { ACCESSORIES, ACCESSORY_CATEGORIES, CRANE_LINES, CRANE_LINE_ORDER } from '../data/products.js';
import { accessorySections, craneSections } from './catalog/catalog-content.js';
import { coverFront } from './catalog/cover-art.js';
import { playWhenVisible } from './scenes/play-when-visible.js';

const models = () => Object.values(CRANE_LINES).reduce((sum, line) => sum + line.models.length, 0);

/** Renglones del índice que se asoma al entreabrir la tapa: cada sección con su hoja real del catálogo. */
const sectionRows = sections => sections.map(section => ({ number: section.index + 1, name: section.line?.name ?? section.category.name, page: section.page }));

const BOOKS = {
    gruas: {
        title: 'Grúas de arrastre y salvamento',
        spine: 'Catálogo de grúas',
        index: () => sectionRows(craneSections()),
        chips: () => [`${CRANE_LINE_ORDER.length} líneas de equipo`, `${models()} modelos`]
    },
    accesorios: {
        title: 'Accesorios para grúas',
        spine: 'Catálogo de accesorios',
        index: () => sectionRows(accessorySections()),
        chips: () => [`${ACCESSORY_CATEGORIES.length} categorías · ${ACCESSORIES.length} accesorios`, 'Pedido por WhatsApp']
    }
};

const pad = number => String(number).padStart(2, '0');

const bookMarkup = (kind, { title, spine, index }) => `
    <span class="book3d-body">
        <span class="book3d-back"></span>
        <span class="book3d-spine">
            <img src="${assetUrl('logo-invictus.png')}" alt="">
            <i></i><span>${esc(spine)}</span><i></i>
            <b>2026</b>
        </span>
        <span class="book3d-edge"></span>
        <span class="book3d-bottom"></span>
        <span class="book3d-ribbon"></span>
        <span class="book3d-inside">
            <img src="${assetUrl('logo-invictus.png')}" alt="">
            <span class="book3d-inside-title">Índice</span>
            ${index().map(row => `<span class="book3d-inside-row"><em>${pad(row.number)}</em><span>${esc(row.name)}</span><i></i><b>${pad(row.page)}</b></span>`).join('')}
            <span class="book3d-glow"></span>
        </span>
        <span class="book3d-cover">
            <span class="book3d-front page--right">
                ${coverFront({ kind, year: 2026, title, action: '<span class="cover-open">Abrir catálogo ▶</span>', titleTag: 'span' })}
            </span>
            <span class="book3d-endpaper"></span>
        </span>
    </span>`;

/** Etiquetas tipo HUD que flotan junto al libro, un anillo que gira en la base y motas de luz. */
const standExtras = chips => `
    <span class="book-orbit" aria-hidden="true"><i></i></span>
    <span class="book-motes" aria-hidden="true">${Array.from({ length: 6 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span>
    ${chips.map((text, i) => `<span class="book-chip ${i ? 'is-b' : 'is-a'}" aria-hidden="true"><i></i>${esc(text)}</span>`).join('')}`;

const isLite = () => document.documentElement.classList.contains('is-lite');

function launch(book) {
    if (book.classList.contains('is-opening')) return;
    if (prefersReducedMotion()) { location.href = book.href; return; }
    if (isLite()) {
        // Modo ligero: sin la apertura en 3D, solo el fundido hacia el catálogo
        const curtain = document.createElement('div');
        curtain.className = 'book-curtain';
        document.body.append(curtain);
        requestAnimationFrame(() => curtain.classList.add('is-visible'));
        setTimeout(() => { location.href = book.href; }, 380);
        return;
    }
    book.classList.add('is-opening');
    book.closest('.book-stand')?.classList.add('is-launching');
    const curtain = document.createElement('div');
    curtain.className = 'book-curtain';
    document.body.append(curtain);
    setTimeout(() => curtain.classList.add('is-visible'), 520);
    setTimeout(() => { location.href = book.href; }, 880);
}

/** El libro gira un poco hacia el cursor (solo con mouse). Escribe --tx/--ty entre -1 y 1. */
function followPointer(stand, book) {
    if (!matchMedia('(pointer: fine)').matches || prefersReducedMotion() || isLite()) return;
    let frame = 0;
    stand.addEventListener('pointermove', event => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
            const rect = stand.getBoundingClientRect();
            book.style.setProperty('--tx', (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
            book.style.setProperty('--ty', (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
        });
    });
    stand.addEventListener('pointerleave', () => {
        cancelAnimationFrame(frame);
        book.style.removeProperty('--tx');
        book.style.removeProperty('--ty');
    });
}

export function initBookLaunchers() {
    $$('[data-book-launch]').forEach(book => {
        const kind = book.dataset.bookLaunch;
        const config = BOOKS[kind];
        book.classList.add('book3d');
        book.setAttribute('aria-label', `Abrir ${config.spine.toLowerCase()} 2026`);
        book.innerHTML = bookMarkup(kind, config);
        book.addEventListener('click', event => { event.preventDefault(); launch(book); });
        const stand = book.closest('.book-stand');
        if (stand) {
            stand.insertAdjacentHTML('beforeend', standExtras(config.chips()));
            followPointer(stand, book);
            playWhenVisible(stand, 0);
        }
    });
    $$('[data-book-trigger]').forEach(button => button.addEventListener('click', event => {
        const book = $(`[data-book-launch="${button.dataset.bookTrigger}"]`);
        if (!book) return;
        event.preventDefault();
        book.scrollIntoView({ behavior: 'smooth', block: 'center' });
        launch(book);
    }));
    // Al volver con el botón "atrás", el navegador puede restaurar la página con el libro abierto.
    addEventListener('pageshow', () => {
        $$('.book3d.is-opening').forEach(book => book.classList.remove('is-opening'));
        $$('.book-stand.is-launching').forEach(stand => stand.classList.remove('is-launching'));
        $$('.book-curtain').forEach(curtain => curtain.remove());
    });
}
