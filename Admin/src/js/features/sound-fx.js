/**
 * Conecta los sonidos (core/sound.js) con la interfaz:
 *   - botón de bocina en la barra superior para silenciar o activar (se recuerda),
 *   - clic en botones, enlaces del menú y secciones que se despliegan,
 *   - interruptores de cuenta activa y listas desplegables de filtros.
 * Los avisos, cuadros de diálogo, el tema y las eliminaciones tocan su propio sonido desde su módulo.
 * Un elemento puede pedir un sonido concreto con `data-sound="nombre"`.
 */
import { $ } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { play, isMuted, setMuted, onMuteChange, sinceLastSound } from '../core/sound.js';

const TAPPABLE = '[data-sound], .nav-link, button.nav-group-btn, a.nav-group-btn, .btn, .icon-btn, .chip, .menu-btn';

function drawToggle(button, muted) {
    button.setAttribute('aria-pressed', String(!muted));
    button.setAttribute('aria-label', muted ? 'Activar sonidos' : 'Silenciar sonidos');
    button.title = muted ? 'Sonidos apagados' : 'Sonidos encendidos';
    button.innerHTML = `${icon(muted ? 'volumeOff' : 'volume', 'size-5')}<span class="sound-bars" aria-hidden="true"><i></i><i></i><i></i></span>`;
}

export function initSounds() {
    const toggle = $('#soundToggle');
    if (toggle) {
        drawToggle(toggle, isMuted());
        onMuteChange(muted => drawToggle(toggle, muted));
        toggle.addEventListener('click', () => {
            setMuted(!isMuted());
            if (!isMuted()) play('soundOn');
            toggle.classList.remove('is-pinged');
            void toggle.offsetWidth;
            toggle.classList.add('is-pinged');
        });
    }

    // Se escucha en document (al final): si lo que se tocó ya hizo su propio sonido, el clic no se encima
    document.addEventListener('click', event => {
        const target = event.target.closest(TAPPABLE);
        if (!target || target.id === 'soundToggle' || target.id === 'themeToggle' || sinceLastSound() < 60) return;
        if (target.dataset.sound) { if (target.dataset.sound !== 'none') play(target.dataset.sound); return; }
        if (target.matches('.nav-link, a.nav-group-btn')) play('nav');
        else if (target.matches('button.nav-group-btn')) play(target.getAttribute('aria-expanded') === 'true' ? 'expand' : 'collapse');
        else play('tap');
    });

    document.addEventListener('change', event => {
        const target = event.target;
        if (target.matches('.switch input[type="checkbox"]')) play(target.checked ? 'on' : 'off');
        else if (target.matches('select')) play('select');
    });
}
