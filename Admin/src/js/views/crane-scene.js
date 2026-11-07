/**
 * Escena animada de «Mis datos»: una grúa Invictus remolca un auto por la carretera de noche,
 * con la ciudad (y sus grúas torre) al fondo y otra grúa de plataforma que pasa en sentido contrario.
 *
 * Rendimiento: todo se mueve con `transform` y `opacity` en capas HTML separadas (la tarjeta de video
 * las desplaza sin volver a pintar). Las llantas son elementos propios para poder girar igual.
 * Tocar la grúa suena el claxon. Los estilos están en src/styles/components/scene.css.
 */
import { replayClass } from '../core/dom.js';
import { play } from '../core/sound.js';

// Medidas del dibujo de la grúa (viewBox) para colocar las llantas encima en porcentajes
const RIG = { w: 300, h: 120 };
const wheelStyle = (cx, cy, r) =>
    `left:${((cx - r) / RIG.w * 100).toFixed(2)}%;top:${((cy - r) / RIG.h * 100).toFixed(2)}%;width:${(2 * r / RIG.w * 100).toFixed(2)}%`;

const WHEEL = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="11" class="cs-tire"/>
        <circle cx="12" cy="12" r="6.2" class="cs-rim"/>
        <path d="M5.8 12h12.4M12 5.8v12.4M7.6 7.6l8.8 8.8M16.4 7.6l-8.8 8.8" class="cs-spoke"/>
    </svg>`;

const wheel = (cx, cy, r, extra = '') => `<span class="cs-wheel ${extra}" style="${wheelStyle(cx, cy, r)}">${WHEEL}</span>`;

/* Grúa de arrastre (mirando a la derecha) con un auto levantado por el brazo de rueda (wheel lift) */
const TOW_TRUCK = `
    <svg class="cs-rig-art" viewBox="0 0 ${RIG.w} ${RIG.h}" aria-hidden="true">
        <defs>
            <pattern id="csHazard" width="8" height="6" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)">
                <rect width="4" height="6" fill="#ffb938"/><rect x="4" width="4" height="6" fill="#141515"/>
            </pattern>
        </defs>
        <!-- Auto remolcado: gira sobre su llanta trasera para quedar con el frente arriba -->
        <g transform="rotate(-6 24 116)">
            <path class="cs-car" d="M4 98 Q4 88 14 86 L32 84 L48 68 Q52 64 58 64 H84 Q90 64 94 70 L102 84 Q110 86 110 94 V102 H4 Z"/>
            <path class="cs-car-glass" d="M40 84 L51 70 H68 V84 Z M72 70 H86 L94 84 H72 Z"/>
            <rect class="cs-tail" x="3" y="89" width="4" height="5" rx="1"/>
            <circle class="cs-tire-static" cx="90" cy="106" r="10"/><circle class="cs-rim-static" cx="90" cy="106" r="5.5"/>
        </g>
        <!-- Brazo de arrastre que sostiene las llantas delanteras del auto -->
        <path class="cs-steel" d="M124 104 L106 110 H80"/>
        <!-- Caja, torre y cabina -->
        <rect class="cs-chassis" x="120" y="98" width="178" height="8" rx="2"/>
        <path class="cs-body" d="M122 76 H228 V98 H122 Z"/>
        <rect x="122" y="88" width="106" height="6" fill="url(#csHazard)" opacity=".9"/>
        <path class="cs-steel" d="M140 76 L160 44 L194 44 L216 76 M160 44 L134 68"/>
        <path class="cs-cable" d="M134 68 V96"/>
        <path class="cs-cab" d="M232 98 V54 Q232 46 240 46 H266 L288 72 Q296 76 296 84 V98 Z"/>
        <path class="cs-glass" d="M240 54 H264 L280 72 H240 Z"/>
        <path class="cs-line" d="M238 78 H292 M266 78 V96"/>
        <text x="236" y="92" class="cs-brand">INVICTUS</text>
        <rect class="cs-headlight" x="291" y="80" width="6" height="6" rx="1.5"/>
    </svg>
    ${wheel(150, 104, 12)}${wheel(178, 104, 12)}${wheel(272, 104, 12)}${wheel(23, 106, 10, 'is-small')}
    <span class="cs-beacon" aria-hidden="true"></span>
    <span class="cs-beam" aria-hidden="true"></span>`;

/* Grúa de plataforma que viene en sentido contrario (mirando a la izquierda), más pequeña y tenue */
const FLATBED = `
    <svg viewBox="0 0 220 80" aria-hidden="true">
        <path class="cs-cab" d="M60 66 V30 Q60 24 54 24 H34 L16 46 Q8 50 8 56 V66 Z"/>
        <path class="cs-glass" d="M52 30 H36 L24 44 H52 Z"/>
        <path class="cs-body" d="M64 50 L212 44 V54 H64 Z"/>
        <path class="cs-car" d="M96 44 Q96 38 104 37 L118 36 L128 26 Q131 23 135 23 H156 Q161 23 164 27 L171 36 Q178 37 178 42 V46 H96 Z"/>
        <rect class="cs-chassis" x="8" y="62" width="204" height="6" rx="2"/>
        <circle class="cs-tire-static" cx="40" cy="70" r="9"/><circle class="cs-tire-static" cx="166" cy="70" r="9"/><circle class="cs-tire-static" cx="188" cy="70" r="9"/>
        <rect class="cs-beacon-static" x="38" y="19" width="14" height="5" rx="2"/>
    </svg>`;

/* Ciudad del fondo con dos grúas torre; se repite dos veces para desplazarse sin cortes */
const SKYLINE = `
    <svg viewBox="0 0 1400 120" width="1400" height="120" aria-hidden="true">
        <path class="cs-city" d="M0 120 V86 H60 V60 H110 V92 H150 V48 H200 V80 H250 V70 H300 V100 H340 V40 H380 V30 H420 V76 H470 V90 H520 V58 H580 V84 H640 V96 H680 V52 H720 V44 H760 V88 H820 V66 H870 V100 H910 V56 H960 V78 H1010 V36 H1060 V90 H1120 V62 H1170 V94 H1220 V50 H1270 V82 H1330 V70 H1400 V120"/>
        <!-- grúas torre -->
        <path class="cs-tower" d="M460 120 V18 M452 120 V18 M452 30 H468 M452 46 H468 M452 62 H468 M452 78 H468 M452 94 H468 M440 18 H560 M440 18 L456 6 L470 18 M456 6 V18 M530 18 V40 M396 18 H452 M396 18 V26 H410 V18"/>
        <path class="cs-tower" d="M1110 120 V28 M1118 120 V28 M1110 40 H1118 M1110 56 H1118 M1110 72 H1118 M1110 88 H1118 M1060 28 H1200 M1114 28 L1114 16 L1100 28 M1114 16 L1128 28 M1176 28 V52"/>
        <rect class="cs-hook" x="526" y="40" width="8" height="6" rx="1"/><rect class="cs-hook" x="1172" y="52" width="8" height="6" rx="1"/>
        <!-- ventanas encendidas -->
        <g class="cs-windows">
            <rect x="70" y="70" width="6" height="4"/><rect x="164" y="58" width="6" height="4"/><rect x="352" y="50" width="6" height="4"/>
            <rect x="392" y="40" width="6" height="4"/><rect x="532" y="68" width="6" height="4"/><rect x="694" y="62" width="6" height="4"/>
            <rect x="922" y="66" width="6" height="4"/><rect x="1022" y="46" width="6" height="4"/><rect x="1232" y="60" width="6" height="4"/>
        </g>
        <g class="cs-windows is-neon">
            <rect x="120" y="70" width="6" height="4"/><rect x="306" y="80" width="6" height="4"/><rect x="590" y="72" width="6" height="4"/>
            <rect x="732" y="54" width="6" height="4"/><rect x="1072" y="72" width="6" height="4"/><rect x="1342" y="80" width="6" height="4"/>
        </g>
    </svg>`;

/* Postes de luz a la orilla del camino (también se repiten) */
const LAMPS = `
    <svg viewBox="0 0 1400 140" width="1400" height="140" aria-hidden="true">
        ${Array.from({ length: 5 }, (_, i) => {
            const x = 140 + i * 280;
            return `<path class="cs-lamp-glow" d="M${x - 2} 22 L${x - 46} 140 H${x + 42} Z"/>
                <path class="cs-pole" d="M${x - 24} 140 V18 Q${x - 24} 12 ${x - 18} 12 H${x + 4}"/>
                <rect class="cs-bulb" x="${x - 6}" y="12" width="14" height="5" rx="2"/>`;
        }).join('')}
    </svg>`;

const STARS = Array.from({ length: 7 }, (_, i) => `<i style="--i:${i}"></i>`).join('');

export const craneScene = () => `
    <figure class="crane-scene enter" style="--i:3" data-crane-scene>
        <div class="cs-sky" aria-hidden="true"><span class="cs-stars">${STARS}</span></div>
        <div class="cs-marquee cs-far" aria-hidden="true"><div>${SKYLINE}${SKYLINE}</div></div>
        <div class="cs-oncoming" aria-hidden="true">${FLATBED}</div>
        <div class="cs-marquee cs-lamps" aria-hidden="true"><div>${LAMPS}${LAMPS}</div></div>
        <div class="cs-road" aria-hidden="true"><span class="cs-dashes"></span></div>
        <button type="button" class="cs-rig" data-sound="none" aria-label="Sonar el claxon de la grúa" title="Toca la grúa">${TOW_TRUCK}</button>
        <figcaption class="cs-sign">Grúas Invictus · en ruta</figcaption>
    </figure>`;

/** Tocar la grúa: claxon, destello de la torreta y un saltito de la suspensión. */
export function wireCraneScene(root) {
    const rig = root.querySelector('.cs-rig');
    rig?.addEventListener('click', () => {
        play('horn');
        replayClass(rig, 'is-honking');
    });
}
