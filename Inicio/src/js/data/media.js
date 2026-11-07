/**
 * Fotografías del sitio: ÚNICA lista de imágenes. Cada foto vive en `assets/img/fotos/<file>`.
 * Mientras ese archivo no exista se muestra `fallback` (la foto de internet que usaba la versión
 * anterior) y, si tampoco carga, queda el marco vacío con el logotipo de fondo.
 * Para cambiar una foto basta con guardar el archivo con el nombre indicado (ver README).
 */

/** Fotos de internet de la versión anterior. Son de terceros: reemplázalas por fotos propias o con licencia. */
const PREVIOUS = {
    rescate: 'https://www.tympsa.com.mx/wp-content/uploads/2021/10/gruacG1.jpg',
    wheelLift: 'https://cdn.dealerspike.com/imglib/v1/800x600/imglib/Assets/Inventory/A2/1A/A21AD3DC-CF6E-4999-9BE3-E45C7FF5EB6D.jpg',
    plataforma: 'https://media.cylex-polska.pl/companies/1147/0017/images/POMOC-DROGOWA-WYNAJEM-AUTOLAWETY-WROCLAW_903704_large.jpg',
    underlift: 'https://reedcitytowing.com/img/towing-clare-mi-l.jpg',
    accesorio1: 'https://cdn.snsimg.carview.co.jp/minkara/note/000/006/074/814/6074814/p4.jpg?ct=84fb7e3ebcf3',
    accesorio2: 'https://www.fiault.com/gallery/options/huit-cales-de-blocages-reglables-sur-le-plancher-4-tp-4-vl-large.jpeg',
    accesorio3: 'https://img.zips.com/i/public/0007649_in-the-ditch-individual-speed-chock_900.jpeg',
    accesorio4: 'https://cdn.fastpixel.io/fp/ret_img%2Bv_9884%2Bw_1182%2Bh_788%2Bq_glossy%2Bto_webp/knobhilltowing.com%2Fwp-content%2Fuploads%2F2025%2F06%2Fimage_4748454fa0be45f593c5a6ce7f908751.jpeg'
};

export const PHOTOS = {
    // Inicio · carrusel principal
    'hero-1': { file: 'inicio/hero-1.jpg', alt: 'Grúa de rescate trabajando en carretera', fallback: PREVIOUS.rescate },
    'hero-2': { file: 'inicio/hero-2.jpg', alt: 'Grúa wheel lift remolcando un auto', fallback: PREVIOUS.wheelLift },
    'hero-3': { file: 'inicio/hero-3.jpg', alt: 'Grúa de plataforma con un auto arriba', fallback: PREVIOUS.plataforma },

    // Líneas de equipos (catálogo y página de cada línea)
    'linea-plataformas': { file: 'lineas/plataformas.jpg', alt: 'Grúa de plataforma', fallback: PREVIOUS.plataforma },
    'linea-rescate': { file: 'lineas/rescate.jpg', alt: 'Grúa de rescate con pluma', fallback: PREVIOUS.rescate },
    'linea-wheel-lift': { file: 'lineas/wheel-lift.jpg', alt: 'Grúa wheel lift', fallback: PREVIOUS.wheelLift },
    'linea-underlift': { file: 'lineas/underlift.jpg', alt: 'Grúa underlift', fallback: PREVIOUS.underlift },

    // Accesorios (catálogo, carrito)
    'acc-cadena-grado-80': { file: 'accesorios/cadena-grado-80.jpg', alt: 'Cadena grado 80', fallback: PREVIOUS.accesorio1 },
    'acc-gancho-arrastre': { file: 'accesorios/gancho-arrastre.jpg', alt: 'Gancho de arrastre', fallback: PREVIOUS.accesorio2 },
    'acc-malacate-electrico': { file: 'accesorios/malacate-electrico.jpg', alt: 'Malacate eléctrico', fallback: PREVIOUS.accesorio3 },
    'acc-barra-luces-led': { file: 'accesorios/barra-luces-led.jpg', alt: 'Barra de luces LED', fallback: PREVIOUS.accesorio4 },
    'acc-eslinga-remolque': { file: 'accesorios/eslinga-remolque.jpg', alt: 'Eslinga de remolque', fallback: PREVIOUS.accesorio1 },
    'acc-cunas-rueda': { file: 'accesorios/cunas-rueda.jpg', alt: 'Cuñas de rueda', fallback: PREVIOUS.accesorio2 },
    'acc-cadena-seguridad': { file: 'accesorios/cadena-seguridad.jpg', alt: 'Cadena de seguridad', fallback: PREVIOUS.accesorio3 },
    'acc-kit-senalizacion': { file: 'accesorios/kit-senalizacion.jpg', alt: 'Kit de señalización', fallback: PREVIOUS.accesorio4 },

    // Encabezados de páginas
    'pagina-nosotros': { file: 'paginas/nosotros.jpg', alt: '', fallback: PREVIOUS.rescate },
    'pagina-reparaciones': { file: 'paginas/reparaciones.jpg', alt: '', fallback: PREVIOUS.underlift },
    'pagina-contacto': { file: 'paginas/contacto.jpg', alt: '', fallback: PREVIOUS.plataforma },

    // Nosotros · trayectoria (mientras no haya foto se muestran las ilustraciones de assets/img/historia)
    ...Object.fromEntries([2006, 2009, 2012, 2015, 2018, 2021, 2024, 2026].map(year => [
        `historia-${year}`,
        { file: `historia/${year}.jpg`, alt: `Industrias Invictus Crane en ${year}`, fallback: `historia/${year}.svg`, localFallback: true }
    ]))
};
