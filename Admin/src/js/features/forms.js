/** Ayudas para formularios: contadores de caracteres y lectura de campos. */
import { $, $$, html } from '../core/dom.js';
import { icon } from '../core/icons.js';

/** Agrega "12 / 300" bajo cada campo con `data-counter` (usa su maxlength). */
export function wireCounters(root) {
    $$('[data-counter]', root).forEach(field => {
        const counter = html('<p class="counter"></p>');
        const update = () => {
            counter.textContent = `${field.value.length} / ${field.maxLength}`;
            counter.classList.toggle('text-amber-500', field.value.length > field.maxLength * .9);
        };
        field.after(counter);
        field.addEventListener('input', update);
        update();
    });
}

/** Valor recortado de un campo del formulario. */
export const value = (form, name) => String(form.elements[name]?.value ?? '').trim();

/** Campo de contraseña con botón para mostrarla. */
export const passwordField = ({ id, label, hint, required }) => `
    <div data-field-wrap>
        <label class="field-label" for="${id}">${label}</label>
        <div class="relative">
            <input id="${id}" name="password" class="input pr-12" type="password" minlength="6" ${required ? 'required' : ''} autocomplete="new-password">
            <button type="button" class="icon-btn absolute right-1 top-1" data-toggle-password aria-label="Mostrar contraseña">${icon('eye')}</button>
        </div>
        <p class="field-hint">${hint}</p>
    </div>`;

export function wirePasswordToggle(root) {
    const button = $('[data-toggle-password]', root);
    if (!button) return;
    const input = button.previousElementSibling;
    button.addEventListener('click', () => {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        button.innerHTML = icon(show ? 'eyeOff' : 'eye');
        button.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
        button.firstElementChild.style.animation = 'var(--animate-pop)';
    });
}
