/**
 * Arma la lista ordenada de hojas de cada catálogo a partir de los datos de productos.
 * Cada línea (o categoría de accesorios) abre con su portadilla y luego siguen sus fichas;
 * el índice muestra una tarjeta por sección. Un libro con portada necesita un número par de hojas:
 * si sobra una, se agrega una hoja de notas.
 */
import { pageUrl } from '../../core/paths.js';
import { whatsappUrl } from '../../core/whatsapp.js';
import { formatPrice, specRange } from '../../core/format.js';
import { ACCESSORIES, ACCESSORY_CATEGORIES, CRANE_LINES, CRANE_LINE_ORDER } from '../../data/products.js';
import { accessoryPage, backCoverPage, coverPage, cranePage, indexPage, infoPage, notesPage, sectionPage } from './page-templates.js';

const actions = links => `<div class="page-actions">${links}</div>`;
const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

/** Inserta una hoja de notas antes de la contraportada si el total es impar. */
function closeBook(pages, nextNumber) {
    if ((nextNumber) % 2 === 1) pages.push(notesPage(nextNumber++));
    pages.push(backCoverPage(nextNumber));
    return pages;
}

/**
 * Secciones del catálogo de grúas con su número de hoja: portadilla en `page` y cada modelo después.
 * También la usa el libro 3D del inicio para su índice.
 */
export function craneSections(firstPage = 4) {
    let page = firstPage;
    return CRANE_LINE_ORDER.map((id, index) => {
        const line = CRANE_LINES[id];
        return { index, line, page: page++, entries: line.models.map(item => ({ item, page: page++ })) };
    });
}

/** Secciones del catálogo de accesorios (una por categoría), igual que `craneSections`. */
export function accessorySections(firstPage = 4) {
    let page = firstPage;
    return ACCESSORY_CATEGORIES.map((category, index) => ({
        index,
        category,
        page: page++,
        entries: ACCESSORIES.filter(item => item.category === category.id).map(item => ({ item, page: page++ }))
    }));
}

/** Pestañas del canto (una por sección). Cada sección las guarda para dibujarlas en sus hojas. */
function withTabs(sections) {
    const tabs = sections.map(section => ({ slot: section.index, label: section.line?.name ?? section.category.name, page: section.page }));
    sections.forEach(section => { section.tabs = tabs; });
    return tabs;
}

export function craneCatalogPages() {
    const sections = craneSections();
    const tabs = withTabs(sections);
    const card = section => ({
        index: section.index,
        title: section.line.name,
        icon: section.line.icon,
        page: section.page,
        meta: `${plural(section.entries.length, 'modelo', 'modelos')} · ${specRange(section.line.models.map(item => item.specs[0]))}`,
        entries: section.entries.map(entry => ({ name: entry.item.model, detail: entry.item.specs[0], page: entry.page }))
    });

    const pages = [coverPage({ kind: 'gruas', year: 2026, title: 'Grúas de arrastre y salvamento' })];
    const half = Math.ceil(sections.length / 2);
    pages.push(
        indexPage(2, sections.slice(0, half).map(card), { tabs, hint: 'Elige una línea o un modelo para ir directo a su hoja' }),
        indexPage(3, sections.slice(half).map(card), { tabs, hint: 'Cada línea empieza con su hoja de presentación y sigue con sus modelos' })
    );

    sections.forEach(section => {
        const { line } = section;
        pages.push(sectionPage(section.page, {
            index: section.index,
            kicker: 'Línea de equipos',
            title: line.name,
            tagline: line.tagline,
            icon: line.icon,
            photo: line.photo,
            facts: line.specLabels.map((label, i) => ({ icon: line.specIcons[i], label, value: specRange(line.models.map(item => item.specs[i])) })),
            entries: section.entries.map(entry => ({ name: entry.item.model, detail: entry.item.specs[0], page: entry.page })),
            link: { href: pageUrl(line.page), label: `Ver la línea ${line.name}` },
            tabs
        }));
        section.entries.forEach(entry => pages.push(cranePage(entry.page, line, entry.item, section)));
    });

    let number = sections.at(-1).entries.at(-1).page + 1;
    pages.push(infoPage(number++, 'Nosotros', 'Industrias Invictus Crane', `
        <p>Somos una empresa orgullosamente mexicana dedicada al diseño y fabricación de grúas de arrastre y salvamento.</p>
        <p>Nuestro compromiso es ofrecer equipos de alto desempeño, componentes certificados y un servicio profesional a cada cliente.</p>
        ${actions(`<a class="page-btn is-primary" href="${pageUrl('nosotros.html')}">Conocer más de nosotros</a><a class="page-btn" href="${pageUrl('reparaciones.html')}">Solicitar una reparación</a>`)}`));
    pages.push(infoPage(number++, 'Cotizaciones', 'Cotiza tu equipo', `
        <p>Los equipos se cotizan por WhatsApp. Cuéntanos qué necesitas y te ayudamos a elegir el modelo adecuado.</p>
        ${actions(`<a class="page-btn is-primary" target="_blank" rel="noopener" href="${whatsappUrl('Hola, quiero cotizar una grúa')}">Cotizar por WhatsApp</a><a class="page-btn" href="${pageUrl('contacto.html')}">Ir a contacto</a><a class="page-btn is-link" href="${pageUrl('accesorios.html')}">Ver accesorios en línea →</a>`)}`));
    return closeBook(pages, number);
}

export function accessoryCatalogPages() {
    const sections = accessorySections();
    const tabs = withTabs(sections);
    const pages = [coverPage({ kind: 'accesorios', year: 2026, title: 'Accesorios para grúas' })];

    pages.push(indexPage(2, sections.map(section => ({
        index: section.index,
        title: section.category.name,
        icon: section.category.icon,
        page: section.page,
        meta: plural(section.entries.length, 'accesorio', 'accesorios'),
        entries: section.entries.map(entry => ({ name: entry.item.name, detail: `${formatPrice(entry.item.price)} MXN`, page: entry.page }))
    })), { tabs, hint: 'Elige una categoría o un accesorio para ir directo a su hoja' }));
    pages.push(infoPage(3, 'Tienda en línea', 'Cómo comprar', `
        <ol class="steps-list">
            <li><b>Crea tu cuenta.</b> Es necesaria para comprar accesorios.</li>
            <li><b>Elige tus accesorios.</b> En la ficha del producto pulsa «Agregar al carrito».</li>
            <li><b>Revisa tu carrito</b> y finaliza tu compra. Todos los precios incluyen IVA.</li>
        </ol>
        ${actions(`<a class="page-btn is-primary" href="${pageUrl('cuenta.html')}?next=accesorios.html#registro">Crear mi cuenta</a>`)}`));

    sections.forEach(section => {
        const { category } = section;
        const prices = section.entries.map(entry => entry.item.price);
        pages.push(sectionPage(section.page, {
            index: section.index,
            kicker: 'Categoría de accesorios',
            title: category.name,
            tagline: category.tagline,
            icon: category.icon,
            facts: [
                { icon: category.icon, label: 'Productos', value: plural(section.entries.length, 'accesorio', 'accesorios') },
                { icon: 'tag', label: 'Precios', value: prices.length > 1 ? `${formatPrice(Math.min(...prices))} – ${formatPrice(Math.max(...prices))}` : formatPrice(prices[0]) },
                { icon: 'cart', label: 'Compra', value: 'En línea · IVA incluido' }
            ],
            entries: section.entries.map(entry => ({ name: entry.item.name, detail: `${formatPrice(entry.item.price)} MXN`, page: entry.page, photo: entry.item.photo })),
            tabs
        }));
        section.entries.forEach(entry => pages.push(accessoryPage(entry.page, entry.item, section)));
    });

    let number = sections.at(-1).entries.at(-1).page + 1;
    pages.push(infoPage(number++, 'Ayuda', '¿No ves lo que buscas?', `
        <p>Escríbenos y te ayudamos a encontrar el accesorio adecuado para tu equipo.</p>
        ${actions(`<a class="page-btn is-primary" target="_blank" rel="noopener" href="${whatsappUrl('Hola, busco un accesorio que no veo en el catálogo')}">Escribir por WhatsApp</a><a class="page-btn" href="${pageUrl('catalogo.html')}">Ver catálogo de grúas</a>`)}`));
    pages.push(infoPage(number++, 'Tu compra', 'Tu carrito', `
        <p>Aquí puedes revisar los accesorios que agregaste y terminar tu compra.</p>
        ${actions(`<button type="button" class="page-btn is-primary" data-cart-open>Abrir mi carrito</button><button type="button" class="page-btn" data-go="2">Volver al índice</button>`)}`));
    return closeBook(pages, number);
}
