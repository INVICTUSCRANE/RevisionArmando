/**
 * Navegación más ágil: al pasar el cursor (o tocar) un enlace interno, el navegador
 * empieza a descargar esa página para que abra casi al instante.
 */
const prefetched = new Set();

function prefetch(link) {
    const url = link.href.split('#')[0];
    if (!url || prefetched.has(url) || url === location.href.split('#')[0]) return;
    if (link.target === '_blank' || link.origin !== location.origin || !/\.html$/.test(new URL(url).pathname)) return;
    prefetched.add(url);
    const hint = document.createElement('link');
    hint.rel = 'prefetch';
    hint.href = url;
    document.head.append(hint);
}

export function initPrefetch() {
    if (location.protocol === 'file:' || navigator.connection?.saveData) return;
    const onIntent = event => {
        const link = event.target.closest?.('a[href]');
        if (link) prefetch(link);
    };
    document.addEventListener('pointerover', onIntent, { passive: true });
    document.addEventListener('touchstart', onIntent, { passive: true });
}
