/**
 * Línea de ensamble de Invictus (la misma idea del login, ampliada para el sitio).
 * Por la banda pasan las cuatro líneas de grúas y cada una se arma estación por estación:
 *   01 el brazo robótico suelda la cabina,
 *   02 el polipasto monta la caja, la pluma o el wheel lift según el tipo,
 *   03 el arco de control de calidad la aprueba (luces, brillo y sello con el modelo),
 * y sale por el arco de entrega. Al fondo, el rack de accesorios.
 * Con el mouse sobre la escena, el brazo apunta y suelda hacia el cursor y su posición
 * horizontal fija la velocidad de la banda. En pantallas táctiles todo se mueve solo.
 *   <div data-scene="assembly"></div>                       → las cuatro líneas
 *   <div data-scene="assembly" data-line="rescate"></div>   → solo una línea (páginas de equipos)
 */
import { $$, prefersReducedMotion } from '../../core/dom.js';
import { CRANE_LINES, CRANE_LINE_ORDER } from '../../data/products.js';

const W = 1200;
const FLOOR = 300;          // superficie de la banda
const SPACING = 300;        // distancia entre grúas
const COUNT = 5;            // grúas en circulación (al menos una siempre fuera de cuadro)
const LOOP = SPACING * COUNT;
const STATIONS = { weld: 420, hoist: 600, qc: 790 };
const ARM = { x: STATIONS.weld, y: 252, l1: 72, l2: 62 };

const CAB = 'M146 272 V214 Q146 206 154 206 H184 L208 234 Q218 238 218 248 V272Z';

/* Carrocería de cada línea: contorno del plano (punteado) y las piezas que monta el polipasto. */
const BADGE_OFF = 1120; // centro de la grúa donde la etiqueta ya se apagó (pasa bajo el arco de entrega)

const BODIES = {
    plataformas: {
        outline: 'M-12 240 H142 V250 H-12Z M134 240 V222 H142 V240',
        parts: `
            <path class="fx-body" d="M-12 240 H142 V250 H-12Z"/>
            <rect class="fx-stripes" x="-12" y="250" width="154" height="5"/>
            <path class="fx-steel-thin" d="M10 255 V262 M64 255 V262 M118 255 V262"/>
            <path class="fx-steel" d="M134 240 V222 H142 V240 M-12 250 L-24 262"/>`
    },
    rescate: {
        outline: 'M0 230 H140 V262 H0Z M112 230 L20 186',
        parts: `
            <path class="fx-body" d="M0 230 H140 V262 H0Z"/>
            <path class="fx-line" d="M46 230 V256 M94 230 V256"/>
            <rect class="fx-stripes" x="0" y="256" width="140" height="6"/>
            <path class="fx-steel is-thick" d="M112 230 L20 186"/>
            <path class="fx-steel" d="M112 230 L96 212 M4 262 V278 M-6 278 H14"/>
            <path class="fx-steel-thin" d="M20 186 V214"/>
            <path class="fx-steel" d="M20 214 a5 5 0 1 0 5 5"/>
            <circle class="fx-joint" cx="20" cy="186" r="3.5"/>`
    },
    'wheel-lift': {
        // Cajas de herramientas, cabecera con torreta y el brazo de rueda plegado atrás
        outline: 'M0 226 H138 V256 H0Z M128 226 V204 H138 V226 M4 262 L-12 272 H-46',
        parts: `
            <path class="fx-body" d="M0 226 H138 V256 H0Z"/>
            <path class="fx-line" d="M46 226 V256 M92 226 V256"/>
            <path class="fx-steel-thin" d="M18 241 H28 M64 241 H74 M110 241 H120"/>
            <path class="fx-steel" d="M128 226 V204 H138 V226"/>
            <rect class="fx-stripes" x="0" y="256" width="138" height="6"/>
            <path class="fx-steel-thin" d="M22 262 L-2 272"/>
            <path class="fx-steel is-thick" d="M4 262 L-12 272 H-46"/>
            <path class="fx-steel" d="M-46 264 V280 M-52 272 V254 H-40 M-40 272 V260"/>`
    },
    underlift: {
        outline: 'M0 236 H140 V262 H0Z M60 236 V218 H120 V236 M2 270 H-36',
        parts: `
            <path class="fx-body" d="M0 236 H140 V262 H0Z M60 236 V218 H120 V236"/>
            <rect class="fx-stripes" x="0" y="256" width="140" height="6"/>
            <path class="fx-steel" d="M40 236 L28 204 H8 M28 204 V226"/>
            <path class="fx-steel is-thick" d="M2 270 H-36 L-44 262 M-50 257 H-30"/>`
    }
};

const wheel = (cx, r = 16) => `
    <g class="fx-wheel" data-cx="${cx}">
        <circle cx="${cx}" cy="${FLOOR - r}" r="${r}" class="fx-tire"/>
        <circle cx="${cx}" cy="${FLOOR - r}" r="${r * .55}" class="fx-rim"/>
        <path d="M${cx - r * .55} ${FLOOR - r}H${cx + r * .55}M${cx} ${FLOOR - r - r * .55}V${FLOOR - r + r * .55}" class="fx-spoke"/>
    </g>`;

/** Grúa de arrastre (mirando a la derecha, origen en la parte trasera) con las variantes de cada línea. */
const truck = lineIds => `
    <g class="fx-truck">
        ${lineIds.map(id => `<path class="fx-blueprint t-variant" data-variant="${id}" d="${CAB} ${BODIES[id].outline}"/>`).join('')}
        <rect class="fx-chassis" x="2" y="262" width="216" height="10" rx="2"/>
        <g class="p-cab">
            <path class="fx-cab" d="${CAB}"/>
            <path class="fx-glass" d="M154 214 H182 L200 234 H154Z"/>
            <path class="fx-line" d="M152 240 H214 M182 240 V268"/>
        </g>
        <g class="p-bed">
            ${lineIds.map(id => `<g class="t-variant" data-variant="${id}">${BODIES[id].parts}</g>`).join('')}
        </g>
        <g class="p-final">
            <rect class="fx-lightbar" x="155" y="199" width="26" height="7" rx="3"/>
            <rect class="fx-headlight" x="212" y="242" width="6" height="6" rx="1.5"/>
            <text x="151" y="259" class="fx-brand">INVICTUS</text>
        </g>
        ${wheel(34)}${wheel(68)}${wheel(188)}
        <g class="p-badge">
            <rect x="44" y="158" width="134" height="24" rx="12" class="fx-badge"/>
            <text x="111" y="175" class="fx-badge-text" data-badge>✓ APROBADA</text>
        </g>
    </g>`;

/* Rack del fondo con los accesorios: ganchos, cadenas, torretas, malacates y eslingas */
const RACK = `
    <g class="fx-far">
        <text x="40" y="146" class="fx-sign">ACCESORIOS</text>
        <path d="M30 300 V152 M250 300 V152 M30 152 H250 M30 200 H250 M30 248 H250"/>
        <path d="M52 152 V166 a8 8 0 1 0 8 8 M80 152 V170 a8 8 0 1 0 8 8 M108 152 V164 a8 8 0 1 0 8 8"/>
        <path d="M140 152 v4 M136 160 h8 v8 h-8z M136 172 h8 v8 h-8z M136 184 h8 v8 h-8z"/>
        <rect x="164" y="186" width="34" height="10" rx="4" class="fx-amber"/><rect x="206" y="186" width="34" height="10" rx="4" class="fx-amber"/>
        <rect x="46" y="218" width="44" height="26" rx="4"/><circle cx="68" cy="231" r="8"/>
        <rect x="104" y="218" width="44" height="26" rx="4"/><circle cx="126" cy="231" r="8"/>
        <circle cx="180" cy="232" r="12" class="fx-amber-line"/><circle cx="214" cy="232" r="12" class="fx-amber-line"/>
        <circle cx="66" cy="278" r="18"/><circle cx="66" cy="278" r="8"/><circle cx="112" cy="278" r="18"/><circle cx="112" cy="278" r="8"/>
        <rect x="150" y="262" width="80" height="34" rx="3"/><path d="M150 276 H230"/>
    </g>`;

const label = (x, text) => `
    <g class="fx-station" transform="translate(${x} 98)">
        <rect x="-62" y="-15" width="124" height="24" rx="5" class="fx-chip"/>
        <text y="2" class="fx-chip-text">${text}</text>
        <path class="fx-chip-line" d="M0 9 V26"/>
    </g>`;

/* Polipasto: viga, carro y gancho que baja las piezas de la carrocería */
const HOIST = `
    <g class="fx-hoist">
        <path class="fx-steel-thin" d="M${STATIONS.hoist - 90} 124 H${STATIONS.hoist + 90} M${STATIONS.hoist - 80} 124 V114 M${STATIONS.hoist + 80} 124 V114"/>
        <rect class="fx-body" x="${STATIONS.hoist - 14}" y="124" width="28" height="12" rx="2"/>
        <rect data-hoist-cable class="fx-cable" x="${STATIONS.hoist - 1}" y="136" width="2" height="100"/>
        <g data-hoist-hook>
            <path class="fx-steel" d="M${STATIONS.hoist} 0 v8 a6 6 0 1 1 -6 6"/>
            <path class="fx-part" d="M${STATIONS.hoist - 28} 30 L${STATIONS.hoist - 12} 8 H${STATIONS.hoist + 12} L${STATIONS.hoist + 28} 30"/>
        </g>
    </g>`;

/* Arco de control de calidad con su haz de escaneo */
const QC = `
    <g class="fx-qc">
        <path class="fx-steel-thin" d="M${STATIONS.qc - 26} 300 V160 H${STATIONS.qc + 26} V300"/>
        <rect class="fx-qc-light" x="${STATIONS.qc - 10}" y="154" width="20" height="6" rx="3"/>
        <line class="fx-scan" x1="${STATIONS.qc}" y1="164" x2="${STATIONS.qc}" y2="298"/>
    </g>`;

/* Arco de entrega con tira LED */
const DISPATCH = `
    <g class="fx-dispatch">
        <path class="fx-steel-thin" d="M960 300 V142 H1180 V300"/>
        <path class="fx-led-strip" d="M972 136 H1168"/>
        <text x="1070" y="126" class="fx-sign is-neon">LISTA PARA ENTREGA</text>
    </g>`;

/* Brazo robótico de soldadura (se reposiciona en cada cuadro) */
const ROBOT = `
    <g class="fx-robot">
        <path class="fx-body" d="M${ARM.x - 22} 300 L${ARM.x - 14} ${ARM.y + 16} H${ARM.x + 14} L${ARM.x + 22} 300Z"/>
        <path data-arm class="fx-arm" d=""/>
        <circle data-joint="0" cx="${ARM.x}" cy="${ARM.y}" r="7" class="fx-joint"/>
        <circle data-joint="1" r="6" class="fx-joint"/>
        <circle data-torch r="4" class="fx-torch"/>
    </g>`;

function markup(lineIds) {
    const sparks = Array.from({ length: 36 }, () => '<circle r="1.6" class="fx-spark" opacity="0"/>').join('');
    const rollers = Array.from({ length: 25 }, (_, i) => `<g class="fx-roller" data-cx="${i * 50 + 10}"><circle cx="${i * 50 + 10}" cy="314" r="9"/><path d="M${i * 50 + 3} 314 H${i * 50 + 17}"/></g>`).join('');
    return `
    <svg class="assembly-scene" viewBox="0 0 ${W} 360" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Línea de ensamble de grúas Invictus: soldadura, montaje y control de calidad">
        <defs>
            <pattern id="fxHazard" width="10" height="6" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)">
                <rect width="5" height="6" fill="#ffb938"/><rect x="5" width="5" height="6" fill="#141515"/>
            </pattern>
        </defs>
        ${RACK}
        ${label(STATIONS.weld, '01 · SOLDADURA')}${label(STATIONS.hoist, '02 · MONTAJE')}${label(STATIONS.qc, '03 · CALIDAD')}
        ${HOIST}
        ${DISPATCH}
        ${ROBOT}
        <g data-trucks>${Array.from({ length: COUNT }, () => truck(lineIds)).join('')}</g>
        ${QC}
        <g data-sparks>${sparks}</g>
        <rect class="fx-belt" x="0" y="${FLOOR}" width="${W}" height="30"/>
        <path class="fx-belt-edge" d="M0 ${FLOOR} H${W}"/>
        <path data-belt class="fx-belt-marks" d="M0 ${FLOOR + 6} H${W}"/>
        <g data-rollers>${rollers}</g>
        <rect class="fx-floor" x="0" y="330" width="${W}" height="30"/>
    </svg>`;
}

/** Ángulos de un brazo de dos tramos que alcanza (tx, ty) desde el hombro (cinemática inversa). */
function solveArm(tx, ty) {
    let dx = tx - ARM.x;
    let dy = ty - ARM.y;
    const reach = ARM.l1 + ARM.l2 - 1;
    const dist = Math.min(Math.hypot(dx, dy), reach);
    const angle = Math.atan2(dy, dx);
    dx = Math.cos(angle) * dist;
    dy = Math.sin(angle) * dist;
    const cosElbow = (dist ** 2 - ARM.l1 ** 2 - ARM.l2 ** 2) / (2 * ARM.l1 * ARM.l2);
    const elbow = Math.acos(Math.max(-1, Math.min(1, cosElbow)));
    const shoulder = angle - Math.atan2(ARM.l2 * Math.sin(elbow), ARM.l1 + ARM.l2 * Math.cos(elbow));
    return { ex: ARM.x + Math.cos(shoulder) * ARM.l1, ey: ARM.y + Math.sin(shoulder) * ARM.l1, tx: ARM.x + dx, ty: ARM.y + dy };
}

function mount(host) {
    const lineIds = host.dataset.line ? [host.dataset.line] : CRANE_LINE_ORDER;
    host.innerHTML = markup(lineIds);
    const svg = host.firstElementChild;
    const trucks = [...svg.querySelectorAll('.fx-truck')].map(node => ({
        node,
        wheels: [...node.querySelectorAll('.fx-wheel')],
        badge: node.querySelector('[data-badge]'),
        badgeGroup: node.querySelector('.p-badge'),
        badgeLevel: -1,
        seq: -1
    }));
    const rollers = [...svg.querySelectorAll('.fx-roller')];
    const sparks = [...svg.querySelectorAll('.fx-spark')].map(node => ({ node, life: 0, x: 0, y: 0, vx: 0, vy: 0 }));
    const belt = svg.querySelector('[data-belt]');
    const arm = svg.querySelector('[data-arm]');
    const elbowJoint = svg.querySelector('[data-joint="1"]');
    const torch = svg.querySelector('[data-torch]');
    const cable = svg.querySelector('[data-hoist-cable]');
    const hook = svg.querySelector('[data-hoist-hook]');

    function placeArm(tx, ty) {
        const p = solveArm(tx, ty);
        arm.setAttribute('d', `M${ARM.x} ${ARM.y} L${p.ex.toFixed(1)} ${p.ey.toFixed(1)} L${p.tx.toFixed(1)} ${p.ty.toFixed(1)}`);
        elbowJoint.setAttribute('cx', p.ex.toFixed(1));
        elbowJoint.setAttribute('cy', p.ey.toFixed(1));
        torch.setAttribute('cx', p.tx.toFixed(1));
        torch.setAttribute('cy', p.ty.toFixed(1));
        return p;
    }

    /** Cada vez que una grúa da la vuelta (fuera de cuadro) se convierte en la siguiente línea y modelo. */
    function assign(truckState, seq) {
        truckState.seq = seq;
        const line = CRANE_LINES[lineIds[seq % lineIds.length]];
        const model = line.models[Math.floor(seq / lineIds.length) % line.models.length];
        truckState.node.dataset.type = line.id;
        truckState.node.querySelectorAll('.t-variant').forEach(part => part.classList.toggle('is-shown', part.dataset.variant === line.id));
        truckState.badge.textContent = `✓ ${model.model} · APROBADA`;
    }

    function placeTrucks(distance) {
        trucks.forEach((state, i) => {
            const travelled = i * SPACING + distance;
            const seq = Math.floor(travelled / LOOP) * COUNT + (COUNT - 1 - i);
            if (seq !== state.seq) assign(state, seq);
            const x = (travelled % LOOP) - 260;
            const middle = x + 110;
            state.node.setAttribute('transform', `translate(${x.toFixed(1)} 0)`);
            state.node.classList.toggle('s1', middle > STATIONS.weld);
            state.node.classList.toggle('s2', middle > STATIONS.hoist);
            state.node.classList.toggle('s3', middle > STATIONS.qc);
            // La etiqueta "aprobada" aparece al salir de calidad y se apaga antes del arco de entrega
            const level = Math.max(0, Math.min(1, (middle - STATIONS.qc) / 40, (BADGE_OFF - middle) / 60));
            const rounded = Math.round(level * 20) / 20;
            if (rounded !== state.badgeLevel) {
                state.badgeLevel = rounded;
                state.badgeGroup.style.opacity = String(rounded);
                state.badgeGroup.setAttribute('transform', `translate(0 ${((1 - rounded) * 8).toFixed(1)})`);
            }
            const angle = ((distance / 16) * 57.3) % 360;
            state.wheels.forEach(w => w.setAttribute('transform', `rotate(${angle.toFixed(1)} ${w.dataset.cx} ${FLOOR - 16})`));
        });
    }

    // Sin animación: una foto fija con una grúa en cada etapa
    if (prefersReducedMotion()) {
        placeTrucks(170);
        placeArm(ARM.x + 60, ARM.y - 30);
        return;
    }

    const pointer = { x: .5, cx: 0, cy: 0, active: false };
    if (matchMedia('(pointer: fine)').matches) {
        host.addEventListener('pointermove', event => {
            const rect = host.getBoundingClientRect();
            pointer.x = (event.clientX - rect.left) / rect.width;
            pointer.cx = event.clientX;
            pointer.cy = event.clientY;
            pointer.active = true;
        });
        host.addEventListener('pointerleave', () => { pointer.active = false; });
    }

    const state = { distance: 0, speed: 1.2, tx: ARM.x + 60, ty: ARM.y - 20 };
    let last = 0;
    let frameId = 0;

    function emitSpark(x, y) {
        const spark = sparks.find(item => item.life <= 0);
        if (spark) Object.assign(spark, { x, y, vx: (Math.random() - .5) * 4, vy: -Math.random() * 3 - .5, life: 1 });
    }

    function frame(now) {
        const dt = last ? Math.min((now - last) / 16.67, 3) : 1;
        last = now;
        // Velocidad de la banda: el cursor la controla; sin cursor, cambia sola
        const target = pointer.active ? .3 + pointer.x * 3.4 : 1.3 + Math.sin(now / 3000) * .8;
        state.speed += (target - state.speed) * .05 * dt;
        state.distance += state.speed * dt;
        const d = state.distance;

        placeTrucks(d);
        belt.style.strokeDashoffset = String((-d % 64).toFixed(1));
        const rollerAngle = ((d / 9) * 57.3) % 360;
        rollers.forEach(r => r.setAttribute('transform', `rotate(${rollerAngle.toFixed(1)} ${r.dataset.cx} 314)`));

        // Brazo: apunta al cursor; sin cursor, recorre la costura de la cabina
        let tx = ARM.x + 70 + Math.sin(now / 420) * 26;
        let ty = 228 + Math.sin(now / 260) * 10;
        if (pointer.active) {
            const point = new DOMPoint(pointer.cx, pointer.cy).matrixTransform(svg.getScreenCTM().inverse());
            tx = point.x;
            ty = Math.min(point.y, 290);
        }
        state.tx += (tx - state.tx) * .12 * dt;
        state.ty += (ty - state.ty) * .12 * dt;
        const tip = placeArm(state.tx, state.ty);

        // Chispas de soldadura en la punta del soplete
        if (Math.random() < .55 * dt) emitSpark(tip.tx, tip.ty);
        sparks.forEach(s => {
            if (s.life <= 0) return;
            s.life -= .03 * dt;
            s.vy += .18 * dt;
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.node.setAttribute('cx', s.x.toFixed(1));
            s.node.setAttribute('cy', s.y.toFixed(1));
            s.node.setAttribute('opacity', Math.max(0, s.life).toFixed(2));
        });

        // Polipasto: baja y sube la pieza de la carrocería
        const drop = 54 + (Math.sin(now / 900) + 1) * 24;
        cable.setAttribute('height', drop.toFixed(1));
        hook.setAttribute('transform', `translate(0 ${(136 + drop).toFixed(1)})`);
        frameId = requestAnimationFrame(frame);
    }

    // Solo anima mientras se ve en pantalla y la pestaña está activa.
    const start = () => { if (!frameId) { last = 0; frameId = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(frameId); frameId = 0; };
    let visible = false;
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        host.classList.toggle('is-playing', visible);
        if (visible && !document.hidden) start(); else stop();
    }).observe(host);
    document.addEventListener('visibilitychange', () => (visible && !document.hidden ? start() : stop()));
    placeTrucks(0);
    placeArm(state.tx, state.ty);
}

export function initAssemblyLine() {
    $$('[data-scene="assembly"]').forEach(mount);
}
