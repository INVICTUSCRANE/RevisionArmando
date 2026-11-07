/**
 * Página de una línea de grúas (Plataformas, Rescate, Wheel Lift, Underlift).
 * Se monta en <main data-equipment="rescate"> con los datos de products.js.
 * Al elegir un modelo, la foto y la ficha entran cayendo desde arriba, un haz de luz escanea la foto
 * y las especificaciones se encienden como paneles LED: el ícono se dibuja y la cifra corre hasta su valor.
 * Abajo, la línea de ensamble arma solo grúas de esa línea.
 */
import { $, $$, escapeHtml as esc, prefersReducedMotion, replayClass } from '../core/dom.js';
import { splitSpec } from '../core/format.js';
import { pageUrl } from '../core/paths.js';
import { photoAttrs } from '../core/photos.js';
import { quoteCraneUrl } from '../core/whatsapp.js';
import { CRANE_LINES } from '../data/products.js';
import { icons, specIcons } from '../layout/icons.js';

const header = line => `
    <section class="page-hero text-center">
        <img ${photoAttrs(line.photo, { alt: '' })} class="page-hero-photo">
        <div class="page-hero-shade"></div>
        <div data-ambient data-sparks="8" class="absolute inset-0 -z-10"></div>
        <p class="eyebrow-led mx-auto w-fit">Equipos Invictus</p>
        <h1 class="drop-in">Grúas <span class="neon-word">${esc(line.name)}</span></h1>
        <p class="mx-auto mt-4 max-w-xl px-4 text-lg text-ink-300">${line.models.length} modelos: ${esc(line.models.map(item => item.model).join(' · '))}</p>
    </section>`;

const stage = () => `
    <section class="relative -mt-16 pb-14">
        <div class="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:px-8">
            <div class="viewer-photo photo-slot hud-corners group" data-viewer-photo></div>
            <article class="viewer-card" data-viewer-card aria-live="polite"></article>
        </div>
        <div class="mx-auto mt-5 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex snap-x gap-3 overflow-x-auto pb-2" role="tablist" aria-label="Modelos" data-viewer-tabs></div>
        </div>
    </section>`;

/** Línea de ensamble con grúas de esta línea (features/scenes/assembly-line.js). */
const scene = line => `
    <section class="relative isolate overflow-hidden bg-ink-950 pt-16 text-white">
        <div data-ambient data-sparks="6" class="absolute inset-0 -z-10"></div>
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-reveal>
            <p class="eyebrow-led">Planta Invictus</p>
            <h2 class="section-title is-light mt-4">Así armamos la línea <span class="neon-text">${esc(line.name)}</span></h2>
        </div>
        <div data-scene="assembly" data-line="${line.id}" class="mt-2 h-[clamp(240px,26vw,560px)]"></div>
    </section>`;

function photoMarkup(line, item) {
    return `
        <img ${photoAttrs(line.photo, { alt: `Fotografía de grúa ${item.model}` })} class="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105">
        <div class="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent"></div>
        <span class="viewer-scan" aria-hidden="true"></span>
        <span class="line-card-chip absolute left-6 top-6">${esc(line.name)}</span>
        <p class="absolute bottom-6 left-6 font-display text-7xl font-bold uppercase text-white/95 drop-shadow-xl sm:text-8xl [text-shadow:0_0_24px_rgb(61_255_180/.45)]">${esc(item.model)}</p>`;
}

function cardMarkup(line, item) {
    const specs = line.specLabels.map((label, index) => {
        const { number, unit } = splitSpec(item.specs[index]);
        return `
            <li class="spec-tile" style="--i:${index}">
                <span class="sr-only">${esc(label)}: ${esc(item.specs[index])}</span>
                <span class="spec-tile-icon" aria-hidden="true">${specIcons[line.specIcons[index]]}</span>
                <span class="spec-tile-copy" aria-hidden="true">
                    <b class="spec-tile-value">${number ? `<span data-spec-count="${esc(number)}">${esc(number)}</span>` : ''}<small>${esc(unit)}</small></b>
                    <span class="spec-tile-label">${esc(label)}</span>
                </span>
            </li>`;
    }).join('');
    return `
        <p class="eyebrow !text-brand-600">Modelo</p>
        <h2 class="font-display text-5xl font-bold uppercase text-ink-900">${esc(item.model)}</h2>
        <p class="mt-2 text-lg text-ink-600">${esc(item.description)}</p>
        <ul class="spec-tiles" aria-label="Especificaciones">${specs}</ul>
        <div class="mt-7 flex flex-wrap gap-3">
            <a class="btn btn-primary" target="_blank" rel="noopener" href="${quoteCraneUrl(item.model, line.name)}"><span class="size-5">${icons.whatsapp}</span> Cotizar por WhatsApp</a>
            <a class="btn btn-ghost-dark" href="${pageUrl('catalogo.html')}">Ver en el catálogo</a>
        </div>`;
}

/** Cada cifra corre desde 0 hasta su valor (mismo formato: miles con coma y decimales) y al llegar destella. */
function countSpecs(card) {
    if (prefersReducedMotion()) return;
    const run = (Number(card.dataset.run) || 0) + 1;
    card.dataset.run = run;
    $$('[data-spec-count]', card).forEach((element, index) => {
        const text = element.dataset.specCount;
        const target = Number(text.replace(/,/g, ''));
        const decimals = (text.split('.')[1] || '').length;
        const format = value => value.toLocaleString('es-MX', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: text.includes(',') });
        const tile = element.closest('.spec-tile');
        const delay = 420 + index * 140;
        const duration = 1100;
        element.textContent = format(0);
        const start = performance.now() + delay;
        const tick = now => {
            if (card.dataset.run !== String(run)) return;
            const progress = Math.max(0, Math.min(1, (now - start) / duration));
            element.textContent = format(target * (1 - (1 - progress) ** 4));
            if (progress < 1) requestAnimationFrame(tick);
            else { element.textContent = text; tile.classList.add('is-lit'); }
        };
        requestAnimationFrame(tick);
    });
}

export function initEquipmentViewer() {
    const main = $('[data-equipment]');
    if (!main) return;
    const line = CRANE_LINES[main.dataset.equipment];
    main.innerHTML = header(line) + stage() + scene(line);

    const tabs = $('[data-viewer-tabs]', main);
    tabs.innerHTML = line.models.map((item, index) => `
        <button type="button" role="tab" class="model-tab drop-in" style="--drop-delay:${300 + index * 80}ms">
            <span class="photo-slot size-14 shrink-0 rounded-xl"><img ${photoAttrs(line.photo, { alt: '' })}></span>
            <span class="text-left"><b class="block font-display text-xl uppercase">${esc(item.model)}</b><small class="text-ink-500">${esc(item.specs[0])}</small></span>
        </button>`).join('');

    const photo = $('[data-viewer-photo]', main);
    const card = $('[data-viewer-card]', main);
    const show = index => {
        const item = line.models[index];
        photo.innerHTML = photoMarkup(line, item);
        card.innerHTML = cardMarkup(line, item);
        // Foto y ficha caen desde arriba cada vez que se elige un modelo.
        replayClass(photo, 'drop-in');
        replayClass(card, 'drop-in');
        $$('[role=tab]', tabs).forEach((tab, i) => tab.setAttribute('aria-selected', String(i === index)));
        countSpecs(card);
    };

    $$('[role=tab]', tabs).forEach((tab, index) => tab.addEventListener('click', () => show(index)));
    show(0);
}
