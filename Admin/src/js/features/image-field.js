/**
 * Campo para subir una imagen: clic o arrastrar y soltar, vista previa y validación (PNG o JPG, 5 MB).
 *   imageField({ current, required })  → HTML para el formulario
 *   wireImageField(form, { onChange }) → { file() } con el archivo elegido (o null)
 */
import { $ } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { MAX_IMAGE_MB, validateImage } from '../core/image.js';
import { showFieldError } from './modal.js';

export const imageField = ({ current = '', required = false, label = 'Imagen' } = {}) => `
    <div data-field-wrap data-field="imagen">
        <span class="field-label">${label}${required ? '' : ' <small>(opcional al editar)</small>'}</span>
        <label class="dropzone" data-dropzone>
            <input type="file" name="imagen" accept="image/png,image/jpeg" class="sr-only" ${required ? 'required' : ''}>
            <span data-drop-empty ${current ? 'hidden' : ''}>
                <span class="drop-icon">${icon('upload', 'size-6')}</span>
                <span class="block font-display text-lg font-semibold text-ink-700 dark:text-ink-200">+ Subir imagen</span>
                <span class="mt-0.5 block text-sm text-ink-500 dark:text-ink-400">PNG o JPG · hasta ${MAX_IMAGE_MB} MB · o arrástrala aquí</span>
            </span>
            <img data-drop-preview src="${current}" alt="Vista previa" ${current ? '' : 'hidden'}>
            <span class="drop-actions" ${current ? '' : 'hidden'}>
                <span class="btn btn-sm bg-white/95 text-ink-800 shadow">${icon('image')}Cambiar imagen</span>
            </span>
        </label>
        ${current ? '<p class="field-hint">Si no eliges otra imagen, se conserva la actual.</p>' : ''}
    </div>`;

export function wireImageField(form, { onChange } = {}) {
    const zone = $('[data-dropzone]', form);
    const input = $('input[type="file"]', zone);
    const preview = $('[data-drop-preview]', zone);
    let chosen = null;
    let objectUrl = '';

    function use(file) {
        const problem = validateImage(file);
        if (problem) {
            input.value = '';
            showFieldError(form, 'imagen', problem);
            return;
        }
        chosen = file;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = URL.createObjectURL(file);
        preview.src = objectUrl;
        preview.hidden = false;
        // Reinicia la animación de entrada de la vista previa
        preview.style.animation = 'none';
        void preview.offsetWidth;
        preview.style.animation = '';
        $('[data-drop-empty]', zone).hidden = true;
        $('.drop-actions', zone).hidden = false;
        onChange?.(file);
    }

    input.addEventListener('change', () => { if (input.files[0]) use(input.files[0]); });
    ['dragenter', 'dragover'].forEach(type => zone.addEventListener(type, event => { event.preventDefault(); zone.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach(type => zone.addEventListener(type, () => zone.classList.remove('is-over')));
    zone.addEventListener('drop', event => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (!file) return;
        try { input.files = event.dataTransfer.files; } catch { /* navegadores antiguos */ }
        use(file);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    return { file: () => chosen };
}
