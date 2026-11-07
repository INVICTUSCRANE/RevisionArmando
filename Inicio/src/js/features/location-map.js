/**
 * Mapa de ubicación (Contacto y Reparaciones): <div data-location-map></div>.
 * Muestra Google Maps apuntando a core/location.js y, a un lado, la ciudad con botones para
 * abrir el mapa o pedir la ruta. Mientras el mapa carga (o si no hay internet) queda un plano con un pin.
 */
import { $$, escapeHtml as esc } from '../core/dom.js';
import { LOCATION, mapDirectionsUrl, mapEmbedUrl, mapOpenUrl } from '../core/location.js';
import { icons } from '../layout/icons.js';

const markup = () => `
    <div class="map-card neon-frame is-soft" data-reveal="zoom">
        <div class="map-card-inner">
        <div class="map-frame">
            <div class="map-placeholder" aria-hidden="true">
                <span class="map-pin"><span class="size-7">${icons.pin}</span></span>
                <span class="mt-4 font-display text-sm font-semibold uppercase tracking-[.3em] text-ink-500">Cargando mapa…</span>
            </div>
            <iframe src="${mapEmbedUrl()}" title="Mapa de ubicación: ${esc(LOCATION.city)}, ${esc(LOCATION.country)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        </div>
        <aside class="map-info">
            <div data-ambient data-dots="6" data-sparks="5" class="absolute inset-0 -z-10"></div>
            <span class="map-info-pin"><span class="size-8">${icons.pin}</span></span>
            <p class="eyebrow-led mt-6">Te esperamos</p>
            <h3 class="mt-3 font-display text-3xl font-bold uppercase leading-tight text-white">${esc(LOCATION.name)}</h3>
            <p class="mt-2 text-lg text-ink-300">${esc(LOCATION.city)}, ${esc(LOCATION.country)}</p>
            <div class="mt-auto flex flex-col gap-3 pt-8">
                <a class="btn btn-primary" href="${mapDirectionsUrl()}" target="_blank" rel="noopener"><span class="size-5">${icons.route}</span> Cómo llegar</a>
                <a class="btn btn-neon" href="${mapOpenUrl()}" target="_blank" rel="noopener">Abrir en Google Maps</a>
            </div>
        </aside>
        </div>
    </div>`;

export function initLocationMaps() {
    $$('[data-location-map]').forEach(root => {
        root.innerHTML = markup();
        const frame = root.querySelector('iframe');
        frame.addEventListener('load', () => frame.classList.add('is-loaded'));
    });
}
