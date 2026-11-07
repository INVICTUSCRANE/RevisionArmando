/**
 * Menú del panel: ÚNICA lista de secciones y pantallas.
 * `route` es la dirección después de "#/" y `view` la pantalla de src/js/views que la dibuja.
 * Una sección con `route` (sin `items`) es un enlace directo, como «Mis datos».
 * Las pantallas marcadas con `pending` todavía no tienen diseño: muestran una vista base
 * con ese texto hasta que se definan sus campos.
 */
export const MENU = [
    {
        id: 'mi-cuenta',
        label: 'Mis datos',
        eyebrow: 'Mi cuenta',
        icon: 'idCard',
        route: 'mis-datos',
        view: 'profile'
    },
    {
        id: 'empresa',
        label: 'Configurar datos de la empresa',
        icon: 'building',
        items: [
            { route: 'empresa/informacion', label: 'Información de la empresa', view: 'company-info' },
            { route: 'empresa/carrusel', label: 'Carrusel', title: 'Carrusel principal', view: 'carousel' },
            { route: 'empresa/linea-del-tiempo', label: 'Línea del tiempo', view: 'timeline' }
        ]
    },
    {
        id: 'accesorios',
        label: 'Configurar catálogo de accesorios',
        icon: 'box',
        items: [
            { route: 'accesorios/categorias', label: 'Categorías de accesorios', view: 'accessory-categories' },
            { route: 'accesorios/categorias-de-atributos', label: 'Categorías de atributos', view: 'attribute-categories' },
            { route: 'accesorios/atributos', label: 'Atributos', title: 'Atributos de accesorios', view: 'attributes' },
            { route: 'accesorios/accesorios', label: 'Accesorios', view: 'accessories' }
        ]
    },
    {
        id: 'gruas',
        label: 'Configurar catálogo de grúas',
        icon: 'truck',
        items: [
            { route: 'gruas/categorias', label: 'Categorías de grúas', view: 'crane-categories' },
            { route: 'gruas/atributos-opcionales', label: 'Atributos opcionales', view: 'crane-optionals' },
            { route: 'gruas/atributos', label: 'Atributos de grúas', view: 'crane-attributes' },
            { route: 'gruas/gruas', label: 'Grúas', view: 'cranes' }
        ]
    },
    {
        id: 'cotizaciones',
        label: 'Cotizaciones y reparaciones',
        icon: 'clipboard',
        items: [
            { route: 'cotizaciones/cotizaciones', label: 'Solicitudes de cotizaciones', view: 'quote-requests' },
            { route: 'cotizaciones/reparaciones', label: 'Solicitudes de reparaciones', view: 'repair-requests' }
        ]
    },
    {
        id: 'usuarios',
        label: 'Administrar usuarios',
        icon: 'users',
        items: [
            { route: 'usuarios/administradores', label: 'Usuarios administradores', view: 'staff-users' },
            { route: 'usuarios/clientes', label: 'Clientes', view: 'clients' }
        ]
    },
    {
        id: 'bitacoras',
        label: 'Bitácoras y auditorías',
        icon: 'scroll',
        items: [
            { route: 'bitacoras/accesos', label: 'Accesos al panel', view: 'access-log' },
            { route: 'bitacoras/recuperacion', label: 'Recuperación de cuentas', view: 'recovery-log' },
            { route: 'bitacoras/cambios-de-usuarios', label: 'Cambios de usuarios', view: 'user-changes' },
            { route: 'bitacoras/empresa', label: 'Cambios en la empresa', view: 'company-changes' },
            { route: 'bitacoras/accesorios', label: 'Cambios en accesorios', view: 'accessory-changes' },
            { route: 'bitacoras/gruas', label: 'Cambios en grúas', view: 'crane-changes' },
            { route: 'bitacoras/solicitudes-eliminadas', label: 'Solicitudes eliminadas', view: 'deleted-requests' }
        ]
    },
    {
        id: 'respaldo',
        label: 'Respaldar base de datos',
        icon: 'database',
        items: [
            { route: 'respaldo/historial', label: 'Historial de respaldos', view: 'backups' }
        ]
    }
];

/** Todas las pantallas con su sección: { route, label, title, eyebrow, view, pending, group } */
export const ROUTES = MENU.flatMap(group => group.items
    ? group.items.map(item => ({ ...item, title: item.title || item.label, eyebrow: group.label, group }))
    : [{ route: group.route, label: group.label, title: group.title || group.label, eyebrow: group.eyebrow || '', view: group.view, group }]);

/** Pantalla al entrar al panel (y al tocar el logotipo): los datos de quien inició sesión. */
export const DEFAULT_ROUTE = 'mis-datos';
