/**
 * Mis datos: la pantalla con la que abre el panel (y a la que lleva el logotipo).
 * Muestra los datos de quien inició sesión, solo para consulta, y debajo la escena animada de grúas.
 */
import { escapeHtml } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { formatDateTime, initialsOf } from '../core/format.js';
import { roleLabel } from '../services/admin-api.js';
import { loadProfile } from '../features/session.js';
import { loadError } from './shared.js';
import { craneScene, wireCraneScene } from './crane-scene.js';

const greeting = (hour = new Date().getHours()) => (hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches');

const field = (iconName, label, value, index, extra = '') => `
    <div class="profile-field enter" style="--i:${index}">
        <dt>${icon(iconName, 'size-4')}${label}</dt>
        <dd ${extra}>${value}</dd>
    </div>`;

function profileHtml(user) {
    const name = `${user.nombre} ${user.apellidos}`.trim();
    const isAdmin = user.rol === 'admin';
    return `
        <section class="panel enter overflow-hidden" style="--i:0">
            <div class="profile-hero">
                <span class="profile-avatar" aria-hidden="true">${escapeHtml(initialsOf(user.nombre, user.apellidos || user.nombre.split(/\s+/)[1] || ''))}</span>
                <div class="min-w-0 flex-1">
                    <p class="eyebrow">${greeting()}</p>
                    <h2 class="mt-1 text-2xl leading-tight font-semibold tracking-tight text-ink-900 @lg:text-3xl dark:text-white">${escapeHtml(name)}</h2>
                    <div class="mt-3 flex flex-wrap items-center gap-2">
                        <span class="badge" data-tone="${isAdmin ? 'ok' : 'muted'}">${icon('shield', 'size-4')}${escapeHtml(roleLabel(user.rol))}</span>
                        <span class="live-pill"><span class="live-dot"></span>Sesión activa</span>
                    </div>
                </div>
            </div>
            <dl class="profile-grid">
                ${field('user', 'Nombre', escapeHtml(user.nombre), 1)}
                ${field('user', 'Apellidos', escapeHtml(user.apellidos || '—'), 2)}
                ${field('mail', 'Correo (usuario)', escapeHtml(user.correo).replace('@', '<wbr>@'), 3, 'class="cell-email"')}
                ${field('phone', 'Teléfono', escapeHtml(user.telefono || '—'), 4)}
                ${field('briefcase', 'Departamento', escapeHtml(user.departamento || '—'), 5)}
                ${field('shield', 'Rol', escapeHtml(roleLabel(user.rol)), 6)}
                ${field('key', 'Cuenta', user.activo ? '<span class="badge is-led" data-tone="ok">Activa</span>' : '<span class="badge" data-tone="error">Desactivada</span>', 7)}
                ${field('clock', 'Sesión iniciada', escapeHtml(formatDateTime(user.sesionIniciada)), 8)}
            </dl>
            <p class="profile-note">
                ${icon('lock', 'size-4 shrink-0')}
                <span>Tus datos solo se consultan aquí. ${isAdmin
                    ? 'Para cambiarlos, edita tu cuenta en <a href="#/usuarios/administradores">Usuarios administradores</a>.'
                    : 'Si algo no es correcto, pide a un administrador que lo actualice.'}</span>
            </p>
        </section>`;
}

export function renderProfile(main) {
    main.innerHTML = `
        <div class="space-y-6">
            <div data-profile><div class="skeleton h-[22rem] rounded-3xl"></div></div>
            ${craneScene()}
        </div>`;
    wireCraneScene(main);

    const holder = main.querySelector('[data-profile]');
    loadProfile()
        .then(user => { if (main.isConnected) holder.innerHTML = profileHtml(user); })
        .catch(error => { holder.innerHTML = `<section class="panel p-6">${loadError(error.message)}</section>`; });
    holder.addEventListener('click', event => { if (event.target.closest('[data-retry]')) location.reload(); });
}
