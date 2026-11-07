/**
 * Recuperar contraseña en tres pasos:
 *   1. elegir correo o teléfono y pedir el código,
 *   2. escribir el código de 6 dígitos (con vencimiento y reenvío),
 *   3. crear la nueva contraseña.
 */
import { $, $$ } from '../core/dom.js';
import { sceneEvent, setBusy, shake, showError } from '../core/ui.js';
import { play } from '../core/sound.js';
import { toast } from '../core/toast.js';
import { maskDestination, requestResetCode, resetPassword, verifyResetCode } from '../services/auth-api.js';
import { onShow, showView } from './views.js';
import { playBurst } from '../core/burst.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const state = { channel: 'email', destination: '', requestId: '', resetToken: '', timers: [] };
const card = () => $('#card');

const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

function countdown(seconds, onTick, onEnd) {
    const end = Date.now() + seconds * 1000;
    const tick = () => {
        const left = Math.max(0, Math.round((end - Date.now()) / 1000));
        onTick(left);
        if (!left) { clearInterval(id); onEnd?.(); }
    };
    const id = setInterval(tick, 1000);
    state.timers.push(id);
    tick();
}
const stopTimers = () => { state.timers.forEach(clearInterval); state.timers = []; };

/* ---------- Paso 1: método ---------- */
function readDestination(form) {
    if (state.channel === 'email') {
        const email = form.email.value.trim().toLowerCase();
        return EMAIL.test(email) ? email : null;
    }
    const digits = form.phone.value.replace(/\D/g, '');
    return digits.length === 10 ? `${form.country.value}${digits}` : null;
}

async function sendCode(button) {
    const restore = setBusy(button, 'Enviando código…');
    try {
        const response = await requestResetCode({ channel: state.channel, destination: state.destination });
        state.requestId = response.requestId;
        // DEMO: sin servidor no se envía nada; cualquier código de 6 dígitos sirve.
        toast('Demostración: escribe cualquier código de 6 dígitos.', { tone: 'code', duration: 5000 });
        return response;
    } finally {
        restore();
    }
}

function initMethodStep() {
    const form = $('#recoverForm');
    const error = $('#recoverError');

    form.addEventListener('change', event => {
        if (event.target.name !== 'channel') return;
        state.channel = event.target.value;
        $$('[data-channel]', form).forEach(group => { group.hidden = group.dataset.channel !== state.channel; });
        showError(error, '');
        $(`[data-channel="${state.channel}"] input`, form).focus();
    });

    // Formato 81 1234 5678 mientras se escribe
    form.phone.addEventListener('input', () => {
        const d = form.phone.value.replace(/\D/g, '').slice(0, 10);
        form.phone.value = [d.slice(0, 2), d.slice(2, 6), d.slice(6)].filter(Boolean).join(' ');
    });
    form.addEventListener('input', event => { event.target.removeAttribute('aria-invalid'); showError(error, ''); });

    // Si escribió su correo en el inicio de sesión, lo trae
    onShow('recover', () => {
        const typed = $('#loginForm').email.value.trim();
        if (typed && !form.email.value) form.email.value = typed;
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const destination = readDestination(form);
        if (!destination) {
            const input = state.channel === 'email' ? form.email : form.phone;
            input.setAttribute('aria-invalid', 'true');
            input.focus();
            showError(error, state.channel === 'email' ? 'Escribe un correo electrónico válido.' : 'Escribe los 10 dígitos de tu teléfono.');
            return shake(card());
        }
        state.destination = destination;
        try {
            const response = await sendCode(form.querySelector('[type="submit"]'));
            startCodeStep(response);
        } catch {
            showError(error, 'No pudimos enviar el código. Inténtalo de nuevo.');
        }
    });
}

/* ---------- Paso 2: código ---------- */
const otpInputs = () => $$('#otp input');
const otpValue = () => otpInputs().map(input => input.value).join('');

function clearOtp() {
    otpInputs().forEach(input => { input.value = ''; });
    otpInputs()[0].focus();
}

function startCodeStep({ expiresIn, resendIn }) {
    stopTimers();
    $('#codeTarget').textContent = maskDestination(state.channel, state.destination);
    showError($('#codeError'), '');
    otpInputs().forEach(input => { input.value = ''; });
    showView('code');
    otpInputs()[0].focus();

    countdown(expiresIn, left => { $('#codeExpiry').textContent = formatTime(left); });
    const resend = $('#resendBtn');
    resend.disabled = true;
    countdown(resendIn, left => { resend.textContent = `Reenviar en ${formatTime(left)}`; }, () => {
        resend.disabled = false;
        resend.textContent = 'Reenviar código';
    });
}

function initCodeStep() {
    const form = $('#codeForm');
    const error = $('#codeError');
    const inputs = otpInputs();

    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            input.value = input.value.replace(/\D/g, '').slice(-1);
            if (input.value) { play('digit', { index }); sceneEvent('typing'); }
            showError(error, '');
            if (input.value && index < inputs.length - 1) inputs[index + 1].focus();
            if (otpValue().length === inputs.length) form.requestSubmit();
        });
        input.addEventListener('keydown', event => {
            if (event.key === 'Backspace' && !input.value && index > 0) inputs[index - 1].focus();
            if (event.key === 'ArrowLeft' && index > 0) inputs[index - 1].focus();
            if (event.key === 'ArrowRight' && index < inputs.length - 1) inputs[index + 1].focus();
        });
        input.addEventListener('focus', () => input.select());
        // Pegar el código completo en cualquier casilla
        input.addEventListener('paste', event => {
            const digits = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, inputs.length);
            if (!digits) return;
            event.preventDefault();
            inputs.forEach((box, i) => { box.value = digits[i] || ''; });
            inputs[Math.min(digits.length, inputs.length - 1)].focus();
            if (digits.length === inputs.length) form.requestSubmit();
        });
    });

    $('#resendBtn').addEventListener('click', async event => {
        const button = event.currentTarget;
        button.disabled = true;
        try {
            const response = await requestResetCode({ channel: state.channel, destination: state.destination });
            state.requestId = response.requestId;
            toast('Código reenviado.', { tone: 'success' });
            startCodeStep(response);
        } catch {
            button.disabled = false;
            showError(error, 'No pudimos reenviar el código. Inténtalo de nuevo.');
        }
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const code = otpValue();
        if (code.length !== inputs.length) {
            showError(error, 'Escribe los 6 dígitos del código.');
            return shake(card());
        }
        const restore = setBusy(form.querySelector('[type="submit"]'), 'Verificando…');
        try {
            const { resetToken } = await verifyResetCode({ requestId: state.requestId, code });
            state.resetToken = resetToken;
            stopTimers();
            showView('reset');
        } catch (failure) {
            showError(error, failure.message);
            clearOtp();
            shake(card());
        } finally {
            restore();
        }
    });
}

/* ---------- Paso 3: nueva contraseña ---------- */
const RULES = {
    length: value => value.length >= 8,
    upper: value => /[A-ZÁÉÍÓÚÑ]/.test(value),
    number: value => /\d/.test(value),
    symbol: value => /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]/.test(value)
};

function checkRules(value) {
    let passed = 0;
    $$('[data-rule]').forEach(item => {
        const ok = RULES[item.dataset.rule](value);
        item.toggleAttribute('data-ok', ok);
        passed += ok;
    });
    $('#strength').dataset.level = value ? Math.max(passed, 1) : 0;
    return passed;
}

function initResetStep() {
    const form = $('#resetForm');
    const error = $('#resetError');

    form.addEventListener('input', event => {
        event.target.removeAttribute('aria-invalid');
        showError(error, '');
        if (event.target === form.password) checkRules(form.password.value);
    });
    onShow('reset', () => { form.reset(); checkRules(''); });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const password = form.password.value;
        let problem = null;
        if (checkRules(password) < 3 || !RULES.length(password)) problem = [form.password, 'La contraseña debe tener al menos 8 caracteres y cumplir 3 de las 4 reglas.'];
        else if (password !== form.confirm.value) problem = [form.confirm, 'Las contraseñas no coinciden.'];
        if (problem) {
            problem[0].setAttribute('aria-invalid', 'true');
            problem[0].focus();
            showError(error, problem[1]);
            return shake(card());
        }
        const restore = setBusy(form.querySelector('[type="submit"]'), 'Guardando…');
        try {
            await resetPassword({ resetToken: state.resetToken, password });
            if (state.channel === 'email') $('#loginForm').email.value = state.destination;
            $('#loginForm').password.value = '';
            showView('done');
        } catch (failure) {
            showError(error, failure.message);
        } finally {
            restore();
        }
    });
}

export function initRecovery() {
    onShow('done', () => {
        playBurst($('#resetBurst'), 'lock');
        play('unlock');
        sceneEvent('success');
    });
    initMethodStep();
    initCodeStep();
    initResetStep();
}
