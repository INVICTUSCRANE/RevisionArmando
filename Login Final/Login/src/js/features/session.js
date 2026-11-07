/**
 * Sesión del portal. "Recordarme" la guarda en localStorage (sobrevive al cerrar el navegador);
 * sin él, en sessionStorage (se borra al cerrar la pestaña). La usará el panel cuando exista.
 * Con servidor real, lo ideal es que el token viaje en una cookie HttpOnly y aquí solo quede el perfil.
 */
const KEY = 'invictus_portal_session';

export const ROLES = {
    admin: { label: 'Administrador', hint: 'Control total del sistema' },
    ventas: { label: 'Ventas', hint: 'Cotizaciones, pedidos y clientes' },
    marketing: { label: 'Marketing', hint: 'Contenido del sitio, campañas y catálogos' }
};

export function saveSession(session, remember) {
    try {
        clearSession();
        (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session));
        return true;
    } catch { return false; }
}

export function clearSession() {
    try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch { /* almacenamiento bloqueado */ }
}
