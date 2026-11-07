/** Formatos de número y texto que se repiten en el panel. */
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });

export const formatMoney = value => money.format(Number(value) || 0);
export const pad2 = value => String(value).padStart(2, '0');

/** "1 vinculado" / "3 vinculados" */
export const plural = (count, singular, pluralForm = `${singular}s`) => `${count} ${count === 1 ? singular : pluralForm}`;

/** Compara sin acentos ni mayúsculas (para los buscadores). */
export const normalize = text => String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export const matches = (query, ...fields) => !normalize(query) || fields.some(field => normalize(field).includes(normalize(query)));

/** "2026-10-16T10:12" → "16/10/2026, 10:12" (sin convertir zona horaria: la fecha llega como la guarda el servidor). */
export function formatDateTime(iso) {
    if (!iso) return '—';
    const [date, time = ''] = String(iso).split('T');
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}${time ? `, ${time.slice(0, 5)}` : ''}`;
}

/** Iniciales para el avatar: "Carlos" + "Mendoza Rivas" → "CM". */
export const initialsOf = (nombre = '', apellidos = '') => `${nombre.trim()[0] || ''}${apellidos.trim()[0] || ''}`.toUpperCase() || '?';
