import { html } from '../core/dom.js';
import { assetUrl, pageUrl } from '../core/paths.js';
import { whatsappUrl } from '../core/whatsapp.js';
import { icons } from './icons.js';
import { FOOTER_LINKS, SOCIAL_LINKS } from './navigation.js';

export function renderFooter() {
    const footer = html(`
        <footer class="relative isolate overflow-hidden bg-ink-950 text-ink-300">
            <div class="led-strip h-0.5"></div>
            <div data-ambient data-sparks="6" data-dots="10" class="absolute inset-0 -z-10"></div>
            <div class="pointer-events-none absolute -right-40 -top-40 -z-10 size-[30rem] rounded-full bg-brand-600/15 blur-3xl"></div>
            <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div class="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr]">
                    <div data-reveal>
                        <img src="${assetUrl('logo-invictus.png')}" alt="Industrias Invictus Crane" width="1320" height="318" loading="lazy" class="h-14 w-auto rounded-lg [animation:logo-glow_4s_ease-in-out_infinite]">
                        <p class="mt-4 max-w-md leading-relaxed">Industrias Invictus Crane es una empresa orgullosamente mexicana dedicada al diseño y fabricación de grúas de arrastre y salvamento.</p>
                        <p class="mt-3 max-w-md leading-relaxed">Nuestro compromiso es ofrecer equipos de alto desempeño, componentes certificados y un servicio profesional a cada cliente.</p>
                        <h4 class="footer-title mt-8 !mb-3">Síguenos</h4>
                        <div class="flex flex-wrap gap-2.5">
                            ${SOCIAL_LINKS.map(item => `
                                <a href="${item.href}" target="_blank" rel="noopener" class="footer-social is-${item.icon}">
                                    <span class="footer-social-icon"><span class="size-5">${icons[item.icon]}</span></span>${item.label}
                                </a>`).join('')}
                        </div>
                    </div>
                    <nav data-reveal style="--reveal-delay:120ms" aria-label="Mapa del sitio">
                        <h4 class="footer-title">Mapa del sitio</h4>
                        <ul class="grid grid-cols-2 gap-x-6 gap-y-2.5">
                            ${FOOTER_LINKS.map(link => `<li><a class="footer-link" href="${pageUrl(link.href)}">${link.label}</a></li>`).join('')}
                        </ul>
                    </nav>
                    <div data-reveal style="--reveal-delay:240ms">
                        <h4 class="footer-title">Hablemos</h4>
                        <a href="${whatsappUrl()}" target="_blank" rel="noopener" class="btn btn-primary">
                            <span class="size-5">${icons.whatsapp}</span> Escríbenos por WhatsApp
                        </a>
                        <img src="${assetUrl('logo-comunicaciones.png')}" alt="Comunicaciones - Secretaría de Infraestructura, Comunicaciones y Transportes" loading="lazy" class="mt-8 w-full max-w-xs drop-shadow-[0_0_12px_rgb(255_255_255/0.08)]">
                    </div>
                </div>
            </div>
            <p class="border-t border-neon/10 py-6 text-center font-display text-sm uppercase tracking-[0.3em] text-neon/80 [text-shadow:0_0_10px_rgb(61_255_180/.5)]">Industrias Invictus Crane - 2026</p>
        </footer>
        `);
    const whatsapp = html(`
        <a class="wa-float" target="_blank" rel="noopener" href="${whatsappUrl()}" aria-label="WhatsApp">
            <span class="size-7">${icons.whatsapp}</span>
        </a>`);
    document.body.append(footer, whatsapp);
}
