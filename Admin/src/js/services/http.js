/**
 * Cliente HTTP para cuando se conecte el backend de Spring Boot. Hoy no se usa (admin-api.js está
 * simulado); queda listo para reemplazar el cuerpo de cada función por `apiFetch(...)`.
 *
 *   const lista = await apiFetch('/api/valores');
 *   await apiFetch('/api/valores', { method: 'POST', body: { titulo, descripcion } });
 *   await apiFetch('/api/carrusel', { method: 'POST', body: formData });   // multipart con imagen
 */
import { ApiError } from './admin-api.js';

/** Dirección del backend. Vacía = mismo servidor que sirve el panel. */
export const API_BASE = '';

const CODES = { 400: 'validation', 401: 'unauthorized', 403: 'forbidden', 404: 'not_found', 409: 'duplicate' };

export async function apiFetch(path, { method = 'GET', body } = {}) {
    const isForm = body instanceof FormData;
    const response = await fetch(`${API_BASE}${path}`, {
        method,
        credentials: 'include',   // la sesión viaja en una cookie HttpOnly
        headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined
    });
    if (response.status === 204) return null;
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        // Ajusta estos nombres al formato de error de tu manejador global (@RestControllerAdvice).
        throw new ApiError(CODES[response.status] || 'server', data?.mensaje || data?.message || 'No se pudo completar la operación.', data?.campo);
    }
    return data;
}
