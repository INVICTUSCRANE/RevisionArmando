/**
 * Plantillas de las hojas del catálogo (estilo pantalla LED). Cada función devuelve el HTML
 * de UNA hoja; el número de página determina si es hoja izquierda o derecha.
 * Las medidas internas usan unidades `cqw` para escalar con el tamaño del libro.
 * Las hojas de una sección (portadilla y fichas) llevan pestañas en el canto, como un índice de uñero.
 */
import { escapeHtml as esc } from '../../core/dom.js';
import { formatPrice } from '../../core/format.js';
import { assetUrl, pageUrl } from '../../core/paths.js';
import { photoAttrs } from '../../core/photos.js';
import { quoteCraneUrl, whatsappUrl } from '../../core/whatsapp.js';
import { icons, specIcons } from '../../layout/icons.js';
import { coverFront, coverTrim } from './cover-art.js';

const side = number => (number % 2 === 0 ? 'page--left' : 'page--right');
const pad = number => String(number).padStart(2, '0');

/** Trazo técnico de grúa que aparece como marca de agua en cada hoja. */
const BLUEPRINT = `
    <svg class="page-blueprint" viewBox="40 150 670 430" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <rect x="58" y="436" width="410" height="84" rx="6"/><path d="M468 250H628L686 382V520H468Z"/><path d="M510 294H600L638 392H510Z"/>
        <rect x="270" y="400" width="140" height="36"/><path d="M152 178H232L384 402H276Z"/><path d="M154 182V348"/>
        <path d="M154 348C118 348 118 400 156 400C186 400 196 372 190 354"/>
        <circle cx="168" cy="512" r="52"/><circle cx="310" cy="512" r="52"/><circle cx="575" cy="512" r="52"/>
        <circle cx="168" cy="512" r="21"/><circle cx="310" cy="512" r="21"/><circle cx="575" cy="512" r="21"/>
    </svg>`;

/** Detalles de hoja técnica: marcas de registro en las esquinas, regla al pie y folio vertical junto al lomo. */
const decor = number => `
    <span class="page-decor" aria-hidden="true">
        <i class="page-marks"></i><i class="page-ruler"></i>
        <i class="page-serial">Industrias Invictus Crane · Catálogo 2026 · Hoja ${pad(number)}</i>
    </span>`;

/** Pestañas del canto: una por sección; la de la sección actual va encendida. */
const pageTabs = (tabs, activeSlot) => tabs.map(tab => `
    <button type="button" class="page-tab${tab.slot === activeSlot ? ' is-active' : ''}" style="--slot:${tab.slot};--count:${tabs.length}" data-go="${tab.page}" aria-label="Ir a la sección ${esc(tab.label)}" title="${esc(tab.label)}">
        <b>${pad(tab.slot + 1)}</b><span>${esc(tab.label)}</span>
    </button>`).join('');

/** Hoja con encabezado y pie. `tabs`/`activeSlot`: pestañas de sección en el canto. */
function sheet(number, section, content, extraClass = '', { tabs = [], activeSlot = null } = {}) {
    return `
        <div class="page page--sheet ${side(number)} ${extraClass}" data-density="soft" data-page-number="${number}">
            <div class="page-sheet">
                ${decor(number)}
                ${BLUEPRINT}
                ${pageTabs(tabs, activeSlot)}
                <header class="page-head">
                    <img src="${assetUrl('logo-invictus.png')}" alt="" class="page-head-logo">
                    <span>${esc(section)}</span>
                </header>
                <div class="page-content">${content}</div>
                <footer class="page-foot">
                    <button type="button" class="page-foot-index" data-go="2">Índice</button>
                    <span class="page-foot-rule"></span>
                    <span class="page-foot-num">${pad(number)}</span>
                </footer>
            </div>
        </div>`;
}

export function coverPage({ kind, year, title }) {
    return `
        <div class="page page--cover page--right" data-density="hard" data-page-number="1">
            ${coverFront({ kind, year, title, action: '<button type="button" class="cover-open" data-go="2">Abrir catálogo ▶</button>' })}
        </div>`;
}

export function backCoverPage(number) {
    return `
        <div class="page page--cover page--left" data-density="hard" data-page-number="${number}">
            <div class="cover-sheet">
                ${BLUEPRINT}
                ${coverTrim()}
                <img class="cover-logo" src="${assetUrl('logo-invictus.png')}" alt="Industrias Invictus Crane">
                <h2 class="cover-title">Gracias por hojear<br>nuestro catálogo</h2>
                <p class="cover-subtitle">INDUSTRIAS INVICTUS CRANE · 2026</p>
                <div class="cover-actions">
                    <a class="cover-open" target="_blank" rel="noopener" href="${whatsappUrl('Hola, vi el catálogo y quiero información')}">Escribir por WhatsApp</a>
                    <button type="button" class="cover-open is-ghost" data-go="1">Volver a la portada</button>
                </div>
                <div class="cover-hazard" aria-hidden="true"></div>
            </div>
        </div>`;
}

/** Hoja de notas con renglones, como al final de un catálogo impreso. */
export const notesPage = number => sheet(number, 'Notas', `
    <h3 class="page-title">Notas</h3>
    <div class="notes-lines" aria-hidden="true"></div>`);

/**
 * Índice por secciones: una tarjeta por línea/categoría con su número, ícono, resumen y sus productos.
 * cards: [{ index, title, icon, page, meta, entries: [{ name, detail, page }] }]
 */
export function indexPage(number, cards, { tabs = [], hint = '' } = {}) {
    let row = 0;
    return sheet(number, 'Contenido', `
        <h3 class="page-title">Índice</h3>
        ${hint ? `<p class="page-hint">${esc(hint)}</p>` : ''}
        <div class="index-cats${cards.length <= 2 ? ' is-roomy' : ''}">
            ${cards.map(card => `
                <section class="index-cat" style="--i:${row++}">
                    <button type="button" class="index-cat-head" data-go="${card.page}">
                        <span class="index-cat-num">${pad(card.index + 1)}</span>
                        <span class="index-cat-icon">${specIcons[card.icon]}</span>
                        <span class="index-cat-name"><b>${esc(card.title)}</b><small>${esc(card.meta)}</small></span>
                        <span class="index-cat-page">${pad(card.page)}</span>
                    </button>
                    <div class="index-cat-items">
                        ${card.entries.map(entry => `
                            <button type="button" class="index-item" data-go="${entry.page}">
                                <span><b>${esc(entry.name)}</b><small>${esc(entry.detail)}</small></span><i>${pad(entry.page)}</i>
                            </button>`).join('')}
                    </div>
                </section>`).join('')}
        </div>`, 'page--index', { tabs });
}

export const infoPage = (number, section, title, body) => sheet(number, section, `
    <h3 class="page-title">${esc(title)}</h3>
    <div class="page-prose">${body}</div>`);

/** Foto del producto con esquinas de visor; si no carga queda el marco con el logotipo. */
const productPhoto = (photoKey, alt, caption, extra = '') => `
    <figure class="product-photo">
        <span class="product-photo-frame photo-slot"><img ${photoAttrs(photoKey, { alt })} loading="lazy"></span>
        <figcaption>${esc(caption)}</figcaption>
        ${extra}
    </figure>`;

/** Etiqueta de sección sobre el nombre del producto: "01 · Plataformas". */
const sectionChip = (section, label) => `<span class="product-chip"><b>${pad(section.index + 1)}</b>${esc(label)}</span>`;

/**
 * Portadilla de una sección: número grande, nombre, frase, foto de la línea (o el ícono de la
 * categoría), tres datos clave y los productos de la sección con su hoja.
 */
export function sectionPage(number, { index, kicker, title, tagline, icon, photo = '', facts, entries, link = null, tabs = [] }) {
    const thumbs = entries.some(entry => entry.photo);
    const visual = photo ? `
        <figure class="divider-photo">
            <span class="product-photo-frame photo-slot"><img ${photoAttrs(photo, { alt: `Fotografía de la línea ${title}` })} loading="lazy"></span>
        </figure>` : '';
    const list = entries.map(entry => thumbs ? `
        <button type="button" class="divider-thumb" data-go="${entry.page}">
            <span class="divider-thumb-photo photo-slot"><img ${photoAttrs(entry.photo, { alt: '' })} loading="lazy"></span>
            <span class="divider-thumb-copy"><b>${esc(entry.name)}</b><small>${esc(entry.detail)}</small></span><i>${pad(entry.page)}</i>
        </button>` : `
        <button type="button" class="divider-item" data-go="${entry.page}"><b>${esc(entry.name)}</b><small>${esc(entry.detail)}</small><i>${pad(entry.page)}</i></button>`).join('');
    return sheet(number, `Sección ${pad(index + 1)}`, `
        <div class="divider${thumbs ? ' has-thumbs' : ''}">
            <span class="divider-num" aria-hidden="true">${pad(index + 1)}</span>
            <div class="divider-head">
                ${photo ? '' : `<span class="divider-emblem">${specIcons[icon]}</span>`}
                <div>
                    <p class="divider-kicker"><b>${pad(index + 1)}</b>${esc(kicker)}</p>
                    <h3 class="divider-title">${esc(title)}</h3>
                </div>
            </div>
            <p class="divider-tagline">${esc(tagline)}</p>
            ${visual}
            <ul class="divider-facts">${facts.map((fact, i) => `
                <li style="--i:${i}"><i class="spec-row-icon">${specIcons[fact.icon]}</i><span><small>${esc(fact.label)}</small><b>${esc(fact.value)}</b></span></li>`).join('')}
            </ul>
            <p class="divider-list-title"><span>${thumbs ? 'Productos de esta categoría' : 'Modelos de esta línea'}</span>${link ? `<a class="divider-link" href="${link.href}">${esc(link.label)} →</a>` : ''}</p>
            <div class="divider-list">${list}</div>
        </div>`, 'page--divider', { tabs, activeSlot: index });
}

/** Ficha de una grúa: foto, nombre, especificaciones con su ícono LED y botones. */
export function cranePage(number, line, item, section) {
    const specs = line.specLabels.map((label, index) => `
        <li class="spec-row has-icon" style="--i:${index}"><i class="spec-row-icon">${specIcons[line.specIcons[index]]}</i><span>${esc(label)}</span><b>${esc(item.specs[index])}</b></li>`).join('');
    return sheet(number, line.name, `
        <div class="product-layout">
            ${productPhoto(line.photo, `Fotografía de grúa ${item.model}`, `Imagen ilustrativa · Modelo ${item.model}`)}
            ${sectionChip(section, line.name)}
            <h3 class="product-name">${esc(item.model)}</h3>
            <p class="product-desc">${esc(item.description)}</p>
            <ul class="spec-list">${specs}</ul>
            <div class="page-actions">
                <a class="page-btn is-primary" target="_blank" rel="noopener" href="${quoteCraneUrl(item.model, line.name)}">Cotizar por WhatsApp</a>
                <a class="page-btn is-link" href="${pageUrl(line.page)}">Ver más de ${esc(line.name)} →</a>
            </div>
        </div>`, 'page--product', { tabs: section.tabs, activeSlot: section.index });
}

/** Ficha de un accesorio con etiqueta de precio y botón para agregarlo al carrito. */
export function accessoryPage(number, item, section) {
    const price = `<span class="price-tag"><small>Precio</small>${formatPrice(item.price)}<small>MXN · IVA incluido</small></span>`;
    return sheet(number, section.category.name, `
        <div class="product-layout">
            ${productPhoto(item.photo, `Fotografía de ${item.name}`, `Imagen ilustrativa · ${item.name}`, price)}
            ${sectionChip(section, section.category.name)}
            <h3 class="product-name is-long">${esc(item.name)}</h3>
            <p class="product-desc">${esc(item.description)}</p>
            <ul class="spec-list">
                <li class="spec-row"><span>Precio</span><b>${formatPrice(item.price)} MXN</b></li>
                <li class="spec-row"><span>Impuestos</span><b>IVA incluido</b></li>
            </ul>
            <div class="page-actions">
                <button type="button" class="page-btn is-primary is-cart" data-add-to-cart="${item.id}"><span class="page-btn-icon">${icons.cart}</span><span data-add-label>Agregar al carrito</span></button>
                <a class="page-btn" target="_blank" rel="noopener" href="${whatsappUrl(`Hola, tengo una duda sobre el accesorio ${item.name}`)}">Preguntar por WhatsApp</a>
                <button type="button" class="page-btn is-link" data-cart-open>Ver mi carrito →</button>
            </div>
        </div>`, 'page--product page--accessory', { tabs: section.tabs, activeSlot: section.index });
}
