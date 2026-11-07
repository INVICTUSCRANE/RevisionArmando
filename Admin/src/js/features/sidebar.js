/**
 * Menú lateral: se dibuja desde data/menu.js, despliega cada sección con animación y marca
 * la pantalla actual. Debajo de 1280 px es un cajón que entra desde la izquierda (se cierra con
 * la X, tocando fuera, con Esc o deslizándolo hacia la izquierda).
 */
import { $, $$, escapeHtml } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { MENU } from '../data/menu.js';

const app = () => $('#app');
/** Desde aquí el menú queda fijo a la izquierda (xl de Tailwind). */
const DESKTOP = matchMedia('(min-width: 80rem)');
/** Lo que tarda en desplegarse una sección (.nav-children en layout.css). */
const EXPAND_MS = 420;

function directHtml(entry) {
    return `
        <div class="nav-group is-direct" data-group="${entry.id}">
            <a class="nav-group-btn" href="#/${entry.route}" data-route="${entry.route}">
                <span class="nav-tile">${icon(entry.icon)}</span>
                <span class="flex-1">${escapeHtml(entry.label)}</span>
                <span class="nav-led" aria-hidden="true"></span>
            </a>
        </div>`;
}

function groupHtml(group) {
    if (!group.items) return directHtml(group);
    const links = group.items.map(item => `
        <li>
            <a class="nav-link" href="#/${item.route}" data-route="${item.route}">
                <span class="nav-text">${escapeHtml(item.label)}</span>
                ${item.pending ? '<span class="nav-soon">Pronto</span>' : '<span class="nav-led" aria-hidden="true"></span>'}
            </a>
        </li>`).join('');
    return `
        <div class="nav-group" data-group="${group.id}">
            <button type="button" class="nav-group-btn" aria-expanded="false" aria-controls="nav-${group.id}">
                <span class="nav-tile">${icon(group.icon)}</span>
                <span class="flex-1">${escapeHtml(group.label)}</span>
                ${icon('chevron', 'nav-chevron')}
            </button>
            <div class="nav-children" id="nav-${group.id}" inert><ul>${links}</ul></div>
        </div>`;
}

function setOpen(groupNode, open) {
    const children = $('.nav-children', groupNode);
    if (!children) return;
    groupNode.classList.toggle('is-open', open);
    $('.nav-group-btn', groupNode).setAttribute('aria-expanded', String(open));
    children.inert = !open;
}

export function setDrawer(open) {
    app().classList.toggle('sidebar-open', open);
    $('#menuBtn').setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open && !DESKTOP.matches);
    if (open) revealCurrent({ focus: true });
}

/** La pantalla actual queda a la vista aunque su sección esté al fondo del menú (al abrir el cajón, también recibe el foco). */
function revealCurrent({ focus = false } = {}) {
    const nav = $('#nav');
    const current = $('[aria-current="page"]', nav);
    if (!current) return;
    if (focus) current.focus({ preventScroll: true });
    // Se procura mostrar la sección completa; si no cabe, al menos el enlace actual
    const box = nav.getBoundingClientRect();
    const group = current.closest('.nav-group').getBoundingClientRect();
    const bottom = group.height < box.height ? group.bottom : current.getBoundingClientRect().bottom;
    if (bottom > box.bottom - 8) nav.scrollTop += bottom - box.bottom + 16;
}

/** Marca la pantalla actual y abre su sección. */
export function setActiveRoute(route) {
    $$('#nav [data-route]').forEach(link => {
        if (link.dataset.route === route.route) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
    $$('.nav-group').forEach(groupNode => {
        const current = groupNode.dataset.group === route.group.id;
        groupNode.classList.toggle('is-current', current);
        setOpen(groupNode, current);   // al cambiar de pantalla solo queda abierta su sección
    });
    // Con el menú fijo, al entrar directo a una pantalla del fondo (enlace o recarga) se desplaza hasta ella
    if (DESKTOP.matches) setTimeout(revealCurrent, EXPAND_MS);
}

/** En celular, deslizar el cajón hacia la izquierda lo cierra. */
function wireSwipe(sidebar) {
    let start = null;
    sidebar.addEventListener('touchstart', event => {
        if (DESKTOP.matches || event.touches.length !== 1) return;
        start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });
    sidebar.addEventListener('touchend', event => {
        if (!start) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - start.x;
        const dy = Math.abs(touch.clientY - start.y);
        start = null;
        if (dx < -60 && dy < 50) setDrawer(false);
    }, { passive: true });
}

export function initSidebar() {
    const nav = $('#nav');
    nav.innerHTML = MENU.map(groupHtml).join('');

    nav.addEventListener('click', event => {
        const toggle = event.target.closest('button.nav-group-btn');
        if (toggle) {
            const groupNode = toggle.closest('.nav-group');
            setOpen(groupNode, !groupNode.classList.contains('is-open'));
            return;
        }
        if (event.target.closest('[data-route]')) setDrawer(false);
    });

    $('#menuBtn').addEventListener('click', () => setDrawer(true));
    $$('[data-close-sidebar]').forEach(node => node.addEventListener('click', () => setDrawer(false)));
    // El logotipo y la tarjeta de la persona llevan a «Mis datos»: en celular también cierran el cajón
    $$('[data-home]').forEach(node => node.addEventListener('click', () => setDrawer(false)));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && app().classList.contains('sidebar-open') && !$('#modalRoot').children.length) setDrawer(false);
    });
    DESKTOP.addEventListener('change', event => { if (event.matches) setDrawer(false); });
    // Si la pantalla cambia por otro medio (botón Atrás del celular), el cajón no se queda abierto encima
    addEventListener('hashchange', () => { if (app().classList.contains('sidebar-open')) setDrawer(false); });
    wireSwipe($('#sidebar'));
}
