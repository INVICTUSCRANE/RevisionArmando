/**
 * Sonidos de la interfaz, sintetizados con Web Audio (no hay archivos de audio que cargar,
 * funciona también abriendo index.html con doble clic).
 *
 *   play('select')             reproduce un sonido (si está activado)
 *   setEnabled(false)          silencia y guarda la preferencia en el navegador
 *
 * Los navegadores no permiten sonar antes de que la persona interactúe con la página,
 * así que el audio se "desbloquea" con el primer clic o tecla.
 */
const KEY = 'invictus_portal_sound';
const listeners = new Set();
let enabled = readPreference();
let ctx = null;
let master = null;
let noiseBuffer = null;
const lastPlayed = {};

function readPreference() {
    try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; }
}

function setup() {
    if (ctx) return ctx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = .55;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.ratio.value = 4;
    master.connect(compressor).connect(ctx.destination);
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * .5, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return ctx;
}

function unlock() {
    if (!enabled) return;
    setup();
    if (ctx?.state === 'suspended') ctx.resume();
}
['pointerdown', 'keydown', 'touchstart'].forEach(type => window.addEventListener(type, unlock, { capture: true, passive: true }));

/* ---------- Bloques básicos ---------- */

function envelope(gain, t, vol, attack, dur) {
    gain.gain.setValueAtTime(.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + attack);
    gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
}

function tone({ freq, to, type = 'sine', dur = .12, vol = .15, attack = .005, delay = 0, lowpass }) {
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    envelope(gain, t, vol, attack, dur);
    let out = osc;
    if (lowpass) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = lowpass;
        out = out.connect(filter);
    }
    out.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + dur + .05);
}

function noise({ freq = 2000, to, q = 1, dur = .1, vol = .1, attack = .005, delay = 0 }) {
    const t = ctx.currentTime + delay;
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = q;
    filter.frequency.setValueAtTime(freq, t);
    if (to) filter.frequency.exponentialRampToValueAtTime(to, t + dur);
    const gain = ctx.createGain();
    envelope(gain, t, vol, attack, dur);
    source.connect(filter).connect(gain).connect(master);
    source.start(t);
    source.stop(t + dur + .05);
}

/* ---------- Catálogo ---------- */

const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];

const SOUNDS = {
    hover: () => tone({ freq: 2200, dur: .035, vol: .025 }),
    tick: () => noise({ freq: 3500 + Math.random() * 1500, q: 3, dur: .028, vol: .07 }),
    click: () => { tone({ freq: 520, to: 760, dur: .07, vol: .08 }); noise({ freq: 4000, q: 2, dur: .02, vol: .03 }); },
    select: () => { tone({ freq: 660, type: 'triangle', dur: .09, vol: .1 }); tone({ freq: 990, type: 'triangle', dur: .12, vol: .08, delay: .05 }); },
    forward: () => { noise({ freq: 500, to: 2600, q: 1.4, dur: .26, vol: .07, attack: .06 }); tone({ freq: 440, to: 660, dur: .16, vol: .04, delay: .04 }); },
    back: () => { noise({ freq: 2600, to: 500, q: 1.4, dur: .26, vol: .07, attack: .06 }); tone({ freq: 660, to: 440, dur: .16, vol: .04, delay: .04 }); },
    dark: () => { tone({ freq: 880, to: 330, dur: .3, vol: .08 }); tone({ freq: 1320, to: 495, dur: .3, vol: .03, delay: .03 }); },
    light: () => { tone({ freq: 330, to: 880, dur: .3, vol: .08 }); tone({ freq: 1760, dur: .25, vol: .03, delay: .18 }); },
    error: () => {
        tone({ freq: 196, type: 'square', dur: .13, vol: .06, lowpass: 900 });
        tone({ freq: 155.56, type: 'square', dur: .22, vol: .06, lowpass: 800, delay: .12 });
    },
    success: () => {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
            tone({ freq, dur: .5, vol: .1, delay: i * .08 });
            tone({ freq: freq * 2, type: 'triangle', dur: .3, vol: .025, delay: i * .08 });
        });
        tone({ freq: 2093, dur: .6, vol: .03, delay: .36 });
    },
    unlock: () => {
        noise({ freq: 1800, q: 6, dur: .05, vol: .12, delay: .42 });
        tone({ freq: 220, type: 'triangle', dur: .08, vol: .1, delay: .44 });
        [783.99, 1046.5, 1318.5].forEach((freq, i) => tone({ freq, dur: .45, vol: .08, delay: .55 + i * .09 }));
    },
    digit: ({ index = 0 } = {}) => tone({ freq: PENTATONIC[index % PENTATONIC.length], dur: .08, vol: .08 }),
    toast: () => { tone({ freq: 880, dur: .06, vol: .06 }); tone({ freq: 1320, dur: .1, vol: .05, delay: .05 }); },
    blip: ({ index = 0 } = {}) => tone({ freq: PENTATONIC[index % PENTATONIC.length], dur: .1, vol: .05, lowpass: 2500 }),
    ping: ({ index = 0 } = {}) => {
        const base = PENTATONIC[index % PENTATONIC.length] * 1.5;
        tone({ freq: base, to: base * 1.5, dur: .2, vol: .08 });
        tone({ freq: base * 2, dur: .35, vol: .025, delay: .04 });
    },
    on: () => { tone({ freq: 660, dur: .09, vol: .09 }); tone({ freq: 990, dur: .16, vol: .08, delay: .07 }); }
};

/* Tiempo mínimo entre repeticiones del mismo sonido (ms) */
const THROTTLE = { hover: 60, tick: 35, blip: 80, digit: 30, click: 40 };

export function play(name, options) {
    if (!enabled || !SOUNDS[name]) return;
    if (!setup()) return;
    // Antes de la primera interacción el navegador mantiene el audio suspendido
    if (ctx.state !== 'running' && !navigator.userActivation?.hasBeenActive) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = performance.now();
    if (THROTTLE[name] && now - (lastPlayed[name] || 0) < THROTTLE[name]) return;
    lastPlayed[name] = now;
    try { SOUNDS[name](options); } catch { /* audio no disponible */ }
}

export const isEnabled = () => enabled;

export function setEnabled(value) {
    enabled = Boolean(value);
    try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch { /* almacenamiento bloqueado */ }
    if (enabled) { unlock(); play('on'); }
    else if (ctx?.state === 'running') ctx.suspend();
    listeners.forEach(callback => callback(enabled));
}

/** Avisa cada vez que cambia el estado del sonido. */
export const onSoundChange = callback => listeners.add(callback);
