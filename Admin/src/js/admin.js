/** Punto de entrada del panel del administrador (index.html). */
import { initTheme } from './features/theme.js';
import { initSounds } from './features/sound-fx.js';
import { initSidebar } from './features/sidebar.js';
import { initSession } from './features/session.js';
import { initRouter } from './features/router.js';
import { renderCompanyInfo } from './views/company-info.js';
import { renderCarousel } from './views/carousel.js';
import { renderTimeline } from './views/timeline.js';
import { renderAccessoryCategories } from './views/accessory-categories.js';
import { renderAttributeCategories } from './views/attribute-categories.js';
import { renderAttributes } from './views/attributes.js';
import { renderAccessories } from './views/accessories.js';
import { renderCraneCategories } from './views/crane-categories.js';
import { renderCraneAttributes, renderCraneOptionals } from './views/crane-extras.js';
import { renderCranes } from './views/cranes.js';
import { renderStaffUsers, renderClients } from './views/people.js';
import { renderQuoteRequests, renderRepairRequests } from './views/requests.js';
import { renderBackups } from './views/backups.js';
import { renderPending } from './views/pending.js';
import { renderProfile } from './views/profile.js';
import { renderAccessLog, renderRecoveryLog, renderUserChanges } from './views/audits.js';
import { renderCompanyChanges, renderAccessoryChanges, renderCraneChanges, renderDeletedRequests } from './views/content-audits.js';
import { $ } from './core/dom.js';
import { resetDemoData } from './services/admin-api.js';
import { confirmDialog } from './features/modal.js';

initTheme();
initSounds();
initSidebar();
initSession();
initRouter({
    profile: renderProfile,
    'company-info': renderCompanyInfo,
    carousel: renderCarousel,
    timeline: renderTimeline,
    'accessory-categories': renderAccessoryCategories,
    'attribute-categories': renderAttributeCategories,
    attributes: renderAttributes,
    accessories: renderAccessories,
    'crane-categories': renderCraneCategories,
    'crane-optionals': renderCraneOptionals,
    'crane-attributes': renderCraneAttributes,
    cranes: renderCranes,
    'quote-requests': renderQuoteRequests,
    'repair-requests': renderRepairRequests,
    'staff-users': renderStaffUsers,
    clients: renderClients,
    backups: renderBackups,
    'access-log': renderAccessLog,
    'recovery-log': renderRecoveryLog,
    'user-changes': renderUserChanges,
    'company-changes': renderCompanyChanges,
    'accessory-changes': renderAccessoryChanges,
    'crane-changes': renderCraneChanges,
    'deleted-requests': renderDeletedRequests,
    pending: renderPending
});

// DEMOSTRACIÓN: vuelve a los datos de ejemplo. Quitar junto con el botón #resetDemo de index.html.
$('#resetDemo').addEventListener('click', async () => {
    const ok = await confirmDialog({
        title: '¿Restablecer los datos de prueba?',
        message: 'Se borrarán los cambios hechos en este navegador y volverá el contenido de ejemplo.',
        confirmText: 'Restablecer',
        tone: 'primary'
    });
    if (ok) { resetDemoData(); dispatchEvent(new HashChangeEvent('hashchange')); }
});
