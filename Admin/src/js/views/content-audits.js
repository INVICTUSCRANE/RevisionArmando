/**
 * Bitácoras y auditorías del contenido que ve el cliente en el sitio (solo lectura):
 *   Cambios en la empresa     misión, visión, WhatsApp, valores, carrusel y línea del tiempo
 *   Cambios en accesorios     accesorios y lo que necesitan para crearse: categorías, atributos y sus categorías
 *   Cambios en grúas          grúas con sus atributos (cantidad) y opcionales, y sus categorías, atributos y opcionales
 *   Solicitudes eliminadas    quién eliminó cada solicitud de cotización o de reparación, y cuándo
 * Las tres primeras despliegan con «Ver cambios» los datos antes y después. La pantalla es la de audit-log.js.
 */
import { escapeHtml } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { formatDateTime, formatMoney } from '../core/format.js';
import {
    CONTENT_ACTIONS, REQUEST_KINDS, STAFF_ROLES,
    listCompanyChanges, listAccessoryChanges, listCraneChanges, listDeletedRequests, roleLabel
} from '../services/admin-api.js';
import { emailHtml } from './shared.js';
import {
    renderLog, byKey, selectHtml, actionFilter, fullName, actionName, dateCell, personCell, authorCells, actionCell, detailCell, field, diffDetail
} from './audit-log.js';

/* ───────── Qué se muestra de cada tipo de registro ───────── */

const longText = (key, label) => field(key, label, { block: true });
const tags = (key, label) => field(key, label, { list: true });
const IMAGE = field('imagen', 'Imagen', { image: true });
const latest = entry => entry.despues || entry.antes;
const nameFrom = key => entry => String(latest(entry)[key]);

/** Solo nombre (categorías) o nombre e imagen (atributos y opcionales de grúas). */
const NAMED = { name: nameFrom('nombre'), fields: [field('nombre', 'Nombre')] };
const NAMED_IMAGE = { name: nameFrom('nombre'), fields: [field('nombre', 'Nombre'), IMAGE] };

// Misión, visión y WhatsApp son una sola fila: solo se modifican y cada campo es una opción del filtro
const COMPANY_FIELDS = [longText('mision', 'Misión'), longText('vision', 'Visión'), field('whatsapp', 'WhatsApp')];
const changedCompanyFields = ({ antes, despues }) => COMPANY_FIELDS.filter(spec => antes?.[spec.key] !== despues?.[spec.key]);
const listFormat = new Intl.ListFormat('es', { type: 'conjunction' });

/**
 * label: cómo se llama en la tabla · group: opción del filtro «Elemento»
 * name(entry): el registro afectado · fields: lo que muestra «Ver cambios»
 */
const ENTITIES = {
    informacion: {
        label: 'Misión, visión y contacto',
        name: entry => listFormat.format(changedCompanyFields(entry).map(spec => spec.label)),
        fields: COMPANY_FIELDS
    },
    valor: { label: 'Valor', group: 'Valores', name: nameFrom('titulo'), fields: [field('titulo', 'Título'), longText('descripcion', 'Descripción')] },
    carrusel: {
        label: 'Carrusel',
        group: 'Carrusel',
        name: nameFrom('titulo'),
        fields: [
            field('orden', 'Lugar'),
            field('tipo', 'Tipo', { show: tipo => (tipo === 'grua' ? 'Grúa' : 'Accesorio') }),
            field('producto', 'Producto'),
            field('titulo', 'Título'),
            field('subtitulo', 'Subtítulo'),
            IMAGE
        ]
    },
    acontecimiento: { label: 'Línea del tiempo', group: 'Línea del tiempo', name: nameFrom('anio'), fields: [field('anio', 'Año'), longText('descripcion', 'Descripción'), IMAGE] },

    accesorio: {
        label: 'Accesorio',
        group: 'Accesorios',
        name: nameFrom('nombre'),
        fields: [
            field('nombre', 'Nombre'),
            field('categoria', 'Categoría'),
            field('precio', 'Precio', { show: formatMoney }),
            longText('descripcion', 'Descripción'),
            tags('atributos', 'Atributos')
        ]
    },
    categoria_accesorio: { label: 'Categoría de accesorio', group: 'Categorías de accesorios', ...NAMED },
    atributo: { label: 'Atributo', group: 'Atributos', name: nameFrom('nombre'), fields: [field('nombre', 'Nombre'), field('categoria', 'Categoría')] },
    categoria_atributo: { label: 'Categoría de atributo', group: 'Categorías de atributos', ...NAMED },

    grua: {
        label: 'Grúa',
        group: 'Grúas',
        name: nameFrom('nombre'),
        fields: [
            field('nombre', 'Nombre'),
            field('categoria', 'Categoría'),
            IMAGE,
            tags('atributos', 'Atributos y cantidad'),
            tags('opcionales', 'Atributos opcionales')
        ]
    },
    categoria_grua: { label: 'Categoría de grúa', group: 'Categorías de grúas', ...NAMED },
    atributo_grua: { label: 'Atributo de grúa', group: 'Atributos de grúas', ...NAMED_IMAGE },
    opcional_grua: { label: 'Atributo opcional', group: 'Atributos opcionales', ...NAMED_IMAGE }
};

const entityOptions = ids => ids.map(id => ({ id, nombre: ENTITIES[id].group }));

/* ───────── Cambios en el contenido (empresa, accesorios y grúas) ───────── */

/** Bitácora de cambios con «Ver cambios»; `elements` son las opciones del filtro y `elementOf(entry)` las del registro. */
const contentLog = ({ elements, elementOf = entry => entry.entidad, ...config }) => ({
    search: 'Buscar por quién hizo el cambio, el registro o la fecha…',
    empty: 'Aún no hay cambios registrados',
    single: true,
    filters: [
        { name: 'elemento', html: selectHtml('elemento', 'Filtrar por elemento', 'Todos los elementos', elements) },
        actionFilter(CONTENT_ACTIONS)
    ],
    filterValue: { elemento: elementOf },
    fields: entry => [
        fullName(entry.autor), entry.autor.correo, roleLabel(entry.autor.rol),
        ENTITIES[entry.entidad].name(entry), ENTITIES[entry.entidad].label, formatDateTime(entry.fecha), actionName(entry.accion)
    ],
    head: '<th>Fecha</th><th>Realizado por</th><th>Rol</th><th>Elemento</th><th>Acción</th><th>Datos</th>',
    row: entry => `
        ${dateCell(entry, 'data-first')}
        ${authorCells(entry.autor)}
        ${personCell('Elemento', ENTITIES[entry.entidad].name(entry), escapeHtml(ENTITIES[entry.entidad].label))}
        ${actionCell(entry.accion)}
        ${detailCell(entry)}`,
    detail: entry => diffDetail(entry, {
        fields: ENTITIES[entry.entidad].fields,
        empty: { antes: 'El registro no existía: se creó con este cambio.', despues: 'El registro se eliminó: ya no tiene datos.' },
        notes: entry.nota ? [['arrowRight', escapeHtml(entry.nota)]] : []
    }),
    ...config
});

const COMPANY = contentLog({
    title: 'Auditoría de la información de la empresa',
    sub: 'Quién cambió la misión, la visión, el WhatsApp, los valores, el carrusel o la línea del tiempo, con los datos antes y después. Solo lectura.',
    list: listCompanyChanges,
    iconName: 'building',
    elements: [
        ...COMPANY_FIELDS.map(spec => ({ id: spec.key, nombre: spec.key === 'whatsapp' ? 'Teléfono (WhatsApp)' : spec.label })),
        ...entityOptions(['valor', 'carrusel', 'acontecimiento'])
    ],
    elementOf: entry => (entry.entidad === 'informacion' ? changedCompanyFields(entry).map(spec => spec.key) : entry.entidad)
});

const ACCESSORIES = contentLog({
    title: 'Auditoría del catálogo de accesorios',
    sub: 'Altas, cambios y bajas de accesorios y de lo que hace falta para crearlos: categorías, atributos y categorías de atributos. Solo lectura.',
    list: listAccessoryChanges,
    iconName: 'box',
    elements: entityOptions(['accesorio', 'categoria_accesorio', 'atributo', 'categoria_atributo'])
});

const CRANES = contentLog({
    title: 'Auditoría del catálogo de grúas',
    sub: 'Altas, cambios y bajas de grúas, con sus atributos, cantidades y opcionales, y de sus categorías. Es lo que el cliente ve en el catálogo. Solo lectura.',
    list: listCraneChanges,
    iconName: 'truck',
    elements: entityOptions(['grua', 'categoria_grua', 'atributo_grua', 'opcional_grua'])
});

/* ───────── Solicitudes eliminadas ───────── */

const REQUEST_KIND = byKey(REQUEST_KINDS);
const kindBadge = tipo => (tipo === 'cotizacion'
    ? `<span class="badge" data-tone="ok">${icon('clipboard', 'size-4')}${REQUEST_KIND.cotizacion.nombre}</span>`
    : `<span class="badge" data-tone="warn">${icon('wrench', 'size-4')}${REQUEST_KIND.reparacion.nombre}</span>`);
const requesterName = request => (request.registrado || request.nombre ? fullName(request) : 'Anónimo');
const requestSummary = request => [`Folio ${request.id}`, `enviada el ${formatDateTime(request.fecha)}`, request.grua].filter(Boolean).join(' · ');

const DELETED_REQUESTS = {
    title: 'Auditoría de cotizaciones y reparaciones eliminadas',
    sub: 'Quién eliminó cada solicitud y cuándo. Las solicitudes llegan desde el sitio, así que en el panel no se crean ni se editan. Solo lectura.',
    search: 'Buscar por quién la eliminó, el solicitante, la grúa o la fecha…',
    list: listDeletedRequests,
    filters: [
        { name: 'tipo', html: selectHtml('tipo', 'Filtrar por tipo de solicitud', 'Todos los tipos', REQUEST_KINDS) },
        { name: 'rol', html: selectHtml('rol', 'Filtrar por rol', 'Todos los roles', STAFF_ROLES) }
    ],
    filterValue: { rol: entry => entry.autor.rol },
    fields: entry => [
        fullName(entry.autor), entry.autor.correo, roleLabel(entry.autor.rol), REQUEST_KIND[entry.tipo]?.nombre, formatDateTime(entry.fecha),
        requesterName(entry.solicitud), entry.solicitud.correo, requestSummary(entry.solicitud)
    ],
    empty: 'Aún no se ha eliminado ninguna solicitud',
    iconName: 'trash',
    head: '<th>Fecha de eliminación</th><th>Eliminada por</th><th>Rol</th><th>Tipo</th><th>Solicitud eliminada</th>',
    row: entry => `
        ${dateCell(entry, 'data-first')}
        ${authorCells(entry.autor, 'Eliminada por')}
        <td data-label="Tipo" data-aside>${kindBadge(entry.tipo)}</td>
        ${personCell('Solicitud', requesterName(entry.solicitud),
            entry.solicitud.correo ? emailHtml(entry.solicitud.correo) : 'Usuario no registrado',
            escapeHtml(requestSummary(entry.solicitud)))}`
};

export const renderCompanyChanges = main => renderLog(COMPANY, main);
export const renderAccessoryChanges = main => renderLog(ACCESSORIES, main);
export const renderCraneChanges = main => renderLog(CRANES, main);
export const renderDeletedRequests = main => renderLog(DELETED_REQUESTS, main);
