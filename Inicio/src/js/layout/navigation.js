/** Mapa del sitio: alimenta el menú principal y el pie de página. */
export const EQUIPMENT_LINKS = [
    { id: 'plataformas', label: 'Plataformas', href: 'plataformas.html' },
    { id: 'rescate', label: 'Rescate', href: 'rescate.html' },
    { id: 'wheel-lift', label: 'Wheel Lift', href: 'wheel-lift.html' },
    { id: 'underlift', label: 'Underlift', href: 'underlift.html' }
];

export const MAIN_LINKS = [
    { id: 'inicio', label: 'Inicio', href: 'index.html' },
    { id: 'nosotros', label: 'Nosotros', href: 'nosotros.html' },
    { id: 'equipos', label: 'Equipos', children: EQUIPMENT_LINKS },
    { id: 'accesorios', label: 'Accesorios', href: 'accesorios.html' },
    { id: 'catalogo', label: 'Catálogo', href: 'catalogo.html' },
    { id: 'reparaciones', label: 'Reparaciones', href: 'reparaciones.html' },
    { id: 'contacto', label: 'Contacto', href: 'contacto.html' }
];

export const FOOTER_LINKS = [
    { label: 'Inicio', href: 'index.html' },
    { label: 'Nosotros', href: 'nosotros.html' },
    ...EQUIPMENT_LINKS,
    { label: 'Accesorios', href: 'accesorios.html' },
    { label: 'Catálogo', href: 'catalogo.html' },
    { label: 'Reparaciones', href: 'reparaciones.html' },
    { label: 'Contacto', href: 'contacto.html' },
    { label: 'Mi cuenta', href: 'cuenta.html' }
];

/** Redes sociales del encabezado, el menú móvil y el pie. Cambia cada `href` por la página oficial de la empresa. */
export const SOCIAL_LINKS = [
    { icon: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/' },
    { icon: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/' },
    { icon: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/' }
];
