/**
 * Administrar usuarios › Usuarios administradores y Clientes.
 * Las dos pantallas comparten tabla, filtros, interruptor de cuenta activa y formulario;
 * el personal además tiene departamento y rol.
 */
import { $, escapeHtml } from '../core/dom.js';
import { plural, matches, initialsOf } from '../core/format.js';
import { toast } from '../core/toast.js';
import {
    STAFF_ROLES, DEPARTMENTS,
    listStaffUsers, createStaffUser, updateStaffUser, setStaffUserActive, deleteStaffUser,
    listClients, createClient, updateClient, setClientActive, deleteClient
} from '../services/admin-api.js';
import { openFormModal, confirmDialog } from '../features/modal.js';
import { value, passwordField, wirePasswordToggle } from '../features/forms.js';
import { panel, addButton, searchBox, rowActions, emailHtml, emptyState, noResults, skeletons, loadError, animateOut, wireList, byId, dataTable } from './shared.js';

const roleName = id => STAFF_ROLES.find(role => role.id === id)?.nombre || id;
const fullName = person => `${person.nombre} ${person.apellidos}`;
const options = (list, selected, placeholder = 'Seleccionar…') =>
    `<option value="">${placeholder}</option>${list.map(item => `<option value="${escapeHtml(item.id)}" ${item.id === selected ? 'selected' : ''}>${escapeHtml(item.nombre)}</option>`).join('')}`;

const KINDS = {
    staff: {
        title: 'Usuarios administradores',
        noun: 'administrador',
        add: 'Agregar administrador',
        list: listStaffUsers, create: createStaffUser, update: updateStaffUser, setActive: setStaffUserActive, remove: deleteStaffUser,
        deleteMessage: 'Perderá el acceso al portal y se borrarán sus datos. Si solo quieres quitarle el acceso, desactiva su cuenta.'
    },
    client: {
        title: 'Clientes',
        noun: 'cliente',
        add: 'Agregar cliente',
        list: listClients, create: createClient, update: updateClient, setActive: setClientActive, remove: deleteClient,
        deleteMessage: 'Ya no podrá entrar a su cuenta del sitio. Sus solicitudes de cotización y reparación se conservan.'
    }
};

function personFields(kind, person) {
    const staff = kind === 'staff';
    const active = person ? person.activo : true;
    return `
        <div class="grid gap-5 sm:grid-cols-2">
            <div data-field-wrap>
                <label class="field-label" for="pNombre">Nombre</label>
                <input id="pNombre" name="nombre" class="input" maxlength="60" required autocomplete="off" value="${escapeHtml(person?.nombre || '')}">
            </div>
            <div data-field-wrap>
                <label class="field-label" for="pApellidos">Apellidos</label>
                <input id="pApellidos" name="apellidos" class="input" maxlength="80" required autocomplete="off" value="${escapeHtml(person?.apellidos || '')}">
            </div>
        </div>
        <div data-field-wrap>
            <label class="field-label" for="pCorreo">Correo electrónico</label>
            <input id="pCorreo" name="correo" class="input" type="email" maxlength="120" required autocomplete="off" inputmode="email"
                placeholder="${staff ? 'nombre@invictuscrane.com' : 'nombre@empresa.com'}" value="${escapeHtml(person?.correo || '')}">
            <p class="field-hint">También será su nombre de usuario.</p>
        </div>
        <div data-field-wrap>
            <label class="field-label" for="pTelefono">Teléfono</label>
            <input id="pTelefono" name="telefono" class="input" type="tel" inputmode="tel" maxlength="20" required autocomplete="off" placeholder="81 1234 5678" value="${escapeHtml(person?.telefono || '')}">
        </div>
        ${staff ? `
        <div class="grid gap-5 sm:grid-cols-2">
            <div data-field-wrap>
                <label class="field-label" for="pDepartamento">Departamento</label>
                <select id="pDepartamento" name="departamento" class="select" required>${options(DEPARTMENTS.map(name => ({ id: name, nombre: name })), person?.departamento)}</select>
            </div>
            <div data-field-wrap>
                <label class="field-label" for="pRol">Rol</label>
                <select id="pRol" name="rol" class="select" required>${options(STAFF_ROLES, person?.rol)}</select>
            </div>
        </div>` : ''}
        ${passwordField(person
            ? { id: 'pPassword', label: 'Nueva contraseña', hint: 'Déjala en blanco para conservar la actual.' }
            : { id: 'pPassword', label: 'Contraseña', hint: 'Mínimo 6 caracteres. Nunca se muestra después de guardar.', required: true })}
        <label class="switch-row cursor-pointer">
            <span>
                <span class="block font-semibold text-ink-900 dark:text-white">Cuenta activa</span>
                <span class="text-sm text-ink-500 dark:text-ink-400" data-active-hint>${active ? 'Puede iniciar sesión.' : 'No podrá iniciar sesión.'}</span>
            </span>
            <span class="switch"><input type="checkbox" name="activo" ${active ? 'checked' : ''}><span class="switch-knob"></span></span>
        </label>`;
}

function rowHtml(kind, person, index, fresh) {
    const staff = kind === 'staff';
    return `
        <tr class="enter ${person.activo ? '' : 'is-muted'} ${fresh ? 'is-fresh' : ''}" style="--i:${index}" data-item data-id="${person.id}">
            <td data-first>
                <div class="flex items-center gap-3 text-left">
                    <span class="avatar-sm">${escapeHtml(initialsOf(person.nombre, person.apellidos))}</span>
                    <span class="cell-strong">${escapeHtml(fullName(person))}</span>
                </div>
            </td>
            <td data-label="Correo (usuario)" class="cell-email">${emailHtml(person.correo)}</td>
            <td data-label="Teléfono" class="whitespace-nowrap">${escapeHtml(person.telefono)}</td>
            ${staff ? `
            <td data-label="Departamento">${escapeHtml(person.departamento)}</td>
            <td data-label="Rol" data-aside><span class="badge" data-tone="${person.rol === 'admin' ? 'ok' : 'muted'}">${escapeHtml(roleName(person.rol))}</span></td>` : ''}
            <td data-label="Activa" data-keep>
                <label class="switch" title="${person.activo ? 'Desactivar cuenta' : 'Activar cuenta'}">
                    <input type="checkbox" data-toggle-active="${person.id}" ${person.activo ? 'checked' : ''} aria-label="Cuenta activa de ${escapeHtml(fullName(person))}">
                    <span class="switch-knob"></span>
                </label>
            </td>
            <td data-keep><div class="row-actions">${rowActions(person.id, { compact: true })}</div></td>
        </tr>`;
}

function renderPeople(kind, main) {
    const config = KINDS[kind];
    const staff = kind === 'staff';
    main.innerHTML = panel({
        title: config.title,
        sub: '&nbsp;',
        action: addButton(config.add),
        body: `
            <div class="filters">
                ${searchBox('Buscar por nombre, correo o teléfono…')}
                ${staff ? `<select class="select" data-role aria-label="Filtrar por rol"><option value="">Todos los roles</option>${STAFF_ROLES.map(role => `<option value="${role.id}">${role.nombre}</option>`).join('')}</select>` : ''}
                <select class="select" data-status aria-label="Filtrar por estado">
                    <option value="">Todos los estados</option><option value="1">Activas</option><option value="0">Inactivas</option>
                </select>
            </div>
            <div class="mt-5" data-list></div>`
    });
    const list = $('[data-list]', main);
    const sub = $('[data-sub]', main);
    const roleFilter = $('[data-role]', main);
    const statusFilter = $('[data-status]', main);
    const state = { items: [], query: '', fresh: null };

    function drawSub() {
        const active = state.items.filter(person => person.activo).length;
        sub.textContent = `${plural(state.items.length, 'registrado')} · ${plural(active, 'activo')}. Desactiva una cuenta para quitarle el acceso sin perder sus datos.`;
    }

    function draw() {
        drawSub();
        const visible = state.items.filter(person =>
            (!roleFilter?.value || person.rol === roleFilter.value)
            && (!statusFilter.value || String(Number(person.activo)) === statusFilter.value)
            && matches(state.query, fullName(person), person.correo, person.telefono, person.departamento));
        if (!state.items.length) { list.innerHTML = emptyState({ title: `Aún no hay ${staff ? 'usuarios' : 'clientes'}`, text: `Agrega el primero con «${config.add}».`, iconName: 'users' }); return; }
        if (!visible.length) { list.innerHTML = state.query ? noResults(state.query) : emptyState({ title: 'Nadie coincide con esos filtros', iconName: 'users' }); return; }
        list.innerHTML = dataTable({
            head: `<th>Nombre</th><th>Correo (usuario)</th><th>Teléfono</th>
                ${staff ? '<th>Departamento</th><th>Rol</th>' : ''}
                <th>Activa</th><th><span class="sr-only">Acciones</span></th>`,
            rows: visible.map((person, index) => rowHtml(kind, person, index, person.id === state.fresh)).join('')
        });
        state.fresh = null;
    }

    async function load() {
        list.innerHTML = `<div class="space-y-3">${skeletons(4, 'h-16')}</div>`;
        try { state.items = await config.list(); draw(); } catch (error) { list.innerHTML = loadError(error.message); }
    }

    async function edit(person) {
        const result = await openFormModal({
            title: person ? `Editar ${config.noun}` : `Nuevo ${config.noun}`,
            fields: personFields(kind, person),
            editing: Boolean(person),
            onMount: form => {
                wirePasswordToggle(form);
                const hint = $('[data-active-hint]', form);
                form.elements.activo.addEventListener('change', () => {
                    hint.textContent = form.elements.activo.checked ? 'Puede iniciar sesión.' : 'No podrá iniciar sesión.';
                });
            },
            onSubmit: form => {
                const data = {
                    nombre: value(form, 'nombre'),
                    apellidos: value(form, 'apellidos'),
                    correo: value(form, 'correo'),
                    telefono: value(form, 'telefono'),
                    password: form.elements.password.value,
                    activo: form.elements.activo.checked,
                    ...(staff ? { departamento: value(form, 'departamento'), rol: value(form, 'rol') } : {})
                };
                return person ? config.update(person.id, data) : config.create(data);
            }
        });
        if (!result) return;
        toast(person ? `Se actualizó la cuenta de ${fullName(result)}.` : `Se creó la cuenta de ${fullName(result)}.`);
        state.fresh = result.id;
        await load();
    }

    // Activar o desactivar directo desde la tabla
    list.addEventListener('change', async event => {
        const input = event.target.closest('[data-toggle-active]');
        if (!input) return;
        const person = byId(state.items, input.dataset.toggleActive);
        const row = input.closest('tr');
        const toggle = input.closest('.switch');
        toggle.classList.add('is-busy');
        try {
            const updated = await config.setActive(person.id, input.checked);
            Object.assign(person, updated);
            row.classList.toggle('is-muted', !person.activo);
            toggle.title = person.activo ? 'Desactivar cuenta' : 'Activar cuenta';
            drawSub();
            toast(person.activo ? `Cuenta de ${fullName(person)} activada.` : `Cuenta de ${fullName(person)} desactivada.`);
        } catch (error) {
            input.checked = !input.checked;
            toggle.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 300 });
            toast(error.message, { tone: 'error', duration: 4600 });
        } finally {
            toggle.classList.remove('is-busy');
        }
    });

    [roleFilter, statusFilter].forEach(select => select?.addEventListener('change', draw));
    wireList(main, {
        onSearch: query => { state.query = query; draw(); },
        onAdd: () => edit(null),
        onEdit: id => edit(byId(state.items, id)),
        onRetry: load,
        onDelete: async (id, node) => {
            const person = byId(state.items, id);
            const ok = await confirmDialog({
                title: `¿Eliminar la cuenta de ${fullName(person)}?`,
                message: config.deleteMessage,
                action: () => config.remove(person.id)
            });
            if (!ok) return;
            await animateOut(node);
            toast(`Se eliminó la cuenta de ${fullName(person)}.`);
            await load();
        }
    });
    load();
}

export const renderStaffUsers = main => renderPeople('staff', main);
export const renderClients = main => renderPeople('client', main);
