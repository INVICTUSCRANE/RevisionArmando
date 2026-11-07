/**
 * Punto de entrada único. Cada módulo revisa si su sección existe en la página
 * y, si no, no hace nada; así todas las páginas cargan el mismo archivo.
 */
import { initLiteMode } from './core/performance.js';
import { initPhotos, watchPhotoErrors } from './core/photos.js';
import { renderHeader } from './layout/header.js';
import { renderFooter } from './layout/footer.js';
import { initCart } from './features/cart/cart-drawer.js';
import { initCatalogs } from './features/catalog/index.js';
import { initReveal, initCounters } from './features/reveal.js';
import { initHeroSlider } from './features/hero-slider.js';
import { initAssemblyLine } from './features/scenes/assembly-line.js';
import { initAmbient } from './features/ambient.js';
import { initBookLaunchers } from './features/book-launcher.js';
import { initTimeline } from './features/timeline.js';
import { initEquipmentViewer } from './features/equipment-viewer.js';
import { initWhatsAppForms } from './features/forms.js';
import { initLocationMaps } from './features/location-map.js';
import { initAccountPage } from './features/auth.js';
import { initStats } from './features/stats.js';
import { initPrefetch } from './features/prefetch.js';
import { initPauseOffscreen } from './features/pause-offscreen.js';

function boot() {
    initLiteMode();
    renderHeader();
    renderFooter();
    initCart();
    initEquipmentViewer();
    initCatalogs();
    initLocationMaps();
    initPhotos();
    initHeroSlider();
    initAssemblyLine();
    initAmbient();
    initBookLaunchers();
    initTimeline();
    initWhatsAppForms();
    if (document.body.dataset.page === 'cuenta') initAccountPage();
    initStats();
    initReveal();
    initCounters();
    initPrefetch();
    initPauseOffscreen();
    requestAnimationFrame(() => document.body.classList.add('is-ready'));
}

watchPhotoErrors();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
