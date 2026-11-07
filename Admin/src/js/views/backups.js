/**
 * Respaldar base de datos › Historial de respaldos.
 * Arriba, dos tarjetas: generar un respaldo (con confirmación) y restaurar uno anterior por fecha
 * (con confirmación reforzada: hay que escribir RESTAURAR). Abajo, el historial de operaciones.
 * Mientras una operación corre, la pantalla consulta su estado cada segundo.
 */
import { $, escapeHtml } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { plural, matches, formatDateTime } from '../core/format.js';
import { toast } from '../core/toast.js';
import { listBackupOperations, getBackupOperation, startBackup, startRestore } from '../services/admin-api.js';
import { openFormModal, confirmDialog } from '../features/modal.js';
import { currentUserName } from '../features/session.js';
import { panel, searchBox, emptyState, noResults, skeletons, loadError, dataTable, wireSearch } from './shared.js';

const CONFIRM_WORD = 'RESTAURAR';
const POLL_MS = 1000;

const OPERATIONS = { respaldar: 'Respaldo', restaurar: 'Restauración' };
const ORIGINS = { automatica: 'Automática', manual: 'Manual' };
const STATES = {
    exitoso: '<span class="badge is-led" data-tone="ok">Exitoso</span>',
    error: `<span class="badge" data-tone="error">${icon('alert', 'size-4')}Error</span>`,
    en_proceso: '<span class="badge" data-tone="busy">En proceso</span>'
};

const restorable = items => items.filter(item => item.operacion === 'respaldar' && item.estado === 'exitoso');

const cardIcon = (name, danger) => `
    <span class="grid size-12 shrink-0 place-items-center rounded-2xl ${danger
        ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300 dark:ring-1 dark:ring-red-400/30'
        : 'bg-brand-50 text-brand-600 dark:bg-neon/10 dark:text-neon dark:ring-1 dark:ring-neon/30'}">${icon(name, 'size-6')}</span>`;

function rowHtml(item, index, fresh) {
    const restoredFrom = item.operacion === 'restaurar' && item.respaldoOrigen
        ? `<span class="block text-sm text-ink-500 dark:text-ink-400">Del respaldo del ${escapeHtml(formatDateTime(item.respaldoOrigen))}</span>` : '';
    return `
        <tr class="enter ${fresh ? 'is-fresh' : ''}" style="--i:${index}" data-item data-id="${item.id}">
            <td data-first data-label="Fecha de inicio" class="whitespace-nowrap"><span class="cell-strong">${escapeHtml(formatDateTime(item.inicio))}</span></td>
            <td data-label="Fecha de fin" class="whitespace-nowrap">${item.fin ? escapeHtml(formatDateTime(item.fin)) : '<span class="text-ink-400">En curso…</span>'}</td>
            <td data-label="Operación">
                <span class="inline-flex items-center gap-2 font-semibold text-ink-800 dark:text-ink-100">
                    ${icon(item.operacion === 'restaurar' ? 'restore' : 'database', `size-4 ${item.operacion === 'restaurar' ? 'text-red-500 dark:text-red-300' : 'text-brand-600 dark:text-neon'}`)}
                    ${OPERATIONS[item.operacion]}
                </span>${restoredFrom}
            </td>
            <td data-label="Origen">${ORIGINS[item.origen] || escapeHtml(item.origen)}</td>
            <td data-label="Usuario">${escapeHtml(item.usuario)}</td>
            <td data-label="Estado" data-aside>${STATES[item.estado] || escapeHtml(item.estado)}</td>
        </tr>`;
}

export function renderBackups(main) {
    main.innerHTML = `
        <div class="grid gap-6 @4xl:grid-cols-2">
            <section class="action-card enter" style="--i:0" data-card="respaldar">
                <div class="card-line neon-topline"></div>
                <div class="flex items-start gap-4">
                    ${cardIcon('database')}
                    <div class="min-w-0">
                        <h2 class="panel-title">Generar respaldo</h2>
                        <p class="panel-sub">Guarda una copia completa de la base de datos en este momento. El sistema también hace uno automático cada noche.</p>
                    </div>
                </div>
                <div class="mt-6" data-progress hidden></div>
                <div class="mt-6 flex justify-end" data-controls>
                    <button type="button" class="btn btn-primary" data-backup>${icon('database')}Generar respaldo</button>
                </div>
            </section>

            <section class="action-card enter" style="--i:1" data-card="restaurar">
                <div class="card-line is-danger"></div>
                <div class="flex items-start gap-4">
                    ${cardIcon('restore', true)}
                    <div class="min-w-0">
                        <h2 class="panel-title">Restaurar base de datos</h2>
                        <p class="panel-sub">Regresa la información al estado de un respaldo anterior. Lo que se haya cambiado después se pierde.</p>
                    </div>
                </div>
                <div class="mt-6" data-progress hidden></div>
                <div class="mt-6 flex flex-col gap-3 @sm:flex-row @sm:items-end" data-controls>
                    <div class="min-w-0 flex-1">
                        <label class="field-label" for="restoreDate">Fecha del respaldo</label>
                        <select id="restoreDate" class="select" data-restore-date disabled><option value="">Cargando…</option></select>
                    </div>
                    <button type="button" class="btn btn-danger" data-restore disabled>${icon('restore')}Restaurar</button>
                </div>
            </section>
        </div>
        <div class="mt-6">
            ${panel({
                title: 'Historial de respaldos',
                sub: '&nbsp;',
                delay: 2,
                body: `
                    <div class="filters">
                        ${searchBox('Buscar por usuario o fecha…')}
                        <select class="select" data-operation aria-label="Filtrar por operación">
                            <option value="">Todas las operaciones</option><option value="respaldar">Respaldos</option><option value="restaurar">Restauraciones</option>
                        </select>
                        <select class="select" data-state aria-label="Filtrar por estado">
                            <option value="">Todos los estados</option><option value="exitoso">Exitosos</option><option value="error">Con error</option><option value="en_proceso">En proceso</option>
                        </select>
                    </div>
                    <div class="mt-5" data-list></div>`
            })}
        </div>`;

    const list = $('[data-list]', main);
    const sub = $('[data-sub]', main);
    const search = $('[data-search]', main);
    const operationFilter = $('[data-operation]', main);
    const stateFilter = $('[data-state]', main);
    const backupButton = $('[data-backup]', main);
    const restoreButton = $('[data-restore]', main);
    const restoreDate = $('[data-restore-date]', main);
    const state = { items: [], fresh: null, running: null, polling: false };

    function drawTable() {
        sub.textContent = `${plural(state.items.length, 'operación registrada', 'operaciones registradas')}.`;
        const visible = state.items.filter(item =>
            (!operationFilter.value || item.operacion === operationFilter.value)
            && (!stateFilter.value || item.estado === stateFilter.value)
            && matches(search.value, item.usuario, formatDateTime(item.inicio), item.fin && formatDateTime(item.fin)));
        if (!state.items.length) { list.innerHTML = emptyState({ title: 'Aún no hay respaldos', text: 'Genera el primero con «Generar respaldo».', iconName: 'database' }); return; }
        if (!visible.length) { list.innerHTML = search.value.trim() ? noResults(search.value) : emptyState({ title: 'Ninguna operación coincide con esos filtros', iconName: 'database' }); return; }
        list.innerHTML = dataTable({
            head: '<th>Fecha de inicio</th><th>Fecha de fin</th><th>Operación</th><th>Origen</th><th>Usuario</th><th>Estado</th>',
            rows: visible.map((item, index) => rowHtml(item, index, item.id === state.fresh)).join('')
        });
        state.fresh = null;
    }

    function drawDates() {
        const backups = restorable(state.items);
        const selected = restoreDate.value;
        restoreDate.innerHTML = backups.length
            ? `<option value="">Selecciona una fecha…</option>${backups.map(item =>
                `<option value="${item.id}" ${String(item.id) === selected ? 'selected' : ''}>${escapeHtml(formatDateTime(item.fin || item.inicio))} · ${ORIGINS[item.origen].toLowerCase()}</option>`).join('')}`
            : '<option value="">No hay respaldos para restaurar</option>';
    }

    /** Bloquea las dos tarjetas mientras corre una operación y muestra su avance en la que corresponde. */
    function drawCards() {
        const running = state.running;
        main.querySelectorAll('[data-card]').forEach(card => {
            const progress = $('[data-progress]', card);
            const mine = running?.operacion === card.dataset.card;
            card.classList.toggle('opacity-60', Boolean(running) && !mine);
            progress.hidden = !mine;
            progress.innerHTML = mine ? `
                <div class="flex items-center justify-between gap-3 text-sm">
                    <span class="font-semibold text-ink-800 dark:text-ink-100" role="status">${mine && running.operacion === 'restaurar' ? 'Restaurando la base de datos…' : 'Generando respaldo…'}</span>
                    <span class="text-ink-500 dark:text-ink-400">Inició ${escapeHtml(formatDateTime(running.inicio))}</span>
                </div>
                <div class="led-scanner mt-3 ${running.operacion === 'restaurar' ? 'is-danger' : ''}"></div>
                <p class="mt-3 text-sm text-ink-500 dark:text-ink-400">Puedes seguir usando el panel; te avisaremos cuando termine.</p>` : '';
        });
        backupButton.disabled = Boolean(running);
        restoreDate.disabled = Boolean(running) || !restorable(state.items).length;
        restoreButton.disabled = Boolean(running) || !restoreDate.value;
    }

    function draw() { drawTable(); drawDates(); drawCards(); }

    async function load() {
        list.innerHTML = `<div class="space-y-3">${skeletons(5, 'h-14')}</div>`;
        try {
            const items = await listBackupOperations();
            const dates = Object.fromEntries(items.map(item => [item.id, item.fin || item.inicio]));
            state.items = items.map(item => ({ ...item, respaldoOrigen: item.respaldoId ? dates[item.respaldoId] : null }));
            state.running = state.items.find(item => item.estado === 'en_proceso') || null;
            draw();
            if (state.running) watch(state.running.id);
        } catch (error) {
            list.innerHTML = loadError(error.message);
        }
    }

    /** Consulta la operación cada segundo hasta que termine (o hasta salir de la pantalla). */
    async function watch(id) {
        if (state.polling) return;
        state.polling = true;
        while (main.isConnected) {
            await new Promise(resolve => setTimeout(resolve, POLL_MS));
            if (!main.isConnected) break;
            let operation;
            try { operation = await getBackupOperation(id); } catch { continue; }
            if (operation.estado === 'en_proceso') continue;
            if (operation.estado === 'exitoso') {
                toast(operation.operacion === 'restaurar' ? 'La base de datos se restauró correctamente.' : 'El respaldo se generó correctamente.');
            } else {
                toast(operation.operacion === 'restaurar' ? 'No se pudo restaurar la base de datos.' : 'No se pudo generar el respaldo.', { tone: 'error', duration: 5000 });
            }
            state.fresh = operation.id;
            break;
        }
        state.polling = false;
        if (main.isConnected) await load();
    }

    function begin(operation) {
        state.items.unshift({ ...operation, respaldoOrigen: null });
        state.running = operation;
        state.fresh = operation.id;
        draw();
        watch(operation.id);
    }

    backupButton.addEventListener('click', async () => {
        let started = null;
        const ok = await confirmDialog({
            title: 'Confirmar respaldo',
            message: '¿Deseas generar un respaldo de la base de datos ahora?',
            note: 'El proceso puede tardar unos minutos.',
            confirmText: 'Sí, generar respaldo',
            tone: 'primary',
            action: async () => { started = await startBackup(currentUserName()); }
        });
        if (ok && started) begin(started);
    });

    restoreDate.addEventListener('change', drawCards);
    restoreButton.addEventListener('click', async () => {
        const backup = state.items.find(item => String(item.id) === restoreDate.value);
        if (!backup) return;
        const date = formatDateTime(backup.fin || backup.inicio);
        const started = await openFormModal({
            title: 'Confirmar restauración',
            submitText: 'Sí, restaurar',
            submitTone: 'danger',
            busyText: 'Un momento…',
            fields: `
                <p class="text-ink-600 dark:text-ink-300">Vas a restaurar la base de datos con el respaldo del <strong class="text-ink-900 dark:text-white">${escapeHtml(date)}</strong>.</p>
                <p class="note-danger">${icon('alert', 'size-4 mt-0.5 shrink-0')}<span>Toda la información actual se reemplazará por la de ese respaldo. Los cambios hechos después de esa fecha se perderán y no se pueden recuperar.</span></p>
                <div data-field-wrap>
                    <label class="field-label" for="restoreConfirm">Escribe ${CONFIRM_WORD} para confirmar</label>
                    <input id="restoreConfirm" name="confirmacion" class="input font-display tracking-[0.2em] uppercase" autocomplete="off" autocapitalize="characters" spellcheck="false" required placeholder="${CONFIRM_WORD}">
                </div>`,
            isValid: form => form.elements.confirmacion.value.trim().toUpperCase() === CONFIRM_WORD,
            onSubmit: () => startRestore(backup.id, currentUserName())
        });
        if (started) begin(started);
    });

    [operationFilter, stateFilter].forEach(select => select.addEventListener('change', drawTable));
    wireSearch(search, drawTable);
    main.addEventListener('click', event => { if (event.target.closest('[data-retry]')) load(); });
    load();
}
