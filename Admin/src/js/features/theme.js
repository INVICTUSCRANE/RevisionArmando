/**
 * Modo claro / oscuro. Se recuerda en localStorage; si la persona nunca lo eligió,
 * sigue la preferencia del sistema (y cambia en vivo si el sistema cambia).
 * Usa la misma clave que el portal de acceso, así el tema elegido al iniciar sesión se conserva.
 * El <script> en el <head> aplica el tema antes de pintar para evitar el destello.
 *
 * Rendimiento: el cambio se anima con View Transitions (el navegador funde dos capturas de la
 * pantalla en un círculo que crece desde el interruptor) en vez de animar el color de cada elemento.
 */
import { $, prefersReducedMotion } from '../core/dom.js';
import { play } from '../core/sound.js';

const KEY = 'invictus_portal_theme';
const system = matchMedia('(prefers-color-scheme: dark)');

function saved() {
    try { return localStorage.getItem(KEY); } catch { return null; }
}

function apply(dark) {
    document.documentElement.classList.toggle('dark', dark);
    $('#themeToggle')?.setAttribute('aria-checked', String(dark));
    $('meta[name="theme-color"]')?.setAttribute('content', dark ? '#141515' : '#1f1f1f');
}

/** Cambia el tema con el círculo que crece desde `origin` (si el navegador lo permite). */
function switchTo(dark, origin) {
    if (!document.startViewTransition || prefersReducedMotion()) { apply(dark); return; }
    const root = document.documentElement;
    const box = origin?.getBoundingClientRect();
    const x = box ? box.left + box.width / 2 : innerWidth / 2;
    const y = box ? box.top + box.height / 2 : 0;
    root.style.setProperty('--vt-x', `${x}px`);
    root.style.setProperty('--vt-y', `${y}px`);
    root.style.setProperty('--vt-r', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    document.startViewTransition(() => apply(dark));
}

export function initTheme() {
    apply(saved() ? saved() === 'dark' : system.matches);

    const toggle = $('#themeToggle');
    toggle?.addEventListener('click', () => {
        const dark = !document.documentElement.classList.contains('dark');
        try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch { /* almacenamiento bloqueado */ }
        play(dark ? 'themeDark' : 'themeLight');
        switchTo(dark, toggle);
    });

    system.addEventListener('change', event => { if (!saved()) switchTo(event.matches); });
}
