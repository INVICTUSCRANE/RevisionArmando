/**
 * Detalles vivos del panel de marca: puntos de neón en los cruces de la cuadrícula y chispas que
 * suben. La mayoría son verdes; algunos morados y dorados dan variedad.
 * (El paralaje con el puntero ahora lo hace la escena del centro de control dentro de su canvas.)
 */
import { $, prefersReducedMotion } from '../core/dom.js';

const random = (min, max) => min + Math.random() * (max - min);
const tint = i => (i % 6 === 0 ? 'is-gold' : i % 4 === 1 ? 'is-purple' : '');

function placeDots(container, count) {
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('span');
        dot.className = `grid-dot ${tint(i)}`;
        // Siempre sobre un cruce de la cuadrícula de 48px
        dot.style.left = `${Math.round(random(1, 18)) * 48}px`;
        dot.style.top = `${Math.round(random(1, 18)) * 48}px`;
        dot.style.setProperty('--dur', `${random(3, 7).toFixed(1)}s`);
        dot.style.setProperty('--delay', `${random(0, 6).toFixed(1)}s`);
        container.append(dot);
    }
}

function placeSparks(container, count) {
    for (let i = 0; i < count; i++) {
        const spark = document.createElement('span');
        spark.className = `spark ${tint(i + 1)}`;
        spark.style.left = `${random(0, 100)}%`;
        spark.style.setProperty('--dur', `${random(8, 16).toFixed(1)}s`);
        spark.style.setProperty('--delay', `${random(0, 12).toFixed(1)}s`);
        spark.style.setProperty('--drift', `${random(-60, 60).toFixed(0)}px`);
        container.append(spark);
    }
}

export function initAmbient() {
    if (!$('#scene') || prefersReducedMotion()) return;
    placeDots($('#gridDots'), 16);
    placeSparks($('#sparks'), 14);
}
