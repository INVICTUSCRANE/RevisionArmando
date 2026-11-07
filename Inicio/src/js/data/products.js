/**
 * Catálogo de productos de Industrias Invictus Crane.
 * Es la única fuente de datos: catálogos, páginas de equipos y carrito leen de aquí.
 * `photo` es la clave de la foto en data/media.js.
 */

/**
 * Líneas de grúas. Cada modelo lista sus especificaciones en el mismo orden que `specLabels`;
 * `specIcons` elige el ícono de cada una e `icon` el de la línea (layout/icons.js → specIcons).
 * `tagline` es la frase de la portadilla de la línea en el catálogo.
 */
export const CRANE_LINES = {
    plataformas: {
        id: 'plataformas',
        name: 'Plataformas',
        page: 'plataformas.html',
        icon: 'flatbed',
        tagline: 'Plataformas de aluminio y acero para auxilio vial, vehículos utilitarios y carga pesada.',
        photo: 'linea-plataformas',
        specLabels: ['Capacidad de plataforma', 'Longitud', 'Capacidad de winch'],
        specIcons: ['weight', 'length', 'winch'],
        models: [
            { model: 'IP-22', description: 'Plataforma de aluminio ligera para auxilio vial urbano.', specs: ['5 toneladas', '19 pies', '9,000 lbs'] },
            { model: 'IP-30', description: 'Plataforma reforzada para vehículos utilitarios.', specs: ['8 toneladas', '21 pies', '12,000 lbs'] },
            { model: 'IP-40', description: 'Plataforma de acero para carga media.', specs: ['12 toneladas', '24 pies', '15,000 lbs'] },
            { model: 'IP-55', description: 'Plataforma pesada con inclinación hidráulica.', specs: ['18 toneladas', '26 pies', '20,000 lbs'] }
        ]
    },
    rescate: {
        id: 'rescate',
        name: 'Rescate',
        page: 'rescate.html',
        icon: 'boom',
        tagline: 'Grúas con pluma telescópica para rescate carretero y salvamento pesado.',
        photo: 'linea-rescate',
        specLabels: ['Capacidad de pluma', 'Alcance de pluma', 'Capacidad de winch'],
        specIcons: ['boom', 'reach', 'winch'],
        models: [
            { model: 'IR-25', description: 'Grúa de rescate compacta para maniobras en espacios reducidos.', specs: ['25 toneladas', '5.5 m', '12,000 lbs'] },
            { model: 'IR-35', description: 'Pluma telescópica para rescate carretero.', specs: ['35 toneladas', '6.5 m', '16,000 lbs'] },
            { model: 'IR-50', description: 'Rescate pesado con doble winch.', specs: ['50 toneladas', '7.5 m', '25,000 lbs'] },
            { model: 'IR-75', description: 'Serie pesada para salvamento extremo.', specs: ['75 toneladas', '9 m', '35,000 lbs'] }
        ]
    },
    'wheel-lift': {
        id: 'wheel-lift',
        name: 'Wheel Lift',
        page: 'wheel-lift.html',
        icon: 'wheel',
        tagline: 'Wheel lift para autos, SUV y camionetas, de uso ligero a comercial.',
        photo: 'linea-wheel-lift',
        specLabels: ['Capacidad wheel lift', 'Peso remolcable', 'Capacidad de winch'],
        specIcons: ['wheel', 'tow', 'winch'],
        models: [
            { model: 'WL-35', description: 'Wheel lift ligero para autos y SUV.', specs: ['3,500 lbs', '2.5 toneladas', '8,000 lbs'] },
            { model: 'WL-50', description: 'Wheel lift de uso comercial.', specs: ['5,000 lbs', '4 toneladas', '10,000 lbs'] },
            { model: 'WL-70', description: 'Wheel lift reforzado para camionetas pesadas.', specs: ['7,000 lbs', '6 toneladas', '12,000 lbs'] }
        ]
    },
    underlift: {
        id: 'underlift',
        name: 'Underlift',
        page: 'underlift.html',
        icon: 'lift',
        tagline: 'Underlift para arrastrar sin dañar el vehículo, de unidades medianas a autobuses y tractocamiones.',
        photo: 'linea-underlift',
        specLabels: ['Capacidad underlift', 'Extensión', 'Capacidad de winch'],
        specIcons: ['lift', 'extension', 'winch'],
        models: [
            { model: 'UL-40', description: 'Underlift para arrastre sin dañar el vehículo.', specs: ['4 toneladas', '1.8 m', '10,000 lbs'] },
            { model: 'UL-60', description: 'Underlift para unidades de carga media.', specs: ['6 toneladas', '2.2 m', '14,000 lbs'] },
            { model: 'UL-85', description: 'Underlift pesado para autobuses y tractocamiones.', specs: ['8.5 toneladas', '2.8 m', '20,000 lbs'] }
        ]
    }
};

export const CRANE_LINE_ORDER = ['plataformas', 'rescate', 'wheel-lift', 'underlift'];


/** Categorías de accesorios, en el orden en que aparecen en el catálogo. `icon` sale de layout/icons.js → specIcons. */
export const ACCESSORY_CATEGORIES = [
    { id: 'amarre', name: 'Amarre y arrastre', icon: 'chain', tagline: 'Cadenas, ganchos y eslingas para asegurar cada maniobra.' },
    { id: 'equipo', name: 'Malacates y luces', icon: 'winch', tagline: 'Equipo que se instala en la grúa para jalar y para ser visto.' },
    { id: 'seguridad', name: 'Seguridad vial', icon: 'cone', tagline: 'Lo necesario para trabajar con seguridad a pie de carretera.' }
];

/**
 * Accesorios a la venta. `price` en pesos MXN con IVA incluido; `category` es el id de su categoría.
 * No cambies el orden: los carritos guardados en versiones anteriores usan la posición de cada accesorio.
 */
export const ACCESSORIES = [
    { id: 'cadena-grado-80', category: 'amarre', name: 'Cadena grado 80', description: 'Cadena de amarre de 3/8" para carga pesada.', price: 1850 },
    { id: 'gancho-arrastre', category: 'amarre', name: 'Gancho de arrastre', description: 'Gancho forjado con seguro, 10 ton.', price: 980 },
    { id: 'malacate-electrico', category: 'equipo', name: 'Malacate eléctrico', description: 'Malacate 12V de 9,000 lbs con control.', price: 12400 },
    { id: 'barra-luces-led', category: 'equipo', name: 'Barra de luces LED', description: 'Barra ámbar de emergencia, 48".', price: 3200 },
    { id: 'eslinga-remolque', category: 'amarre', name: 'Eslinga de remolque', description: 'Eslinga de poliéster de 8 m, 5 ton.', price: 760 },
    { id: 'cunas-rueda', category: 'seguridad', name: 'Cuñas de rueda', description: 'Par de cuñas antideslizantes.', price: 540 },
    { id: 'cadena-seguridad', category: 'amarre', name: 'Cadena de seguridad', description: 'Juego de 2 cadenas con ganchos.', price: 1450 },
    { id: 'kit-senalizacion', category: 'seguridad', name: 'Kit de señalización', description: 'Conos, banderas y triángulos.', price: 890 }
].map(item => ({ ...item, photo: `acc-${item.id}` }));

export const findAccessory = id => ACCESSORIES.find(item => item.id === id);
