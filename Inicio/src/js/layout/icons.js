/** Íconos SVG en línea, heredan el color del texto (currentColor). */
const svg = (path, { viewBox = '0 0 24 24', fill = true } = {}) =>
    `<svg viewBox="${viewBox}" aria-hidden="true" class="size-full" ${fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${path}</svg>`;

export const icons = {
    facebook: svg('<path d="M14 8h2.5V4.5H14C11.5 4.5 10 6 10 8.5v2H7.5V14H10v6.5h3.5V14H16l.5-3.5h-3V9c0-.6.4-1 1.5-1z"/>'),
    instagram: svg('<path fill-rule="evenodd" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm5 2.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>'),
    tiktok: svg('<path d="M16 3c.3 2 1.6 3.4 3.5 3.6v2.8c-1.3 0-2.5-.4-3.5-1.1V14a5 5 0 1 1-5-5v2.8a2.2 2.2 0 1 0 2.2 2.2V3z"/>'),
    whatsapp: svg('<path d="M16 3.2A12.6 12.6 0 0 0 5.2 22.3L3.5 28.8l6.7-1.7A12.7 12.7 0 1 0 16 3.2zm0 22.9c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.4 10.4 0 1 1 16 26.1zm5.7-7.8c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.4 8.4 0 0 1-2.5-1.5 9.3 9.3 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.7l.5-.5.3-.6c.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9 1.2 3.3 1.4 3.5 2.4 3.7 5.8 5.1c.8.3 1.4.5 1.9.6.8.2 1.5.2 2 .1.6-.1 1.8-.7 2-1.4s.3-1.3.2-1.4-.3-.3-.6-.5z"/>', { viewBox: '0 0 32 32' }),
    cart: svg('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3.5h2.6l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1l1.9-7.3H6.2"/>', { fill: false }),
    user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', { fill: false }),
    close: svg('<path d="M6 6l12 12M18 6 6 18"/>', { fill: false }),
    menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>', { fill: false }),
    chevronLeft: svg('<path d="m15 5-7 7 7 7"/>', { fill: false }),
    chevronRight: svg('<path d="m9 5 7 7-7 7"/>', { fill: false }),
    chevronDown: svg('<path d="m6 9 6 6 6-6"/>', { fill: false }),
    arrowRight: svg('<path d="M5 12h14m-6-6 6 6-6 6"/>', { fill: false }),
    plus: svg('<path d="M12 5v14M5 12h14"/>', { fill: false }),
    minus: svg('<path d="M5 12h14"/>', { fill: false }),
    trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', { fill: false }),
    expand: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', { fill: false }),
    list: svg('<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>', { fill: false }),
    check: svg('<path d="m5 12 5 5L20 7"/>', { fill: false }),
    bag: svg('<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>', { fill: false }),
    pin: svg('<path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>', { fill: false }),
    route: svg('<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>', { fill: false })
};

/**
 * Íconos de las especificaciones y de las líneas/categorías (products.js → specIcons, icon). Cada trazo lleva
 * pathLength="1" para poder dibujarse con stroke-dashoffset al aparecer.
 */
const line = paths => svg(paths.replace(/<(path|rect|circle) /g, '<$1 pathLength="1" '), { fill: false });
export const specIcons = {
    weight: line('<path d="M9 8.5a3 3 0 1 1 6 0"/><path d="M6.8 8.5h10.4l2.8 11.5H4z"/><path d="M10 12.5h4M12 12.5V17"/>'),
    length: line('<path d="M3 7v10M21 7v10"/><path d="M6 12h12"/><path d="M8.5 9.5 6 12l2.5 2.5M15.5 9.5 18 12l-2.5 2.5"/>'),
    winch: line('<rect x="2.5" y="5" width="10" height="9" rx="2"/><path d="M5.8 5v9M9.2 5v9"/><path d="M12.5 7H19v6"/><path d="M19 13v2a2.2 2.2 0 1 1-2.2 2.2"/><path d="M2.5 18h10"/>'),
    boom: line('<path d="M3 20h12"/><path d="M5 20v-3h7v3"/><path d="M8 17 19 6"/><path d="M19 6v7"/><path d="M19 13v1.5a1.8 1.8 0 1 1-1.8 1.8"/><path d="M10.5 17 14 11"/>'),
    reach: line('<path d="M4 20 18 6"/><path d="M12 5h7v7"/><path d="M4 14v6h6"/>'),
    wheel: line('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/><path d="M12 3.5V9M12 15v5.5M3.5 12H9M15 12h5.5"/>'),
    tow: line('<path d="M3 16.5V13l2.4-4.5h7.8l3.6 4.5H21v3.5"/><path d="M5.5 12.8h10.3"/><circle cx="7.2" cy="16.8" r="2"/><circle cx="16.8" cy="16.8" r="2"/>'),
    lift: line('<path d="M2.5 18.5h11l3-5h5"/><path d="M4 15h7"/><path d="M12 3.5v8M8.8 6.7 12 3.5l3.2 3.2"/>'),
    extension: line('<rect x="2.5" y="9" width="7" height="6" rx="1"/><rect x="9.5" y="10.3" width="6" height="3.4" rx=".8"/><path d="M15.5 12h6M18.8 9.3 21.5 12l-2.7 2.7"/>'),
    flatbed: line('<path d="M2 14.5h12.5"/><path d="M3.5 14.5 6 10.5h8.5v4"/><path d="M14.5 14.5V8.5h4.2l3 3.6v2.4"/><circle cx="6.5" cy="17" r="2"/><circle cx="17.5" cy="17" r="2"/>'),
    chain: line('<path d="M10.6 7.2 12.2 5.6a3.8 3.8 0 0 1 5.4 5.4L16 12.6"/><path d="M13.4 16.8 11.8 18.4a3.8 3.8 0 0 1-5.4-5.4L8 11.4"/><path d="M9.5 14.5l5-5"/>'),
    cone: line('<path d="M9.8 4h4.4l4.3 15H5.5z"/><path d="M8.4 9h7.2M7 14h10"/><path d="M3 19.5h18"/>'),
    tag: line('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>'),
    cart: line('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3.5h2.6l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1l1.9-7.3H6.2"/>')
};
