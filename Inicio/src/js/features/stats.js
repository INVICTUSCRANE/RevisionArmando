/**
 * Cifras del inicio calculadas desde los datos (así nunca quedan desactualizadas):
 * <dd data-stat="years|models|lines|accessories">. Cuentan desde 0 con `initCounters`.
 */
import { $$ } from '../core/dom.js';
import { ACCESSORIES, CRANE_LINES } from '../data/products.js';

/** Año de inicio de la empresa: en 2026 da 6 años de experiencia y se actualiza solo cada año. */
const FOUNDED = 2020;

const STATS = {
    years: () => new Date().getFullYear() - FOUNDED,
    models: () => Object.values(CRANE_LINES).reduce((sum, line) => sum + line.models.length, 0),
    lines: () => Object.keys(CRANE_LINES).length,
    accessories: () => ACCESSORIES.length
};

export function initStats() {
    $$('[data-stat]').forEach(element => {
        const value = STATS[element.dataset.stat]?.();
        if (value !== undefined) element.dataset.countTo = value;
    });
}
