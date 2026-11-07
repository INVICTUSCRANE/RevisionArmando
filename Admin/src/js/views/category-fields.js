/** Formulario de una sola caja "Nombre" que usan las dos pantallas de categorías. */
import { escapeHtml } from '../core/dom.js';

export const nameField = (item, placeholder) => `
    <div data-field-wrap>
        <label class="field-label" for="categoriaNombre">Nombre</label>
        <input id="categoriaNombre" name="nombre" class="input" maxlength="60" required placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(item?.nombre || '')}" autocomplete="off" autofocus>
    </div>`;

export const lockNote = text => `
    <p class="panel-note">
        <svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        ${text}
    </p>`;
