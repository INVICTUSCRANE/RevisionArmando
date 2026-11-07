/**
 * Sonidos de la interfaz, sintetizados al momento con Web Audio (no hay archivos de audio que descargar).
 * Son cortos y bajitos para acompañar sin cansar. Quedan encendidos o silenciados según lo que la persona
 * eligió la última vez (localStorage). Los navegadores solo dejan sonar después de un toque o clic,
 * así que el audio se prepara con la primera interacción.
 *
 *   play('success')        suena (si no está silenciado)
 *   setMuted(true)         silencia y lo recuerda
 *   onMuteChange(fn)       avisa cuando cambia
 */
const KEY = 'invictus_admin_sound';
const listeners = new Set();
const lastPlayed = {};

let context = null;
let output = null;
let noiseBuffer = null;
let muted = readMuted();
let lastAny = 0;

function readMuted() {
    try { return localStorage.getItem(KEY) === 'off'; } catch { return false; }
}

function audio() {
    if (!context) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) return null;
        context = new Context();
        // Compresor suave: varios sonidos juntos nunca suben de golpe
        const compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.knee.value = 14;
        compressor.ratio.value = 4;
        output = context.createGain();
        output.gain.value = .9;
        output.connect(compressor).connect(context.destination);
        noiseBuffer = context.createBuffer(1, Math.round(context.sampleRate * .4), context.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (context.state === 'suspended') context.resume();
    return context;
}

/** Envolvente: sube en `attack` y se apaga de forma exponencial hasta `dur`. */
function envelope(start, { gain, attack = .004, dur }) {
    const env = context.createGain();
    env.gain.setValueAtTime(.0001, start);
    env.gain.exponentialRampToValueAtTime(gain, start + attack);
    env.gain.exponentialRampToValueAtTime(.0001, start + dur);
    return env;
}

function tone(t, { freq, to = freq, type = 'sine', dur = .08, gain = .08, attack, delay = 0, lowpass }) {
    const start = t + delay;
    const osc = context.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (to !== freq) osc.frequency.exponentialRampToValueAtTime(to, start + dur);
    let chain = osc.connect(envelope(start, { gain, attack, dur }));
    if (lowpass) {
        const filter = context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = lowpass;
        chain = chain.connect(filter);
    }
    chain.connect(output);
    osc.start(start);
    osc.stop(start + dur + .02);
}

/** Ruido filtrado: el "aire" de los barridos y el golpe de borrar. */
function noise(t, { dur = .1, gain = .03, freq = 2000, to = freq, q = .8, type = 'bandpass', delay = 0 }) {
    const start = t + delay;
    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(freq, start);
    if (to !== freq) filter.frequency.exponentialRampToValueAtTime(to, start + dur);
    source.connect(filter).connect(envelope(start, { gain, attack: .01, dur })).connect(output);
    source.start(start);
    source.stop(start + dur + .02);
}

const SOUNDS = {
    // Clic de botón: un "tic" metálico muy corto
    tap: t => { tone(t, { freq: 2100, to: 1500, dur: .035, gain: .05 }); noise(t, { dur: .018, gain: .02, freq: 4200 }); },
    // Cambio de pantalla desde el menú
    nav: t => { tone(t, { freq: 740, to: 1110, type: 'triangle', dur: .07, gain: .06 }); tone(t, { freq: 1480, dur: .1, gain: .025, delay: .045 }); },
    // Abrir / cerrar una sección del menú o un detalle
    expand: t => tone(t, { freq: 620, to: 930, type: 'triangle', dur: .07, gain: .045 }),
    collapse: t => tone(t, { freq: 930, to: 620, type: 'triangle', dur: .07, gain: .04 }),
    // Cuadros de diálogo y cajón del menú
    open: t => { tone(t, { freq: 420, to: 840, dur: .16, gain: .05 }); noise(t, { dur: .14, gain: .014, freq: 1400, to: 3200 }); },
    close: t => { tone(t, { freq: 760, to: 380, dur: .13, gain: .035 }); noise(t, { dur: .1, gain: .01, freq: 2600, to: 1100 }); },
    // Interruptores (cuenta activa)
    on: t => { tone(t, { freq: 880, type: 'triangle', dur: .06, gain: .05 }); tone(t, { freq: 1320, type: 'triangle', dur: .09, gain: .05, delay: .055 }); },
    off: t => { tone(t, { freq: 1320, type: 'triangle', dur: .06, gain: .045 }); tone(t, { freq: 880, type: 'triangle', dur: .09, gain: .045, delay: .055 }); },
    // Filtros y listas desplegables
    select: t => tone(t, { freq: 1250, type: 'triangle', dur: .045, gain: .04 }),
    // Avisos
    success: t => {
        tone(t, { freq: 1046.5, dur: .32, gain: .055 });
        tone(t, { freq: 1568, dur: .42, gain: .045, delay: .08 });
        tone(t, { freq: 2093, dur: .28, gain: .012, delay: .08 });
    },
    error: t => {
        tone(t, { freq: 196, type: 'square', dur: .09, gain: .03, lowpass: 900 });
        tone(t, { freq: 185, type: 'square', dur: .13, gain: .03, delay: .11, lowpass: 900 });
    },
    info: t => tone(t, { freq: 1318.5, dur: .22, gain: .04 }),
    // Elemento que sale de la lista al eliminarlo
    remove: t => { tone(t, { freq: 520, to: 140, type: 'triangle', dur: .2, gain: .055 }); noise(t, { dur: .12, gain: .022, freq: 900, to: 300, type: 'lowpass' }); },
    // Tema: al oscurecer se "enciende" el neón; al aclarar, un barrido brillante
    themeDark: t => {
        tone(t, { freq: 660, to: 220, dur: .26, gain: .045 });
        tone(t, { freq: 110, type: 'sawtooth', dur: .32, gain: .014, delay: .08, lowpass: 420 });
        tone(t, { freq: 1975.5, dur: .3, gain: .022, delay: .2 });
    },
    themeLight: t => { tone(t, { freq: 330, to: 990, dur: .24, gain: .045 }); tone(t, { freq: 1318.5, dur: .3, gain: .028, delay: .12 }); },
    // Al volver a activar el sonido
    soundOn: t => { tone(t, { freq: 523.25, dur: .12, gain: .05 }); tone(t, { freq: 784, dur: .18, gain: .05, delay: .08 }); },
    // Claxon de la grúa en «Mis datos» (solo al tocarla)
    horn: t => {
        tone(t, { freq: 392, type: 'square', dur: .13, gain: .028, lowpass: 1400 });
        tone(t, { freq: 494, type: 'square', dur: .13, gain: .02, lowpass: 1400 });
        tone(t, { freq: 392, type: 'square', dur: .16, gain: .028, delay: .19, lowpass: 1400 });
        tone(t, { freq: 494, type: 'square', dur: .16, gain: .02, delay: .19, lowpass: 1400 });
    }
};

/** Toca un sonido. El mismo sonido no se repite en menos de 50 ms (evita ráfagas). */
export function play(name) {
    if (muted || !SOUNDS[name]) return;
    const now = performance.now();
    if (now - (lastPlayed[name] || 0) < 50) return;
    lastPlayed[name] = now;
    lastAny = now;
    try {
        if (!audio()) return;
        SOUNDS[name](context.currentTime + .005);
    } catch { /* audio no disponible: el panel sigue igual */ }
}

/** Milisegundos desde el último sonido (para no encimar el clic con el sonido de lo que abrió). */
export const sinceLastSound = () => performance.now() - lastAny;

export const isMuted = () => muted;

export function setMuted(value) {
    muted = Boolean(value);
    try { localStorage.setItem(KEY, muted ? 'off' : 'on'); } catch { /* almacenamiento bloqueado */ }
    listeners.forEach(listener => listener(muted));
}

export function onMuteChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
