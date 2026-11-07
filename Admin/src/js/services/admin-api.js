/**
 * Servicio del panel del administrador.
 *
 * ⚠ SIMULADO. Todavía no está conectado al backend de Spring Boot, así que este módulo imita la API
 * guardando los datos en el navegador (localStorage) a partir de data/seed.js.
 * Las pantallas SOLO llaman a las funciones exportadas aquí. Para conectar el servidor, reemplaza el
 * cuerpo de cada una por la petición indicada en su comentario «SERVIDOR REAL» (puedes usar
 * `apiFetch` de services/http.js) y borra todo lo marcado como «DEMO».
 * Las reglas (campos obligatorios, años repetidos, categorías en uso…) deben vivir en el servidor;
 * aquí solo se imitan para que la interfaz se pueda probar con los mismos mensajes.
 *
 * Errores: toda función puede lanzar `ApiError` con
 *   code: validation (400) · duplicate (409) · in_use (409) · limit (409) · not_found (404) · storage
 *   field: el campo del formulario al que se refiere el error (si aplica)
 */
import { SEED } from '../data/seed.js';

export class ApiError extends Error {
    constructor(code, message, field) {
        super(message);
        this.code = code;
        this.field = field;
    }
}

export const CAROUSEL_MAX = 10;

// ───────────────────────────── DEMO ─────────────────────────────
const DB_KEY = 'invictus_admin_demo_db';
const DB_VERSION = 2;   // súbelo cuando cambie la forma de los datos: los navegadores vuelven a la semilla

function load() {
    try {
        const saved = JSON.parse(localStorage.getItem(DB_KEY));
        // Las secciones nuevas que aún no existían en este navegador se toman de la semilla
        if (saved?.version === DB_VERSION) return { ...structuredClone(SEED), ...saved };
    } catch { /* datos dañados o almacenamiento bloqueado: se usa la semilla */ }
    return { version: DB_VERSION, ...structuredClone(SEED) };
}

let db = load();

/** Aplica un cambio y lo guarda; si algo falla, deshace el cambio completo. */
function mutate(change) {
    const before = JSON.stringify(db);
    try {
        const result = change();
        try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch {
            throw new ApiError('storage', 'El navegador no tiene espacio para guardar esta imagen de prueba. Usa una imagen más ligera.', 'imagen');
        }
        return result;
    } catch (error) {
        db = JSON.parse(before);
        throw error;
    }
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
/** Simula una latencia de red corta y entrega copias (como lo haría un JSON del servidor). */
async function respond(work) {
    await wait(90 + Math.random() * 110);
    return structuredClone(work());
}

/** Fecha y hora local en formato ISO hasta los minutos: "2026-10-16T09:02". */
const stamp = (date = new Date()) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const nextId = list => Math.max(0, ...list.map(item => Number(item.id) || 0)) + 1;
const same = (a, b) => String(a ?? '').trim().toLocaleLowerCase('es') === String(b ?? '').trim().toLocaleLowerCase('es');
const find = (list, id, what) => {
    const item = list.find(entry => String(entry.id) === String(id));
    if (!item) throw new ApiError('not_found', `${what} ya no existe. Recarga la página.`);
    return item;
};
const nameOf = (list, id) => list.find(item => item.id === id)?.nombre;

function text(value, field, label, max) {
    const clean = String(value ?? '').trim();
    if (!clean) throw new ApiError('validation', `${label} es obligatorio.`, field);
    if (clean.length > max) throw new ApiError('validation', `${label} no puede pasar de ${max} caracteres.`, field);
    return clean;
}

/** Borra los cambios hechos en este navegador y vuelve a los datos de demostración. */
export function resetDemoData() {
    try { localStorage.removeItem(DB_KEY); } catch { /* almacenamiento bloqueado */ }
    db = load();
}
// ─────────────────────────── FIN DEMO ───────────────────────────


/* ═════════════════════ Mi cuenta (Mis datos) ═════════════════════ */

/** "admin" → "Administrador" */
export const roleLabel = id => STAFF_ROLES.find(role => role.id === id)?.nombre || id || '—';

// DEMO: sin sesión del portal se usa esta cuenta de la lista de usuarios de ejemplo
const DEMO_ACCOUNT = 'carlos.mendoza@invictuscrane.com';
// DEMO: teléfonos de las cuentas de prueba del portal de acceso (no están en la lista de usuarios de ejemplo)
const PORTAL_PHONES = { 'admin@invictuscrane.com': '81 1234 5601', 'ventas@invictuscrane.com': '81 1234 5602', 'marketing@invictuscrane.com': '81 1234 5603' };
const DEPARTMENT_BY_ROLE = { admin: 'Administración', ventas: 'Ventas', marketing: 'Marketing' };
// DEMO: quien usa el panel; queda como autor en las bitácoras de cambios
let demoActor = null;
const actor = () => ({ ...(demoActor || { nombre: 'Administración', apellidos: '', correo: 'admin@invictuscrane.com', rol: 'admin' }) });

/**
 * Datos de quien inició sesión. `session` es lo que guardó el portal ({ nombre, correo, rol, inicio }).
 * SERVIDOR REAL: GET /api/auth/me (la sesión viaja en la cookie; el parámetro ya no hace falta)
 *   → { nombre, apellidos, correo, telefono, departamento, rol, activo, sesionIniciada } · 401 sin sesión
 */
export const getMyProfile = session => respond(() => {
    const correo = String(session?.correo || DEMO_ACCOUNT).trim().toLowerCase();
    const staff = db.usuarios.find(user => user.correo === correo);
    const profile = staff
        ? publicUser(staff)
        : {
            nombre: session?.nombre || 'Administración',
            apellidos: '',
            correo,
            telefono: PORTAL_PHONES[correo] || '—',
            departamento: DEPARTMENT_BY_ROLE[session?.rol] || '—',
            rol: session?.rol || 'admin',
            activo: true
        };
    profile.sesionIniciada = stamp(session?.inicio ? new Date(session.inicio) : new Date());
    demoActor = { nombre: profile.nombre, apellidos: profile.apellidos, correo: profile.correo, rol: profile.rol };
    return profile;
});


/* ═════════════════════ Registro de cambios en el contenido (DEMO) ═════════════════════ */
/*
 * DEMO: el servidor real escribe estas bitácoras en la misma transacción de cada alta, modificación o baja,
 * con quien inició sesión como autor. Cada registro guarda una copia de los datos en ese momento, con
 * nombres en lugar de ids, para que el historial no cambie si después se edita o se elimina algo relacionado.
 * Se consultan con listCompanyChanges(), listAccessoryChanges() y listCraneChanges() (al final del archivo).
 */
const named = ({ nombre }) => ({ nombre });
const namedImage = ({ nombre, imagen }) => ({ nombre, imagen });
const attributeLabel = id => {
    const attribute = db.atributos.find(entry => entry.id === id);
    return attribute && `${nameOf(db.categoriasAtributo, attribute.categoriaId)}: ${attribute.nombre}`;
};

/** Bitácora (módulo) donde se anota cada tipo de registro y los datos que se copian de él. */
const AUDITED = {
    informacion: { modulo: 'empresa', copy: ({ mision, vision, whatsapp }) => ({ mision, vision, whatsapp }) },
    valor: { modulo: 'empresa', copy: ({ titulo, descripcion }) => ({ titulo, descripcion }) },
    carrusel: {
        modulo: 'empresa',
        copy: slide => ({ orden: slide.orden, tipo: slide.tipo, producto: productName(slide) || 'Producto eliminado', titulo: slide.titulo, subtitulo: slide.subtitulo, imagen: slide.imagen })
    },
    acontecimiento: { modulo: 'empresa', copy: ({ anio, descripcion, imagen }) => ({ anio, descripcion, imagen }) },
    categoria_accesorio: { modulo: 'accesorios', copy: named },
    categoria_atributo: { modulo: 'accesorios', copy: named },
    atributo: { modulo: 'accesorios', copy: attribute => ({ nombre: attribute.nombre, categoria: nameOf(db.categoriasAtributo, attribute.categoriaId) }) },
    accesorio: {
        modulo: 'accesorios',
        copy: item => ({
            nombre: item.nombre,
            categoria: nameOf(db.categoriasAccesorio, item.categoriaId),
            precio: item.precio,
            descripcion: item.descripcion,
            atributos: item.atributos.map(attributeLabel).filter(Boolean)
        })
    },
    categoria_grua: { modulo: 'gruas', copy: named },
    atributo_grua: { modulo: 'gruas', copy: namedImage },
    opcional_grua: { modulo: 'gruas', copy: namedImage },
    grua: {
        modulo: 'gruas',
        copy: crane => ({
            nombre: crane.nombre,
            categoria: nameOf(db.categoriasGrua, crane.categoriaId),
            imagen: crane.imagen,
            atributos: crane.atributos.map(entry => `${entry.cantidad} × ${nameOf(db.atributosGrua, entry.atributoId)}`),
            opcionales: crane.opcionales.map(id => nameOf(db.opcionalesGrua, id)).filter(Boolean)
        })
    }
};

/**
 * Anota un cambio. `before` / `after` son el registro antes y después (null en el alta o en la baja);
 * `nota` describe lo que cambió en otros registros como consecuencia.
 */
function logContentChange(entidad, accion, before, after, nota = '') {
    const { modulo, copy } = AUDITED[entidad];
    const antes = before && copy(before);
    const despues = after && copy(after);
    if (antes && despues) {
        if (JSON.stringify(antes) === JSON.stringify(despues)) return;   // se guardó sin cambios
        // La imagen solo se anota si cambió: así la bitácora no repite el mismo archivo en cada edición
        if (antes.imagen === despues.imagen) { delete antes.imagen; delete despues.imagen; }
    }
    db.cambiosContenido.push({ id: nextId(db.cambiosContenido), fecha: stamp(), modulo, entidad, accion, autor: actor(), antes, despues, ...(nota ? { nota } : {}) });
}

/** Da de alta `item` en `list` y lo anota en la bitácora. */
function addAudited(entidad, list, item) {
    list.push(item);
    logContentChange(entidad, 'crear', null, item);
    return item;
}

/** Aplica `fields` a `item` y anota en la bitácora sus datos antes y después. */
function updateAudited(entidad, item, fields) {
    const before = { ...item };
    Object.assign(item, fields);
    logContentChange(entidad, 'actualizar', before, item);
    return item;
}

const listFormat = new Intl.ListFormat('es', { type: 'conjunction' });
/** "También se quitó de 2 grúas: Rescate IR-75 y Underlift UL-60." (vacío si no afectó a nadie) */
function removedFrom(names, singular, pluralName) {
    if (!names.length) return '';
    return names.length === 1
        ? `También se quitó ${singular} «${names[0]}».`
        : `También se quitó de ${names.length} ${pluralName}: ${listFormat.format(names)}.`;
}


/* ═════════════════════ Información de la empresa ═════════════════════ */

/**
 * Misión, visión y WhatsApp. Solo se editan (no se crean ni se eliminan).
 * SERVIDOR REAL: GET /api/empresa → { mision, vision, whatsapp }
 */
export const getCompanyInfo = () => respond(() => db.empresa);

/**
 * SERVIDOR REAL: PUT /api/empresa  { mision, vision, whatsapp } → 200 { mision, vision, whatsapp } · 400 validación
 */
export const updateCompanyInfo = data => respond(() => mutate(() => {
    const whatsapp = String(data.whatsapp ?? '').trim();
    const digits = whatsapp.replace(/\D/g, '');
    if (!/^\+?[\d\s()-]+$/.test(whatsapp) || digits.length < 10 || digits.length > 15) {
        throw new ApiError('validation', 'Escribe un número de 10 a 15 dígitos, con lada. Ejemplo: +52 81 1234 5600.', 'whatsapp');
    }
    const before = db.empresa;
    db.empresa = {
        mision: text(data.mision, 'mision', 'La misión', 1000),
        vision: text(data.vision, 'vision', 'La visión', 1000),
        whatsapp
    };
    logContentChange('informacion', 'actualizar', before, db.empresa);
    return db.empresa;
}));

/* ═════════════════════ Valores de la empresa ═════════════════════ */

/** SERVIDOR REAL: GET /api/valores → [{ id, titulo, descripcion }] en orden de alta */
export const listValues = () => respond(() => db.valores);

function valueFields(data, id) {
    const titulo = text(data.titulo, 'titulo', 'El título', 60);
    if (db.valores.some(value => same(value.titulo, titulo) && value.id !== id)) {
        throw new ApiError('duplicate', `Ya existe el valor «${titulo}».`, 'titulo');
    }
    return { titulo, descripcion: text(data.descripcion, 'descripcion', 'La descripción', 300) };
}

/** SERVIDOR REAL: POST /api/valores  { titulo, descripcion } → 201 { id, titulo, descripcion } · 409 título repetido */
export const createValue = data => respond(() => mutate(() => addAudited('valor', db.valores, { id: nextId(db.valores), ...valueFields(data) })));

/** SERVIDOR REAL: PUT /api/valores/{id}  { titulo, descripcion } → 200 { id, titulo, descripcion } */
export const updateValue = (id, data) => respond(() => mutate(() => updateAudited('valor', find(db.valores, id, 'El valor'), valueFields(data, id))));

/** SERVIDOR REAL: DELETE /api/valores/{id} → 204 */
export const deleteValue = id => respond(() => mutate(() => {
    const value = find(db.valores, id, 'El valor');
    db.valores = db.valores.filter(entry => entry.id !== id);
    logContentChange('valor', 'eliminar', value, null);
}));

/* ═════════════════════ Carrusel principal ═════════════════════ */

const productName = slide => slide.tipo === 'grua'
    ? db.gruas.find(crane => crane.id === Number(slide.productoId))?.nombre
    : db.accesorios.find(item => item.id === Number(slide.productoId))?.nombre;

const withProduct = slide => ({ ...slide, productoNombre: productName(slide) || 'Producto eliminado' });
const sortSlides = () => db.carrusel.sort((a, b) => a.orden - b.orden);

/** Grúas y accesorios que se pueden promocionar en el carrusel. SERVIDOR REAL: GET /api/carrusel/productos */
export const getCarouselProducts = () => respond(() => ({
    gruas: db.gruas.map(({ id, nombre, categoriaId }) => ({ id, nombre, categoria: db.categoriasGrua.find(category => category.id === categoriaId)?.nombre || 'Sin categoría' }))
        .sort((a, b) => a.categoria.localeCompare(b.categoria, 'es') || a.nombre.localeCompare(b.nombre, 'es', { numeric: true })),
    accesorios: db.accesorios.map(({ id, nombre }) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}));

/**
 * Elementos del carrusel en su orden (máximo 10).
 * SERVIDOR REAL: GET /api/carrusel → [{ id, orden, tipo: 'grua' | 'accesorio', productoId, productoNombre, titulo, subtitulo, imagen (URL) }]
 */
export const listSlides = () => respond(() => sortSlides().map(withProduct));

function slideFields(data, { creating }) {
    const tipo = data.tipo;
    const exists = tipo === 'grua'
        ? db.gruas.some(crane => crane.id === Number(data.productoId))
        : tipo === 'accesorio' && db.accesorios.some(item => item.id === Number(data.productoId));
    if (!exists) throw new ApiError('validation', 'Elige una grúa o un accesorio.', 'producto');
    if (creating && !data.imagen) throw new ApiError('validation', 'La imagen es obligatoria.', 'imagen');
    return {
        tipo,
        productoId: Number(data.productoId),
        titulo: text(data.titulo, 'titulo', 'El título', 60),
        subtitulo: text(data.subtitulo, 'subtitulo', 'El subtítulo', 90),
        ...(data.imagen ? { imagen: data.imagen } : {})
    };
}

/** Acomoda el elemento en la posición pedida y renumera 1…n sin huecos. */
function placeSlide(slide, orden) {
    const others = sortSlides().filter(item => item !== slide);
    const position = Math.min(Math.max(Number(orden) || others.length + 1, 1), others.length + 1);
    others.splice(position - 1, 0, slide);
    others.forEach((item, index) => { item.orden = index + 1; });
    db.carrusel = others;
}

/**
 * SERVIDOR REAL: POST /api/carrusel  multipart/form-data { tipo, productoId, orden, titulo, subtitulo, imagen (archivo) }
 *   → 201 elemento · 409 si ya hay 10 elementos. El servidor recorre el orden de los demás.
 */
export const createSlide = data => respond(() => mutate(() => {
    if (db.carrusel.length >= CAROUSEL_MAX) throw new ApiError('limit', `El carrusel ya tiene ${CAROUSEL_MAX} elementos. Elimina uno para agregar otro.`);
    const slide = { id: nextId(db.carrusel), ...slideFields(data, { creating: true }) };
    placeSlide(slide, data.orden);
    logContentChange('carrusel', 'crear', null, slide, slide.orden < db.carrusel.length ? 'Los elementos de ese lugar en adelante bajaron un lugar.' : '');
    return withProduct(slide);
}));

/**
 * SERVIDOR REAL: PUT /api/carrusel/{id}  multipart/form-data (imagen opcional: sin archivo se conserva la actual)
 */
export const updateSlide = (id, data) => respond(() => mutate(() => {
    const slide = find(db.carrusel, id, 'El elemento');
    const before = { ...slide };
    Object.assign(slide, slideFields(data, { creating: false }));
    placeSlide(slide, data.orden);
    logContentChange('carrusel', 'actualizar', before, slide, slide.orden !== before.orden ? 'Los demás elementos se recorrieron para dejarle su nuevo lugar.' : '');
    return withProduct(slide);
}));

/** SERVIDOR REAL: DELETE /api/carrusel/{id} → 204 (el servidor renumera el orden de los demás) */
export const deleteSlide = id => respond(() => mutate(() => {
    const removed = find(db.carrusel, id, 'El elemento');
    db.carrusel = db.carrusel.filter(slide => slide.id !== id);
    sortSlides().forEach((slide, index) => { slide.orden = index + 1; });
    logContentChange('carrusel', 'eliminar', removed, null, removed.orden <= db.carrusel.length ? 'Los elementos que seguían subieron un lugar.' : '');
}));

/* ═════════════════════ Línea del tiempo (historia de la empresa) ═════════════════════ */
/*
 * SERVIDOR REAL: ControlAcontecimiento (RutasApi.HISTORIA_EMPRESA). Alta y modificación son
 * multipart/form-data con { anio, descripcion, imagen }. En la modificación la imagen es opcional:
 * si no se manda archivo se conserva la actual. Un año repetido responde 409 (ExcepcionRecursoDuplicado).
 */

/** SERVIDOR REAL: GET HISTORIA_EMPRESA + OPERACION_LEER → [{ id, anio, descripcion, imagen (URL) }] */
export const listEvents = () => respond(() => [...db.historia].sort((a, b) => a.anio - b.anio));

function eventFields(data, id, { creating }) {
    const anio = Number(data.anio);
    if (!/^\d{4}$/.test(String(data.anio ?? '').trim()) || anio < 1900 || anio > 2100) {
        throw new ApiError('validation', 'Escribe un año de 4 dígitos entre 1900 y 2100.', 'anio');
    }
    if (db.historia.some(event => event.anio === anio && event.id !== id)) {
        throw new ApiError('duplicate', `Ya hay un acontecimiento en ${anio}. Edítalo o elige otro año.`, 'anio');
    }
    if (creating && !data.imagen) throw new ApiError('validation', 'La imagen es obligatoria.', 'imagen');
    return { anio, descripcion: text(data.descripcion, 'descripcion', 'La descripción', 5000), ...(data.imagen ? { imagen: data.imagen } : {}) };
}

/** SERVIDOR REAL: POST HISTORIA_EMPRESA + OPERACION_GUARDAR (multipart) → 201 · 400 · 409 año repetido */
export const createEvent = data => respond(() => mutate(() => addAudited('acontecimiento', db.historia, { id: nextId(db.historia), ...eventFields(data, null, { creating: true }) })));

/** SERVIDOR REAL: PUT HISTORIA_EMPRESA + OPERACION_EDITAR + /{id} (multipart, imagen opcional) → 200 · 400 · 409 */
export const updateEvent = (id, data) => respond(() => mutate(() => updateAudited('acontecimiento', find(db.historia, id, 'El acontecimiento'), eventFields(data, id, { creating: false }))));

/** SERVIDOR REAL: DELETE HISTORIA_EMPRESA + OPERACION_ELIMINAR + /{id} → 204 (también borra la imagen de S3) */
export const deleteEvent = id => respond(() => mutate(() => {
    const event = find(db.historia, id, 'El acontecimiento');
    db.historia = db.historia.filter(entry => entry.id !== id);
    logContentChange('acontecimiento', 'eliminar', event, null);
}));

/* ═════════════════════ Categorías de accesorios ═════════════════════ */

const accessoriesIn = categoryId => db.accesorios.filter(item => item.categoriaId === categoryId).length;

/** SERVIDOR REAL: GET /api/accesorios/categorias → [{ id, nombre, vinculados }] (vinculados = accesorios que la usan) */
export const listAccessoryCategories = () => respond(() => db.categoriasAccesorio
    .map(category => ({ ...category, vinculados: accessoriesIn(category.id) }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));

function categoryName(list, data, id, what) {
    const nombre = text(data.nombre, 'nombre', 'El nombre', 60);
    if (list.some(item => same(item.nombre, nombre) && item.id !== id)) throw new ApiError('duplicate', `Ya existe la ${what} «${nombre}».`, 'nombre');
    return { nombre };
}

/** SERVIDOR REAL: POST /api/accesorios/categorias  { nombre } → 201 · 409 nombre repetido */
export const createAccessoryCategory = data => respond(() => mutate(() => {
    const category = addAudited('categoria_accesorio', db.categoriasAccesorio, { id: nextId(db.categoriasAccesorio), ...categoryName(db.categoriasAccesorio, data, null, 'categoría') });
    return { ...category, vinculados: 0 };
}));

/** SERVIDOR REAL: PUT /api/accesorios/categorias/{id}  { nombre } → 200 · 409 */
export const updateAccessoryCategory = (id, data) => respond(() => mutate(() => {
    const category = updateAudited('categoria_accesorio', find(db.categoriasAccesorio, id, 'La categoría'), categoryName(db.categoriasAccesorio, data, id, 'categoría'));
    return { ...category, vinculados: accessoriesIn(id) };
}));

/** SERVIDOR REAL: DELETE /api/accesorios/categorias/{id} → 204 · 409 si tiene accesorios vinculados */
export const deleteAccessoryCategory = id => respond(() => mutate(() => {
    const category = find(db.categoriasAccesorio, id, 'La categoría');
    const linked = accessoriesIn(id);
    if (linked) throw new ApiError('in_use', `«${category.nombre}» tiene ${linked} accesorio(s) vinculado(s); cámbialos de categoría antes de eliminarla.`);
    db.categoriasAccesorio = db.categoriasAccesorio.filter(item => item.id !== id);
    logContentChange('categoria_accesorio', 'eliminar', category, null);
}));

/* ═════════════════════ Categorías de atributos ═════════════════════ */

const attributesIn = categoryId => db.atributos.filter(attribute => attribute.categoriaId === categoryId)
    .map(({ id, nombre }) => ({ id, nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true }));

/** SERVIDOR REAL: GET /api/atributos/categorias → [{ id, nombre, atributos: [{ id, nombre }] }] */
export const listAttributeCategories = () => respond(() => db.categoriasAtributo
    .map(category => ({ ...category, atributos: attributesIn(category.id) }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));

/** SERVIDOR REAL: POST /api/atributos/categorias  { nombre } → 201 · 409 */
export const createAttributeCategory = data => respond(() => mutate(() => {
    const category = addAudited('categoria_atributo', db.categoriasAtributo, { id: nextId(db.categoriasAtributo), ...categoryName(db.categoriasAtributo, data, null, 'categoría de atributo') });
    return { ...category, atributos: [] };
}));

/** SERVIDOR REAL: PUT /api/atributos/categorias/{id}  { nombre } → 200 · 409 */
export const updateAttributeCategory = (id, data) => respond(() => mutate(() => {
    const category = updateAudited('categoria_atributo', find(db.categoriasAtributo, id, 'La categoría'), categoryName(db.categoriasAtributo, data, id, 'categoría de atributo'));
    return { ...category, atributos: attributesIn(id) };
}));

/** SERVIDOR REAL: DELETE /api/atributos/categorias/{id} → 204 · 409 si tiene atributos ligados */
export const deleteAttributeCategory = id => respond(() => mutate(() => {
    const category = find(db.categoriasAtributo, id, 'La categoría');
    const linked = attributesIn(id).length;
    if (linked) throw new ApiError('in_use', `«${category.nombre}» tiene ${linked} atributo(s) ligado(s); muévelos o elimínalos antes.`);
    db.categoriasAtributo = db.categoriasAtributo.filter(item => item.id !== id);
    logContentChange('categoria_atributo', 'eliminar', category, null);
}));

/* ═════════════════════ Atributos ═════════════════════ */

const usesOf = attributeId => db.accesorios.filter(item => item.atributos.includes(attributeId)).length;
const withCategory = attribute => ({
    ...attribute,
    categoriaNombre: db.categoriasAtributo.find(category => category.id === attribute.categoriaId)?.nombre || 'Sin categoría',
    usos: usesOf(attribute.id)
});

/** SERVIDOR REAL: GET /api/atributos → [{ id, nombre, categoriaId, categoriaNombre, usos }] (usos = accesorios que lo tienen) */
export const listAttributes = () => respond(() => db.atributos.map(withCategory)
    .sort((a, b) => a.categoriaNombre.localeCompare(b.categoriaNombre, 'es') || a.nombre.localeCompare(b.nombre, 'es', { numeric: true })));

function attributeFields(data, id) {
    const nombre = text(data.nombre, 'nombre', 'El nombre', 60);
    const categoriaId = Number(data.categoriaId);
    if (!db.categoriasAtributo.some(category => category.id === categoriaId)) throw new ApiError('validation', 'Elige una categoría de atributo.', 'categoriaId');
    if (db.atributos.some(item => same(item.nombre, nombre) && item.categoriaId === categoriaId && item.id !== id)) {
        throw new ApiError('duplicate', `Ya existe el atributo «${nombre}» en esa categoría.`, 'nombre');
    }
    return { nombre, categoriaId };
}

/** SERVIDOR REAL: POST /api/atributos  { nombre, categoriaId } → 201 · 409 repetido en la categoría */
export const createAttribute = data => respond(() => mutate(() => withCategory(addAudited('atributo', db.atributos, { id: nextId(db.atributos), ...attributeFields(data) }))));

/** SERVIDOR REAL: PUT /api/atributos/{id}  { nombre, categoriaId } → 200 · 409 */
export const updateAttribute = (id, data) => respond(() => mutate(() => withCategory(updateAudited('atributo', find(db.atributos, id, 'El atributo'), attributeFields(data, id)))));

/** SERVIDOR REAL: DELETE /api/atributos/{id} → 204 (el servidor lo quita también de los accesorios que lo tenían) */
export const deleteAttribute = id => respond(() => mutate(() => {
    const attribute = find(db.atributos, id, 'El atributo');
    const linked = db.accesorios.filter(item => item.atributos.includes(id)).map(item => item.nombre);
    logContentChange('atributo', 'eliminar', attribute, null, removedFrom(linked, 'del accesorio', 'accesorios'));
    db.atributos = db.atributos.filter(entry => entry.id !== id);
    db.accesorios.forEach(item => { item.atributos = item.atributos.filter(attributeId => attributeId !== id); });
}));

/* ═════════════════════ Accesorios ═════════════════════ */

const withDetails = item => ({
    ...item,
    categoriaNombre: db.categoriasAccesorio.find(category => category.id === item.categoriaId)?.nombre || 'Sin categoría',
    atributos: item.atributos.map(id => db.atributos.find(attribute => attribute.id === id)).filter(Boolean).map(withCategory)
});

/**
 * SERVIDOR REAL: GET /api/accesorios → [{ id, nombre, categoriaId, categoriaNombre, precio, descripcion, atributos: [{ id, nombre, categoriaNombre }] }]
 */
export const listAccessories = () => respond(() => db.accesorios.map(withDetails).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));

function accessoryFields(data, id) {
    const nombre = text(data.nombre, 'nombre', 'El nombre', 80);
    if (db.accesorios.some(item => same(item.nombre, nombre) && item.id !== id)) throw new ApiError('duplicate', `Ya existe el accesorio «${nombre}».`, 'nombre');
    const categoriaId = Number(data.categoriaId);
    if (!db.categoriasAccesorio.some(category => category.id === categoriaId)) throw new ApiError('validation', 'Elige una categoría de accesorio.', 'categoriaId');
    const precio = Number(String(data.precio ?? '').replace(/[$,\s]/g, ''));
    if (!(precio > 0) || precio > 10_000_000 || Math.abs(Math.round(precio * 100) - precio * 100) > 1e-6) {
        throw new ApiError('validation', 'Escribe un precio mayor a 0, con hasta 2 decimales.', 'precio');
    }
    const atributos = [...new Set((data.atributos || []).map(Number))].filter(attributeId => db.atributos.some(attribute => attribute.id === attributeId));
    return { nombre, categoriaId, precio, descripcion: text(data.descripcion, 'descripcion', 'La descripción', 500), atributos };
}

/** SERVIDOR REAL: POST /api/accesorios  { nombre, categoriaId, precio, descripcion, atributos: [ids] } → 201 · 400 · 409 */
export const createAccessory = data => respond(() => mutate(() => withDetails(addAudited('accesorio', db.accesorios, { id: nextId(db.accesorios), ...accessoryFields(data) }))));

/** SERVIDOR REAL: PUT /api/accesorios/{id}  (mismos campos) → 200 · 400 · 409 */
export const updateAccessory = (id, data) => respond(() => mutate(() => withDetails(updateAudited('accesorio', find(db.accesorios, id, 'El accesorio'), accessoryFields(data, id)))));

/** SERVIDOR REAL: DELETE /api/accesorios/{id} → 204 · 409 si está en el carrusel */
export const deleteAccessory = id => respond(() => mutate(() => {
    const item = find(db.accesorios, id, 'El accesorio');
    const slide = db.carrusel.find(entry => entry.tipo === 'accesorio' && entry.productoId === id);
    if (slide) throw new ApiError('in_use', `«${item.nombre}» aparece en el carrusel (lugar ${slide.orden}). Quítalo del carrusel antes de eliminarlo.`);
    logContentChange('accesorio', 'eliminar', item, null);
    db.accesorios = db.accesorios.filter(entry => entry.id !== id);
}));

/* ═════════════════════ Catálogo de grúas: categorías ═════════════════════ */

const cranesIn = categoryId => db.gruas.filter(crane => crane.categoriaId === categoryId).length;

/** SERVIDOR REAL: GET /api/gruas/categorias → [{ id, nombre, vinculados }] (vinculados = grúas que la usan) */
export const listCraneCategories = () => respond(() => db.categoriasGrua
    .map(category => ({ ...category, vinculados: cranesIn(category.id) }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));

/** SERVIDOR REAL: POST /api/gruas/categorias  { nombre } → 201 · 409 nombre repetido */
export const createCraneCategory = data => respond(() => mutate(() => {
    const category = addAudited('categoria_grua', db.categoriasGrua, { id: nextId(db.categoriasGrua), ...categoryName(db.categoriasGrua, data, null, 'categoría') });
    return { ...category, vinculados: 0 };
}));

/** SERVIDOR REAL: PUT /api/gruas/categorias/{id}  { nombre } → 200 · 409 */
export const updateCraneCategory = (id, data) => respond(() => mutate(() => {
    const category = updateAudited('categoria_grua', find(db.categoriasGrua, id, 'La categoría'), categoryName(db.categoriasGrua, data, id, 'categoría'));
    return { ...category, vinculados: cranesIn(id) };
}));

/** SERVIDOR REAL: DELETE /api/gruas/categorias/{id} → 204 · 409 si tiene grúas vinculadas */
export const deleteCraneCategory = id => respond(() => mutate(() => {
    const category = find(db.categoriasGrua, id, 'La categoría');
    const linked = cranesIn(id);
    if (linked) throw new ApiError('in_use', `«${category.nombre}» tiene ${linked} grúa(s) vinculada(s); cámbialas de categoría antes de eliminarla.`);
    db.categoriasGrua = db.categoriasGrua.filter(item => item.id !== id);
    logContentChange('categoria_grua', 'eliminar', category, null);
}));

/* ═════════════════════ Catálogo de grúas: atributos y atributos opcionales ═════════════════════ */
/*
 * Los dos tienen nombre e imagen. Los atributos son componentes que forman la grúa (con cantidad);
 * los opcionales son extras que el cliente puede elegir. Alta y modificación van en multipart/form-data
 * { nombre, imagen }; al modificar, sin archivo se conserva la imagen actual.
 */
const cranesWithAttribute = id => db.gruas.filter(crane => crane.atributos.some(entry => entry.atributoId === id));
const cranesWithOptional = id => db.gruas.filter(crane => crane.opcionales.includes(id));

function imageItems({ key, entidad, label, usedBy, unlink }) {
    const withUses = item => ({ ...item, vinculados: usedBy(item.id).length });
    const fields = (data, id, creating) => {
        const nombre = text(data.nombre, 'nombre', 'El nombre', 60);
        if (db[key].some(item => same(item.nombre, nombre) && item.id !== id)) throw new ApiError('duplicate', `Ya existe el ${label} «${nombre}».`, 'nombre');
        if (creating && !data.imagen) throw new ApiError('validation', 'La imagen es obligatoria.', 'imagen');
        return { nombre, ...(data.imagen ? { imagen: data.imagen } : {}) };
    };
    return {
        list: () => respond(() => db[key].map(withUses).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))),
        create: data => respond(() => mutate(() => withUses(addAudited(entidad, db[key], { id: nextId(db[key]), ...fields(data, null, true) })))),
        update: (id, data) => respond(() => mutate(() => withUses(updateAudited(entidad, find(db[key], id, `El ${label}`), fields(data, id, false))))),
        remove: id => respond(() => mutate(() => {
            const item = find(db[key], id, `El ${label}`);
            logContentChange(entidad, 'eliminar', item, null, removedFrom(usedBy(item.id).map(crane => crane.nombre), 'de la grúa', 'grúas'));
            db[key] = db[key].filter(entry => entry.id !== id);
            db.gruas.forEach(crane => unlink(crane, id));
        }))
    };
}

const craneAttributes = imageItems({
    key: 'atributosGrua', entidad: 'atributo_grua', label: 'atributo', usedBy: cranesWithAttribute,
    unlink: (crane, id) => { crane.atributos = crane.atributos.filter(entry => entry.atributoId !== id); }
});
const craneOptionals = imageItems({
    key: 'opcionalesGrua', entidad: 'opcional_grua', label: 'atributo opcional', usedBy: cranesWithOptional,
    unlink: (crane, id) => { crane.opcionales = crane.opcionales.filter(optionalId => optionalId !== id); }
});

/** SERVIDOR REAL: GET /api/gruas/atributos → [{ id, nombre, imagen (URL), vinculados }] (vinculados = grúas que lo usan) */
export const listCraneAttributes = craneAttributes.list;
/** SERVIDOR REAL: POST /api/gruas/atributos  multipart { nombre, imagen } → 201 · 409 nombre repetido */
export const createCraneAttribute = craneAttributes.create;
/** SERVIDOR REAL: PUT /api/gruas/atributos/{id}  multipart (imagen opcional) → 200 · 409 */
export const updateCraneAttribute = craneAttributes.update;
/** SERVIDOR REAL: DELETE /api/gruas/atributos/{id} → 204 (el servidor lo quita también de las grúas que lo tenían) */
export const deleteCraneAttribute = craneAttributes.remove;

/** SERVIDOR REAL: GET /api/gruas/opcionales → [{ id, nombre, imagen (URL), vinculados }] */
export const listCraneOptionals = craneOptionals.list;
/** SERVIDOR REAL: POST /api/gruas/opcionales  multipart { nombre, imagen } → 201 · 409 */
export const createCraneOptional = craneOptionals.create;
/** SERVIDOR REAL: PUT /api/gruas/opcionales/{id}  multipart (imagen opcional) → 200 · 409 */
export const updateCraneOptional = craneOptionals.update;
/** SERVIDOR REAL: DELETE /api/gruas/opcionales/{id} → 204 (el servidor lo quita también de las grúas) */
export const deleteCraneOptional = craneOptionals.remove;

/* ═════════════════════ Catálogo de grúas: grúas ═════════════════════ */

export const CRANE_MAX_QUANTITY = 99;

const withCraneDetails = crane => ({
    ...crane,
    categoriaNombre: nameOf(db.categoriasGrua, crane.categoriaId) || 'Sin categoría',
    atributos: crane.atributos.map(entry => ({ ...entry, nombre: nameOf(db.atributosGrua, entry.atributoId) })).filter(entry => entry.nombre),
    opcionales: crane.opcionales.map(id => ({ id, nombre: nameOf(db.opcionalesGrua, id) })).filter(entry => entry.nombre)
});

/**
 * SERVIDOR REAL: GET /api/gruas → [{ id, nombre, categoriaId, categoriaNombre, imagen (URL),
 *   atributos: [{ atributoId, nombre, cantidad }], opcionales: [{ id, nombre }] }]
 */
export const listCranes = () => respond(() => db.gruas.map(withCraneDetails)
    .sort((a, b) => a.categoriaNombre.localeCompare(b.categoriaNombre, 'es') || a.nombre.localeCompare(b.nombre, 'es', { numeric: true })));

/** Listas para el formulario de grúa. SERVIDOR REAL: las tres peticiones GET de arriba (categorías, atributos y opcionales). */
export const getCraneFormOptions = () => respond(() => {
    const byName = (a, b) => a.nombre.localeCompare(b.nombre, 'es');
    return {
        categorias: [...db.categoriasGrua].sort(byName),
        atributos: db.atributosGrua.map(({ id, nombre }) => ({ id, nombre })).sort(byName),
        opcionales: db.opcionalesGrua.map(({ id, nombre }) => ({ id, nombre })).sort(byName)
    };
});

function craneFields(data, id, creating) {
    const nombre = text(data.nombre, 'nombre', 'El nombre', 80);
    if (db.gruas.some(crane => same(crane.nombre, nombre) && crane.id !== id)) throw new ApiError('duplicate', `Ya existe la grúa «${nombre}».`, 'nombre');
    const categoriaId = Number(data.categoriaId);
    if (!db.categoriasGrua.some(category => category.id === categoriaId)) throw new ApiError('validation', 'Elige una categoría de grúa.', 'categoriaId');
    if (creating && !data.imagen) throw new ApiError('validation', 'La imagen es obligatoria.', 'imagen');

    const atributos = (data.atributos || []).map(entry => ({ atributoId: Number(entry.atributoId), cantidad: Number(entry.cantidad) }));
    if (!atributos.length) throw new ApiError('validation', 'Agrega al menos un atributo con su cantidad.', 'atributos');
    if (atributos.some(entry => !db.atributosGrua.some(attribute => attribute.id === entry.atributoId))) throw new ApiError('validation', 'Elige un atributo en cada renglón.', 'atributos');
    if (new Set(atributos.map(entry => entry.atributoId)).size !== atributos.length) throw new ApiError('validation', 'Cada atributo solo puede aparecer una vez; ajusta su cantidad.', 'atributos');
    if (atributos.some(entry => !Number.isInteger(entry.cantidad) || entry.cantidad < 1 || entry.cantidad > CRANE_MAX_QUANTITY)) {
        throw new ApiError('validation', `La cantidad debe ser un número entero de 1 a ${CRANE_MAX_QUANTITY}.`, 'atributos');
    }
    const opcionales = (data.opcionales || []).map(Number);
    if (opcionales.some(optionalId => !db.opcionalesGrua.some(optional => optional.id === optionalId))) throw new ApiError('validation', 'Elige un atributo opcional en cada renglón.', 'opcionales');
    if (new Set(opcionales).size !== opcionales.length) throw new ApiError('validation', 'Cada atributo opcional solo puede aparecer una vez.', 'opcionales');

    return { nombre, categoriaId, atributos, opcionales, ...(data.imagen ? { imagen: data.imagen } : {}) };
}

/**
 * SERVIDOR REAL: POST /api/gruas  multipart/form-data
 *   { nombre, categoriaId, imagen (archivo), atributos (JSON [{ atributoId, cantidad }]), opcionales (JSON [ids]) } → 201 · 400 · 409
 */
export const createCrane = data => respond(() => mutate(() => withCraneDetails(addAudited('grua', db.gruas, { id: nextId(db.gruas), ...craneFields(data, null, true) }))));

/** SERVIDOR REAL: PUT /api/gruas/{id}  multipart (mismos campos; imagen opcional) → 200 · 400 · 409 */
export const updateCrane = (id, data) => respond(() => mutate(() => withCraneDetails(updateAudited('grua', find(db.gruas, id, 'La grúa'), craneFields(data, id, false)))));

/**
 * SERVIDOR REAL: DELETE /api/gruas/{id} → 204 · 409 si está en el carrusel.
 * Las solicitudes de cotización que la pedían se conservan con el nombre que tenía.
 */
export const deleteCrane = id => respond(() => mutate(() => {
    const crane = find(db.gruas, id, 'La grúa');
    const slide = db.carrusel.find(entry => entry.tipo === 'grua' && entry.productoId === id);
    if (slide) throw new ApiError('in_use', `«${crane.nombre}» aparece en el carrusel (lugar ${slide.orden}). Quítala del carrusel antes de eliminarla.`);
    logContentChange('grua', 'eliminar', crane, null);
    db.cotizaciones.forEach(request => { if (request.gruaId === id) { request.gruaId = null; request.gruaNombre = crane.nombre; } });
    db.gruas = db.gruas.filter(entry => entry.id !== id);
}));

/* ═════════════════════ Usuarios administradores (personal con acceso al portal) ═════════════════════ */

/** Opciones de los formularios. SERVIDOR REAL: GET /api/usuarios/opciones (o constantes compartidas con el backend). */
export const STAFF_ROLES = [
    { id: 'admin', nombre: 'Administrador' },
    { id: 'marketing', nombre: 'Marketing' },
    { id: 'ventas', nombre: 'Ventas' }
];
export const DEPARTMENTS = ['Administración', 'Desarrollo de software', 'Marketing', 'Producción', 'Ventas'];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const publicUser = ({ password, ...user }) => user;   // la contraseña nunca sale del servidor

/** Nombre, apellidos, correo, teléfono y contraseña: comunes a personal y clientes. */
function personFields(data, list, id) {
    const correo = String(data.correo ?? '').trim().toLowerCase();
    if (!EMAIL.test(correo)) throw new ApiError('validation', 'Escribe un correo válido, por ejemplo nombre@empresa.com.', 'correo');
    if (list.some(person => person.correo === correo && person.id !== id)) throw new ApiError('duplicate', `Ya hay una cuenta con el correo ${correo}.`, 'correo');
    const telefono = String(data.telefono ?? '').trim();
    const digits = telefono.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) throw new ApiError('validation', 'Escribe un teléfono de 10 dígitos (puede llevar lada).', 'telefono');
    const password = String(data.password ?? '');
    if ((!id || password) && password.length < 6) throw new ApiError('validation', 'La contraseña debe tener al menos 6 caracteres.', 'password');
    return {
        nombre: text(data.nombre, 'nombre', 'El nombre', 60),
        apellidos: text(data.apellidos, 'apellidos', 'Los apellidos', 80),
        correo,
        telefono,
        activo: Boolean(data.activo),
        // DEMO: el servidor real guarda solo el hash (BCrypt) y jamás la devuelve
        ...(password ? { password: '•'.repeat(8) } : {})
    };
}

/* DEMO: el servidor real escribe la bitácora «Cambios de usuarios» en cada alta, edición, activación o baja. */
const auditFields = (person, staff) => ({
    nombre: person.nombre, apellidos: person.apellidos, correo: person.correo, telefono: person.telefono,
    ...(staff ? { departamento: person.departamento, rol: person.rol } : {}),
    activo: person.activo
});

function logUserChange(accion, kind, before, after, passwordChanged = false) {
    const staff = kind === 'administrador';
    const antes = before && auditFields(before, staff);
    const despues = after && auditFields(after, staff);
    if (accion === 'actualizar') {
        if (!passwordChanged && JSON.stringify(antes) === JSON.stringify(despues)) return;   // nada cambió
        const onlyActive = JSON.stringify({ ...antes, activo: null }) === JSON.stringify({ ...despues, activo: null }) && !passwordChanged;
        if (onlyActive) accion = despues.activo ? 'activar' : 'desactivar';
    }
    const target = after || before;
    db.cambiosUsuarios.push({
        id: nextId(db.cambiosUsuarios),
        fecha: stamp(),
        accion,
        ...(passwordChanged ? { contrasena: true } : {}),
        autor: actor(),
        afectado: { nombre: target.nombre, apellidos: target.apellidos, correo: target.correo, tipo: kind },
        antes,
        despues
    });
}

const activeAdmins = exceptId => db.usuarios.filter(user => user.rol === 'admin' && user.activo && user.id !== exceptId).length;
function keepOneAdmin(user, next) {
    const losesAdmin = user.rol === 'admin' && user.activo && (!next || next.rol !== 'admin' || !next.activo);
    if (losesAdmin && !activeAdmins(user.id)) {
        throw new ApiError('in_use', `${user.nombre} es el único administrador activo. Activa o crea otro antes de quitarle el acceso.`);
    }
}

/** SERVIDOR REAL: GET /api/usuarios → [{ id, nombre, apellidos, correo, telefono, departamento, rol, activo }] */
export const listStaffUsers = () => respond(() => db.usuarios.map(publicUser)
    .sort((a, b) => Number(b.activo) - Number(a.activo) || `${a.nombre} ${a.apellidos}`.localeCompare(`${b.nombre} ${b.apellidos}`, 'es')));

function staffFields(data, id) {
    if (!DEPARTMENTS.includes(data.departamento)) throw new ApiError('validation', 'Elige un departamento.', 'departamento');
    if (!STAFF_ROLES.some(role => role.id === data.rol)) throw new ApiError('validation', 'Elige un rol.', 'rol');
    return { ...personFields(data, db.usuarios, id), departamento: data.departamento, rol: data.rol };
}

/** SERVIDOR REAL: POST /api/usuarios  { nombre, apellidos, correo, telefono, departamento, rol, password, activo } → 201 · 400 · 409 correo repetido */
export const createStaffUser = data => respond(() => mutate(() => {
    const user = { id: nextId(db.usuarios), ...staffFields(data) };
    db.usuarios.push(user);
    logUserChange('crear', 'administrador', null, user);
    return publicUser(user);
}));

/** SERVIDOR REAL: PUT /api/usuarios/{id}  (mismos campos; password vacío = se conserva la actual) → 200 · 400 · 409 */
export const updateStaffUser = (id, data) => respond(() => mutate(() => {
    const user = find(db.usuarios, id, 'El usuario');
    const fields = staffFields(data, user.id);
    keepOneAdmin(user, fields);
    const before = { ...user };
    Object.assign(user, fields);
    logUserChange('actualizar', 'administrador', before, user, Boolean(data.password));
    return publicUser(user);
}));

/** SERVIDOR REAL: PATCH /api/usuarios/{id}/estado  { activo } → 200 · 409 si es el último administrador activo */
export const setStaffUserActive = (id, activo) => respond(() => mutate(() => {
    const user = find(db.usuarios, id, 'El usuario');
    keepOneAdmin(user, { ...user, activo });
    const before = { ...user };
    user.activo = activo;
    logUserChange(activo ? 'activar' : 'desactivar', 'administrador', before, user);
    return publicUser(user);
}));

/** SERVIDOR REAL: DELETE /api/usuarios/{id} → 204 · 409 si es el último administrador activo */
export const deleteStaffUser = id => respond(() => mutate(() => {
    const user = find(db.usuarios, id, 'El usuario');
    keepOneAdmin(user, null);
    db.usuarios = db.usuarios.filter(entry => entry.id !== user.id);
    logUserChange('eliminar', 'administrador', user, null);
}));

/* ═════════════════════ Clientes (cuentas del sitio público) ═════════════════════ */

/** SERVIDOR REAL: GET /api/clientes → [{ id, nombre, apellidos, correo, telefono, activo }] */
export const listClients = () => respond(() => db.clientes.map(publicUser)
    .sort((a, b) => Number(b.activo) - Number(a.activo) || `${a.nombre} ${a.apellidos}`.localeCompare(`${b.nombre} ${b.apellidos}`, 'es')));

/** SERVIDOR REAL: POST /api/clientes  { nombre, apellidos, correo, telefono, password, activo } → 201 · 400 · 409 */
export const createClient = data => respond(() => mutate(() => {
    const client = { id: nextId(db.clientes), ...personFields(data, db.clientes) };
    db.clientes.push(client);
    logUserChange('crear', 'cliente', null, client);
    return publicUser(client);
}));

/** SERVIDOR REAL: PUT /api/clientes/{id}  (password vacío = se conserva) → 200 · 400 · 409 */
export const updateClient = (id, data) => respond(() => mutate(() => {
    const client = find(db.clientes, id, 'El cliente');
    const before = { ...client };
    Object.assign(client, personFields(data, db.clientes, client.id));
    logUserChange('actualizar', 'cliente', before, client, Boolean(data.password));
    return publicUser(client);
}));

/** SERVIDOR REAL: PATCH /api/clientes/{id}/estado  { activo } → 200 */
export const setClientActive = (id, activo) => respond(() => mutate(() => {
    const client = find(db.clientes, id, 'El cliente');
    const before = { ...client };
    client.activo = activo;
    logUserChange(activo ? 'activar' : 'desactivar', 'cliente', before, client);
    return publicUser(client);
}));

/**
 * SERVIDOR REAL: DELETE /api/clientes/{id} → 204. Sus solicitudes se conservan con su nombre y correo,
 * pero pasan a "No registrado".
 */
export const deleteClient = id => respond(() => mutate(() => {
    const client = find(db.clientes, id, 'El cliente');
    [...db.cotizaciones, ...db.reparaciones].filter(request => request.clienteId === client.id).forEach(request => {
        Object.assign(request, { clienteId: null, nombre: client.nombre, apellidos: client.apellidos, correo: client.correo });
    });
    db.clientes = db.clientes.filter(entry => entry.id !== client.id);
    logUserChange('eliminar', 'cliente', client, null);
}));

/* ═════════════════════ Solicitudes de cotizaciones y reparaciones (solo consultar y eliminar) ═════════════════════ */

function requester(request) {
    const client = db.clientes.find(entry => entry.id === request.clienteId);
    if (client) return { registrado: true, nombre: client.nombre, apellidos: client.apellidos, correo: client.correo };
    return { registrado: false, nombre: request.nombre || '', apellidos: request.apellidos || '', correo: request.correo || '' };
}
const newestFirst = (a, b) => b.fecha.localeCompare(a.fecha);

/** La grúa que se pidió; si ya se eliminó del catálogo, el nombre que tenía. */
function requestedCrane(request) {
    const crane = db.gruas.find(entry => entry.id === request.gruaId);
    return crane
        ? { id: crane.id, nombre: crane.nombre, imagen: crane.imagen }
        : { id: null, nombre: request.gruaNombre || 'Grúa ya no disponible', imagen: '' };
}

/*
 * DEMO: el servidor real anota en la bitácora «Solicitudes eliminadas» quién eliminó la solicitud y cuándo,
 * con una copia de los datos que la identifican (no guarda el mensaje del cliente).
 */
function logRequestDeletion(tipo, request, extra = {}) {
    db.solicitudesEliminadas.push({
        id: nextId(db.solicitudesEliminadas),
        fecha: stamp(),
        tipo,
        autor: actor(),
        solicitud: { id: request.id, fecha: request.fecha, ...requester(request), ...extra }
    });
}

/**
 * SERVIDOR REAL: GET /api/solicitudes/cotizaciones
 *   → [{ id, fecha (ISO), registrado, nombre, apellidos, correo, grua: { id, nombre, imagen } }] (más recientes primero)
 */
export const listQuoteRequests = () => respond(() => [...db.cotizaciones].sort(newestFirst)
    .map(request => ({ id: request.id, fecha: request.fecha, ...requester(request), grua: requestedCrane(request) })));

/** SERVIDOR REAL: DELETE /api/solicitudes/cotizaciones/{id} → 204 (el servidor anota la baja en la bitácora) */
export const deleteQuoteRequest = id => respond(() => mutate(() => {
    const request = find(db.cotizaciones, id, 'La solicitud');
    db.cotizaciones = db.cotizaciones.filter(entry => entry.id !== Number(id));
    logRequestDeletion('cotizacion', request, { grua: requestedCrane(request).nombre });
}));

/** SERVIDOR REAL: GET /api/solicitudes/reparaciones → [{ id, fecha, registrado, nombre, apellidos, correo, mensaje }] */
export const listRepairRequests = () => respond(() => [...db.reparaciones].sort(newestFirst)
    .map(request => ({ id: request.id, fecha: request.fecha, mensaje: request.mensaje, ...requester(request) })));

/** SERVIDOR REAL: DELETE /api/solicitudes/reparaciones/{id} → 204 (el servidor anota la baja en la bitácora) */
export const deleteRepairRequest = id => respond(() => mutate(() => {
    const request = find(db.reparaciones, id, 'La solicitud');
    db.reparaciones = db.reparaciones.filter(entry => entry.id !== Number(id));
    logRequestDeletion('reparacion', request);
}));

/* ═════════════════════ Respaldos de la base de datos ═════════════════════ */
/*
 * Respaldar y restaurar tardan, así que el servidor los atiende en segundo plano:
 * la petición responde 202 con la operación "en_proceso" y la pantalla consulta su estado
 * cada segundo con getBackupOperation(id) hasta que termina.
 */
const DEMO_DURATION = { respaldar: 4200, restaurar: 5200 };

/** DEMO: da por terminada la operación cuando pasó su tiempo. */
function settle(operation) {
    if (operation.estado === 'en_proceso' && Date.now() >= operation.terminaEn) {
        operation.estado = 'exitoso';
        operation.fin = stamp();
        delete operation.terminaEn;
        try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* almacenamiento lleno */ }
    }
    return operation;
}

/**
 * SERVIDOR REAL: GET /api/respaldos
 *   → [{ id, inicio, fin, operacion: 'respaldar' | 'restaurar', origen: 'automatica' | 'manual', usuario, estado: 'exitoso' | 'error' | 'en_proceso' }]
 */
export const listBackupOperations = () => respond(() => db.respaldos.map(settle).sort((a, b) => b.inicio.localeCompare(a.inicio) || b.id - a.id));

/** SERVIDOR REAL: GET /api/respaldos/{id} → la operación con su estado actual */
export const getBackupOperation = id => respond(() => settle(find(db.respaldos, id, 'La operación')));

function startOperation(operacion, usuario, extra = {}) {
    if (db.respaldos.some(operation => settle(operation).estado === 'en_proceso')) {
        throw new ApiError('in_use', 'Ya hay un respaldo o una restauración en curso. Espera a que termine.');
    }
    const operation = { id: nextId(db.respaldos), inicio: stamp(), fin: null, operacion, origen: 'manual', usuario, estado: 'en_proceso', terminaEn: Date.now() + DEMO_DURATION[operacion], ...extra };
    db.respaldos.push(operation);
    return operation;
}

/** SERVIDOR REAL: POST /api/respaldos → 202 { operación en_proceso } · 409 si ya hay una en curso (el usuario sale del token) */
export const startBackup = usuario => respond(() => mutate(() => startOperation('respaldar', usuario)));

/** SERVIDOR REAL: POST /api/respaldos/{id}/restaurar → 202 { operación en_proceso } · 409 */
export const startRestore = (backupId, usuario) => respond(() => mutate(() => {
    const backup = find(db.respaldos, backupId, 'El respaldo');
    if (backup.operacion !== 'respaldar' || backup.estado !== 'exitoso') throw new ApiError('validation', 'Ese respaldo no se puede restaurar.', 'respaldoId');
    return startOperation('restaurar', usuario, { respaldoId: backup.id });
}));

/* ═════════════════════ Bitácoras y auditorías (solo lectura) ═════════════════════ */

/** Eventos de la bitácora de accesos, con su texto y tono de etiqueta. */
export const ACCESS_EVENTS = [
    { id: 'login_exitoso', nombre: 'Login exitoso', tone: 'ok' },
    { id: 'login_fallido', nombre: 'Login fallido', tone: 'error' },
    { id: 'cuenta_bloqueada', nombre: 'Cuenta bloqueada', tone: 'danger' },
    { id: 'logout', nombre: 'Logout', tone: 'muted' }
];
export const RECOVERY_STATES = [{ id: 'exitoso', nombre: 'Exitoso' }, { id: 'fallido', nombre: 'Fallido' }];
export const RECOVERY_CHANNELS = [{ id: 'correo', nombre: 'Correo' }, { id: 'telefono', nombre: 'Teléfono' }];
export const USER_CHANGE_ACTIONS = [
    { id: 'crear', nombre: 'Crear' },
    { id: 'actualizar', nombre: 'Actualizar' },
    { id: 'eliminar', nombre: 'Eliminar' },
    { id: 'activar', nombre: 'Activar' },
    { id: 'desactivar', nombre: 'Desactivar' }
];
export const ACCOUNT_KINDS = [{ id: 'administrador', nombre: 'Administrador' }, { id: 'cliente', nombre: 'Cliente' }];
/** Las bitácoras de contenido solo tienen altas, modificaciones y bajas. */
export const CONTENT_ACTIONS = USER_CHANGE_ACTIONS.filter(action => ['crear', 'actualizar', 'eliminar'].includes(action.id));
export const REQUEST_KINDS = [{ id: 'cotizacion', nombre: 'Cotización' }, { id: 'reparacion', nombre: 'Reparación' }];

const newestLogFirst = (a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id;

/**
 * Inicios y cierres de sesión del personal del panel (no incluye clientes).
 * SERVIDOR REAL: GET /api/bitacoras/accesos
 *   → [{ id, fecha, correo, nombre, apellidos, rol, evento: 'login_exitoso' | 'login_fallido' | 'cuenta_bloqueada' | 'logout' }]
 *   (más recientes primero; con muchos registros conviene paginar: ?pagina=&tamano=)
 */
export const listAccessLog = () => respond(() => [...db.accesos].sort(newestLogFirst));

/**
 * Recuperaciones de contraseña del personal.
 * SERVIDOR REAL: GET /api/bitacoras/recuperaciones
 *   → [{ id, fecha, correo, nombre, apellidos, estado: 'exitoso' | 'fallido', medio: 'correo' | 'telefono' }]
 */
export const listRecoveryLog = () => respond(() => [...db.recuperaciones].sort(newestLogFirst));

/**
 * Quién modificó a qué usuario o cliente, con los datos antes y después.
 * SERVIDOR REAL: GET /api/bitacoras/cambios-usuarios
 *   → [{ id, fecha, accion, contrasena (bool: se cambió la contraseña; nunca se guarda el valor),
 *        autor: { nombre, apellidos, correo, rol }, afectado: { nombre, apellidos, correo, tipo: 'administrador' | 'cliente' },
 *        antes: { nombre, apellidos, correo, telefono, departamento?, rol?, activo } | null, despues: { … } | null }]
 */
export const listUserChanges = () => respond(() => [...db.cambiosUsuarios].sort(newestLogFirst));

/*
 * Cambios en el contenido que ve el cliente en el sitio, con los datos antes y después.
 *   accion: 'crear' | 'actualizar' | 'eliminar' · autor: { nombre, apellidos, correo, rol }
 *   antes / despues: copia de los datos (null en el alta o en la baja). Llevan nombres en lugar de ids y la
 *   imagen como URL; en una modificación la imagen solo viene si cambió. El servidor debe conservar en S3 las
 *   imágenes que aparecen en la bitácora (no borrarlas al reemplazarlas) para que el «antes» se siga viendo.
 *   nota (opcional): lo que cambió en otros registros como consecuencia («También se quitó de 2 grúas: …»).
 * Las tres pueden compartir una tabla en el servidor con una columna `modulo`.
 */
const listContentChanges = modulo => respond(() => db.cambiosContenido.filter(entry => entry.modulo === modulo).sort(newestLogFirst));

/**
 * Misión, visión y WhatsApp (una sola fila, solo se modifica), valores, carrusel y línea del tiempo.
 * SERVIDOR REAL: GET /api/bitacoras/empresa
 *   → [{ id, fecha, accion, autor, antes, despues, nota?,
 *        entidad: 'informacion' { mision, vision, whatsapp } · 'valor' { titulo, descripcion }
 *               · 'carrusel' { orden, tipo, producto, titulo, subtitulo, imagen } · 'acontecimiento' { anio, descripcion, imagen } }]
 */
export const listCompanyChanges = () => listContentChanges('empresa');

/**
 * Accesorios y lo que hace falta para crearlos.
 * SERVIDOR REAL: GET /api/bitacoras/accesorios
 *   → [{ id, fecha, accion, autor, antes, despues, nota?,
 *        entidad: 'accesorio' { nombre, categoria, precio, descripcion, atributos: ['Capacidad: 9,000 lbs'] }
 *               · 'categoria_accesorio' { nombre } · 'atributo' { nombre, categoria } · 'categoria_atributo' { nombre } }]
 */
export const listAccessoryChanges = () => listContentChanges('accesorios');

/**
 * Grúas con sus detalles (atributo × cantidad) y opcionales, y los catálogos que las forman.
 * SERVIDOR REAL: GET /api/bitacoras/gruas
 *   → [{ id, fecha, accion, autor, antes, despues, nota?,
 *        entidad: 'grua' { nombre, categoria, imagen, atributos: ['2 × Winche'], opcionales: ['Cabina climatizada'] }
 *               · 'categoria_grua' { nombre } · 'atributo_grua' { nombre, imagen } · 'opcional_grua' { nombre, imagen } }]
 */
export const listCraneChanges = () => listContentChanges('gruas');

/**
 * Solicitudes de cotización y de reparación eliminadas (no se crean ni se modifican en el panel).
 * SERVIDOR REAL: GET /api/bitacoras/solicitudes-eliminadas
 *   → [{ id, fecha (de la baja), tipo: 'cotizacion' | 'reparacion', autor: { nombre, apellidos, correo, rol },
 *        solicitud: { id, fecha, registrado, nombre, apellidos, correo, grua? (nombre, solo cotizaciones) } }]
 */
export const listDeletedRequests = () => respond(() => [...db.solicitudesEliminadas].sort(newestLogFirst));
