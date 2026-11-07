/**
 * Fotografías con respaldo: primero la foto local (assets/img/fotos), luego la de respaldo
 * y, si ninguna carga, la imagen se oculta y queda el marco `.photo-slot` con el logotipo.
 *   En HTML:  <img data-photo="hero-1" class="…">
 *   En JS:    `<img ${photoAttrs('linea-rescate')} class="…">`
 */
import { $$, escapeHtml } from './dom.js';
import { assetUrl } from './paths.js';
import { PHOTOS } from '../data/media.js';

const sources = key => {
    const photo = PHOTOS[key];
    if (!photo) return null;
    return {
        src: assetUrl(`fotos/${photo.file}`),
        fallback: photo.fallback ? (photo.localFallback ? assetUrl(photo.fallback) : photo.fallback) : '',
        alt: photo.alt
    };
};

/** Atributos `src`, `alt` y respaldo para interpolar en una plantilla de <img>. */
export function photoAttrs(key, { alt } = {}) {
    const photo = sources(key);
    if (!photo) return 'alt=""';
    return `src="${photo.src}" data-fallback-src="${photo.fallback}" alt="${escapeHtml(alt ?? photo.alt)}"`;
}

function useFallback(img) {
    const next = img.dataset.fallbackSrc;
    if (next) {
        img.removeAttribute('data-fallback-src');
        img.src = next;
    } else {
        img.classList.add('is-missing');
    }
}

/** Atiende las fotos que no cargan en todo el sitio (se llama antes de dibujar nada). */
export function watchPhotoErrors() {
    document.addEventListener('error', event => {
        if (event.target.tagName === 'IMG') useFallback(event.target);
    }, true);
}

/** Completa las <img data-photo> del HTML. */
export function initPhotos() {
    $$('img[data-photo]').forEach(img => {
        const photo = sources(img.dataset.photo);
        if (!photo) return;
        img.dataset.fallbackSrc = photo.fallback;
        if (!img.hasAttribute('alt')) img.alt = photo.alt;
        img.src = photo.src;
    });
    // Imágenes que ya fallaron antes de que corriera este archivo.
    $$('img').forEach(img => { if (img.complete && img.getAttribute('src') && !img.naturalWidth) useFallback(img); });
}
