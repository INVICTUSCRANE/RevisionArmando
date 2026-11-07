/**
 * Modo claro / oscuro. Se recuerda en localStorage; si la persona nunca lo eligió,
 * sigue la preferencia del sistema (y cambia en vivo si el sistema cambia).
 * El <script> en el <head> aplica el tema antes de pintar para evitar el destello.
 */
import { $ } from '../core/dom.js';

const KEY = 'invictus_portal_theme';
const system = matchMedia('(prefers-color-scheme: dark)');

function saved() {
    try { return localStorage.getItem(KEY); } catch { return null; }
}

function apply(dark, animate) {
    const root = document.documentElement;
    if (animate) {
        root.classList.add('theme-switching');
        setTimeout(() => root.classList.remove('theme-switching'), 400);
    }
    root.classList.toggle('dark', dark);
    $('#themeToggle')?.setAttribute('aria-checked', String(dark));
    $('meta[name="theme-color"]')?.setAttribute('content', dark ? '#141515' : '#1f1f1f');
}

export function initTheme() {
    apply(saved() ? saved() === 'dark' : system.matches, false);

    $('#themeToggle')?.addEventListener('click', () => {
        const dark = !document.documentElement.classList.contains('dark');
        try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch { /* almacenamiento bloqueado */ }
        apply(dark, true);
    });

    system.addEventListener('change', event => { if (!saved()) apply(event.matches, true); });
}
