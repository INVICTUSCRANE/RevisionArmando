/**
 * Cotizaciones y reparaciones › Solicitudes de cotizaciones y Solicitudes de reparaciones.
 * Llegan desde el sitio público, así que aquí solo se consultan y se eliminan.
 * Las de reparación traen un mensaje que se abre en un cuadro aparte.
 */
import { $, escapeHtml } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { plural, matches, formatDateTime } from '../core/format.js';
import { toast } from '../core/toast.js';
import { listQuoteRequests, deleteQuoteRequest, listRepairRequests, deleteRepairRequest } from '../services/admin-api.js';
import { confirmDialog, openInfoModal } from '../features/modal.js';
import { panel, searchBox, emailHtml, emptyState, noResults, skeletons, loadError, animateOut, wireList, byId, dataTable } from './shared.js';

const displayName = request => request.registrado || request.nombre
    ? `${request.nombre} ${request.apellidos}`.trim()
    : 'Anónimo';
const emailOf = request => request.correo || 'Usuario no registrado';
const emailCell = request => request.correo
    ? emailHtml(request.correo)
    : '<span class="italic text-ink-400 dark:text-ink-500">Usuario no registrado</span>';
const registryBadge = request => request.registrado
    ? '<span class="badge is-led" data-tone="ok">Registrado</span>'
    : '<span class="badge" data-tone="muted">No registrado</span>';
const deleteButton = id =>
    `<button type="button" class="btn btn-ghost is-danger btn-sm" data-delete="${id}" title="Eliminar">${icon('trash')}<span class="btn-text">Eliminar</span></button>`;

const KINDS = {
    quote: {
        title: 'Solicitudes de cotizaciones',
        search: 'Buscar por usuario, correo, fecha o grúa…',
        list: listQuoteRequests,
        remove: deleteQuoteRequest,
        empty: 'Aún no llegan solicitudes de cotización',
        fields: request => [displayName(request), request.correo, formatDateTime(request.fecha), request.grua.nombre],
        head: '<th>Usuario</th><th>Correo</th><th>Registro</th><th>Fecha de solicitud</th><th>Grúa</th>',
        cells: request => `
            <td data-first><span class="cell-strong">${escapeHtml(displayName(request))}</span></td>
            <td data-label="Correo" class="cell-email">${emailCell(request)}</td>
            <td data-label="Registro" data-aside>${registryBadge(request)}</td>
            <td data-label="Fecha" class="whitespace-nowrap">${escapeHtml(formatDateTime(request.fecha))}</td>
            <td data-label="Grúa">
                <div class="cell-media">
                    <span class="crane-thumb">${request.grua.imagen ? `<img src="${escapeHtml(request.grua.imagen)}" alt="" loading="lazy">` : ''}</span>
                    <span class="font-semibold whitespace-nowrap text-ink-800 dark:text-ink-100">${escapeHtml(request.grua.nombre)}</span>
                </div>
            </td>
            <td data-keep><div class="row-actions">${deleteButton(request.id)}</div></td>`
    },
    repair: {
        title: 'Solicitudes de reparaciones',
        search: 'Buscar por usuario, correo o fecha…',
        list: listRepairRequests,
        remove: deleteRepairRequest,
        empty: 'Aún no llegan solicitudes de reparación',
        fields: request => [displayName(request), request.correo, formatDateTime(request.fecha)],
        head: '<th>Nombre</th><th>Apellidos</th><th>Correo</th><th>Registro</th><th>Fecha de solicitud</th><th>Mensaje</th>',
        cells: request => `
            <td data-first><span class="cell-strong">${escapeHtml(request.registrado || request.nombre ? request.nombre : 'Anónimo')}</span></td>
            <td data-label="Apellidos">${escapeHtml(request.apellidos || '—')}</td>
            <td data-label="Correo" class="cell-email">${emailCell(request)}</td>
            <td data-label="Registro" data-aside>${registryBadge(request)}</td>
            <td data-label="Fecha" class="whitespace-nowrap">${escapeHtml(formatDateTime(request.fecha))}</td>
            <td data-label="Mensaje">
                <button type="button" class="btn btn-ghost btn-sm" data-message="${request.id}" title="Ver mensaje">${icon('message')}<span class="btn-text">Ver mensaje</span></button>
            </td>
            <td data-keep><div class="row-actions">${deleteButton(request.id)}</div></td>`
    }
};

function showMessage(request) {
    openInfoModal({
        title: 'Mensaje del cliente',
        body: `
            <div class="flex items-center gap-3">
                <span class="avatar-sm">${icon('message', 'size-4')}</span>
                <div class="min-w-0">
                    <p class="font-semibold text-ink-900 dark:text-white">${escapeHtml(displayName(request))}
                        <span class="ml-1 align-middle">${registryBadge(request)}</span></p>
                    <p class="text-sm text-ink-500 dark:text-ink-400">${escapeHtml(emailOf(request))} · ${escapeHtml(formatDateTime(request.fecha))}</p>
                </div>
            </div>
            <blockquote class="quote-block mt-5 whitespace-pre-line">${escapeHtml(request.mensaje)}</blockquote>`
    });
}

function renderRequests(kind, main) {
    const config = KINDS[kind];
    main.innerHTML = panel({
        title: config.title,
        sub: '&nbsp;',
        body: `
            <div class="filters">
                ${searchBox(config.search)}
                <select class="select is-wide" data-registry aria-label="Filtrar por registro">
                    <option value="">Registrados y no registrados</option>
                    <option value="1">Solo registrados</option>
                    <option value="0">Solo no registrados</option>
                </select>
            </div>
            <div class="mt-5" data-list></div>`
    });
    const list = $('[data-list]', main);
    const sub = $('[data-sub]', main);
    const registry = $('[data-registry]', main);
    const state = { items: [], query: '' };

    function draw() {
        sub.textContent = `${plural(state.items.length, 'solicitud recibida', 'solicitudes recibidas')}. Solo puedes consultarlas o eliminarlas.`;
        const visible = state.items.filter(request =>
            (!registry.value || String(Number(request.registrado)) === registry.value)
            && matches(state.query, ...config.fields(request)));
        if (!state.items.length) { list.innerHTML = emptyState({ title: config.empty, text: 'Aparecerán aquí en cuanto alguien las envíe desde el sitio.', iconName: 'clipboard' }); return; }
        if (!visible.length) { list.innerHTML = state.query ? noResults(state.query) : emptyState({ title: 'Ninguna solicitud coincide con ese filtro', iconName: 'clipboard' }); return; }
        list.innerHTML = dataTable({
            head: `${config.head}<th><span class="sr-only">Acciones</span></th>`,
            rows: visible.map((request, index) => `
                <tr class="enter" style="--i:${index}" data-item data-id="${request.id}">${config.cells(request)}</tr>`).join('')
        });
    }

    async function load() {
        list.innerHTML = `<div class="space-y-3">${skeletons(4, 'h-16')}</div>`;
        try { state.items = await config.list(); draw(); } catch (error) { list.innerHTML = loadError(error.message); }
    }

    list.addEventListener('click', event => {
        const button = event.target.closest('[data-message]');
        if (button) showMessage(byId(state.items, button.dataset.message));
    });
    registry.addEventListener('change', draw);
    wireList(main, {
        onSearch: query => { state.query = query; draw(); },
        onRetry: load,
        onDelete: async (id, node) => {
            const request = byId(state.items, id);
            const ok = await confirmDialog({
                title: '¿Eliminar esta solicitud?',
                message: `La solicitud de ${displayName(request)} del ${formatDateTime(request.fecha)} se borrará y no se podrá recuperar.`,
                action: () => config.remove(request.id)
            });
            if (!ok) return;
            await animateOut(node);
            toast('Se eliminó la solicitud.');
            await load();
        }
    });
    load();
}

export const renderQuoteRequests = main => renderRequests('quote', main);
export const renderRepairRequests = main => renderRequests('repair', main);
