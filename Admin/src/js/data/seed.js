/**
 * Datos de demostración. Son los mismos textos y productos del sitio público (invictus-web-v3),
 * así el panel muestra contenido real mientras no hay servidor. Se copian al navegador la primera
 * vez que se abre el panel; al conectar la API este archivo deja de usarse.
 */
const demo = year => `assets/img/demo/${year}.svg`;

// Autores de los cambios de ejemplo en las bitácoras de contenido (copia de sus datos en ese momento)
const CARLOS = { nombre: 'Carlos', apellidos: 'Mendoza Rivas', correo: 'carlos.mendoza@invictuscrane.com', rol: 'admin' };
const LUCIA = { nombre: 'Lucía', apellidos: 'Fernández Soto', correo: 'lucia.fernandez@invictuscrane.com', rol: 'marketing' };
const ROBERTO = { nombre: 'Roberto', apellidos: 'Salinas Cruz', correo: 'roberto.salinas@invictuscrane.com', rol: 'ventas' };
const ANDREA = { nombre: 'Andrea', apellidos: 'Ibarra León', correo: 'andrea.ibarra@invictuscrane.com', rol: 'admin' };

const MISION = 'Fabricar grúas de alto desempeño que brinden seguridad y confianza a quienes mueven lo imposible, con ingeniería mexicana y servicio cercano.';
const VISION = 'Ser la marca de grúas de referencia en Latinoamérica, innovando en tecnología, diseño y fabricación con personal altamente calificado.';

export const SEED = {
    empresa: { mision: MISION, vision: VISION, whatsapp: '+52 81 1234 5600' },

    valores: [
        { id: 1, titulo: 'Seguridad', descripcion: 'Diseñamos equipos y procesos pensando primero en la integridad de las personas y la confiabilidad de cada maniobra.' },
        { id: 2, titulo: 'Calidad', descripcion: 'Trabajamos con atención al detalle, materiales adecuados y mejora continua en cada producto y servicio.' },
        { id: 3, titulo: 'Compromiso', descripcion: 'Acompañamos a nuestros clientes con honestidad, atención cercana y soluciones que respondan a sus necesidades.' }
    ],

    // Catálogo de grúas: categorías, atributos (componentes con cantidad) y atributos opcionales (extras).
    categoriasGrua: [
        { id: 1, nombre: 'Plataformas' },
        { id: 2, nombre: 'Rescate' },
        { id: 3, nombre: 'Wheel Lift' },
        { id: 4, nombre: 'Underlift' }
    ],

    atributosGrua: [
        { id: 1, nombre: 'Winche', imagen: demo(2015) },
        { id: 2, nombre: 'Plataforma', imagen: demo(2009) },
        { id: 3, nombre: 'Pluma telescópica', imagen: demo(2012) },
        { id: 4, nombre: 'Brazo wheel lift', imagen: demo(2018) },
        { id: 5, nombre: 'Underlift', imagen: demo(2006) }
    ],

    opcionalesGrua: [
        { id: 1, nombre: 'Parachoques frontal personalizado', imagen: demo(2012) },
        { id: 2, nombre: 'Estribos cromados', imagen: demo(2006) },
        { id: 3, nombre: 'Cabina climatizada', imagen: demo(2018) }
    ],

    // atributos: [atributoId, cantidad] · opcionales: ids
    gruas: [
        ['IP-22', 1, [[2, 1], [1, 1]], [2]], ['IP-30', 1, [[2, 1], [1, 1]], []], ['IP-40', 1, [[2, 1], [1, 1]], [1]], ['IP-55', 1, [[2, 1], [1, 2]], [1, 3]],
        ['IR-25', 2, [[3, 1], [1, 1]], []], ['IR-35', 2, [[3, 1], [1, 2]], [3]], ['IR-50', 2, [[3, 1], [1, 2], [4, 1]], [1, 3]], ['IR-75', 2, [[3, 1], [1, 2], [5, 1]], [1, 2, 3]],
        ['WL-35', 3, [[4, 1], [1, 1]], []], ['WL-50', 3, [[4, 1], [1, 1]], [2]], ['WL-70', 3, [[4, 1], [1, 2]], []],
        ['UL-40', 4, [[5, 1], [1, 1]], []], ['UL-60', 4, [[5, 1], [1, 1]], [2]], ['UL-85', 4, [[5, 1], [1, 2], [3, 1]], [3]]
    ].map(([modelo, categoriaId, atributos, opcionales], index) => ({
        id: index + 1,
        nombre: `${['Plataformas', 'Rescate', 'Wheel Lift', 'Underlift'][categoriaId - 1]} ${modelo}`,
        categoriaId,
        imagen: demo([2009, 2015, 2018, 2018][categoriaId - 1]),
        atributos: atributos.map(([atributoId, cantidad]) => ({ atributoId, cantidad })),
        opcionales
    })),

    carrusel: [
        { id: 1, orden: 1, tipo: 'grua', productoId: 7, titulo: 'Potencia sin límites', subtitulo: 'Rescate pesado con doble winch', imagen: demo(2015) },
        { id: 2, orden: 2, tipo: 'accesorio', productoId: 3, titulo: 'Fuerza en cada maniobra', subtitulo: 'Malacate de 9,000 lbs con control', imagen: demo(2026) },
        { id: 3, orden: 3, tipo: 'grua', productoId: 1, titulo: 'Plataformas para la ciudad', subtitulo: 'Aluminio ligero para auxilio vial urbano', imagen: demo(2009) }
    ],

    historia: [
        [2006, 'Nace Industrias Invictus Crane como un pequeño taller de reparación de grúas.'],
        [2009, 'Se fabrica la primera plataforma, el modelo IP-22.'],
        [2012, 'Inauguramos una planta propia de manufactura y soldadura especializada.'],
        [2015, 'Lanzamos la línea de grúas de rescate con pluma telescópica.'],
        [2018, 'Llegan al catálogo los equipos wheel lift y underlift.'],
        [2021, 'Primeras exportaciones a Centroamérica y Sudamérica.'],
        [2024, 'Presentamos el catálogo digital interactivo.'],
        [2026, 'Abrimos la tienda en línea de accesorios.']
    ].map(([anio, descripcion], index) => ({ id: index + 1, anio, descripcion, imagen: demo(anio) })),

    categoriasAccesorio: [
        { id: 1, nombre: 'Amarre y arrastre' },
        { id: 2, nombre: 'Malacates' },
        { id: 3, nombre: 'Iluminación' },
        { id: 4, nombre: 'Seguridad vial' },
        { id: 5, nombre: 'Herramientas' }
    ],

    categoriasAtributo: [
        { id: 1, nombre: 'Capacidad' },
        { id: 2, nombre: 'Eléctrico' },
        { id: 3, nombre: 'Material' },
        { id: 4, nombre: 'Medida' },
        { id: 5, nombre: 'Color' }
    ],

    atributos: [
        { id: 1, nombre: 'Hasta 5 toneladas', categoriaId: 1 },
        { id: 2, nombre: 'Hasta 10 toneladas', categoriaId: 1 },
        { id: 3, nombre: '9,000 lbs', categoriaId: 1 },
        { id: 4, nombre: '12 V', categoriaId: 2 },
        { id: 5, nombre: 'Control inalámbrico', categoriaId: 2 },
        { id: 6, nombre: 'Luz LED ámbar', categoriaId: 2 },
        { id: 7, nombre: 'Acero forjado', categoriaId: 3 },
        { id: 8, nombre: 'Acero aleado grado 80', categoriaId: 3 },
        { id: 9, nombre: 'Poliéster de alta tenacidad', categoriaId: 3 },
        { id: 10, nombre: 'Hule antideslizante', categoriaId: 3 },
        { id: 11, nombre: '3/8 de pulgada', categoriaId: 4 },
        { id: 12, nombre: '8 metros', categoriaId: 4 },
        { id: 13, nombre: '48 pulgadas', categoriaId: 4 }
    ],

    accesorios: [
        { id: 1, nombre: 'Cadena grado 80', categoriaId: 1, precio: 1850, descripcion: 'Cadena de amarre de 3/8" para carga pesada.', atributos: [8, 11, 2] },
        { id: 2, nombre: 'Gancho de arrastre', categoriaId: 1, precio: 980, descripcion: 'Gancho forjado con seguro, 10 ton.', atributos: [7, 2] },
        { id: 3, nombre: 'Malacate eléctrico', categoriaId: 2, precio: 12400, descripcion: 'Malacate 12V de 9,000 lbs con control.', atributos: [3, 4, 5] },
        { id: 4, nombre: 'Barra de luces LED', categoriaId: 3, precio: 3200, descripcion: 'Barra ámbar de emergencia, 48".', atributos: [6, 4, 13] },
        { id: 5, nombre: 'Eslinga de remolque', categoriaId: 1, precio: 760, descripcion: 'Eslinga de poliéster de 8 m, 5 ton.', atributos: [9, 12, 1] },
        { id: 6, nombre: 'Cuñas de rueda', categoriaId: 4, precio: 540, descripcion: 'Par de cuñas antideslizantes.', atributos: [10] },
        { id: 7, nombre: 'Cadena de seguridad', categoriaId: 1, precio: 1450, descripcion: 'Juego de 2 cadenas con ganchos.', atributos: [8] },
        { id: 8, nombre: 'Kit de señalización', categoriaId: 4, precio: 890, descripcion: 'Conos, banderas y triángulos.', atributos: [] }
    ],

    // Personal interno con acceso al portal. `rol` usa las mismas claves que el inicio de sesión.
    usuarios: [
        { id: 1, nombre: 'Carlos', apellidos: 'Mendoza Rivas', correo: 'carlos.mendoza@invictuscrane.com', telefono: '55 1234 5678', departamento: 'Administración', rol: 'admin', activo: true },
        { id: 2, nombre: 'Lucía', apellidos: 'Fernández Soto', correo: 'lucia.fernandez@invictuscrane.com', telefono: '55 2345 6789', departamento: 'Marketing', rol: 'marketing', activo: true },
        { id: 3, nombre: 'Roberto', apellidos: 'Salinas Cruz', correo: 'roberto.salinas@invictuscrane.com', telefono: '81 3456 7890', departamento: 'Ventas', rol: 'ventas', activo: true },
        { id: 4, nombre: 'Andrea', apellidos: 'Ibarra León', correo: 'andrea.ibarra@invictuscrane.com', telefono: '33 4567 8901', departamento: 'Desarrollo de software', rol: 'admin', activo: false }
    ],

    clientes: [
        { id: 1, nombre: 'Miguel', apellidos: 'Torres Aguilar', correo: 'mtorres@acerosdelnorte.mx', telefono: '81 1111 2222', activo: true },
        { id: 2, nombre: 'Patricia', apellidos: 'Gómez Vidal', correo: 'patricia@constructoraandes.com', telefono: '55 3333 4444', activo: true },
        { id: 3, nombre: 'Héctor', apellidos: 'Ramírez Peña', correo: 'hramirez@puertomaritimo.mx', telefono: '229 555 6666', activo: false }
    ],

    // Solicitudes que llegan desde el sitio. clienteId null = persona sin cuenta.
    cotizaciones: [
        { id: 1, clienteId: 1, fecha: '2026-10-16T10:12', gruaId: 7 },
        { id: 2, clienteId: null, fecha: '2026-10-15T17:45', gruaId: 3 },
        { id: 3, clienteId: 2, fecha: '2026-10-14T09:30', gruaId: 10 },
        { id: 4, clienteId: null, fecha: '2026-10-11T13:05', gruaId: 14 },
        { id: 5, clienteId: 3, fecha: '2026-10-07T16:20', gruaId: 6 }
    ],

    reparaciones: [
        { id: 1, clienteId: 1, fecha: '2026-10-16T08:50', mensaje: 'Buenos días. Nuestra grúa de rescate IR-50 presenta un ruido metálico al extender la pluma con cargas mayores a 10 toneladas. El problema empezó hace dos semanas y se ha vuelto más frecuente. Además, el freno del winch parece tardar más en responder. Necesitamos una revisión lo antes posible porque es la unidad principal de nuestro servicio carretero.' },
        { id: 2, clienteId: null, fecha: '2026-10-14T15:10', mensaje: 'Hola, tengo una plataforma IP-22 que pierde aceite en el cilindro de inclinación. ¿Pueden revisarla esta semana? Mi teléfono es 81 2222 7788.' },
        { id: 3, clienteId: 3, fecha: '2026-10-12T11:40', mensaje: 'El wheel lift de nuestra unidad WL-70 no sube a la altura completa y hace un chasquido al bajar. Queremos agendar mantenimiento preventivo para las tres unidades de la flotilla.' },
        { id: 4, clienteId: null, fecha: '2026-10-06T09:05', mensaje: 'Necesito cotizar la reparación de la torreta y la barra de luces de una grúa underlift. Se dañaron en un choque leve. Pueden escribirme a este mismo medio o llamarme al 55 9876 1122.' }
    ],

    // Historial de respaldos. operacion: respaldar | restaurar · origen: automatica | manual · estado: exitoso | error | en_proceso
    respaldos: [
        { id: 6, inicio: '2026-10-15T02:00', fin: '2026-10-15T02:07', operacion: 'respaldar', origen: 'automatica', usuario: 'Sistema', estado: 'exitoso' },
        { id: 5, inicio: '2026-10-14T16:20', fin: '2026-10-14T16:31', operacion: 'respaldar', origen: 'manual', usuario: 'Carlos Mendoza', estado: 'exitoso' },
        { id: 4, inicio: '2026-10-14T02:00', fin: '2026-10-14T02:03', operacion: 'respaldar', origen: 'automatica', usuario: 'Sistema', estado: 'error' },
        { id: 3, inicio: '2026-10-10T11:05', fin: '2026-10-10T11:24', operacion: 'restaurar', origen: 'manual', usuario: 'Andrea Ibarra', estado: 'exitoso', respaldoId: 2 },
        { id: 2, inicio: '2026-10-08T02:00', fin: '2026-10-08T02:08', operacion: 'respaldar', origen: 'automatica', usuario: 'Sistema', estado: 'exitoso' },
        { id: 1, inicio: '2026-10-01T02:00', fin: '2026-10-01T02:09', operacion: 'respaldar', origen: 'automatica', usuario: 'Sistema', estado: 'exitoso' }
    ],

    /*
     * Bitácoras (solo lectura). Cada registro guarda una copia de los datos de la persona en ese momento,
     * así el historial no cambia si después se edita o se elimina la cuenta.
     * accesos.evento: login_exitoso | login_fallido | cuenta_bloqueada | logout
     */
    accesos: [
        { id: 22, fecha: '2026-10-16T09:02', correo: 'carlos.mendoza@invictuscrane.com', nombre: 'Carlos', apellidos: 'Mendoza Rivas', rol: 'admin', evento: 'login_exitoso' },
        { id: 21, fecha: '2026-10-16T08:47', correo: 'lucia.fernandez@invictuscrane.com', nombre: 'Lucía', apellidos: 'Fernández Soto', rol: 'marketing', evento: 'login_exitoso' },
        { id: 20, fecha: '2026-10-15T18:30', correo: 'roberto.salinas@invictuscrane.com', nombre: 'Roberto', apellidos: 'Salinas Cruz', rol: 'ventas', evento: 'logout' },
        { id: 19, fecha: '2026-10-15T17:12', correo: 'roberto.salinas@invictuscrane.com', nombre: 'Roberto', apellidos: 'Salinas Cruz', rol: 'ventas', evento: 'login_exitoso' },
        { id: 18, fecha: '2026-10-15T12:40', correo: 'andrea.ibarra@invictuscrane.com', nombre: 'Andrea', apellidos: 'Ibarra León', rol: 'admin', evento: 'cuenta_bloqueada' },
        { id: 17, fecha: '2026-10-15T12:39', correo: 'andrea.ibarra@invictuscrane.com', nombre: 'Andrea', apellidos: 'Ibarra León', rol: 'admin', evento: 'login_fallido' },
        { id: 16, fecha: '2026-10-15T12:38', correo: 'andrea.ibarra@invictuscrane.com', nombre: 'Andrea', apellidos: 'Ibarra León', rol: 'admin', evento: 'login_fallido' },
        { id: 15, fecha: '2026-10-15T12:36', correo: 'andrea.ibarra@invictuscrane.com', nombre: 'Andrea', apellidos: 'Ibarra León', rol: 'admin', evento: 'login_fallido' },
        { id: 14, fecha: '2026-10-14T19:05', correo: 'carlos.mendoza@invictuscrane.com', nombre: 'Carlos', apellidos: 'Mendoza Rivas', rol: 'admin', evento: 'logout' },
        { id: 13, fecha: '2026-10-14T10:15', correo: 'carlos.mendoza@invictuscrane.com', nombre: 'Carlos', apellidos: 'Mendoza Rivas', rol: 'admin', evento: 'login_exitoso' },
        { id: 12, fecha: '2026-10-13T16:55', correo: 'lucia.fernandez@invictuscrane.com', nombre: 'Lucía', apellidos: 'Fernández Soto', rol: 'marketing', evento: 'logout' },
        { id: 11, fecha: '2026-10-13T09:10', correo: 'lucia.fernandez@invictuscrane.com', nombre: 'Lucía', apellidos: 'Fernández Soto', rol: 'marketing', evento: 'login_exitoso' },
        { id: 10, fecha: '2026-10-12T11:24', correo: 'roberto.salinas@invictuscrane.com', nombre: 'Roberto', apellidos: 'Salinas Cruz', rol: 'ventas', evento: 'login_exitoso' },
        { id: 9, fecha: '2026-10-12T10:58', correo: 'roberto.salinas@invictuscrane.com', nombre: 'Roberto', apellidos: 'Salinas Cruz', rol: 'ventas', evento: 'login_fallido' },
        { id: 8, fecha: '2026-10-12T10:21', correo: 'carlos.mendoza@invictuscrane.com', nombre: 'Carlos', apellidos: 'Mendoza Rivas', rol: 'admin', evento: 'login_exitoso' },
        { id: 7, fecha: '2026-10-09T15:12', correo: 'lucia.fernandez@invictuscrane.com', nombre: 'Lucía', apellidos: 'Fernández Soto', rol: 'marketing', evento: 'login_exitoso' },
        { id: 6, fecha: '2026-10-09T14:58', correo: 'lucia.fernandez@invictuscrane.com', nombre: 'Lucía', apellidos: 'Fernández Soto', rol: 'marketing', evento: 'login_fallido' },
        { id: 5, fecha: '2026-10-08T18:40', correo: 'carlos.mendoza@invictuscrane.com', nombre: 'Carlos', apellidos: 'Mendoza Rivas', rol: 'admin', evento: 'logout' },
        { id: 4, fecha: '2026-10-08T16:05', correo: 'carlos.mendoza@invictuscrane.com', nombre: 'Carlos', apellidos: 'Mendoza Rivas', rol: 'admin', evento: 'login_exitoso' },
        { id: 3, fecha: '2026-10-05T09:14', correo: 'lucia.fernandez@invictuscrane.com', nombre: 'Lucía', apellidos: 'Fernández Soto', rol: 'marketing', evento: 'login_exitoso' },
        { id: 2, fecha: '2026-10-02T09:47', correo: 'carlos.mendoza@invictuscrane.com', nombre: 'Carlos', apellidos: 'Mendoza Rivas', rol: 'admin', evento: 'login_exitoso' },
        { id: 1, fecha: '2026-09-25T12:58', correo: 'roberto.salinas@invictuscrane.com', nombre: 'Roberto', apellidos: 'Salinas Cruz', rol: 'ventas', evento: 'login_fallido' }
    ],

    // Recuperaciones de contraseña del personal. estado: exitoso | fallido · medio: correo | telefono
    recuperaciones: [
        { id: 7, fecha: '2026-10-15T12:50', correo: 'andrea.ibarra@invictuscrane.com', nombre: 'Andrea', apellidos: 'Ibarra León', estado: 'exitoso', medio: 'telefono' },
        { id: 6, fecha: '2026-10-12T11:20', correo: 'roberto.salinas@invictuscrane.com', nombre: 'Roberto', apellidos: 'Salinas Cruz', estado: 'exitoso', medio: 'correo' },
        { id: 5, fecha: '2026-10-09T15:10', correo: 'lucia.fernandez@invictuscrane.com', nombre: 'Lucía', apellidos: 'Fernández Soto', estado: 'exitoso', medio: 'telefono' },
        { id: 4, fecha: '2026-10-09T15:03', correo: 'lucia.fernandez@invictuscrane.com', nombre: 'Lucía', apellidos: 'Fernández Soto', estado: 'fallido', medio: 'correo' },
        { id: 3, fecha: '2026-10-02T09:45', correo: 'carlos.mendoza@invictuscrane.com', nombre: 'Carlos', apellidos: 'Mendoza Rivas', estado: 'exitoso', medio: 'correo' },
        { id: 2, fecha: '2026-09-25T13:00', correo: 'roberto.salinas@invictuscrane.com', nombre: 'Roberto', apellidos: 'Salinas Cruz', estado: 'fallido', medio: 'telefono' },
        { id: 1, fecha: '2026-09-18T08:30', correo: 'andrea.ibarra@invictuscrane.com', nombre: 'Andrea', apellidos: 'Ibarra León', estado: 'exitoso', medio: 'correo' }
    ],

    /*
     * Quién cambió a qué usuario o cliente, con los datos antes y después.
     * accion: crear | actualizar | eliminar | activar | desactivar · afectado.tipo: administrador | cliente
     * antes / despues: null cuando el registro no existía (crear) o ya no existe (eliminar).
     */
    cambiosUsuarios: [
        {
            id: 9, fecha: '2026-10-15T13:05', accion: 'desactivar',
            autor: { nombre: 'Carlos', apellidos: 'Mendoza Rivas', correo: 'carlos.mendoza@invictuscrane.com', rol: 'admin' },
            afectado: { nombre: 'Andrea', apellidos: 'Ibarra León', correo: 'andrea.ibarra@invictuscrane.com', tipo: 'administrador' },
            antes: { nombre: 'Andrea', apellidos: 'Ibarra León', correo: 'andrea.ibarra@invictuscrane.com', telefono: '33 4567 8901', departamento: 'Desarrollo de software', rol: 'admin', activo: true },
            despues: { nombre: 'Andrea', apellidos: 'Ibarra León', correo: 'andrea.ibarra@invictuscrane.com', telefono: '33 4567 8901', departamento: 'Desarrollo de software', rol: 'admin', activo: false }
        },
        {
            id: 8, fecha: '2026-10-12T10:30', accion: 'actualizar', contrasena: true,
            autor: { nombre: 'Carlos', apellidos: 'Mendoza Rivas', correo: 'carlos.mendoza@invictuscrane.com', rol: 'admin' },
            afectado: { nombre: 'Roberto', apellidos: 'Salinas Cruz', correo: 'roberto.salinas@invictuscrane.com', tipo: 'administrador' },
            antes: { nombre: 'Roberto', apellidos: 'Salinas Cruz', correo: 'roberto.salinas@invictuscrane.com', telefono: '81 3456 7800', departamento: 'Producción', rol: 'ventas', activo: true },
            despues: { nombre: 'Roberto', apellidos: 'Salinas Cruz', correo: 'roberto.salinas@invictuscrane.com', telefono: '81 3456 7890', departamento: 'Ventas', rol: 'ventas', activo: true }
        },
        {
            id: 7, fecha: '2026-10-08T16:12', accion: 'crear',
            autor: { nombre: 'Carlos', apellidos: 'Mendoza Rivas', correo: 'carlos.mendoza@invictuscrane.com', rol: 'admin' },
            afectado: { nombre: 'Patricia', apellidos: 'Gómez Vidal', correo: 'patricia@constructoraandes.com', tipo: 'cliente' },
            antes: null,
            despues: { nombre: 'Patricia', apellidos: 'Gómez Vidal', correo: 'patricia@constructoraandes.com', telefono: '55 3333 4444', activo: true }
        },
        {
            id: 6, fecha: '2026-10-05T09:20', accion: 'eliminar',
            autor: { nombre: 'Lucía', apellidos: 'Fernández Soto', correo: 'lucia.fernandez@invictuscrane.com', rol: 'marketing' },
            afectado: { nombre: 'Pedro', apellidos: 'Luna Ortiz', correo: 'pluna@oldmail.com', tipo: 'cliente' },
            antes: { nombre: 'Pedro', apellidos: 'Luna Ortiz', correo: 'pluna@oldmail.com', telefono: '33 7777 8888', activo: false },
            despues: null
        },
        {
            id: 5, fecha: '2026-10-03T11:48', accion: 'desactivar',
            autor: { nombre: 'Carlos', apellidos: 'Mendoza Rivas', correo: 'carlos.mendoza@invictuscrane.com', rol: 'admin' },
            afectado: { nombre: 'Héctor', apellidos: 'Ramírez Peña', correo: 'hramirez@puertomaritimo.mx', tipo: 'cliente' },
            antes: { nombre: 'Héctor', apellidos: 'Ramírez Peña', correo: 'hramirez@puertomaritimo.mx', telefono: '229 555 6666', activo: true },
            despues: { nombre: 'Héctor', apellidos: 'Ramírez Peña', correo: 'hramirez@puertomaritimo.mx', telefono: '229 555 6666', activo: false }
        },
        {
            id: 4, fecha: '2026-09-30T17:05', accion: 'actualizar',
            autor: { nombre: 'Carlos', apellidos: 'Mendoza Rivas', correo: 'carlos.mendoza@invictuscrane.com', rol: 'admin' },
            afectado: { nombre: 'Lucía', apellidos: 'Fernández Soto', correo: 'lucia.fernandez@invictuscrane.com', tipo: 'administrador' },
            antes: { nombre: 'Lucía', apellidos: 'Fernández Soto', correo: 'lucia.fernandez@invictuscrane.com', telefono: '55 2345 6789', departamento: 'Ventas', rol: 'ventas', activo: true },
            despues: { nombre: 'Lucía', apellidos: 'Fernández Soto', correo: 'lucia.fernandez@invictuscrane.com', telefono: '55 2345 6789', departamento: 'Marketing', rol: 'marketing', activo: true }
        },
        {
            id: 3, fecha: '2026-09-28T10:15', accion: 'crear',
            autor: { nombre: 'Andrea', apellidos: 'Ibarra León', correo: 'andrea.ibarra@invictuscrane.com', rol: 'admin' },
            afectado: { nombre: 'Roberto', apellidos: 'Salinas Cruz', correo: 'roberto.salinas@invictuscrane.com', tipo: 'administrador' },
            antes: null,
            despues: { nombre: 'Roberto', apellidos: 'Salinas Cruz', correo: 'roberto.salinas@invictuscrane.com', telefono: '81 3456 7800', departamento: 'Producción', rol: 'ventas', activo: true }
        },
        {
            id: 2, fecha: '2026-09-22T12:40', accion: 'activar',
            autor: { nombre: 'Carlos', apellidos: 'Mendoza Rivas', correo: 'carlos.mendoza@invictuscrane.com', rol: 'admin' },
            afectado: { nombre: 'Andrea', apellidos: 'Ibarra León', correo: 'andrea.ibarra@invictuscrane.com', tipo: 'administrador' },
            antes: { nombre: 'Andrea', apellidos: 'Ibarra León', correo: 'andrea.ibarra@invictuscrane.com', telefono: '33 4567 8901', departamento: 'Desarrollo de software', rol: 'admin', activo: false },
            despues: { nombre: 'Andrea', apellidos: 'Ibarra León', correo: 'andrea.ibarra@invictuscrane.com', telefono: '33 4567 8901', departamento: 'Desarrollo de software', rol: 'admin', activo: true }
        },
        {
            id: 1, fecha: '2026-09-18T09:30', accion: 'actualizar',
            autor: { nombre: 'Lucía', apellidos: 'Fernández Soto', correo: 'lucia.fernandez@invictuscrane.com', rol: 'ventas' },
            afectado: { nombre: 'Miguel', apellidos: 'Torres Aguilar', correo: 'mtorres@acerosdelnorte.mx', tipo: 'cliente' },
            antes: { nombre: 'Miguel', apellidos: 'Torres Aguilar', correo: 'miguel.torres@acerosnorte.mx', telefono: '81 1111 2222', activo: true },
            despues: { nombre: 'Miguel', apellidos: 'Torres Aguilar', correo: 'mtorres@acerosdelnorte.mx', telefono: '81 1111 2222', activo: true }
        }
    ],

    /*
     * Cambios en el contenido del sitio: Configurar datos de la empresa (modulo «empresa»), catálogo de
     * accesorios («accesorios») y catálogo de grúas («gruas»). accion: crear | actualizar | eliminar.
     * antes / despues guardan nombres, no ids; en una modificación la imagen solo aparece si cambió.
     */
    cambiosContenido: [
        // ── Datos de la empresa
        {
            id: 9, fecha: '2026-10-15T16:40', modulo: 'empresa', entidad: 'carrusel', accion: 'actualizar', autor: LUCIA,
            antes: { orden: 2, tipo: 'accesorio', producto: 'Malacate eléctrico', titulo: 'Fuerza en cada maniobra', subtitulo: 'Malacate de 9,000 lbs' },
            despues: { orden: 2, tipo: 'accesorio', producto: 'Malacate eléctrico', titulo: 'Fuerza en cada maniobra', subtitulo: 'Malacate de 9,000 lbs con control' }
        },
        {
            id: 8, fecha: '2026-10-14T11:25', modulo: 'empresa', entidad: 'informacion', accion: 'actualizar', autor: CARLOS,
            antes: { mision: MISION, vision: VISION, whatsapp: '+52 81 1234 5699' },
            despues: { mision: MISION, vision: VISION, whatsapp: '+52 81 1234 5600' }
        },
        {
            id: 7, fecha: '2026-10-13T09:50', modulo: 'empresa', entidad: 'carrusel', accion: 'crear', autor: LUCIA, antes: null,
            despues: { orden: 3, tipo: 'grua', producto: 'Plataformas IP-22', titulo: 'Plataformas para la ciudad', subtitulo: 'Aluminio ligero para auxilio vial urbano', imagen: demo(2009) }
        },
        {
            id: 6, fecha: '2026-10-12T13:15', modulo: 'empresa', entidad: 'carrusel', accion: 'eliminar', autor: LUCIA,
            antes: { orden: 3, tipo: 'accesorio', producto: 'Barra de luces LED', titulo: 'Temporada de lluvias', subtitulo: 'Visibilidad en cualquier clima', imagen: demo(2024) },
            despues: null
        },
        {
            id: 5, fecha: '2026-10-10T17:30', modulo: 'empresa', entidad: 'acontecimiento', accion: 'actualizar', autor: CARLOS,
            antes: { anio: 2024, descripcion: 'Presentamos el catálogo digital.', imagen: demo(2021) },
            despues: { anio: 2024, descripcion: 'Presentamos el catálogo digital interactivo.', imagen: demo(2024) }
        },
        {
            id: 4, fecha: '2026-10-09T10:05', modulo: 'empresa', entidad: 'acontecimiento', accion: 'crear', autor: CARLOS, antes: null,
            despues: { anio: 2026, descripcion: 'Abrimos la tienda en línea de accesorios.', imagen: demo(2026) }
        },
        {
            id: 3, fecha: '2026-10-07T12:20', modulo: 'empresa', entidad: 'valor', accion: 'actualizar', autor: LUCIA,
            antes: { titulo: 'Compromiso', descripcion: 'Acompañamos a nuestros clientes con atención cercana.' },
            despues: { titulo: 'Compromiso', descripcion: 'Acompañamos a nuestros clientes con honestidad, atención cercana y soluciones que respondan a sus necesidades.' }
        },
        {
            id: 2, fecha: '2026-10-03T18:10', modulo: 'empresa', entidad: 'informacion', accion: 'actualizar', autor: CARLOS,
            antes: { mision: 'Fabricar grúas de alto desempeño con ingeniería mexicana.', vision: VISION, whatsapp: '+52 81 1234 5699' },
            despues: { mision: MISION, vision: VISION, whatsapp: '+52 81 1234 5699' }
        },
        {
            id: 1, fecha: '2026-10-01T09:00', modulo: 'empresa', entidad: 'valor', accion: 'eliminar', autor: LUCIA,
            antes: { titulo: 'Puntualidad', descripcion: 'Cumplimos los tiempos de entrega que prometemos a cada cliente.' }, despues: null
        },

        // ── Catálogo de accesorios
        {
            id: 17, fecha: '2026-10-15T12:10', modulo: 'accesorios', entidad: 'accesorio', accion: 'actualizar', autor: ROBERTO,
            antes: { nombre: 'Malacate eléctrico', categoria: 'Malacates', precio: 11900, descripcion: 'Malacate 12V de 9,000 lbs con control.', atributos: ['Capacidad: 9,000 lbs', 'Eléctrico: 12 V', 'Eléctrico: Control inalámbrico'] },
            despues: { nombre: 'Malacate eléctrico', categoria: 'Malacates', precio: 12400, descripcion: 'Malacate 12V de 9,000 lbs con control.', atributos: ['Capacidad: 9,000 lbs', 'Eléctrico: 12 V', 'Eléctrico: Control inalámbrico'] }
        },
        {
            id: 16, fecha: '2026-10-14T16:45', modulo: 'accesorios', entidad: 'accesorio', accion: 'crear', autor: ROBERTO, antes: null,
            despues: { nombre: 'Kit de señalización', categoria: 'Seguridad vial', precio: 890, descripcion: 'Conos, banderas y triángulos.', atributos: [] }
        },
        {
            id: 15, fecha: '2026-10-13T10:30', modulo: 'accesorios', entidad: 'accesorio', accion: 'actualizar', autor: CARLOS,
            antes: { nombre: 'Barra de luces LED', categoria: 'Iluminación', precio: 3200, descripcion: 'Barra ámbar de emergencia.', atributos: ['Eléctrico: Luz LED ámbar', 'Eléctrico: 12 V'] },
            despues: { nombre: 'Barra de luces LED', categoria: 'Iluminación', precio: 3200, descripcion: 'Barra ámbar de emergencia, 48".', atributos: ['Eléctrico: Luz LED ámbar', 'Eléctrico: 12 V', 'Medida: 48 pulgadas'] }
        },
        { id: 14, fecha: '2026-10-11T09:20', modulo: 'accesorios', entidad: 'atributo', accion: 'crear', autor: CARLOS, antes: null, despues: { nombre: '48 pulgadas', categoria: 'Medida' } },
        {
            id: 13, fecha: '2026-10-10T15:05', modulo: 'accesorios', entidad: 'accesorio', accion: 'eliminar', autor: ROBERTO,
            antes: { nombre: 'Faro de trabajo LED', categoria: 'Iluminación', precio: 650, descripcion: 'Faro auxiliar para maniobras nocturnas.', atributos: ['Eléctrico: 12 V'] },
            despues: null
        },
        { id: 12, fecha: '2026-10-08T11:40', modulo: 'accesorios', entidad: 'categoria_accesorio', accion: 'actualizar', autor: CARLOS, antes: { nombre: 'Amarre' }, despues: { nombre: 'Amarre y arrastre' } },
        { id: 11, fecha: '2026-10-06T13:00', modulo: 'accesorios', entidad: 'categoria_atributo', accion: 'crear', autor: CARLOS, antes: null, despues: { nombre: 'Color' } },
        {
            id: 10, fecha: '2026-10-02T10:15', modulo: 'accesorios', entidad: 'atributo', accion: 'eliminar', autor: ANDREA,
            antes: { nombre: '24 V', categoria: 'Eléctrico' }, despues: null, nota: 'También se quitó del accesorio «Faro de trabajo LED».'
        },

        // ── Catálogo de grúas
        {
            id: 26, fecha: '2026-10-15T17:55', modulo: 'gruas', entidad: 'grua', accion: 'actualizar', autor: ROBERTO,
            antes: { nombre: 'Rescate IR-50', categoria: 'Rescate', atributos: ['1 × Pluma telescópica', '1 × Winche', '1 × Brazo wheel lift'], opcionales: ['Parachoques frontal personalizado'] },
            despues: { nombre: 'Rescate IR-50', categoria: 'Rescate', atributos: ['1 × Pluma telescópica', '2 × Winche', '1 × Brazo wheel lift'], opcionales: ['Parachoques frontal personalizado', 'Cabina climatizada'] }
        },
        {
            id: 25, fecha: '2026-10-14T09:40', modulo: 'gruas', entidad: 'grua', accion: 'crear', autor: CARLOS, antes: null,
            despues: { nombre: 'Underlift UL-85', categoria: 'Underlift', imagen: demo(2018), atributos: ['1 × Underlift', '2 × Winche', '1 × Pluma telescópica'], opcionales: ['Cabina climatizada'] }
        },
        { id: 24, fecha: '2026-10-13T15:20', modulo: 'gruas', entidad: 'atributo_grua', accion: 'actualizar', autor: CARLOS, antes: { nombre: 'Pluma' }, despues: { nombre: 'Pluma telescópica' } },
        {
            id: 23, fecha: '2026-10-12T12:00', modulo: 'gruas', entidad: 'opcional_grua', accion: 'eliminar', autor: ROBERTO,
            antes: { nombre: 'Torreta LED adicional', imagen: demo(2024) }, despues: null, nota: 'También se quitó de 2 grúas: Rescate IR-75 y Underlift UL-60.'
        },
        { id: 22, fecha: '2026-10-10T10:45', modulo: 'gruas', entidad: 'opcional_grua', accion: 'crear', autor: CARLOS, antes: null, despues: { nombre: 'Cabina climatizada', imagen: demo(2018) } },
        { id: 21, fecha: '2026-10-08T17:15', modulo: 'gruas', entidad: 'categoria_grua', accion: 'actualizar', autor: ANDREA, antes: { nombre: 'Wheel-lift' }, despues: { nombre: 'Wheel Lift' } },
        {
            id: 20, fecha: '2026-10-07T09:30', modulo: 'gruas', entidad: 'grua', accion: 'eliminar', autor: ROBERTO,
            antes: { nombre: 'Rescate IR-20', categoria: 'Rescate', imagen: demo(2015), atributos: ['1 × Pluma telescópica', '1 × Winche'], opcionales: [] }, despues: null
        },
        {
            id: 19, fecha: '2026-10-05T14:10', modulo: 'gruas', entidad: 'grua', accion: 'actualizar', autor: CARLOS,
            antes: { nombre: 'Plataformas IP-22', categoria: 'Plataformas', imagen: demo(2006), atributos: ['1 × Plataforma', '1 × Winche'], opcionales: ['Estribos cromados'] },
            despues: { nombre: 'Plataformas IP-22', categoria: 'Plataformas', imagen: demo(2009), atributos: ['1 × Plataforma', '1 × Winche'], opcionales: ['Estribos cromados'] }
        },
        { id: 18, fecha: '2026-10-02T11:00', modulo: 'gruas', entidad: 'categoria_grua', accion: 'crear', autor: CARLOS, antes: null, despues: { nombre: 'Underlift' } }
    ],

    // Solicitudes eliminadas: quién y cuándo, con los datos que identifican la solicitud (sin el mensaje)
    solicitudesEliminadas: [
        {
            id: 5, fecha: '2026-10-15T19:20', tipo: 'cotizacion', autor: ROBERTO,
            solicitud: { id: 8, fecha: '2026-10-15T08:10', registrado: false, nombre: '', apellidos: '', correo: '', grua: 'Plataformas IP-30' }
        },
        {
            id: 4, fecha: '2026-10-14T13:30', tipo: 'reparacion', autor: CARLOS,
            solicitud: { id: 6, fecha: '2026-10-13T18:22', registrado: true, nombre: 'Patricia', apellidos: 'Gómez Vidal', correo: 'patricia@constructoraandes.com' }
        },
        {
            id: 3, fecha: '2026-10-11T10:05', tipo: 'cotizacion', autor: ROBERTO,
            solicitud: { id: 7, fecha: '2026-10-10T20:41', registrado: true, nombre: 'Miguel', apellidos: 'Torres Aguilar', correo: 'mtorres@acerosdelnorte.mx', grua: 'Rescate IR-35' }
        },
        {
            id: 2, fecha: '2026-10-08T09:15', tipo: 'reparacion', autor: CARLOS,
            solicitud: { id: 5, fecha: '2026-10-07T23:58', registrado: false, nombre: '', apellidos: '', correo: '' }
        },
        {
            id: 1, fecha: '2026-10-04T16:40', tipo: 'cotizacion', autor: ANDREA,
            solicitud: { id: 6, fecha: '2026-10-03T12:15', registrado: false, nombre: '', apellidos: '', correo: '', grua: 'Wheel Lift WL-35' }
        }
    ]
};
