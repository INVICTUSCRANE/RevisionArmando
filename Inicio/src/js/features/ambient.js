/**
 * Fondo vivo de las secciones oscuras: cuadrícula, barrido de luz, puntos de neón,
 * chispas y un aura morada fija (los estilos están en styles/components/ambient.css).
 *   <div data-ambient class="absolute inset-0 -z-10"></div>          → todas las capas
 *   <div data-ambient="light" data-dots="10" data-sparks="0">        → variante para fondo claro (con manchas de luz)
 * El HTML decide dónde va la capa; aquí solo se llena. Fuera de pantalla se pausa.
 * El verde manda: uno de cada cinco puntos es morado y una de cada tres chispas es dorada o morada.
 */
import { $$, prefersReducedMotion } from '../core/dom.js';
import { playWhenVisible } from './scenes/play-when-visible.js';

const random = (min, max) => min + Math.random() * (max - min);

function dots(count, height) {
    const rows = Math.max(4, Math.floor(height / 48) - 1); // repartidos en todo el alto de la sección
    return Array.from({ length: count }, (_, index) => {
        // Siempre sobre un cruce de la cuadrícula de 48 px
        const style = `left:${Math.round(random(1, 30)) * 48}px;top:${Math.round(random(1, rows)) * 48}px;--dur:${random(3, 7).toFixed(1)}s;--delay:${random(0, 6).toFixed(1)}s`;
        return `<span class="grid-dot${index % 5 === 4 ? ' is-violet' : ''}" style="${style}"></span>`;
    }).join('');
}

const SPARK_TONES = ['', 'is-gold', '', '', 'is-violet', ''];

function sparks(count, height) {
    return Array.from({ length: count }, (_, index) => {
        const style = `left:${random(0, 100).toFixed(1)}%;--dur:${random(8, 16).toFixed(1)}s;--delay:${random(0, 12).toFixed(1)}s;--drift:${random(-60, 60).toFixed(0)}px;--rise:${height}px`;
        return `<span class="ambient-spark ${SPARK_TONES[index % SPARK_TONES.length]}" style="${style}"></span>`;
    }).join('');
}

export function initAmbient() {
    const reduced = prefersReducedMotion();
    $$('[data-ambient]').forEach(layer => {
        layer.setAttribute('aria-hidden', 'true');
        const height = Math.max(400, layer.offsetHeight + 40);
        const dotCount = Number(layer.dataset.dots ?? 14);
        // En modo ligero (core/performance.js) no hay chispas: son las que más trabajo dan al subir
        const sparkCount = reduced || document.documentElement.classList.contains('is-lite') ? 0 : Number(layer.dataset.sparks ?? 10);
        const blobs = layer.dataset.ambient.includes('light') ? '<div class="ambient-blob"></div><div class="ambient-blob is-b"></div>' : '';
        layer.innerHTML = `<div class="ambient-aura"></div>${blobs}<div class="grid-floor"></div><div class="grid-scan"></div>${dots(dotCount, height)}${sparks(sparkCount, height)}`;
        playWhenVisible(layer);
    });
}
