/**
 * Bitácoras y auditorías de las cuentas (solo lectura):
 *   Accesos al panel         inicios y cierres de sesión del personal (no incluye clientes)
 *   Recuperación de cuentas  recuperaciones de contraseña, con su estado y el medio usado
 *   Cambios de usuarios      quién modificó a qué usuario o cliente; «Ver cambios» despliega los datos antes y después
 * La pantalla (buscador, filtros, contador y «Mostrar más») es la de audit-log.js.
 */
import { escapeHtml } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { formatDateTime } from '../core/format.js';
import {
    ACCESS_EVENTS, RECOVERY_STATES, RECOVERY_CHANNELS, USER_CHANGE_ACTIONS, ACCOUNT_KINDS, STAFF_ROLES,
    listAccessLog, listRecoveryLog, listUserChanges, roleLabel
} from '../services/admin-api.js';
import { emailHtml } from './shared.js';
import {
    renderLog, byKey, selectHtml, actionFilter, fullName, actionName, dateCell, personCell, authorCells, actionCell, detailCell, field, diffDetail
} from './audit-log.js';

const EVENTS = byKey(ACCESS_EVENTS);
const KINDS_BY_ID = byKey(ACCOUNT_KINDS);

/* ───────── Accesos al panel ───────── */

const EVENT_ICONS = { login_exitoso: 'login', login_fallido: 'alert', cuenta_bloqueada: 'lock', logout: 'logout' };
const eventBadge = id => {
    const event = EVENTS[id] || { nombre: id, tone: 'muted' };
    return `<span class="badge ${id === 'login_exitoso' ? 'is-led' : ''}" data-tone="${event.tone}">${id === 'login_exitoso' ? '' : icon(EVENT_ICONS[id] || 'alert', 'size-4')}${escapeHtml(event.nombre)}</span>`;
};

/* ───────── Recuperación de cuentas ───────── */

const recoveryBadge = estado => estado === 'exitoso'
    ? '<span class="badge is-led" data-tone="ok">Exitoso</span>'
    : `<span class="badge" data-tone="error">${icon('close', 'size-4')}Fallido</span>`;
const channelCell = medio => `<span class="inline-flex items-center gap-2">${icon(medio === 'telefono' ? 'phone' : 'mail', 'size-4 text-brand-600 dark:text-neon')}${medio === 'telefono' ? 'Teléfono' : 'Correo'}</span>`;

/* ───────── Cambios de usuarios ───────── */

const kindLabel = tipo => KINDS_BY_ID[tipo]?.nombre || tipo;

const USER_FIELDS = [
    field('nombre', 'Nombre'),
    field('apellidos', 'Apellidos'),
    field('correo', 'Correo', { show: emailHtml }),
    field('telefono', 'Teléfono'),
    field('departamento', 'Departamento'),
    field('rol', 'Rol', { show: value => escapeHtml(roleLabel(value)) }),
    field('activo', 'Cuenta', { show: value => (value ? 'Activa' : 'Desactivada') }),
    field('contrasena', 'Contraseña')
];

/** La contraseña nunca se guarda en la bitácora: si se cambió, el detalle solo lo anota. */
const withPassword = entry => (entry.contrasena
    ? { ...entry, antes: { ...entry.antes, contrasena: '••••••••' }, despues: { ...entry.despues, contrasena: 'Se cambió' } }
    : entry);

/* ───────── Configuración de cada bitácora ───────── */

const LOGS = {
    access: {
        title: 'Accesos al panel',
        sub: 'Inicios y cierres de sesión de los usuarios del panel (no incluye clientes). Solo lectura.',
        search: 'Buscar por usuario, correo o fecha…',
        list: listAccessLog,
        filters: [
            { name: 'evento', html: selectHtml('evento', 'Filtrar por evento', 'Todos los eventos', ACCESS_EVENTS) },
            { name: 'rol', html: selectHtml('rol', 'Filtrar por rol', 'Todos los roles', STAFF_ROLES) }
        ],
        fields: entry => [entry.correo, entry.nombre, entry.apellidos, fullName(entry), formatDateTime(entry.fecha), EVENTS[entry.evento]?.nombre, roleLabel(entry.rol)],
        empty: 'Aún no hay accesos registrados',
        iconName: 'login',
        head: '<th>Fecha</th><th>Correo (usuario)</th><th>Nombre</th><th>Apellidos</th><th>Evento</th><th>Rol</th>',
        row: entry => `
            ${dateCell(entry, 'data-first')}
            <td data-label="Correo (usuario)" class="cell-email">${emailHtml(entry.correo)}</td>
            <td data-label="Nombre">${escapeHtml(entry.nombre)}</td>
            <td data-label="Apellidos">${escapeHtml(entry.apellidos)}</td>
            <td data-label="Evento" data-aside>${eventBadge(entry.evento)}</td>
            <td data-label="Rol">${escapeHtml(roleLabel(entry.rol))}</td>`
    },
    recovery: {
        title: 'Recuperación de cuentas',
        sub: 'Historial de recuperaciones de contraseña realizadas por el equipo. Solo lectura.',
        search: 'Buscar por usuario, correo o fecha…',
        list: listRecoveryLog,
        filters: [
            { name: 'estado', html: selectHtml('estado', 'Filtrar por estado', 'Todos los estados', RECOVERY_STATES) },
            { name: 'medio', html: selectHtml('medio', 'Filtrar por medio', 'Todos los medios', RECOVERY_CHANNELS) }
        ],
        fields: entry => [entry.correo, entry.nombre, entry.apellidos, fullName(entry), formatDateTime(entry.fecha), entry.estado, entry.medio === 'telefono' ? 'Teléfono' : 'Correo'],
        empty: 'Aún no hay recuperaciones de contraseña',
        iconName: 'key',
        head: '<th>Usuario (correo)</th><th>Nombre</th><th>Apellidos</th><th>Estado</th><th>Fecha</th><th>Medio</th>',
        row: entry => `
            <td data-first class="cell-email"><span class="cell-strong">${emailHtml(entry.correo)}</span></td>
            <td data-label="Nombre">${escapeHtml(entry.nombre)}</td>
            <td data-label="Apellidos">${escapeHtml(entry.apellidos)}</td>
            <td data-label="Estado" data-aside>${recoveryBadge(entry.estado)}</td>
            ${dateCell(entry)}
            <td data-label="Medio">${channelCell(entry.medio)}</td>`
    },
    changes: {
        title: 'Cambios de usuarios',
        sub: 'Quién modificó a qué usuario o cliente, con los datos antes y después. Solo lectura.',
        search: 'Buscar por quién hizo el cambio, a quién o fecha…',
        list: listUserChanges,
        single: true,
        filters: [
            actionFilter(USER_CHANGE_ACTIONS),
            { name: 'tipo', html: selectHtml('tipo', 'Filtrar por tipo de cuenta', 'Admins y clientes', ACCOUNT_KINDS) }
        ],
        filterValue: { tipo: entry => entry.afectado.tipo },
        fields: entry => [fullName(entry.autor), entry.autor.correo, fullName(entry.afectado), entry.afectado.correo, formatDateTime(entry.fecha), actionName(entry.accion), roleLabel(entry.autor.rol)],
        empty: 'Aún no hay cambios registrados',
        iconName: 'users',
        head: '<th>Fecha</th><th>Realizado por</th><th>Rol</th><th>Usuario afectado</th><th>Acción</th><th>Datos</th>',
        row: entry => `
            ${dateCell(entry, 'data-first')}
            ${authorCells(entry.autor)}
            ${personCell('Usuario afectado', fullName(entry.afectado), `${emailHtml(entry.afectado.correo)} · ${escapeHtml(kindLabel(entry.afectado.tipo))}`)}
            ${actionCell(entry.accion)}
            ${detailCell(entry)}`,
        detail: entry => diffDetail(withPassword(entry), {
            fields: USER_FIELDS,
            empty: { antes: 'La cuenta no existía: se creó con este cambio.', despues: 'La cuenta se eliminó: ya no tiene datos.' },
            notes: entry.contrasena ? [['lock', 'La contraseña nunca se guarda en la bitácora; solo se registra que se cambió.']] : []
        })
    }
};

export const renderAccessLog = main => renderLog(LOGS.access, main);
export const renderRecoveryLog = main => renderLog(LOGS.recovery, main);
export const renderUserChanges = main => renderLog(LOGS.changes, main);
