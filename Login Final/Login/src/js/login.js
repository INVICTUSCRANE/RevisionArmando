/** Punto de entrada de la pantalla de inicio de sesión (index.html). */
import { $$ } from './core/dom.js';
import { initTheme } from './features/theme.js';
import { initAmbient } from './features/ambient.js';
import { initViews } from './features/views.js';
import { initPasswordToggles } from './features/password-field.js';
import { initLoginForm } from './features/login-form.js';
import { initRecovery } from './features/recovery.js';
import { initInspectionScene } from './features/inspection-scene.js';
import { initSoundFx } from './features/sound-fx.js';

$$('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });
initTheme();
initAmbient();
initInspectionScene();
initViews();
initPasswordToggles();
initLoginForm();
initRecovery();
initSoundFx();
