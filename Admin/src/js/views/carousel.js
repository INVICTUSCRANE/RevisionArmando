/** Configurar datos de la empresa › Carrusel principal: hasta 10 elementos que promocionan una grúa o un accesorio. */
import { $, escapeHtml } from '../core/dom.js';
import { matches } from '../core/format.js';
import { readImage } from '../core/image.js';
import { toast } from '../core/toast.js';
import { CAROUSEL_MAX, listSlides, getCarouselProducts, createSlide, updateSlide, deleteSlide } from '../services/admin-api.js';
import { openFormModal, confirmDialog } from '../features/modal.js';
import { wireCounters, value } from '../features/forms.js';
import { imageField, wireImageField } from '../features/image-field.js';
import { panel, addButton, searchBox, rowActions, emptyState, noResults, skeletons, loadError, enterAttrs, animateOut, wireList, byId } from './shared.js';

const TYPE_LABEL = { grua: 'Grúa', accesorio: 'Accesorio' };

const ledMeter = count => `<div class="led-meter" role="img" aria-label="${count} de ${CAROUSEL_MAX} lugares ocupados">
    ${Array.from({ length: CAROUSEL_MAX }, (_, index) => `<span class="${index < count ? 'is-on' : ''}" style="--i:${index}"></span>`).join('')}
</div>`;

const groupByCategory = cranes => cranes.reduce((groups, crane) => ((groups[crane.categoria] ||= []).push(crane), groups), {});

function slideFields(slide, products, total) {
    const positions = slide ? total : total + 1;
    const selectedOrder = slide ? slide.orden : positions;
    const craneOptions = Object.entries(groupByCategory(products.gruas)).map(([category, cranes]) => `
        <optgroup label="${escapeHtml(category)}">${cranes.map(crane => `<option value="${crane.id}" ${slide?.tipo === 'grua' && slide.productoId === crane.id ? 'selected' : ''}>${escapeHtml(crane.nombre)}</option>`).join('')}</optgroup>`).join('');
    const accessoryOptions = products.accesorios.map(item => `<option value="${item.id}" ${slide?.tipo === 'accesorio' && slide.productoId === item.id ? 'selected' : ''}>${escapeHtml(item.nombre)}</option>`).join('');
    return `
        <div data-field-wrap data-field="producto">
            <div class="grid gap-4 sm:grid-cols-2">
                <div>
                    <label class="field-label" for="slideGrua">Grúa</label>
                    <select id="slideGrua" name="gruaId" class="select"><option value="">Seleccionar…</option>${craneOptions}</select>
                </div>
                <div>
                    <label class="field-label" for="slideAccesorio">Accesorio</label>
                    <select id="slideAccesorio" name="accesorioId" class="select"><option value="">Seleccionar…</option>${accessoryOptions}</select>
                </div>
            </div>
        </div>
        <div data-field-wrap>
            <label class="field-label" for="slideOrden">Número de orden</label>
            <select id="slideOrden" name="orden" class="select">
                ${Array.from({ length: positions }, (_, index) => `<option value="${index + 1}" ${index + 1 === selectedOrder ? 'selected' : ''}>${index + 1}${index + 1 === positions && !slide ? ' (al final)' : ''}</option>`).join('')}
            </select>
            <p class="field-hint">Los demás elementos se recorren solos para dejar este lugar libre.</p>
        </div>
        <div class="grid gap-5 sm:grid-cols-2">
        <div data-field-wrap>
            <label class="field-label" for="slideTitulo">Título</label>
            <input id="slideTitulo" name="titulo" class="input" maxlength="60" required placeholder="Ej. Potencia sin límites" value="${escapeHtml(slide?.titulo || '')}" autocomplete="off" data-counter>
        </div>
        <div data-field-wrap>
            <label class="field-label" for="slideSubtitulo">Subtítulo</label>
            <input id="slideSubtitulo" name="subtitulo" class="input" maxlength="90" required placeholder="Ej. Capacidad de hasta 50 toneladas" value="${escapeHtml(slide?.subtitulo || '')}" autocomplete="off" data-counter>
        </div>
        </div>
        ${imageField({ current: slide?.imagen, required: !slide })}`;
}

export function renderCarousel(main) {
    main.innerHTML = panel({
        title: 'Elementos del carrusel',
        sub: '&nbsp;',
        action: addButton('Agregar elemento'),
        body: `${searchBox('Buscar por título, subtítulo o producto…')}<div class="mt-5" data-meter></div><div class="mt-5" data-list></div>`
    });
    const list = $('[data-list]', main);
    const sub = $('[data-sub]', main);
    const add = $('[data-add]', main);
    const state = { items: [], query: '', fresh: null };

    function draw() {
        const full = state.items.length >= CAROUSEL_MAX;
        sub.textContent = `${state.items.length} de ${CAROUSEL_MAX} elementos · vista en miniatura según su orden.`;
        add.disabled = full;
        add.title = full ? `El carrusel admite hasta ${CAROUSEL_MAX} elementos.` : '';
        $('[data-meter]', main).innerHTML = ledMeter(state.items.length);

        const visible = state.items.filter(slide => matches(state.query, slide.titulo, slide.subtitulo, slide.productoNombre, TYPE_LABEL[slide.tipo]));
        if (!state.items.length) { list.innerHTML = emptyState({ title: 'El carrusel está vacío', text: 'Agrega un elemento para mostrarlo en la portada del sitio.', iconName: 'image' }); return; }
        if (!visible.length) { list.innerHTML = noResults(state.query); return; }
        list.innerHTML = `<div class="grid gap-5 @lg:grid-cols-2 @4xl:grid-cols-3">${visible.map((slide, index) => `
            <article ${enterAttrs(index, slide.id === state.fresh)} data-item>
                <div class="slide-media">
                    <span class="slide-order">${slide.orden}</span>
                    <img src="${escapeHtml(slide.imagen)}" alt="" loading="lazy">
                    <div class="absolute inset-x-0 bottom-0 z-[1] p-4 text-white">
                        <h3 class="text-lg leading-tight font-semibold [text-shadow:0_2px_10px_rgb(0_0_0/.6)]">${escapeHtml(slide.titulo)}</h3>
                        <p class="mt-0.5 truncate text-sm text-white/85">${escapeHtml(slide.subtitulo)}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 px-4 py-3.5">
                    <div class="min-w-0 flex-1">
                        <p class="font-display text-xs font-semibold uppercase tracking-[0.16em] text-ink-500 dark:text-ink-400">${TYPE_LABEL[slide.tipo]}</p>
                        <p class="truncate font-semibold text-ink-800 dark:text-ink-100" title="${escapeHtml(slide.productoNombre)}">${escapeHtml(slide.productoNombre)}</p>
                    </div>
                    ${rowActions(slide.id, { compact: true })}
                </div>
            </article>`).join('')}</div>`;
        state.fresh = null;
    }

    async function load() {
        list.innerHTML = `<div class="grid gap-5 @lg:grid-cols-2 @4xl:grid-cols-3">${skeletons(3, 'aspect-[16/13]')}</div>`;
        try { state.items = await listSlides(); draw(); } catch (error) { list.innerHTML = loadError(error.message); }
    }

    async function edit(slide) {
        let products;
        try { products = await getCarouselProducts(); } catch { toast('No se pudieron cargar los productos.', { tone: 'error' }); return; }
        let image;
        const result = await openFormModal({
            title: slide ? 'Editar elemento del carrusel' : 'Nuevo elemento del carrusel',
            intro: 'Elige un producto: una grúa o un accesorio.',
            size: 'lg',
            fields: slideFields(slide, products, state.items.length),
            editing: Boolean(slide),
            isValid: form => Boolean(form.elements.gruaId.value || form.elements.accesorioId.value),
            onMount: (form, { refresh }) => {
                wireCounters(form);
                image = wireImageField(form, { onChange: refresh });
                // Solo un producto: al elegir una grúa se limpia el accesorio y viceversa
                const [crane, accessory] = [form.elements.gruaId, form.elements.accesorioId];
                crane.addEventListener('change', () => { if (crane.value) accessory.value = ''; });
                accessory.addEventListener('change', () => { if (accessory.value) crane.value = ''; });
            },
            onSubmit: async form => {
                const file = image.file();
                const crane = form.elements.gruaId.value;
                const data = {
                    tipo: crane ? 'grua' : 'accesorio',
                    productoId: crane || form.elements.accesorioId.value,
                    orden: Number(form.elements.orden.value),
                    titulo: value(form, 'titulo'),
                    subtitulo: value(form, 'subtitulo'),
                    imagen: file ? await readImage(file) : null   // SERVIDOR REAL: enviar el File en FormData
                };
                return slide ? updateSlide(slide.id, data) : createSlide(data);
            }
        });
        if (!result) return;
        toast(slide ? `«${result.titulo}» actualizado.` : `«${result.titulo}» agregado en el lugar ${result.orden}.`);
        state.fresh = result.id;
        await load();
    }

    wireList(main, {
        onSearch: query => { state.query = query; draw(); },
        onAdd: () => edit(null),
        onEdit: id => edit(byId(state.items, id)),
        onRetry: load,
        onDelete: async (id, node) => {
            const slide = byId(state.items, id);
            const ok = await confirmDialog({
                title: `¿Eliminar «${slide.titulo}»?`,
                message: 'Se quitará del carrusel de la portada y los demás elementos subirán un lugar.',
                action: () => deleteSlide(slide.id)
            });
            if (!ok) return;
            await animateOut(node);
            toast(`«${slide.titulo}» eliminado del carrusel.`);
            await load();
        }
    });
    load();
}
