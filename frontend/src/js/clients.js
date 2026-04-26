import { api, showToast, escapeHtml, getSelectedBusinessId, toggleAcc } from './api.js';
import { t } from './i18n.js';

// ==================== CLIENTS MODULE ====================

window.clientPage = 1;
let currentClients = [];
let allClientsList = [];

async function renderClients() {
  const content = document.getElementById('page-content');
  const bid = getSelectedBusinessId();

  try {
    if (!bid) {
      // "Hammasi" mode — fetch from all businesses
      const businesses = await api.get('/businesses/my').catch(() => []);
      if (!businesses || businesses.length === 0) {
        content.innerHTML = `<div class="empty-state"><div class="icon">🏢</div><h4>${t("Biznes yarating")}</h4></div>`;
        return;
      }

      const results = await Promise.all(
        businesses.map(b => 
          api.get(`/clients?businessId=${b.id}`).catch(() => []).then(clients => {
            // Tag with business name
            clients.forEach(c => { c._businessName = b.name; c._businessId = b.id; });
            return clients;
          })
        )
      );

      allClientsList = results.flat();
    } else {
      const clients = await api.get(`/clients?businessId=${bid}`);
      allClientsList = clients || [];
    }
    renderClientsTable(allClientsList);
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><h4>${t("Xatolik")}</h4><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function renderClientsTable(list, isAppend = false) {
  if (typeof list === 'boolean') {
    isAppend = list;
    list = null;
  }
  if (list) {
    currentClients = list;
    if (!isAppend) window.clientPage = 1;
  }

  const limit = 15;
  const totalPages = Math.ceil(currentClients.length / limit);
  // Infinite scroll: slice from 0 to current page * limit
  const end = window.clientPage * limit;
  const paginated = currentClients.slice(end - limit, end);

  const content = document.getElementById('page-content');

  const avatarColors = ['acc-avatar-indigo', 'acc-avatar-green', 'acc-avatar-blue', 'acc-avatar-orange'];

  const items = paginated.length === 0 && !isAppend
    ? `<div class="empty-state"><div class="icon">👥</div><h4>${t("Mijozlar yo'q")}</h4></div>`
    : paginated.map((c, i) => {
      const colorClass = avatarColors[i % avatarColors.length];
      const initial = (c.fullName || '?')[0].toUpperCase();
      const bizBadge = c._businessName ? `<span class="badge" style="background:rgba(255,255,255,0.05); border:1px solid var(--border); font-size:10px; opacity:0.7; margin-left:8px;">${escapeHtml(c._businessName)}</span>` : '';
      return `
        <div class="acc-item" id="client-acc-${c.id}">
          <div class="acc-header" onclick="toggleAcc('client-acc-${c.id}')">
            <div class="acc-header-left">
              <div class="acc-avatar ${colorClass}">${initial}</div>
              <div>
                <div class="acc-title">${escapeHtml(c.fullName)} ${bizBadge}</div>
                <div class="acc-subtitle">${escapeHtml(c.phone)}</div>
              </div>
            </div>
            <div class="acc-header-right">
              <span class="badge" style="background:#EEF2FF; color:#4F46E5;">${t("Mijoz")}</span>
              <span class="acc-chevron">▼</span>
            </div>
          </div>
          <div class="acc-body">
            <div class="acc-detail-grid">
              <div class="acc-detail-item">
                <span class="acc-detail-icon">📞</span>
                <div><div class="acc-detail-label">${t("Telefon")}</div><div class="acc-detail-value">${escapeHtml(c.phone)}</div></div>
              </div>
              ${c.address ? `<div class="acc-detail-item">
                <span class="acc-detail-icon">📍</span>
                <div><div class="acc-detail-label">${t("Manzil")}</div><div class="acc-detail-value">${escapeHtml(c.address)}</div></div>
              </div>` : ''}
              <div class="acc-detail-item">
                <span class="acc-detail-icon">📅</span>
                <div><div class="acc-detail-label">${t("Qo'shilgan")}</div><div class="acc-detail-value">${formatDate(c.createdAt)}</div></div>
              </div>
            </div>
            <div class="acc-actions">
              ${window.hasPermission('edit') ? `<button class="btn btn-success btn-sm" onclick='openClientModal(${JSON.stringify(c).replace(/'/g, "&#39;")})'>✏️ ${t("Tahrirlash")}</button>` : ''}
              ${window.hasPermission('delete') ? `<button class="btn btn-danger btn-sm" onclick="deleteClient(${c.id})">🗑️ ${t("O'chirish")}</button>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');

  if (!isAppend) {
    content.innerHTML = `
      <div class="acc-list" id="client-acc-list">${items}</div>
      <div id="client-pagination-area">
        ${renderPageControls('clientPage', totalPages, 'renderClientsTable')}
      </div>
      <div class="page-bottom-bar">
        <div class="search-box" style="flex:1; max-width:none;">
          <span class="search-icon" style="color:rgba(255,255,255,0.6);">🔍</span>
          <input type="text" placeholder="${t("Qidirish...")}" id="client-search"
            value="${escapeHtml(document.getElementById('client-search')?.value || '')}"
            oninput="filterClients(this.value)"
            style="background:rgba(255,255,255,0.15); border-color:rgba(255,255,255,0.25); color:white;">
        </div>
        ${getSelectedBusinessId() && window.hasPermission('add') ? `<button class="btn btn-primary" onclick="openClientModal()">${t("Qo'shish")}</button>` : ''}
      </div>
    `;
    attachInfiniteScroll('clientPage', totalPages, 'renderClientsTable');
  } else {
    const listContainer = document.getElementById('client-acc-list');
    if (listContainer) {
      listContainer.insertAdjacentHTML('beforeend', items);
    }
    const pagArea = document.getElementById('client-pagination-area');
    if (pagArea) {
      pagArea.innerHTML = renderPageControls('clientPage', totalPages, 'renderClientsTable');
    }
    attachInfiniteScroll('clientPage', totalPages, 'renderClientsTable');
  }
}

function filterClients(query) {
  const q = query.toLowerCase();
  const filtered = allClientsList.filter(c =>
    (c.fullName && c.fullName.toLowerCase().includes(q)) ||
    (c.phone && c.phone.toLowerCase().includes(q))
  );
  const _inputEl = document.getElementById('client-search');
  const _cursor = _inputEl ? _inputEl.selectionStart : 0;

  renderClientsTable(filtered);

  setTimeout(() => {
    const input = document.getElementById('client-search');
    if (input) {
      input.focus();
      try { input.setSelectionRange(_cursor, _cursor); } catch (e) { }
    }
  }, 0);
}

function openClientModal(c = null) {
  const isEdit = !!c;
  openModal(`
    <div class="modal-header">
      <h3>${isEdit ? t('Mijozni tahrirlash') : t('Yangi mijoz')}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <form onsubmit="saveClient(event, ${isEdit ? c.id : 0})" style="min-width:400px">
      <div class="form-group">
        <label>${t("To'liq ism")}</label>
        <input type="text" class="form-control" id="client-name" value="${isEdit ? escapeHtml(c.fullName) : ''}" placeholder="${t('Mijozning to\'liq ismini kiriting')}" required>
      </div>
      <div class="form-group">
        <label>${t("Telefon")}</label>
        <div style="position:relative">
          <input type="tel" class="form-control" id="client-phone" value="${isEdit ? escapeHtml(c.phone) : ''}" placeholder="+998" required style="padding-left:40px">
           <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:16px; opacity:0.5;">📞</span>
        </div>
      </div>
      <div class="form-group">
        <label>${t("Manzil")}</label>
        <input type="text" class="form-control" id="client-address" value="${isEdit && c.address ? escapeHtml(c.address) : ''}" placeholder="${t('Mijozning manzilini kiriting')}">
      </div>
      <div class="modal-footer" style="padding-top:10px">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
        <button type="submit" class="btn btn-primary" style="padding:10px 40px;">${isEdit ? t('Saqlash') : t('Yaratish')}</button>
      </div>
    </form>
  `);
}

async function saveClient(e, id) {
  e.preventDefault();
  const bid = getSelectedBusinessId();
  const name = document.getElementById('client-name').value.trim();
  const phone = document.getElementById('client-phone').value.trim();
  const address = document.getElementById('client-address').value.trim() || null;

  // Phone verification (+998XXXXXXXXX)
  const phoneRegex = /^\+998\d{9}$/;
  if (!phoneRegex.test(phone)) {
    showToast(t("Telefon raqami noto'g'ri (+998XXXXXXXXX ko'rinishida bo'lsin)"), 'error');
    return;
  }

  // User cannot be a customer to themselves
  const currentUser = api.getUser();
  if (currentUser && (currentUser.phone === phone || currentUser.phoneNumber === phone)) {
    showToast(t("O'zingizni mijoz sifatida qo'sha olmaysiz"), 'error');
    return;
  }

  try {
    if (id) {
      await api.put(`/clients/${id}`, {
        businessId: bid || 0,
        fullName: name,
        phone: phone,
        address: address,
      });
      showToast(t('Mijoz yangilandi'));
      closeModal();
    } else {
      await api.post('/clients', {
        businessId: bid,
        fullName: name,
        phone: phone,
        address: address,
      });
      showToast(t('Mijoz qo\'shildi'));
      document.getElementById('client-name').value = '';
      document.getElementById('client-phone').value = '';
      document.getElementById('client-address').value = '';
      document.getElementById('client-name').focus();
    }
    renderClients();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteClient(id) {
  if (!confirm(t('Mijozni o\'chirishga ishonchingiz komilmi?'))) return;
  try {
    const bid = getSelectedBusinessId();
    await api.delete(`/clients/${id}${bid ? '?businessId=' + bid : ''}`);
    showToast(t('Mijoz o\'chirildi'));
    renderClients();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Global exports
window.renderClients = renderClients;
window.renderClientsTable = renderClientsTable;
window.filterClients = filterClients;
window.openClientModal = openClientModal;
window.saveClient = saveClient;
window.deleteClient = deleteClient;
window.clientPage = clientPage;
window.allClientsList = allClientsList;
window.currentClients = currentClients;
