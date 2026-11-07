/** Formulario de inicio de sesión: rol, correo, contraseña y "Recordarme". */
import { $, escapeHtml } from '../core/dom.js';
import { sceneEvent, setBusy, shake, showError } from '../core/ui.js';
import { play } from '../core/sound.js';
import { login, DEMO_USERS } from '../services/auth-api.js';
import { ROLES, saveSession } from './session.js';
import { playBurst } from '../core/burst.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function syncRole(form) {
    const role = ROLES[form.role.value];
    const hint = $('#roleHint');
    hint.textContent = role.hint;
    hint.classList.remove('animate-fade-up');
    void hint.offsetWidth;
    hint.classList.add('animate-fade-up');
    form.querySelector('[data-label]').textContent = `Ingresar como ${role.label}`;
}

function messageFor(error) {
    if (error.code === 'locked') return `Demasiados intentos fallidos. Espera ${error.retryIn} segundos e inténtalo de nuevo.`;
    if (error.code === 'wrong_role') return `Esta cuenta no tiene acceso como ${ROLES[$('#loginForm').role.value].label}. Su rol es ${ROLES[error.role].label}.`;
    if (error.code === 'invalid_credentials') {
        return error.remaining <= 2 && error.remaining > 0
            ? `${error.message} Te quedan ${error.remaining} intento${error.remaining === 1 ? '' : 's'}.`
            : error.message;
    }
    return 'No pudimos conectar con el servidor. Inténtalo de nuevo.';
}

// DEMO: lista las cuentas de prueba y las rellena al hacer clic. Borrar al conectar el servidor.
function renderDemoAccounts(form) {
    const list = $('#demoAccounts');
    if (!list) return;
    list.innerHTML = DEMO_USERS.map((user, index) => `
        <li><button type="button" data-demo="${index}" class="w-full rounded-lg px-2 py-1 text-left transition hover:bg-brand-50 dark:hover:bg-neon/5">
            <strong class="text-ink-800 dark:text-ink-200">${ROLES[user.rol].label}:</strong>
            ${escapeHtml(user.correo)} · <code class="text-royal-600 dark:text-royal-300">${escapeHtml(user.password)}</code>
        </button></li>`).join('');
    list.addEventListener('click', event => {
        const button = event.target.closest('[data-demo]');
        if (!button) return;
        const user = DEMO_USERS[button.dataset.demo];
        form.email.value = user.correo;
        form.password.value = user.password;
        form.querySelector(`[name="role"][value="${user.rol}"]`).checked = true;
        syncRole(form);
    });
}

/** Aviso de sesión iniciada. Cuando exista el panel, aquí se redirigirá a él. */
function showSuccess(user) {
    const dialog = $('#successDialog');
    $('#successText').textContent = `Bienvenido, ${user.nombre}. Entraste como ${ROLES[user.rol].label}.`;
    dialog.hidden = false;
    playBurst($('#loginBurst'), 'check');
    play('success');
    sceneEvent('success');
    $('#successClose').focus();
}

function initSuccessDialog() {
    const dialog = $('#successDialog');
    const close = () => { dialog.hidden = true; $('#loginEmail').focus(); };
    $('#successClose').addEventListener('click', close);
    dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !dialog.hidden) close(); });
}

export function initLoginForm() {
    initSuccessDialog();
    const form = $('#loginForm');
    const error = $('#loginError');
    const card = $('#card');

    form.addEventListener('change', event => { if (event.target.name === 'role') syncRole(form); });
    form.addEventListener('input', event => {
        event.target.removeAttribute('aria-invalid');
        showError(error, '');
    });
    renderDemoAccounts(form);

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const email = form.email.value.trim();
        const password = form.password.value;

        const invalid = !EMAIL.test(email) ? form.email : !password ? form.password : null;
        if (invalid) {
            invalid.setAttribute('aria-invalid', 'true');
            invalid.focus();
            showError(error, invalid === form.email ? 'Escribe un correo electrónico válido, por ejemplo nombre@invictuscrane.com.' : 'Escribe tu contraseña.');
            return shake(card);
        }

        const restore = setBusy(form.querySelector('[type="submit"]'), 'Verificando…');
        try {
            const { user, token } = await login({ email, password, role: form.role.value });
            if (!saveSession({ ...user, token, inicio: Date.now() }, form.remember.checked)) {
                restore();
                return showError(error, 'El navegador bloqueó el almacenamiento local; no se pudo guardar la sesión.');
            }
            restore();
            form.password.value = '';
            showSuccess(user);
        } catch (failure) {
            restore();
            showError(error, messageFor(failure));
            if (failure.code === 'invalid_credentials') form.password.select();
            shake(card);
        }
    });
}
