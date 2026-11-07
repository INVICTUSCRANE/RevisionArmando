/**
 * Portada de los catálogos: la usan el libro que se hojea (page-templates.js) y los libros 3D
 * del inicio (book-launcher.js), así ambos se ven iguales.
 * Pasta de fibra de carbono con costura, esquineros metálicos, plano técnico luminoso que se dibuja
 * solo (grúa con gancho que se balancea y torreta que destella, o engranes, cadena y barra de luces),
 * sello giratorio con el año, título cromado, etiquetas que se encienden, tres garantías con ícono
 * y franja de seguridad LED.
 * Las animaciones están en styles/components/book-pages.css (sección "Tapas").
 * Los textos van en HTML encima del dibujo (no como <text> de SVG): así el libro 3D puede flotar
 * sin que el navegador vuelva a acomodar las letras en cada cuadro.
 */
import { escapeHtml as esc } from '../../core/dom.js';
import { assetUrl } from '../../core/paths.js';
import { CRANE_LINES, CRANE_LINE_ORDER } from '../../data/products.js';

/** Íconos de línea de las tres garantías al pie de la portada. */
const FEATURE_ICONS = {
    flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    shield: '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
    wrench: '<path d="M14.5 5.5a4 4 0 0 0 4.9 4.9L21 12l-8.5 8.5a2.1 2.1 0 0 1-3-3L18 9"/><path d="M14.5 5.5 12.6 3.6A4 4 0 0 0 7 9.2"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3.5h2.6l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1l1.9-7.3H6.2"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>'
};

const KINDS = {
    gruas: {
        kicker: 'Catálogo de equipos',
        tags: () => CRANE_LINE_ORDER.map(id => CRANE_LINES[id].name),
        features: [['flag', 'Ingeniería mexicana'], ['shield', 'Componentes certificados'], ['wrench', 'Soporte profesional']],
        art: () => truckArt,
        // Rótulo pintado sobre el dibujo: posición en % del plano (x, y de la línea base en el viewBox 320×150)
        label: { text: 'INVICTUS', x: 118, y: 93 }
    },
    accesorios: {
        kicker: 'Catálogo de accesorios',
        tags: () => ['Cadenas', 'Ganchos', 'Malacates', 'Señalización'],
        features: [['cart', 'Compra en línea'], ['tag', 'Precios con IVA incluido'], ['chat', 'Atención por WhatsApp']],
        art: () => accessoriesArt(),
        label: { text: 'ACCESORIOS', x: 246, y: 90 }
    }
};

const features = list => `
    <ul class="cover-features">${list.map(([icon, text]) => `
        <li><span class="cover-feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${FEATURE_ICONS[icon]}</svg></span>${esc(text)}</li>`).join('')}
    </ul>`;

/** Esquineros metálicos y costura de la pasta (también en la contraportada). */
export const coverTrim = () => `
    <span class="cover-stitch" aria-hidden="true"></span>
    <span class="cover-corner is-tl" aria-hidden="true"></span><span class="cover-corner is-tr" aria-hidden="true"></span>
    <span class="cover-corner is-bl" aria-hidden="true"></span><span class="cover-corner is-br" aria-hidden="true"></span>`;

/** Sello con el texto girando alrededor del año (cada letra es un <i> girado alrededor del centro). */
function seal(year) {
    const letters = [...`EDICIÓN ${year} ✦ INVICTUS CRANE ✦ HECHO EN MÉXICO ✦ `];
    const step = 360 / letters.length;
    return `
        <span class="cover-seal" aria-hidden="true">
            <span class="cover-seal-ring">${letters.map((letter, i) => `<i style="--r:${(i * step).toFixed(1)}deg">${letter === ' ' ? '&nbsp;' : esc(letter)}</i>`).join('')}</span>
            <b>${year}</b>
        </span>`;
}

const artLabel = ({ text, x, y }) => `<span class="ill-label" style="left:${((x / 320) * 100).toFixed(1)}%;top:${((y / 150) * 100).toFixed(1)}%">${esc(text)}</span>`;

/**
 * Portada completa. `action` es el botón de abajo: un <button> en el libro que se hojea
 * y un <span> en el libro 3D (que ya es un enlace, por eso ahí el título tampoco es encabezado).
 */
export function coverFront({ kind, year, title, action, titleTag = 'h2' }) {
    const config = KINDS[kind] ?? KINDS.gruas;
    return `
        <div class="cover-sheet cover-front" data-cover="${kind}">
            ${coverTrim()}
            <div class="cover-top"><span>Industrias Invictus Crane</span><span>N.º ${String(year).slice(-2)}</span></div>
            <img class="cover-logo" src="${assetUrl('logo-invictus.png')}" alt="Industrias Invictus Crane">
            <div class="cover-art" aria-hidden="true">
                <div class="cover-plot">${config.art()}${artLabel(config.label)}</div>
                <span class="cover-scan"></span>
                ${seal(year)}
            </div>
            <p class="cover-kicker">${esc(config.kicker)}</p>
            <${titleTag} class="cover-title">${esc(title)}</${titleTag}>
            <ul class="cover-tags">${config.tags().map(tag => `<li>${esc(tag)}</li>`).join('')}</ul>
            ${features(config.features)}
            ${action}
            <div class="cover-hazard" aria-hidden="true"></div>
        </div>`;
}

/* ---------- Planos técnicos (viewBox 320×150). `.ill-line` se dibuja al aparecer; --d es el retraso en ms ---------- */

const ground = `
    <path class="ill-line" style="--d:0" pathLength="1" d="M4 134H316"/>
    <g class="ill-dim"><path d="M8 144H304"/><path d="M8 140v8M304 140v8M82 142v4M156 142v4M230 142v4"/></g>`;

/** Grúa de rescate: pluma, cable con gancho que se balancea, torreta ámbar y wheel lift. */
const truckArt = `
    <svg class="cover-illustration" viewBox="0 0 320 150" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        ${ground}
        <path class="ill-line" style="--d:100" pathLength="1" d="M34 104H60a18 18 0 0 1 36 0a18 18 0 0 1 36 0H244a18 18 0 0 1 36 0H302"/>
        <path class="ill-line" style="--d:200" pathLength="1" d="M40 104V80a4 4 0 0 1 4-4H200V104"/>
        <rect class="ill-line" style="--d:350" pathLength="1" x="47" y="82" width="28" height="13" rx="2"/>
        <rect class="ill-line" style="--d:400" pathLength="1" x="160" y="82" width="34" height="13" rx="2"/>
        <path class="ill-line" style="--d:450" pathLength="1" d="M68 88h4M187 88h4"/>
        <path class="ill-line" style="--d:250" pathLength="1" d="M206 104V56a6 6 0 0 1 6-6h40l22 26h18a6 6 0 0 1 6 6v22"/>
        <path class="ill-line" style="--d:420" pathLength="1" d="M214 56h36l16 20h-52z"/>
        <path class="ill-line" style="--d:500" pathLength="1" d="M246 86h6M298 92h6v10h-6M270 58h5v10"/>
        <circle class="ill-line" style="--d:520" pathLength="1" cx="291" cy="86" r="3"/>
        <path class="ill-line" style="--d:300" pathLength="1" d="M202 104V38M199 38h6"/>
        <rect class="ill-line" style="--d:550" pathLength="1" x="219" y="43" width="32" height="7" rx="2"/>
        <g class="ill-beacons" stroke="none"><circle cx="227" cy="46.5" r="2.4"/><circle cx="235" cy="46.5" r="2.4"/><circle cx="243" cy="46.5" r="2.4"/></g>
        <path class="ill-line" style="--d:600" pathLength="1" d="M150 70 34 20l6 8 116 50z"/>
        <path class="ill-line" style="--d:700" pathLength="1" d="M112 58 52 32"/>
        <path class="ill-line" style="--d:650" pathLength="1" d="M142 76l10-11 12 11"/>
        <path class="ill-line is-thick" style="--d:750" pathLength="1" d="M182 76 142 60"/>
        <path class="ill-line" style="--d:780" pathLength="1" d="M142 60 104 45"/>
        <path class="ill-line" style="--d:450" pathLength="1" d="M40 97H24l-5 6H8M9 103v6M15 103v6"/>
        <g class="ill-wheels">
            <circle class="ill-line" style="--d:300" pathLength="1" cx="78" cy="118" r="15"/><circle class="ill-line" style="--d:380" pathLength="1" cx="114" cy="118" r="15"/><circle class="ill-line" style="--d:460" pathLength="1" cx="262" cy="118" r="15"/>
            <circle class="ill-line" style="--d:600" pathLength="1" cx="78" cy="118" r="5"/><circle class="ill-line" style="--d:650" pathLength="1" cx="114" cy="118" r="5"/><circle class="ill-line" style="--d:700" pathLength="1" cx="262" cy="118" r="5"/>
        </g>
        <circle class="ill-line" style="--d:900" pathLength="1" cx="36" cy="24" r="4"/>
        <circle class="ill-target" cx="36" cy="24" r="9"/>
        <g class="ill-swing">
            <path class="ill-line" style="--d:1000" pathLength="1" d="M36 28v46"/>
            <path class="ill-line is-thick" style="--d:1150" pathLength="1" d="M36 74v8a6.5 6.5 0 1 1-6.5 6.5l-2.5-3"/>
        </g>
    </svg>`;

/** Engrane de `teeth` dientes centrado en (cx, cy). */
function gear(cx, cy, outer, inner, teeth) {
    const step = (Math.PI * 2) / teeth;
    const point = (radius, angle) => `${(cx + radius * Math.cos(angle)).toFixed(1)} ${(cy + radius * Math.sin(angle)).toFixed(1)}`;
    const path = Array.from({ length: teeth }, (_, i) => {
        const a = i * step;
        return `${i ? 'L' : 'M'}${point(inner, a)}L${point(outer, a + step * 0.14)}L${point(outer, a + step * 0.36)}L${point(inner, a + step * 0.5)}`;
    }).join('');
    return `${path}Z`;
}

/** Accesorios: engranes que giran, cadena con gancho que se balancea, barra de luces y cuña. */
const accessoriesArt = () => `
    <svg class="cover-illustration" viewBox="0 0 320 150" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        ${ground}
        <g class="ill-spin">
            <path class="ill-line" style="--d:100" pathLength="1" d="${gear(66, 72, 36, 29, 12)}"/>
            <circle class="ill-line" style="--d:300" pathLength="1" cx="66" cy="72" r="11"/>
            <path class="ill-line" style="--d:400" pathLength="1" d="M66 47v14M66 83v14M41 72h14M77 72h14"/>
        </g>
        <g class="ill-spin is-reverse">
            <path class="ill-line" style="--d:250" pathLength="1" d="${gear(113, 112, 22, 17, 9)}"/>
            <circle class="ill-line" style="--d:450" pathLength="1" cx="113" cy="112" r="6"/>
        </g>
        <path class="ill-line" style="--d:150" pathLength="1" d="M140 6H200M150 6v-2M190 6v-2"/>
        <g class="ill-swing is-chain">
            <rect class="ill-line" style="--d:300" pathLength="1" x="163" y="7" width="14" height="24" rx="7"/>
            <rect class="ill-line" style="--d:400" pathLength="1" x="167.5" y="25" width="5" height="22" rx="2.5"/>
            <rect class="ill-line" style="--d:500" pathLength="1" x="163" y="41" width="14" height="24" rx="7"/>
            <rect class="ill-line" style="--d:600" pathLength="1" x="167.5" y="59" width="5" height="20" rx="2.5"/>
            <circle class="ill-line" style="--d:700" pathLength="1" cx="170" cy="85" r="6"/>
            <path class="ill-line is-thick" style="--d:850" pathLength="1" d="M170 91v12a14 14 0 1 1-14 14l-4-6"/>
        </g>
        <rect class="ill-line" style="--d:300" pathLength="1" x="204" y="52" width="84" height="15" rx="5"/>
        <path class="ill-line" style="--d:500" pathLength="1" d="M214 67v7M278 67v7M208 74h76"/>
        <g class="ill-beacons" stroke="none"><circle cx="217" cy="59.5" r="3.3"/><circle cx="231.5" cy="59.5" r="3.3"/><circle cx="246" cy="59.5" r="3.3"/><circle cx="260.5" cy="59.5" r="3.3"/><circle cx="275" cy="59.5" r="3.3"/></g>
        <path class="ill-line" style="--d:450" pathLength="1" d="M226 134 262 100h14l30 34"/>
        <path class="ill-line" style="--d:650" pathLength="1" d="M240 134l26-26M254 134l20-20M268 134l12-12"/>
    </svg>`;
