/**
 * Escena del panel de marca: inspección de calidad de las grúas Invictus.
 *
 * Un inspector (casco, visor de realidad aumentada y chaleco reflejante) revisa desde un panel
 * holográfico cómo se construye cada grúa en la bahía de ensamble:
 *   1. el chasis sube por el elevador,
 *   2. el soldador del pórtico agrega cabina, caja de arrastre, torre y luces,
 *   3. tras cada pieza, el escáner láser la revisa y el inspector la palomea en el holograma,
 *   4. con las 5 piezas aprobadas sale el sello "APROBADA" y la grúa se va; sube la siguiente.
 *
 * Interacción: la posición horizontal del cursor fija la velocidad de la línea; sobre la bahía, el
 * escáner sigue al cursor; clic en el holograma = nuevo escaneo, clic en la bahía = chispas.
 * Reacciona al formulario con el evento `invictus:scene` (typing | error | success | swap).
 *
 * Rendimiento: un solo <canvas>. Lo fijo (piso, pórtico, base del holograma con su retícula) se
 * pinta una vez en capas aparte; en cada cuadro solo se copian y se dibuja lo que se mueve.
 * Los brillos son sprites precalculados (sin shadowBlur ni filtros). Se pausa si no está visible.
 */
import { $, prefersReducedMotion } from '../core/dom.js';
import { play } from '../core/sound.js';

const W = 900;
const H = 318;               // deja una franja bajo el piso para el texto © del panel
const FLOOR = 290;
const C = { neon: '#3dffb4', brand: '#2a8f71', purple: '#b07cff', gold: '#ffcc4d', red: '#ff5d6c' };
const RGB = { neon: '61 255 180', purple: '176 124 255', gold: '255 204 77', red: '255 93 108', white: '255 255 255' };
const rgba = (name, a) => `rgb(${RGB[name]} / ${a})`;
const FONT = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';

/* ---------- Grúa (coordenadas del dibujo: piso en y = 300, mirando a la derecha) ---------- */
const TRUCK = { x: 540, s: 1.12 };
const CAB = 'M146 272 V214 Q146 206 154 206 H184 L208 234 Q218 238 218 248 V272Z';
const BED = 'M0 248 H140 V262 H0Z';
const BOOM = 'M18 248 L38 216 L72 216 L94 248 M38 216 L12 240';
const PARTS = [
    { id: 'chasis', label: 'CHASIS Y EJES', box: [-28, 258, 218, 300] },
    { id: 'cabina', label: 'CABINA', box: [146, 206, 218, 272] },
    { id: 'caja', label: 'CAJA DE ARRASTRE', box: [0, 248, 140, 262] },
    { id: 'torre', label: 'TORRE Y PLUMA', box: [12, 214, 94, 248] },
    { id: 'luces', label: 'LUCES Y SEÑALES', box: [150, 197, 220, 250] }
];
const WHEELS = [34, 68, 188];

/* ---------- Holograma ---------- */
const HOLO = { x: 162, y: 76, w: 232, h: 150, skew: -.06 };
const holoToWorld = (lx, ly) => ({ x: HOLO.x + lx, y: HOLO.y + ly + lx * HOLO.skew });
const ROW_Y = i => 40 + i * 20;

/* ---------- Pórtico de la bahía ---------- */
const GANTRY = { left: 442, right: 862, beam: 66 };
/* Inspector: pies en X, dibujado a escala S desde el piso */
const MAN = { x: 96, s: 1.28 };
const toMan = p => ({ x: MAN.x + (p.x - MAN.x) / MAN.s, y: FLOOR + (p.y - FLOOR) / MAN.s });
const fromMan = (x, y) => ({ x: MAN.x + (x - MAN.x) * MAN.s, y: FLOOR + (y - FLOOR) * MAN.s });

/* ---------- Línea de tiempo de cada grúa (segundos a velocidad 1) ---------- */
const STEPS = [
    { type: 'rise', dur: 1.3 },
    { type: 'check', part: 0, dur: 1.1 },
    ...[1, 2, 3, 4].flatMap(part => [{ type: 'build', part, dur: 1.1 }, { type: 'check', part, dur: 1.1 }]),
    { type: 'approve', dur: 1.8 },
    { type: 'exit', dur: 1.9 }
];

const ease = t => 1 - (1 - t) ** 3;
const easeIn = t => t * t * t;
const spring = t => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;   // pequeño rebote al llegar
const clamp01 = t => Math.max(0, Math.min(1, t));
const random = (a, b) => a + Math.random() * (b - a);

/** Caja de una pieza en coordenadas del mundo. */
function partBox(part, dx = 0, dy = 0) {
    const [x1, y1, x2, y2] = part.box;
    const tx = v => TRUCK.x + dx + v * TRUCK.s;
    const ty = v => FLOOR + dy + (v - 300) * TRUCK.s;
    return { x1: tx(x1), y1: ty(y1), x2: tx(x2), y2: ty(y2), cx: tx((x1 + x2) / 2), cy: ty((y1 + y2) / 2) };
}

function glowSprite(name) {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const g = canvas.getContext('2d');
    const gradient = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, rgba(name, .95));
    gradient.addColorStop(.25, rgba(name, .42));
    gradient.addColorStop(1, rgba(name, 0));
    g.fillStyle = gradient;
    g.fillRect(0, 0, size, size);
    return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
}

function setSpacing(ctx, px) { if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`; }

/** Brazo de dos tramos que alcanza (tx, ty) desde el hombro (cinemática inversa). */
function solveArm(sx, sy, l1, l2, tx, ty, bendUp = true) {
    let dx = tx - sx;
    let dy = ty - sy;
    const dist = Math.min(Math.hypot(dx, dy), l1 + l2 - .5);
    const angle = Math.atan2(dy, dx);
    const cosElbow = (dist ** 2 - l1 ** 2 - l2 ** 2) / (2 * l1 * l2);
    const elbow = Math.acos(Math.max(-1, Math.min(1, cosElbow))) * (bendUp ? -1 : 1);
    const shoulder = angle - Math.atan2(l2 * Math.sin(elbow), l1 + l2 * Math.cos(elbow));
    const ex = sx + Math.cos(shoulder) * l1;
    const ey = sy + Math.sin(shoulder) * l1;
    return { ex, ey, hx: sx + Math.cos(angle) * dist, hy: sy + Math.sin(angle) * dist };
}

export function initInspectionScene() {
    const host = $('#inspectionScene');
    if (!host) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'scene-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.append(canvas);
    const ctx = canvas.getContext('2d');
    const staticLayer = document.createElement('canvas');
    const holoLayer = document.createElement('canvas');

    const glows = Object.fromEntries(Object.keys(RGB).map(name => [name, glowSprite(name)]));
    const paths = { cab: new Path2D(CAB), bed: new Path2D(BED), boom: new Path2D(BOOM), blueprint: new Path2D(`${CAB} ${BED} ${BOOM} M2 262 H218 V272 H2Z`) };
    // Piezas del modelo en miniatura del holograma y torso del inspector (se crean una sola vez)
    paths.mini = [
        [0, new Path2D('M2 262 H218 V272 H2Z M18 284 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0 M52 284 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0 M172 284 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0')],
        [1, paths.cab], [2, paths.bed], [3, paths.boom],
        [4, new Path2D('M155 199 h26 v7 h-26z M212 242 h6 v6 h-6z')]
    ];
    const X0 = MAN.x;
    paths.torso = new Path2D(`M${X0 - 11} 218 L${X0 + 12} 218 L${X0 + 15} 172 Q${X0 + 14} 160 ${X0 + 4} 160 L${X0 - 6} 160 Q${X0 - 15} 160 ${X0 - 15} 172 Z`);
    const hazard = (() => {
        const tile = document.createElement('canvas');
        tile.width = 10; tile.height = 6;
        const g = tile.getContext('2d');
        g.fillStyle = '#141515'; g.fillRect(0, 0, 10, 6);
        g.fillStyle = '#f0b429';
        g.beginPath(); g.moveTo(0, 6); g.lineTo(4, 0); g.lineTo(8, 0); g.lineTo(4, 6); g.fill();
        return ctx.createPattern(tile, 'repeat');
    })();

    const view = { cssW: 0, cssH: 0, dpr: 1, scale: 1, offX: 0, offY: 0, margin: 14 };
    const pointer = { x: .5, lx: -999, ly: -999, active: false };
    const state = {
        speed: 1, parallax: 0, t: 0, unit: 427,
        alert: 0, celebrate: 0, holoPulse: 0, holoHover: 0, glitch: 0,
        hand: { x: 130, y: 200 }, welder: GANTRY.left + 30, scanner: GANTRY.right - 30,
        wheelAngle: 0, checkFlash: -1, checkFlashAge: 0, lastStepIndex: -1,
        sparks: Array.from({ length: 48 }, () => ({ life: 0, x: 0, y: 0, vx: 0, vy: 0, color: 'gold' })),
        rings: []
    };

    /* ---------- Capas fijas ---------- */

    function renderStatic() {
        const { cssW, cssH, dpr, margin } = view;
        staticLayer.width = Math.round((cssW + margin * 2) * dpr);
        staticLayer.height = Math.round(cssH * dpr);
        const g = staticLayer.getContext('2d');
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        const fullW = cssW + margin * 2;

        // Piso
        const floorY = view.offY + FLOOR * view.scale;
        const fade = g.createLinearGradient(0, floorY, 0, cssH);
        fade.addColorStop(0, 'rgb(0 0 0 / .35)');
        fade.addColorStop(1, 'rgb(0 0 0 / .55)');
        g.fillStyle = fade;
        g.fillRect(0, floorY, fullW, cssH - floorY);
        const edge = g.createLinearGradient(0, 0, fullW, 0);
        edge.addColorStop(0, rgba('neon', .15));
        edge.addColorStop(.25, rgba('neon', .8));
        edge.addColorStop(.6, rgba('neon', .8));
        edge.addColorStop(.8, rgba('purple', .6));
        edge.addColorStop(1, rgba('neon', .15));
        g.fillStyle = rgba('neon', .1);
        g.fillRect(0, floorY - 3, fullW, 7);
        g.fillStyle = edge;
        g.fillRect(0, floorY - .75, fullW, 1.5);

        g.save();
        g.translate(margin + view.offX, view.offY);
        g.scale(view.scale, view.scale);

        // Pórtico de la bahía de ensamble
        g.strokeStyle = 'rgb(255 255 255 / .22)';
        g.lineWidth = 3;
        g.lineJoin = 'round';
        g.beginPath();
        g.moveTo(GANTRY.left, FLOOR); g.lineTo(GANTRY.left, GANTRY.beam);
        g.lineTo(GANTRY.right, GANTRY.beam); g.lineTo(GANTRY.right, FLOOR);
        g.stroke();
        g.lineWidth = 1;
        g.strokeStyle = 'rgb(255 255 255 / .09)';
        for (const x of [GANTRY.left, GANTRY.right]) {
            for (let y = GANTRY.beam + 14; y < FLOOR - 10; y += 22) {
                g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 6, y + 22); g.moveTo(x + 6, y); g.lineTo(x - 6, y + 22); g.stroke();
            }
        }
        g.fillStyle = '#141616';
        g.fillRect(GANTRY.left - 8, GANTRY.beam - 8, GANTRY.right - GANTRY.left + 16, 12);
        g.strokeStyle = rgba('neon', .45);
        g.strokeRect(GANTRY.left - 8, GANTRY.beam - 8, GANTRY.right - GANTRY.left + 16, 12);
        g.font = `600 9px ${FONT}`;
        setSpacing(g, 3);
        g.fillStyle = 'rgb(255 255 255 / .35)';
        g.fillText('BAHÍA DE ENSAMBLE 03 · GRÚAS INVICTUS', GANTRY.left + 4, GANTRY.beam - 16);
        setSpacing(g, 0);

        // Elevador
        g.fillStyle = '#121414';
        g.fillRect(TRUCK.x - 50, FLOOR - 4, 330, 4);
        g.fillStyle = rgba('neon', .55);
        g.fillRect(TRUCK.x - 50, FLOOR - 4, 330, 1);
        g.fillStyle = 'rgb(240 180 41 / .5)';
        for (let x = TRUCK.x - 46; x < TRUCK.x + 276; x += 16) g.fillRect(x, FLOOR - 2.5, 7, 1.5);

        // Proyector del holograma
        const base = holoToWorld(HOLO.w / 2, HOLO.h);
        g.save();
        g.translate(base.x, FLOOR - 3);
        g.scale(1, .18);
        const disc = g.createRadialGradient(0, 0, 0, 0, 0, 52);
        disc.addColorStop(0, rgba('neon', .55));
        disc.addColorStop(.55, rgba('purple', .18));
        disc.addColorStop(1, rgba('purple', 0));
        g.fillStyle = disc;
        g.beginPath(); g.arc(0, 0, 52, 0, Math.PI * 2); g.fill();
        g.restore();
        g.fillStyle = '#151818';
        roundRect(g, base.x - 26, FLOOR - 8, 52, 8, 3);
        g.fill();
        g.strokeStyle = rgba('neon', .6);
        g.lineWidth = 1;
        g.stroke();
        g.restore();

        renderHoloBase();
    }

    /** Base del holograma (marco, retícula, líneas de barrido) a la resolución real de pantalla. */
    function renderHoloBase() {
        const f = view.scale * view.dpr;
        holoLayer.width = Math.ceil(HOLO.w * f);
        holoLayer.height = Math.ceil(HOLO.h * f);
        const g = holoLayer.getContext('2d');
        g.setTransform(f, 0, 0, f, 0, 0);
        const fill = g.createLinearGradient(0, 0, 0, HOLO.h);
        fill.addColorStop(0, rgba('neon', .13));
        fill.addColorStop(1, rgba('purple', .07));
        roundRect(g, .5, .5, HOLO.w - 1, HOLO.h - 1, 8);
        g.fillStyle = fill;
        g.fill();
        g.strokeStyle = rgba('neon', .45);
        g.lineWidth = 1;
        g.stroke();
        // Líneas de barrido horizontales
        g.fillStyle = rgba('neon', .05);
        for (let y = 3; y < HOLO.h; y += 3) g.fillRect(2, y, HOLO.w - 4, 1);
        // Esquinas brillantes
        g.strokeStyle = C.neon;
        g.lineWidth = 2;
        [[0, 0, 1, 1], [HOLO.w, 0, -1, 1], [0, HOLO.h, 1, -1], [HOLO.w, HOLO.h, -1, -1]].forEach(([x, y, sx, sy]) => {
            g.beginPath(); g.moveTo(x + sx * 14, y + sy * 1); g.lineTo(x + sx * 1, y + sy * 1); g.lineTo(x + sx * 1, y + sy * 14); g.stroke();
        });
        // Encabezado y divisiones
        g.font = `600 9px ${FONT}`;
        setSpacing(g, 2);
        g.fillStyle = rgba('neon', .9);
        g.fillText('INSPECCIÓN DE CALIDAD', 12, 15);
        setSpacing(g, 0);
        g.fillStyle = rgba('neon', .25);
        g.fillRect(10, 22, HOLO.w - 20, 1);
        g.fillRect(126, 28, 1, 92);
        g.font = `500 8px ${FONT}`;
        setSpacing(g, 1.5);
        g.fillStyle = 'rgb(255 255 255 / .45)';
        g.fillText('ESCANEO 3D', 136, 36);
        g.fillText('TOLERANCIA ±0.2 MM', 136, 108);
        setSpacing(g, 0);
    }

    function resize() {
        const rect = host.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        view.cssW = rect.width;
        view.cssH = rect.height;
        view.dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(rect.width * view.dpr);
        canvas.height = Math.round(rect.height * view.dpr);
        // Se recorta el aire de los lados para que inspector y grúa se vean lo más grandes posible
        const narrow = rect.width < 620;
        const x0 = narrow ? 66 : 48;
        const vw = narrow ? 810 : 834;
        view.scale = Math.min(rect.width / vw, rect.height / H);
        view.offX = (rect.width - vw * view.scale) / 2 - x0 * view.scale;
        view.offY = rect.height - H * view.scale;
        renderStatic();
        if (reduced) drawFrame(performance.now(), 0);
    }

    /* ---------- Línea de tiempo ---------- */

    const TOTAL = STEPS.reduce((sum, step) => sum + step.dur, 0);

    /** Estado derivado del tiempo: qué pieza se arma, cuál se revisa, dónde está la grúa. */
    function timeline(t) {
        let acc = 0;
        let index = 0;
        while (index < STEPS.length - 1 && t >= acc + STEPS[index].dur) acc += STEPS[index++].dur;
        const step = STEPS[index];
        const p = clamp01((t - acc) / step.dur);
        const tl = { index, step, p, rise: 0, dx: 0, built: [], checked: 0, target: null, approved: false, exiting: false };
        let checked = 0;
        const built = [0, 0, 0, 0, 0];
        for (let i = 0; i < index; i++) {
            const s = STEPS[i];
            if (s.type === 'rise') built[0] = 1;
            if (s.type === 'build') built[s.part] = 1;
            if (s.type === 'check') checked++;
        }
        if (step.type === 'rise') { tl.rise = 1 - ease(p); built[0] = 1; }
        if (step.type === 'build') built[step.part] = p;
        if (step.type === 'check' || step.type === 'build') tl.target = step.part;
        if (step.type === 'approve') tl.approved = true;
        if (step.type === 'exit') { tl.approved = true; tl.exiting = true; tl.dx = easeIn(p) * 420; }
        tl.built = built;
        tl.checked = checked;
        return tl;
    }

    /* ---------- Eventos ---------- */

    function emitSpark(x, y, color = 'gold', power = 1) {
        const spark = state.sparks.find(s => s.life <= 0);
        if (!spark) return;
        Object.assign(spark, { x, y, color, vx: random(-2.2, 2.2) * power, vy: random(-2.6, -.4) * power, life: 1 });
    }

    function ring(x, y, color = 'neon', max = 60) { state.rings.push({ x, y, color, r: 4, max }); }

    function sceneEvent(type) {
        if (type === 'typing') state.holoPulse = Math.min(1, state.holoPulse + .35);
        else if (type === 'error') { state.alert = 1; state.glitch = 1; }
        else if (type === 'success') {
            state.celebrate = 1;
            const center = holoToWorld(HOLO.w / 2, HOLO.h / 2);
            ring(center.x, center.y, 'gold', 150);
            for (let i = 0; i < 26; i++) emitSpark(random(TRUCK.x, TRUCK.x + 240), random(200, 260), i % 3 ? 'gold' : 'neon', 1.4);
        } else if (type === 'swap') state.glitch = Math.max(state.glitch, .5);
    }

    function toLogical(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        return { x: (clientX - rect.left - view.offX - state.parallax) / view.scale, y: (clientY - rect.top - view.offY) / view.scale };
    }
    const overHolo = (x, y) => x > HOLO.x - 4 && x < HOLO.x + HOLO.w + 4 && y > HOLO.y + (x - HOLO.x) * HOLO.skew - 4 && y < HOLO.y + HOLO.h + (x - HOLO.x) * HOLO.skew + 4;
    const overBay = (x, y) => x > GANTRY.left && x < GANTRY.right && y > GANTRY.beam && y < FLOOR;

    /* ---------- Dibujo ---------- */

    function glow(name, x, y, size, alpha = 1) {
        ctx.globalAlpha = alpha;
        ctx.drawImage(glows[name], x - size / 2, y - size / 2, size, size);
        ctx.globalAlpha = 1;
    }

    function drawTruck(tl, now) {
        const { built, rise, dx, approved } = tl;
        const dy = rise * 70;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W + 20, FLOOR + .5);       // lo que está bajo el piso (elevador) no se ve
        ctx.clip();
        ctx.translate(TRUCK.x + dx, FLOOR + dy);
        ctx.scale(TRUCK.s, TRUCK.s);
        ctx.translate(0, -300);

        // Plano punteado de la grúa completa
        if (!tl.exiting) {
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = rgba('purple', approved ? .15 : .45);
            ctx.lineWidth = 1.1;
            ctx.stroke(paths.blueprint);
            ctx.setLineDash([]);
        }

        const part = (i, draw) => {
            const a = built[i];
            if (a <= 0) return;
            ctx.save();
            ctx.globalAlpha = Math.min(1, a * 1.6);
            ctx.translate(0, (1 - spring(a)) * -26);
            draw();
            ctx.restore();
        };

        // Chasis, enganche y ruedas
        part(0, () => {
            ctx.fillStyle = '#1b1d1d';
            ctx.strokeStyle = 'rgb(255 255 255 / .4)';
            ctx.lineWidth = 1.4;
            roundRect(ctx, 2, 262, 216, 10, 2);
            ctx.fill(); ctx.stroke();
            ctx.strokeStyle = 'rgb(255 255 255 / .55)';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(2, 266); ctx.lineTo(-14, 276); ctx.lineTo(-20, 288); ctx.moveTo(-28, 288); ctx.lineTo(-10, 288); ctx.stroke();
            WHEELS.forEach(cx => {
                ctx.fillStyle = '#0d0e0e';
                ctx.strokeStyle = 'rgb(255 255 255 / .45)';
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(cx, 284, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.strokeStyle = C.neon;
                ctx.beginPath(); ctx.arc(cx, 284, 8.8, 0, Math.PI * 2); ctx.stroke();
                ctx.save();
                ctx.translate(cx, 284);
                ctx.rotate(state.wheelAngle);
                ctx.strokeStyle = 'rgb(255 255 255 / .55)';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(-8.8, 0); ctx.lineTo(8.8, 0); ctx.moveTo(0, -8.8); ctx.lineTo(0, 8.8); ctx.stroke();
                ctx.restore();
            });
        });
        // Cabina
        part(1, () => {
            ctx.fillStyle = approved ? rgba('neon', .3) : 'rgb(42 143 113 / .32)';
            ctx.strokeStyle = approved ? C.neon : 'rgb(255 255 255 / .6)';
            ctx.lineWidth = 1.5;
            ctx.fill(paths.cab); ctx.stroke(paths.cab);
            ctx.fillStyle = rgba('neon', .14);
            ctx.strokeStyle = rgba('neon', .45);
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(154, 214); ctx.lineTo(182, 214); ctx.lineTo(200, 234); ctx.lineTo(154, 234); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = 'rgb(255 255 255 / .3)';
            ctx.beginPath(); ctx.moveTo(152, 240); ctx.lineTo(214, 240); ctx.moveTo(182, 240); ctx.lineTo(182, 268); ctx.stroke();
        });
        // Caja de arrastre con franjas de seguridad
        part(2, () => {
            ctx.fillStyle = 'rgb(255 255 255 / .06)';
            ctx.strokeStyle = 'rgb(255 255 255 / .45)';
            ctx.lineWidth = 1.5;
            ctx.fill(paths.bed); ctx.stroke(paths.bed);
            ctx.fillStyle = hazard;
            ctx.globalAlpha *= .85;
            ctx.fillRect(0, 256, 140, 6);
        });
        // Torre y pluma
        part(3, () => {
            ctx.strokeStyle = 'rgb(255 255 255 / .65)';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke(paths.boom);
            ctx.strokeStyle = C.neon;
            ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(12, 240); ctx.lineTo(8, 252); ctx.stroke();
        });
        // Luces, faro y marca
        part(4, () => {
            const flashing = approved && Math.floor(now / 220) % 2 === 0;
            ctx.fillStyle = flashing ? '#ffb938' : 'rgb(255 185 56 / .45)';
            roundRect(ctx, 155, 199, 26, 7, 3); ctx.fill();
            ctx.fillStyle = '#fff3c4';
            roundRect(ctx, 212, 242, 6, 6, 1.5); ctx.fill();
            ctx.font = `700 10px ${FONT}`;
            setSpacing(ctx, .5);
            ctx.fillStyle = '#fff';
            ctx.fillText('INVICTUS', 151, 259);
            setSpacing(ctx, 0);
            if (flashing) {
                ctx.globalCompositeOperation = 'lighter';
                ctx.drawImage(glows.gold, 148, 182, 40, 40);
                ctx.globalCompositeOperation = 'source-over';
            }
        });
        ctx.restore();

        // Faro encendido y sello sobre la grúa
        if (built[4] >= 1) {
            ctx.globalCompositeOperation = 'lighter';
            glow('gold', TRUCK.x + dx + 216 * TRUCK.s, FLOOR + (245 - 300) * TRUCK.s, 24, .8);
            ctx.globalCompositeOperation = 'source-over';
        }
        if (approved) {
            const a = tl.exiting ? 1 - tl.p : ease(Math.min(1, tl.p * 3));
            const bx = TRUCK.x + dx + 110 * TRUCK.s;
            const by = 150 - (tl.exiting ? tl.p * 10 : 0);
            ctx.globalAlpha = a;
            roundRect(ctx, bx - 46, by - 13, 92, 26, 13);
            ctx.fillStyle = 'rgb(20 21 21 / .9)';
            ctx.fill();
            ctx.strokeStyle = C.gold;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.font = `700 12px ${FONT}`;
            setSpacing(ctx, 1.5);
            ctx.textAlign = 'center';
            ctx.fillStyle = C.gold;
            ctx.fillText('✓ APROBADA', bx, by + 4.5);
            ctx.textAlign = 'left';
            setSpacing(ctx, 0);
            ctx.globalAlpha = 1;
        }
    }

    function drawGantry(tl, dt, now) {
        // Soldador: va a la pieza que se arma
        const building = tl.step.type === 'build';
        const checking = tl.step.type === 'check';
        const target = tl.target != null ? partBox(PARTS[tl.target]) : null;
        const welderX = building && target ? target.cx : GANTRY.left + 34;
        state.welder += (welderX - state.welder) * Math.min(1, .12 * dt);

        // Escáner: revisa la pieza; si el cursor está sobre la bahía, lo sigue
        const manual = pointer.active && overBay(pointer.lx, pointer.ly);
        const scanX = manual ? pointer.lx : checking && target ? target.cx : GANTRY.right - 34;
        state.scanner += (scanX - state.scanner) * Math.min(1, (manual ? .2 : .1) * dt);

        // Carro del soldador con brazo telescópico
        const weldDepth = building && target ? Math.max(0, target.y1 - GANTRY.beam - 14) * ease(Math.min(1, tl.p * 2.2)) : 10;
        const wx = state.welder;
        ctx.fillStyle = '#1b1d1d';
        ctx.strokeStyle = rgba('gold', .7);
        ctx.lineWidth = 1.2;
        roundRect(ctx, wx - 13, GANTRY.beam + 4, 26, 11, 3);
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgb(255 255 255 / .55)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(wx, GANTRY.beam + 15); ctx.lineTo(wx, GANTRY.beam + 15 + weldDepth * .5); ctx.stroke();
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(wx, GANTRY.beam + 15 + weldDepth * .5); ctx.lineTo(wx, GANTRY.beam + 15 + weldDepth); ctx.stroke();
        const tipY = GANTRY.beam + 17 + weldDepth;
        if (building && tl.p > .3 && tl.p < .95) {
            ctx.globalCompositeOperation = 'lighter';
            glow('gold', wx, tipY, 30 + Math.random() * 10, .9);
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#fff';
            ctx.fillRect(wx - 1.5, tipY - 1.5, 3, 3);
            if (Math.random() < .7 * dt) emitSpark(wx + random(-4, 4), tipY);
        }

        // Carro del escáner con abanico láser
        const sx = state.scanner;
        ctx.fillStyle = '#1b1d1d';
        ctx.strokeStyle = rgba('neon', .8);
        ctx.lineWidth = 1.2;
        roundRect(ctx, sx - 11, GANTRY.beam + 4, 22, 9, 3);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.neon;
        ctx.fillRect(sx - 3, GANTRY.beam + 13, 6, 2);
        const scanning = manual || (checking && target);
        if (scanning) {
            const box = manual ? { x1: sx - 26, x2: sx + 26, y2: FLOOR } : target;
            const sweep = manual ? .5 + Math.sin(now / 260) * .5 : (Math.sin(tl.p * Math.PI * 3) + 1) / 2;
            const lineX = box.x1 + (box.x2 - box.x1) * sweep;
            ctx.fillStyle = laserFan;
            ctx.beginPath();
            ctx.moveTo(sx, GANTRY.beam + 15);
            ctx.lineTo(box.x2, box.y2);
            ctx.lineTo(box.x1, box.y2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = rgba('neon', .85);
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(sx, GANTRY.beam + 15); ctx.lineTo(lineX, box.y2); ctx.stroke();
            ctx.globalCompositeOperation = 'lighter';
            glow('neon', lineX, box.y2 - 2, 18, .9);
            ctx.globalCompositeOperation = 'source-over';
        }

        // Luces del pórtico
        for (let i = 0; i < 6; i++) {
            const on = Math.floor(now / 400 + i) % 6 === 0;
            ctx.fillStyle = on ? C.neon : rgba('neon', .2);
            ctx.fillRect(GANTRY.left + 30 + i * 70, GANTRY.beam - 2, 8, 2);
        }
    }

    /** Escuadras de enfoque alrededor de la pieza que se revisa. */
    function drawBrackets(box, color, now) {
        const pad = 5 + Math.sin(now / 160) * 1.5;
        const x1 = box.x1 - pad, y1 = box.y1 - pad, x2 = box.x2 + pad, y2 = box.y2 + pad;
        const len = 7;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x1, y1 + len); ctx.lineTo(x1, y1); ctx.lineTo(x1 + len, y1);
        ctx.moveTo(x2 - len, y1); ctx.lineTo(x2, y1); ctx.lineTo(x2, y1 + len);
        ctx.moveTo(x2, y2 - len); ctx.lineTo(x2, y2); ctx.lineTo(x2 - len, y2);
        ctx.moveTo(x1 + len, y2); ctx.lineTo(x1, y2); ctx.lineTo(x1, y2 - len);
        ctx.stroke();
    }

    function drawHolo(tl, now, dt) {
        const red = state.alert > .05;
        const gold = state.celebrate > .05;
        const hoverTarget = pointer.active && overHolo(pointer.lx, pointer.ly) ? 1 : 0;
        state.holoHover += (hoverTarget - state.holoHover) * Math.min(1, .15 * dt);
        const flicker = .82 + Math.sin(now / 90) * .03 + (Math.random() < .03 ? -.25 : 0);
        const alpha = Math.min(1, flicker + state.holoPulse * .2 + state.holoHover * .15);

        // Haz del proyector hacia el panel
        const base = holoToWorld(HOLO.w / 2, HOLO.h);
        const bl = holoToWorld(8, HOLO.h);
        const br = holoToWorld(HOLO.w - 8, HOLO.h);
        ctx.fillStyle = beamGradient;
        ctx.globalAlpha = .55 + state.holoHover * .3;
        ctx.beginPath();
        ctx.moveTo(base.x - 20, FLOOR - 8); ctx.lineTo(base.x + 20, FLOOR - 8);
        ctx.lineTo(br.x, br.y); ctx.lineTo(bl.x, bl.y);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.save();
        // Falla visual (glitch): el panel se desplaza en franjas
        const jitter = state.glitch > .05 ? (Math.random() - .5) * 10 * state.glitch : 0;
        ctx.transform(1, HOLO.skew, 0, 1, HOLO.x + jitter, HOLO.y);
        ctx.globalAlpha = alpha;
        ctx.drawImage(holoLayer, 0, 0, HOLO.w, HOLO.h);
        if (red || gold) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = rgba(red ? 'red' : 'gold', (red ? state.alert : state.celebrate) * .22);
            roundRect(ctx, 0, 0, HOLO.w, HOLO.h, 8);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }

        // Unidad en revisión
        ctx.font = `600 9px ${FONT}`;
        setSpacing(ctx, 1.5);
        ctx.textAlign = 'right';
        ctx.fillStyle = red ? C.red : C.gold;
        ctx.fillText(red ? '⚠ ALERTA' : `UNIDAD IC-0${state.unit}`, HOLO.w - 12, 15);
        ctx.textAlign = 'left';

        // Lista de verificación
        PARTS.forEach((part, i) => {
            const y = ROW_Y(i);
            const done = i < tl.checked || tl.approved;
            const active = tl.step.type === 'check' && tl.step.part === i;
            const color = done ? C.neon : active ? C.purple : 'rgb(255 255 255 / .3)';
            if (active) {
                ctx.fillStyle = rgba('purple', .14 + Math.sin(now / 140) * .05);
                ctx.fillRect(8, y - 9, 114, 15);
            }
            if (i === state.checkFlash && state.checkFlashAge < 1) {
                ctx.fillStyle = rgba('neon', .35 * (1 - state.checkFlashAge));
                ctx.fillRect(8, y - 9, 114, 15);
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.2;
            ctx.strokeRect(12.5, y - 6.5, 9, 9);
            if (done) {
                ctx.beginPath(); ctx.moveTo(14.5, y - 2); ctx.lineTo(16.8, y + .5); ctx.lineTo(20.5, y - 4.5); ctx.stroke();
            } else if (active) {
                ctx.fillStyle = C.purple;
                ctx.fillRect(15, y - 4, 4 * Math.min(1, tl.p * 1.4), 4);
            }
            ctx.font = `600 9.5px ${FONT}`;
            ctx.fillStyle = done ? 'rgb(255 255 255 / .9)' : active ? '#fff' : 'rgb(255 255 255 / .45)';
            ctx.fillText(part.label, 28, y + 2, 72);
            ctx.textAlign = 'right';
            ctx.font = `600 8.5px ${FONT}`;
            ctx.fillStyle = color;
            ctx.fillText(done ? 'OK' : active ? '•'.repeat(1 + Math.floor(now / 200) % 3) : '—', 120, y + 2);
            ctx.textAlign = 'left';
        });
        setSpacing(ctx, 0);

        // Modelo 3D en miniatura con la pieza actual resaltada
        ctx.save();
        ctx.translate(140, 86);
        ctx.scale(.34, .34);
        ctx.translate(26, -300);
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        paths.mini.forEach(([i, path]) => {
            const isTarget = tl.target === i && !tl.approved;
            const ready = tl.built[i] >= 1;
            ctx.setLineDash(ready ? [] : [6, 6]);
            ctx.strokeStyle = isTarget ? C.purple : ready ? rgba('neon', gold ? 1 : .85) : 'rgb(255 255 255 / .22)';
            ctx.lineWidth = isTarget ? 4.5 : 3;
            ctx.stroke(path);
        });
        ctx.setLineDash([]);
        ctx.restore();
        // Barrido del escáner sobre el modelo
        const scanX = 134 + ((now / 1400) % 1) * 88;
        ctx.fillStyle = rgba('neon', .5);
        ctx.fillRect(scanX, 42, 1, 56);

        ctx.font = `600 8.5px ${FONT}`;
        ctx.fillStyle = rgba('neon', .85);
        ctx.fillText(`PRECISIÓN ${(99.4 + Math.sin(now / 700) * .3 + .3).toFixed(1)}%`, 136, 120);

        // Avance
        const progress = tl.approved ? 1 : (tl.checked + (tl.step.type === 'check' ? tl.p : 0)) / PARTS.length;
        ctx.font = `600 8px ${FONT}`;
        setSpacing(ctx, 1.5);
        ctx.fillStyle = 'rgb(255 255 255 / .5)';
        ctx.fillText('AVANCE', 12, 134);
        ctx.textAlign = 'right';
        ctx.fillStyle = progress >= 1 ? C.gold : C.neon;
        ctx.fillText(`${Math.round(progress * 100)}%`, HOLO.w - 12, 134);
        ctx.textAlign = 'left';
        setSpacing(ctx, 0);
        ctx.fillStyle = 'rgb(255 255 255 / .1)';
        ctx.fillRect(12, 139, HOLO.w - 24, 4);
        ctx.fillStyle = progress >= 1 ? C.gold : C.neon;
        ctx.fillRect(12, 139, (HOLO.w - 24) * progress, 4);

        // Sello de aprobación en el holograma
        if (tl.approved && !tl.exiting) {
            const a = ease(Math.min(1, tl.p * 2.5));
            ctx.save();
            ctx.globalAlpha = a * alpha;
            ctx.translate(HOLO.w / 2, 72);
            ctx.rotate(-.12);
            ctx.scale(1.4 - a * .4, 1.4 - a * .4);
            roundRect(ctx, -62, -16, 124, 32, 6);
            ctx.fillStyle = 'rgb(20 21 21 / .82)';
            ctx.fill();
            ctx.strokeStyle = C.gold;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.font = `700 16px ${FONT}`;
            setSpacing(ctx, 2.5);
            ctx.textAlign = 'center';
            ctx.fillStyle = C.gold;
            ctx.fillText('APROBADA', 0, 6);
            setSpacing(ctx, 0);
            ctx.restore();
        }
        ctx.restore();
    }

    /** Enlace de datos del holograma a la pieza que se revisa. */
    function drawLink(tl, now) {
        if (tl.step.type !== 'check') return;
        const box = partBox(PARTS[tl.step.part]);
        const from = holoToWorld(HOLO.w, 60);
        const color = state.alert > .05 ? 'red' : 'purple';
        ctx.setLineDash([3, 5]);
        ctx.lineDashOffset = -now / 30;
        ctx.strokeStyle = rgba(color, .7);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(box.x1 - 8, box.cy);
        ctx.stroke();
        ctx.setLineDash([]);
        const k = (now / 700) % 1;
        ctx.globalCompositeOperation = 'lighter';
        glow(color, from.x + (box.x1 - 8 - from.x) * k, from.y + (box.cy - from.y) * k, 14, 1);
        ctx.globalCompositeOperation = 'source-over';
        drawBrackets(box, state.alert > .05 ? C.red : C.neon, now);
    }

    /** El inspector: casco, visor de realidad aumentada, chaleco con franjas y tableta. */
    function drawInspector(tl, now, dt) {
        const bob = Math.sin(now / 900) * .8;
        const X = MAN.x;

        // Mano: toca la fila que se revisa, el botón al aprobar, o descansa
        let target;
        if (state.celebrate > .3) target = fromMan(X + 30, 112 + Math.sin(now / 120) * 3);
        else if (tl.step.type === 'check') {
            const row = holoToWorld(17, ROW_Y(tl.step.part) - 2);
            const tap = tl.p > .55 && tl.p < .75 ? 3 : 0;
            target = { x: row.x + tap, y: row.y };
        } else if (tl.approved && !tl.exiting) target = holoToWorld(40, 141);
        else if (pointer.active && overHolo(pointer.lx, pointer.ly)) target = { x: pointer.lx, y: pointer.ly };
        else target = fromMan(X + 24, 200 + bob);
        state.hand.x += (target.x - state.hand.x) * Math.min(1, .1 * dt);
        state.hand.y += (target.y - state.hand.y) * Math.min(1, .1 * dt);
        const hand = toMan(state.hand);
        ctx.save();
        ctx.translate(X, FLOOR);
        ctx.scale(MAN.s, MAN.s);
        ctx.translate(-X, -FLOOR);

        // Luz del holograma sobre el inspector
        ctx.globalCompositeOperation = 'lighter';
        glow('neon', X + 30, 170, 150, .16 + state.holoHover * .08);
        ctx.globalCompositeOperation = 'source-over';

        const body = '#1b2121';
        const rim = rgba('neon', .55);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Brazo trasero con la tableta
        ctx.strokeStyle = '#151a1a';
        ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(X - 6, 168 + bob); ctx.lineTo(X - 10, 192 + bob); ctx.lineTo(X - 2, 208 + bob); ctx.stroke();
        ctx.save();
        ctx.translate(X - 4, 206 + bob);
        ctx.rotate(-.35);
        ctx.fillStyle = '#101414';
        ctx.fillRect(-9, -6, 18, 12);
        ctx.fillStyle = rgba('purple', .75);
        ctx.fillRect(-7, -4, 14, 8);
        ctx.restore();

        // Piernas y botas
        ctx.strokeStyle = body;
        ctx.lineWidth = 11;
        ctx.beginPath(); ctx.moveTo(X - 5, 214); ctx.lineTo(X - 9, 282); ctx.moveTo(X + 6, 214); ctx.lineTo(X + 12, 282); ctx.stroke();
        ctx.strokeStyle = rim;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(X + 11, 216); ctx.lineTo(X + 17, 280); ctx.moveTo(X - 1, 218); ctx.lineTo(X - 4, 280); ctx.stroke();
        // Rodilleras reflejantes
        ctx.fillStyle = 'rgb(240 180 41 / .6)';
        ctx.fillRect(X - 12, 250, 7, 2);
        ctx.fillRect(X + 7, 250, 8, 2);
        ctx.fillStyle = '#0f1212';
        roundRect(ctx, X - 16, 280, 14, 8, 3); ctx.fill();
        roundRect(ctx, X + 6, 280, 16, 8, 3); ctx.fill();
        ctx.strokeStyle = 'rgb(240 180 41 / .7)';
        ctx.beginPath(); ctx.moveTo(X + 7, 284); ctx.lineTo(X + 21, 284); ctx.stroke();

        // Torso con chaleco reflejante
        ctx.save();
        ctx.translate(0, bob);
        const torso = paths.torso;
        ctx.fillStyle = body;
        ctx.fill(torso);
        ctx.save();
        ctx.clip(torso);
        ctx.fillStyle = 'rgb(240 180 41 / .85)';
        ctx.fillRect(X - 16, 186, 34, 3);
        ctx.fillRect(X - 16, 200, 34, 3);
        ctx.fillStyle = 'rgb(255 255 255 / .06)';
        ctx.fillRect(X - 1, 160, 2, 58);
        ctx.restore();
        ctx.strokeStyle = rim;
        ctx.lineWidth = 1.1;
        ctx.stroke(torso);
        // Cinturón de herramientas
        ctx.fillStyle = '#0f1313';
        ctx.fillRect(X - 12, 213, 25, 6);
        ctx.fillStyle = rgba('neon', .8);
        ctx.fillRect(X - 1, 214.5, 4, 3);
        // Gafete
        ctx.fillStyle = C.neon;
        ctx.fillRect(X + 5, 172, 6, 8);

        // Cabeza, visor y casco
        const hx = X + 2;
        const hy = 145;
        ctx.fillStyle = '#2a3030';
        ctx.fillRect(hx - 3, hy + 8, 7, 8);                    // cuello
        ctx.beginPath(); ctx.arc(hx, hy, 11, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(hx + 10, hy - 1); ctx.lineTo(hx + 14, hy + 3); ctx.lineTo(hx + 10, hy + 4); ctx.fill();   // nariz
        ctx.strokeStyle = rim;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(hx, hy, 11, -1.2, 1.3); ctx.stroke();
        // Visor de realidad aumentada
        const visorGlow = .75 + Math.sin(now / 300) * .2 + state.holoPulse * .2;
        ctx.fillStyle = state.alert > .05 ? C.red : C.neon;
        ctx.globalAlpha = Math.min(1, visorGlow);
        roundRect(ctx, hx + 1, hy - 5, 13, 5, 2.5);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'lighter';
        glow(state.alert > .05 ? 'red' : 'neon', hx + 9, hy - 3, 26, .7);
        ctx.globalCompositeOperation = 'source-over';
        // Casco
        ctx.fillStyle = '#e8ecea';
        ctx.beginPath();
        ctx.moveTo(hx - 13, hy - 6);
        ctx.quadraticCurveTo(hx - 12, hy - 22, hx + 1, hy - 22);
        ctx.quadraticCurveTo(hx + 13, hy - 22, hx + 13, hy - 7);
        ctx.lineTo(hx + 19, hy - 6);
        ctx.lineTo(hx + 19, hy - 4);
        ctx.lineTo(hx - 13, hy - 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = C.brand;
        ctx.fillRect(hx - 3, hy - 21, 4, 15);                 // franja del casco
        ctx.restore();

        // Brazo delantero (cinemática inversa hacia el holograma)
        const sx = X + 8;
        const sy = 168 + bob;
        const arm = solveArm(sx, sy, 32, 32, hand.x, hand.y, false);
        ctx.strokeStyle = body;
        ctx.lineWidth = 8.5;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(arm.ex, arm.ey); ctx.lineTo(arm.hx, arm.hy); ctx.stroke();
        ctx.strokeStyle = rim;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sx + 3, sy - 2); ctx.lineTo(arm.ex + 2, arm.ey - 3); ctx.lineTo(arm.hx, arm.hy - 3); ctx.stroke();
        ctx.fillStyle = '#2a3030';
        ctx.beginPath(); ctx.arc(arm.hx, arm.hy, 3.6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Punto de contacto con el holograma
        const tip = fromMan(arm.hx + 3, arm.hy);
        if (overHolo(tip.x + 2, tip.y)) {
            ctx.globalCompositeOperation = 'lighter';
            glow(state.alert > .05 ? 'red' : 'purple', tip.x, tip.y, 18 + Math.sin(now / 120) * 3, .9);
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    function drawEffects(dt) {
        ctx.globalCompositeOperation = 'lighter';
        state.sparks.forEach(s => {
            if (s.life <= 0) return;
            s.life -= .028 * dt;
            s.vy += .16 * dt;
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            if (s.y > FLOOR) { s.y = FLOOR; s.vy *= -.35; s.vx *= .6; }
            ctx.globalAlpha = Math.max(0, s.life);
            ctx.fillStyle = s.color === 'gold' ? '#ffd27a' : C[s.color];
            ctx.fillRect(s.x - 1, s.y - 1, 2, 2);
        });
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        for (let i = state.rings.length - 1; i >= 0; i--) {
            const r = state.rings[i];
            r.r += (r.max - r.r) * .06 * dt + .3 * dt;
            const life = 1 - r.r / r.max;
            if (life <= .02) { state.rings.splice(i, 1); continue; }
            ctx.strokeStyle = rgba(r.color, life * .8);
            ctx.lineWidth = 1 + life * 2;
            ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
        }
    }

    let beamGradient, laserFan;
    function makeGradients() {
        beamGradient = ctx.createLinearGradient(0, FLOOR, 0, HOLO.y + HOLO.h - 10);
        beamGradient.addColorStop(0, rgba('neon', .3));
        beamGradient.addColorStop(1, rgba('neon', .02));
        laserFan = ctx.createLinearGradient(0, GANTRY.beam, 0, FLOOR);
        laserFan.addColorStop(0, rgba('neon', .3));
        laserFan.addColorStop(1, rgba('neon', .04));
    }

    function drawFrame(now, dt) {
        const tl = timeline(state.t);
        const { dpr } = view;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(staticLayer, Math.round((state.parallax - view.margin) * dpr), 0);
        ctx.setTransform(dpr * view.scale, 0, 0, dpr * view.scale, (view.offX + state.parallax) * dpr, view.offY * dpr);

        drawGantry(tl, dt, now);
        drawTruck(tl, now);
        drawLink(tl, now);
        drawHolo(tl, now, dt);
        drawInspector(tl, now, dt);
        drawEffects(dt);
        return tl;
    }

    /* ---------- Bucle ---------- */

    const reduced = prefersReducedMotion();
    makeGradients();
    new ResizeObserver(resize).observe(host);
    document.fonts?.ready.then(() => { if (view.cssW) renderStatic(); });

    if (reduced) {
        // Sin animación: foto fija a media inspección
        state.t = STEPS.slice(0, 6).reduce((sum, s) => sum + s.dur, 0) + .5;
        resize();
        return;
    }

    const finePointer = matchMedia('(pointer: fine)').matches;
    if (finePointer) {
        window.addEventListener('pointermove', event => {
            pointer.x = event.clientX / innerWidth;
            pointer.active = true;
            const l = toLogical(event.clientX, event.clientY);
            pointer.lx = l.x;
            pointer.ly = l.y;
        }, { passive: true });
        document.addEventListener('pointerleave', () => { pointer.active = false; pointer.lx = pointer.ly = -999; });
    }

    let wasOverHolo = false;
    canvas.addEventListener('click', event => {
        const l = toLogical(event.clientX, event.clientY);
        if (overHolo(l.x, l.y)) {
            state.holoPulse = 1;
            state.glitch = .35;
            ring(l.x, l.y, 'purple', 70);
            play('ping', { index: 2 });
        } else if (l.y < FLOOR && l.x > GANTRY.left - 20) {
            for (let i = 0; i < 16; i++) emitSpark(l.x, l.y, i % 4 ? 'gold' : 'neon', 1.2);
            ring(l.x, l.y, 'gold', 40);
            play('blip', { index: 4 });
        }
    });

    window.addEventListener('invictus:scene', event => sceneEvent(event.detail?.type));

    let visible = true;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(host);
    let last = performance.now();

    function frame(now) {
        requestAnimationFrame(frame);
        const dt = Math.min((now - last) / 16.67, 3);
        last = now;
        if (!visible || document.hidden || !view.cssW) return;

        // Velocidad de la línea: el cursor la controla; sin cursor, va a ritmo normal
        const target = pointer.active ? .6 + pointer.x * 1.3 : 1;
        state.speed += (target - state.speed) * .05 * dt;
        const parallaxTarget = pointer.active ? (pointer.x - .5) * -12 : 0;
        state.parallax += (parallaxTarget - state.parallax) * .06 * dt;

        state.t += (dt / 60) * state.speed;
        if (state.t >= TOTAL) { state.t -= TOTAL; state.unit++; }

        const holoNow = finePointer && pointer.active && overHolo(pointer.lx, pointer.ly);
        const bayNow = finePointer && pointer.active && overBay(pointer.lx, pointer.ly);
        if (holoNow && !wasOverHolo) play('blip', { index: 1 });
        wasOverHolo = holoNow;
        const cursor = holoNow || bayNow ? 'pointer' : '';
        if (canvas.style.cursor !== cursor) canvas.style.cursor = cursor;

        state.alert = Math.max(0, state.alert - .016 * dt);
        state.glitch = Math.max(0, state.glitch - .03 * dt);
        state.celebrate = Math.max(0, state.celebrate - .008 * dt);
        state.holoPulse = Math.max(0, state.holoPulse - .03 * dt);
        state.checkFlashAge += .03 * dt;

        const tl = drawFrame(now, dt);

        // Ruedas: giran al salir
        if (tl.exiting) state.wheelAngle += (tl.p * 0.35 + .05) * dt * state.speed;
        // Al terminar una revisión, la fila del holograma destella
        if (tl.index !== state.lastStepIndex) {
            const prev = STEPS[state.lastStepIndex];
            if (prev?.type === 'check') { state.checkFlash = prev.part; state.checkFlashAge = 0; }
            if (prev?.type === 'build') { const box = partBox(PARTS[prev.part]); for (let i = 0; i < 6; i++) emitSpark(box.cx, box.y1, 'neon', .8); }
            state.lastStepIndex = tl.index;
        }
    }
    requestAnimationFrame(frame);
}
