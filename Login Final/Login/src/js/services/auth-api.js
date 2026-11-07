/**
 * Servicio de autenticación del portal.
 *
 * ⚠ SIMULADO. Todavía no hay servidor, así que este módulo imita las respuestas de la API
 * con tres cuentas de prueba y guarda los cambios de contraseña en el navegador.
 * El resto del portal SOLO llama a las funciones exportadas aquí. Para conectar el backend real,
 * reemplaza el cuerpo de cada una por el `fetch` indicado en su comentario «SERVIDOR REAL» y
 * borra todo lo marcado como «DEMO». Las reglas de seguridad (contraseñas, códigos, intentos,
 * vencimientos) deben vivir en el servidor: aquí solo se imitan para que la interfaz se pueda probar.
 */

export class AuthError extends Error {
    /** code: invalid_credentials | wrong_role | locked | invalid_code | expired_code */
    constructor(code, message, extra = {}) {
        super(message);
        this.code = code;
        Object.assign(this, extra);
    }
}

// ───────────────────────────── DEMO ─────────────────────────────
/** Cuentas de prueba. Al conectar el servidor, bórralas junto con el bloque de la página que las muestra. */
export const DEMO_USERS = [
    { nombre: 'Administración', correo: 'admin@invictuscrane.com', telefono: '+528112345601', rol: 'admin', password: 'Invictus#2026' },
    { nombre: 'Equipo de Ventas', correo: 'ventas@invictuscrane.com', telefono: '+528112345602', rol: 'ventas', password: 'Ventas#2026' },
    { nombre: 'Equipo de Marketing', correo: 'marketing@invictuscrane.com', telefono: '+528112345603', rol: 'marketing', password: 'Marketing#2026' }
];

const PASSWORDS_KEY = 'invictus_portal_demo_passwords';   // contraseñas cambiadas con "recuperar" (hash PBKDF2)
const LOCK_KEY = 'invictus_portal_demo_lock';
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;
const CODE_TTL_SECONDS = 600;
const RESEND_SECONDS = 45;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const latency = () => wait(700 + Math.random() * 500);
const toHex = bytes => [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
const randomHex = size => toHex(crypto.getRandomValues(new Uint8Array(size)));

function readStore(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function writeStore(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* almacenamiento bloqueado */ }
}

async function hash(text, salt) {
    const encoder = new TextEncoder();
    const material = await crypto.subtle.importKey('raw', encoder.encode(text), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' }, material, 256);
    return toHex(new Uint8Array(bits));
}

async function passwordMatches(user, password) {
    const changed = readStore(PASSWORDS_KEY, {})[user.correo];
    return changed ? (await hash(password, changed.salt)) === changed.hash : password === user.password;
}

const findByEmail = email => DEMO_USERS.find(user => user.correo === email.trim().toLowerCase());
const findByPhone = phone => DEMO_USERS.find(user => user.telefono === phone);

/** Recuperaciones en curso: requestId → { correo, expiresAt, resetToken } */
const pending = new Map();
// ─────────────────────────── FIN DEMO ───────────────────────────

/** Oculta parte del destino: a•••n@invictuscrane.com / •••• ••56 01 */
export function maskDestination(channel, value) {
    if (channel === 'email') {
        const [name, domain] = value.split('@');
        return `${name[0]}${'•'.repeat(Math.max(name.length - 2, 1))}${name.length > 1 ? name.at(-1) : ''}@${domain}`;
    }
    const digits = value.replace(/\D/g, '');
    return `•••• •• ${digits.slice(-4, -2)} ${digits.slice(-2)}`;
}

/**
 * Inicia sesión con correo, contraseña y rol.
 * SERVIDOR REAL: POST /api/auth/login  { email, password, role }
 *   → 200 { user: { nombre, correo, rol }, token }   · 401 credenciales · 403 rol · 429 bloqueado
 */
export async function login({ email, password, role }) {
    await latency();
    const lock = readStore(LOCK_KEY, { fails: 0, until: 0 });
    if (lock.until > Date.now()) {
        throw new AuthError('locked', 'Demasiados intentos fallidos.', { retryIn: Math.ceil((lock.until - Date.now()) / 1000) });
    }

    const user = findByEmail(email);
    if (!user || !(await passwordMatches(user, password))) {
        lock.fails += 1;
        if (lock.fails >= MAX_ATTEMPTS) Object.assign(lock, { fails: 0, until: Date.now() + LOCK_SECONDS * 1000 });
        writeStore(LOCK_KEY, lock);
        throw new AuthError('invalid_credentials', 'El correo o la contraseña no son correctos.', { remaining: MAX_ATTEMPTS - lock.fails });
    }
    writeStore(LOCK_KEY, { fails: 0, until: 0 });
    if (user.rol !== role) throw new AuthError('wrong_role', 'Esta cuenta no tiene acceso con el rol seleccionado.', { role: user.rol });

    return { user: { nombre: user.nombre, correo: user.correo, rol: user.rol }, token: `demo.${randomHex(16)}` };
}

/**
 * Pide un código de seguridad por correo o SMS.
 * SERVIDOR REAL: POST /api/auth/password/forgot  { channel: 'email' | 'sms', destination }
 *   → 200 { requestId, expiresIn, resendIn }. Responde igual exista o no la cuenta, para no revelar
 *     qué correos o teléfonos están registrados; el servidor genera el código y lo envía.
 */
export async function requestResetCode({ channel, destination }) {
    await latency();
    const requestId = randomHex(12);
    const user = channel === 'email' ? findByEmail(destination) : findByPhone(destination);
    pending.set(requestId, { correo: user?.correo || null, expiresAt: Date.now() + CODE_TTL_SECONDS * 1000 });
    return { requestId, expiresIn: CODE_TTL_SECONDS, resendIn: RESEND_SECONDS };
}

/**
 * Comprueba el código de 6 dígitos.
 * SERVIDOR REAL: POST /api/auth/password/verify  { requestId, code }
 *   → 200 { resetToken } · 400 código incorrecto · 410 vencido · 429 demasiados intentos
 */
export async function verifyResetCode({ requestId, code }) {
    await latency();
    const entry = pending.get(requestId);
    if (!entry) throw new AuthError('expired_code', 'La solicitud ya no es válida. Pide un código nuevo.');
    if (entry.expiresAt < Date.now()) throw new AuthError('expired_code', 'El código venció. Pide uno nuevo.');
    // DEMO: por ahora cualquier código de 6 dígitos es correcto. El servidor real lo comparará con el que envió.
    if (!/^\d{6}$/.test(code)) throw new AuthError('invalid_code', 'El código debe tener 6 dígitos.');
    entry.resetToken = randomHex(16);
    return { resetToken: entry.resetToken };
}

/**
 * Guarda la nueva contraseña.
 * SERVIDOR REAL: POST /api/auth/password/reset  { resetToken, password }  → 204
 */
export async function resetPassword({ resetToken, password }) {
    await latency();
    const entry = [...pending.values()].find(item => item.resetToken && item.resetToken === resetToken);
    if (!entry) throw new AuthError('expired_code', 'La verificación venció. Vuelve a pedir un código.');
    // DEMO: si el dato pertenece a una cuenta de prueba, su contraseña cambia de verdad en este navegador.
    if (entry.correo) {
        const salt = randomHex(16);
        const passwords = readStore(PASSWORDS_KEY, {});
        passwords[entry.correo] = { salt, hash: await hash(password, salt) };
        writeStore(PASSWORDS_KEY, passwords);
    }
    pending.clear();
    return {};
}
