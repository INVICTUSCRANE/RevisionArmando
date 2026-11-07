import { $, $$, html, escapeHtml } from '../core/dom.js';
import { assetUrl, pageUrl, currentPage } from '../core/paths.js';
import { getCurrentUser } from '../features/auth.js';
import { icons } from './icons.js';
import { MAIN_LINKS, SOCIAL_LINKS } from './navigation.js';

const isActive = link => link.id === currentPage() || link.children?.some(child => child.id === currentPage());

function desktopLink(link) {
    const active = isActive(link);
    if (!link.children) {
        return `<a href="${pageUrl(link.href)}" class="nav-link ${active ? 'is-active' : ''}" ${active ? 'aria-current="page"' : ''}>${link.label}</a>`;
    }
    return `
        <div class="group relative">
            <button type="button" class="nav-link ${active ? 'is-active' : ''} flex items-center gap-1" aria-haspopup="true">
                ${link.label}<span class="size-4 transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180">${icons.chevronDown}</span>
            </button>
            <div class="invisible absolute left-1/2 top-full w-64 -translate-x-1/2 translate-y-3 pt-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div class="dropdown-panel">
                    ${link.children.map((child, index) => `
                        <a href="${pageUrl(child.href)}" style="--i:${index}" class="dropdown-link ${child.id === currentPage() ? 'is-active' : ''}">
                            <span class="dropdown-led"></span>${child.label}
                        </a>`).join('')}
                </div>
            </div>
        </div>`;
}

function mobileLinks() {
    return MAIN_LINKS.flatMap(link => link.children ?? [link])
        .map((link, index) => `<a href="${pageUrl(link.href)}" style="--i:${index}" class="mobile-link ${link.id === currentPage() ? 'is-active' : ''}">${link.label}</a>`)
        .join('');
}

const socialButtons = (size = 'size-9', iconSize = 'size-[1.1rem]') => SOCIAL_LINKS.map(item => `
    <a href="${item.href}" target="_blank" rel="noopener" aria-label="${item.label}" title="${item.label}" class="social-btn is-${item.icon} ${size}"><span class="${iconSize}">${icons[item.icon]}</span></a>`).join('');

export function renderHeader() {
    const user = getCurrentUser();
    const accountLabel = user ? `Hola, ${escapeHtml(user.nombre)}` : 'Iniciar sesión / Registrarse';
    const header = html(`
        <header id="siteHeader" class="site-header">
            <div class="mx-auto flex h-full max-w-[96rem] items-center gap-4 px-4 sm:px-6 lg:px-8">
                <a href="${pageUrl('index.html')}" class="header-logo" aria-label="Industrias Invictus Crane - Inicio">
                    <img src="${assetUrl('logo-invictus.png')}" alt="Industrias Invictus Crane" width="1320" height="318">
                </a>
                <nav class="ml-3 hidden items-center gap-0.5 xl:flex 2xl:ml-6" aria-label="Principal">
                    ${MAIN_LINKS.map(desktopLink).join('')}
                </nav>
                <div class="ml-auto flex items-center gap-2">
                    <div class="header-social hidden items-center gap-1.5 sm:flex" role="group" aria-label="Redes sociales">${socialButtons()}</div>
                    <span class="mx-1 hidden h-6 w-px bg-white/15 sm:block" aria-hidden="true"></span>
                    <a href="${pageUrl('cuenta.html')}" class="account-btn" title="${accountLabel}">
                        <span class="size-5">${icons.user}</span><span class="hidden max-w-48 truncate 2xl:inline">${accountLabel}</span>
                    </a>
                    <button type="button" class="cart-btn" data-cart-open aria-label="Abrir carrito de compra">
                        <span class="size-5">${icons.cart}</span>
                        <span class="cart-badge" data-cart-count="0">0</span>
                    </button>
                    <button type="button" id="menuToggle" class="menu-toggle xl:hidden" aria-label="Menú" aria-expanded="false" aria-controls="mobileMenu">
                        <span class="size-6">${icons.menu}</span>
                    </button>
                </div>
            </div>
            <div class="header-led" aria-hidden="true"><span id="scrollProgress"></span></div>
        </header>`);

    const mobileMenu = html(`
        <div id="mobileMenu" class="mobile-menu" aria-hidden="true">
            <div data-ambient data-sparks="6" data-dots="10" class="absolute inset-0 -z-10"></div>
            <nav class="flex flex-col gap-1" aria-label="Menú móvil">${mobileLinks()}</nav>
            <a href="${pageUrl('cuenta.html')}" class="mobile-link truncate !text-2xl" style="--i:11">${accountLabel}</a>
            <div class="mt-6 flex gap-2">${socialButtons('size-11', 'size-5')}</div>
        </div>`);

    document.body.prepend(header, mobileMenu);
    setupHeaderBehaviour(header, mobileMenu);
}

function setupHeaderBehaviour(header, mobileMenu) {
    // Una sola actualización por cuadro y sin medir la página en cada evento de scroll
    // (medir obliga al navegador a recalcular el diseño y el scroll se siente trabado).
    const progress = $('#scrollProgress', header);
    let maxScroll = 0;
    let frame = 0;
    const measure = () => { maxScroll = document.documentElement.scrollHeight - innerHeight; };
    const update = () => {
        frame = 0;
        header.classList.toggle('is-scrolled', scrollY > 40);
        progress.style.transform = `scaleX(${maxScroll > 0 ? Math.min(1, scrollY / maxScroll) : 0})`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    new ResizeObserver(() => { measure(); onScroll(); }).observe(document.body);
    addEventListener('resize', measure, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    measure();
    update();

    const toggle = $('#menuToggle', header);
    const setOpen = open => {
        mobileMenu.classList.toggle('is-open', open);
        mobileMenu.setAttribute('aria-hidden', String(!open));
        toggle.setAttribute('aria-expanded', String(open));
        toggle.innerHTML = `<span class="size-6">${open ? icons.close : icons.menu}</span>`;
        document.documentElement.classList.toggle('overflow-hidden', open);
    };
    toggle.addEventListener('click', () => setOpen(!mobileMenu.classList.contains('is-open')));
    $$('a', mobileMenu).forEach(link => link.addEventListener('click', () => setOpen(false)));
    addEventListener('keydown', event => event.key === 'Escape' && setOpen(false));
}
