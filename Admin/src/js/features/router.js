/**
 * Navegación por "#/seccion/pantalla". Cada cambio actualiza el encabezado, el menú y dibuja la
 * pantalla correspondiente de src/js/views dentro de <main id="view">.
 * Sin dirección (recién iniciada la sesión) se abre «Mis datos».
 */
import { $, replayClass } from '../core/dom.js';
import { ROUTES, DEFAULT_ROUTE } from '../data/menu.js';
import { setActiveRoute } from './sidebar.js';

/** Tiempo que dura la entrada escalonada de una pantalla; después, redibujar la lista ya no la repite. */
const SETTLE_MS = 900;

let views = {};
let settleTimer = 0;

const currentRoute = () => {
    const path = decodeURIComponent(location.hash.replace(/^#\/?/, '')).replace(/\/$/, '');
    return ROUTES.find(route => route.route === path);
};

function render() {
    const route = currentRoute();
    if (!route) { location.replace(`#/${DEFAULT_ROUTE}`); return; }

    $('#pageEyebrow').textContent = route.eyebrow;
    $('#pageTitle').textContent = route.title;
    replayClass($('#pageHeading'), 'enter');
    document.title = `${route.title} · Panel del administrador · Invictus Crane`;
    setActiveRoute(route);

    // Contenedor nuevo en cada cambio: los eventos de la pantalla anterior se van con él
    const host = document.createElement('div');
    $('#view').replaceChildren(host);
    const draw = views[route.pending ? 'pending' : route.view] || views.pending;
    draw(host, route);
    scrollTo({ top: 0, behavior: 'instant' });

    // Al buscar o filtrar, la lista se redibuja con un fundido corto en vez de repetir la entrada completa
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => { host.dataset.settled = ''; }, SETTLE_MS);
}

/** `viewMap`: { nombre de vista: (contenedor, ruta) => void } */
export function initRouter(viewMap) {
    views = viewMap;
    addEventListener('hashchange', render);
    render();
}
