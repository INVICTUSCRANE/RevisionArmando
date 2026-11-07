/** Formularios de contacto y reparaciones: arman el mensaje y lo abren en WhatsApp. */
import { $ } from '../core/dom.js';
import { whatsappUrl } from '../core/whatsapp.js';
import { toast } from '../core/toast.js';

const FORMS = {
    contactForm: data => `Hola, soy ${data.nombre} (${data.correo}). ${data.mensaje}`,
    repairForm: data => [
        'Solicitud de reparación',
        `Nombre: ${data.nombre} ${data.apellido}`,
        `Correo: ${data.correo}`,
        `Mensaje: ${data.mensaje}`
    ].join('\n')
};

export function initWhatsAppForms() {
    Object.entries(FORMS).forEach(([id, buildMessage]) => {
        const form = $(`#${id}`);
        if (!form) return;
        form.addEventListener('submit', event => {
            event.preventDefault();
            window.open(whatsappUrl(buildMessage(Object.fromEntries(new FormData(form)))), '_blank', 'noopener');
            toast('Abriendo WhatsApp…', { tone: 'success' });
        });
    });
}
