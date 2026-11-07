/**
 * Cuentas locales (demo sin backend). Las contraseñas se guardan como hash PBKDF2,
 * nunca en texto plano. Cuando exista un backend, solo cambia este módulo.
 */
import { $, $$ } from '../core/dom.js';
import { readJSON, writeJSON, removeKey } from '../core/storage.js';
import { toast } from '../core/toast.js';

const USERS_KEY = 'inv_us';
const SESSION_KEY = 'inv_u';

export const getCurrentUser = () => readJSON(SESSION_KEY, null);

const toHex = bytes => [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');

async function hashPassword(password, salt) {
    if (!window.crypto?.subtle) throw new Error('Web Crypto no está disponible en este contexto.');
    const encoder = new TextEncoder();
    const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 120000, hash: 'SHA-256' },
        material, 256
    );
    return toHex(new Uint8Array(bits));
}

function makeSalt() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return toHex(bytes);
}

const publicUser = user => ({ nombre: user.nombre, apellidos: user.apellidos || '', correo: user.correo });
const nextPage = () => new URLSearchParams(location.search).get('next') || 'accesorios.html';
const goNext = () => setTimeout(() => { location.href = nextPage(); }, 900);

async function register(form) {
    const data = Object.fromEntries(new FormData(form));
    const users = readJSON(USERS_KEY, []);
    const existing = users.findIndex(user => user.correo?.toLowerCase() === data.correo.toLowerCase());
    if (existing >= 0 && users[existing].passwordHash) return toast('Ese correo ya tiene una cuenta', { tone: 'error' });
    if (data.password.length < 8) return toast('La contraseña debe tener al menos 8 caracteres', { tone: 'error' });

    const salt = makeSalt();
    const record = {
        nombre: data.nombre, apellidos: data.apellidos || '', correo: data.correo, telefono: data.telefono,
        passwordSalt: salt, passwordHash: await hashPassword(data.password, salt)
    };
    if (existing >= 0) users[existing] = record; else users.push(record);
    if (!writeJSON(USERS_KEY, users) || !writeJSON(SESSION_KEY, publicUser(record))) {
        return toast('El navegador bloqueó el almacenamiento local.', { tone: 'error' });
    }
    toast('¡Cuenta creada!', { tone: 'success' });
    goNext();
}

async function login(form) {
    const data = Object.fromEntries(new FormData(form));
    const user = readJSON(USERS_KEY, []).find(item => item.correo?.toLowerCase() === data.correo.toLowerCase());
    if (!user) return toast('No encontramos esa cuenta. Crea una primero.', { tone: 'error' });
    if (!user.passwordSalt || !user.passwordHash) return toast('Esta cuenta antigua no tiene contraseña guardada. Regístrate nuevamente.', { tone: 'error' });
    if (await hashPassword(data.password, user.passwordSalt) !== user.passwordHash) {
        form.classList.remove('animate-shake'); void form.offsetWidth; form.classList.add('animate-shake');
        return toast('La contraseña es incorrecta.', { tone: 'error' });
    }
    writeJSON(SESSION_KEY, publicUser(user));
    toast('Sesión iniciada', { tone: 'success' });
    goNext();
}

/** Página "Mi cuenta": pestañas, registro, inicio y cierre de sesión. */
export function initAccountPage() {
    const tabs = $$('[data-auth-tab]');
    const indicator = $('#authTabIndicator');
    const showTab = name => {
        tabs.forEach((tab, index) => {
            const active = tab.dataset.authTab === name;
            tab.setAttribute('aria-selected', String(active));
            $(`#${tab.getAttribute('aria-controls')}`).hidden = !active;
            if (active && indicator) indicator.style.transform = `translateX(${index * 100}%)`;
        });
    };
    tabs.forEach(tab => tab.addEventListener('click', () => showTab(tab.dataset.authTab)));
    showTab(location.hash === '#login' ? 'login' : 'register');

    const user = getCurrentUser();
    if (user) {
        $('#authForms').hidden = true;
        const panel = $('#authWelcome');
        panel.hidden = false;
        $('[data-user-name]', panel).textContent = `Hola, ${user.nombre} ${user.apellidos || ''}`;
        $('[data-user-email]', panel).textContent = user.correo;
        $('#logoutBtn').addEventListener('click', () => { removeKey(SESSION_KEY); location.reload(); });
    }

    const handle = action => async event => {
        event.preventDefault();
        const button = $('button[type=submit]', event.target);
        button.disabled = true;
        try { await action(event.target); }
        catch (error) {
            console.error(error);
            toast('No se pudo validar la cuenta. Abre el proyecto con localhost o HTTPS.', { tone: 'error' });
        } finally { button.disabled = false; }
    };
    $('#registerForm').addEventListener('submit', handle(register));
    $('#loginForm').addEventListener('submit', handle(login));
}

