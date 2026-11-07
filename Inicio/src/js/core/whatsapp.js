export const WHATSAPP_NUMBER = '520000000000';

export const whatsappUrl = (text = '') =>
    `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const quoteCraneUrl = (model, lineName) =>
    whatsappUrl(`Hola, quiero cotizar la grúa ${model} (${lineName})`);
