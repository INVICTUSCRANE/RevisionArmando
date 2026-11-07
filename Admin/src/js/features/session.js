/**
 * Persona que usa el panel. Lee la sesión que guarda el portal de acceso (invictus-portal,
 * misma clave) y pide su perfil completo al servicio (lo muestran «Mis datos» y la tarjeta del menú).
 * Si no hay sesión, por ser una demostración se usa la cuenta de prueba de Carlos Mendoza (administrador).
 * SERVIDOR REAL: el perfil sale de GET /api/auth/me y, sin sesión válida o sin rol del panel,
 * se envía a la persona a LOGIN_URL.
 */
import { $ } from '../core/dom.js';
import { initialsOf } from '../core/format.js';
import { getMyProfile, roleLabel } from '../services/admin-api.js';
import { confirmDialog } from './modal.js';

const KEY = 'invictus_portal_session';
/** Pantalla de inicio de sesión (el portal de acceso). Ajusta la ruta según cómo se publiquen ambos. */
export const LOGIN_URL = '../invictus-portal/index.html';

function readSession() {
    try {
        const raw = localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

let profile = null;
let ready = null;

/** Perfil de quien usa el panel: { nombre, apellidos, correo, telefono, departamento, rol, activo, sesionIniciada }. */
export const loadProfile = () => ready;

/** Nombre de quien usa el panel (para registrar operaciones manuales como los respaldos). */
export const currentUserName = () => (profile ? `${profile.nombre} ${profile.apellidos}`.trim() : 'Administración');

function drawCard(user) {
    $('#userName').textContent = `${user.nombre} ${user.apellidos}`.trim();
    $('#userRole').textContent = roleLabel(user.rol);
    $('#userInitials').textContent = initialsOf(user.nombre, user.apellidos || user.nombre.split(/\s+/)[1] || '');
    $('#userInitials').title = user.correo || '';
}

export function initSession() {
    // El portal guarda { nombre, correo, rol, token, inicio }
    ready = getMyProfile(readSession()).then(user => {
        profile = user;
        drawCard(user);
        return user;
    });

    $('#logoutBtn').addEventListener('click', async () => {
        const ok = await confirmDialog({
            title: '¿Cerrar sesión?',
            message: 'Volverás a la pantalla de inicio de sesión del portal.',
            confirmText: 'Cerrar sesión',
            tone: 'primary'
        });
        if (!ok) return;
        try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch { /* almacenamiento bloqueado */ }
        location.href = LOGIN_URL;
    });
}
