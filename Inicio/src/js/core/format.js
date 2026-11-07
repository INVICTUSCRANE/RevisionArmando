const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

/** 1850 → "$1,850" */
export const formatPrice = amount => currency.format(amount).replace(/\s?MXN/, '');

/** "12,000 lbs" → { number: '12,000', unit: 'lbs' } */
export function splitSpec(value) {
    const match = /^([\d.,]+)\s*(.*)$/.exec(value);
    return match ? { number: match[1], unit: match[2] } : { number: '', unit: value };
}

/** Rango de una especificación entre varios modelos: ['5 toneladas', '18 toneladas'] → "5 – 18 toneladas". */
export function specRange(values) {
    const parts = values.map(splitSpec);
    const number = part => Number(part.number.replace(/,/g, ''));
    const sorted = [...parts].sort((a, b) => number(a) - number(b));
    const [low, high] = [sorted[0], sorted[sorted.length - 1]];
    if (!low.number || low.unit !== high.unit) return values.join(' · ');
    return low.number === high.number ? `${low.number} ${low.unit}` : `${low.number} – ${high.number} ${low.unit}`;
}
