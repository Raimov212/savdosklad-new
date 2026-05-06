import { api, showToast, escapeHtml, getSelectedBusinessId, toggleAcc, formatPrice, formatDateTime } from './api.js';
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
        (businesses || []).filter(b => b).map(b =>
          api.get(`/clients?businessId=${b.id}`).catch(() => []).then(clients => {
            // Tag with business name
            (clients || []).filter(c => c).forEach(c => { c._businessName = b.name; c._businessId = b.id; });
            return (clients || []).filter(c => c);
          })
        )
      );

      allClientsList = results.flat().filter(c => c);
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
              <button class="btn btn-ghost btn-sm" onclick="showClientTransactions(${c.id}, '${escapeHtml(c.fullName)}')">🛍️ ${t("Sotuvlar")}</button>
              ${window.hasPermission('edit') ? `<button class="btn btn-success btn-sm" onclick='openClientModal(${JSON.stringify(c).replace(/'/g, "&#39;")})'>✏️ ${t("Tahrirlash")}</button>` : ''}
              ${window.hasPermission('delete') ? `<button class="btn btn-danger btn-sm" onclick="deleteClient(${c.id})">🗑️ ${t("O'chirish")}</button>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');

  if (!isAppend) {
    content.innerHTML = `
      <div class="card-header" style="padding: 15px 20px; background: var(--bg-glass); border-bottom: 1px solid var(--border); border-radius: 20px 20px 0 0;">
        <div class="toolbar" style="width: 100%; display: flex; gap: 10px; align-items: center;">
          <div class="search-box" style="flex: 1; max-width: none; margin: 0;">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="${t("Qidirish...")}" id="client-search"
              value="${escapeHtml(document.getElementById('client-search')?.value || '')}"
              oninput="filterClients(this.value)"
              style="color: var(--text-primary) !important; background: var(--bg-input) !important; height: 44px;" class="form-control" autocomplete="off">
          </div>
          ${getSelectedBusinessId() && window.hasPermission('add') ? `<button class="btn btn-primary" onclick="openClientModal()" style="height: 44px; padding: 0 20px;">${t("Qo'shish")}</button>` : ''}
        </div>
      </div>
      <div class="acc-list" id="client-acc-list" style="margin-top: 10px;">${items}</div>
      <div id="client-pagination-area">
        ${renderPageControls('clientPage', totalPages, 'renderClientsTable')}
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
  const q = (query || '').toLowerCase();
  const filtered = allClientsList.filter(c =>
    (c.fullName && String(c.fullName).toLowerCase().includes(q)) ||
    (c.phone && String(c.phone).toLowerCase().includes(q))
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

window.toggleClientTransAcc = async function (transId, ids) {
  toggleAcc('client-trans-acc-' + transId);
  const itemsContainer = document.getElementById('client-trans-items-' + transId);
  if (itemsContainer && !itemsContainer.dataset.loaded) {
    itemsContainer.innerHTML = `<div class="loader" style="width:20px;height:20px;margin:10px auto;"></div>`;
    try {
      if (!Array.isArray(ids)) ids = [ids];
      const promises = ids.map(id => api.get(`/transactions/${id}/items`));
      const results = await Promise.all(promises);
      const items = results.flat();

      if (items.length === 0) {
        itemsContainer.innerHTML = `<div style="text-align:center; padding:10px; color:var(--text-muted); font-size:12px;">${t("Ma'lumot yo'q")}</div>`;
        itemsContainer.dataset.loaded = 'true';
        return;
      }

      let html = `<div style="background:var(--bg-secondary); border-radius:10px; padding:10px; margin-top:10px;">
        <table style="width:100%; font-size:12px; border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid var(--border); opacity:0.7;">
            <th style="text-align:left; padding-bottom:5px;">${t("Nomi")}</th>
            <th style="text-align:center; padding-bottom:5px;">${t("Soni")}</th>
            <th style="text-align:right; padding-bottom:5px;">${t("Narxi")}</th>
            <th style="text-align:right; padding-bottom:5px;">${t("Jami")}</th>
          </tr>
        </thead>
        <tbody>`;
      (items || []).forEach(it => {
        if (!it) return;
        html += `<tr>
          <td style="padding:5px 0; font-weight:600;">${escapeHtml(it.productName)}</td>
          <td style="text-align:center; padding:5px 0;">${it.productQuantity}</td>
          <td style="text-align:right; padding:5px 0;">${formatPrice(it.productPrice)}</td>
          <td style="text-align:right; padding:5px 0; font-weight:600; color:var(--accent);">${formatPrice(it.productQuantity * it.productPrice)}</td>
        </tr>`;
      });
      html += `</tbody></table></div>`;
      itemsContainer.innerHTML = html;
      itemsContainer.dataset.loaded = 'true';
    } catch (e) {
      itemsContainer.innerHTML = `<span style="color:red; font-size:12px;">${e.message}</span>`;
    }
  }
};

window.renderClientHistoryRows = function (transactions) {
  let rows = '';
  if (transactions.length === 0) {
    rows = `<div style="text-align:center; padding:20px; color:var(--text-muted);">${t("Sotuvlar yo'q")}</div>`;
  } else {
    rows = transactions.map((trans) => {
      const hasDebt = trans.debt > 0;
      const idsJson = JSON.stringify(trans.ids);
      return `
        <div class="acc-item" id="client-trans-acc-${trans.id}">
          <div class="acc-header" onclick='toggleClientTransAcc(${trans.id}, ${idsJson})'>
            <div class="acc-header-left">
              <div class="acc-avatar acc-avatar-indigo" style="${hasDebt ? 'background:linear-gradient(135deg,#EF4444,#DC2626)' : ''}">🛒</div>
              <div>
                <div class="acc-title">№ ${trans.ids.join(', ')} — ${formatDateTime(trans.createdAt)}</div>
                <div class="acc-subtitle">
                  ${hasDebt ? `<span class="badge badge-danger">${t("Qarz")}: ${formatPrice(trans.debt)}</span>` : ''}
                </div>
              </div>
            </div>
            <div class="acc-header-right">
              <span class="acc-price" style="color:var(--success);">${formatPrice(trans.total)} ${t("so'm")}</span>
              <span class="acc-chevron">▼</span>
            </div>
          </div>
          <div class="acc-body">
            <div class="acc-detail-grid" style="margin-bottom:10px;">
              ${trans.cash > 0 ? `<div class="acc-detail-item">
                <span class="acc-detail-icon">💵</span>
                <div><div class="acc-detail-label">${t("Naqd")}</div><div class="acc-detail-value">${formatPrice(trans.cash)} ${t("so'm")}</div></div>
              </div>` : ''}
              ${trans.card > 0 ? `<div class="acc-detail-item">
                <span class="acc-detail-icon">💳</span>
                <div><div class="acc-detail-label">${t("Karta")}</div><div class="acc-detail-value">${formatPrice(trans.card)} ${t("so'm")}</div></div>
              </div>` : ''}
              ${trans.click > 0 ? `<div class="acc-detail-item">
                <span class="acc-detail-icon">📱</span>
                <div><div class="acc-detail-label">${t("Click")}</div><div class="acc-detail-value">${formatPrice(trans.click)} ${t("so'm")}</div></div>
              </div>` : ''}
              ${hasDebt ? `<div class="acc-detail-item" style="border-color:#FCA5A5;">
                <span class="acc-detail-icon">⚠️</span>
                <div><div class="acc-detail-label" style="color:#EF4444;">${t("Qarz")}</div><div class="acc-detail-value" style="color:#EF4444;">${formatPrice(trans.debt)} ${t("so'm")}</div></div>
              </div>` : ''}
            </div>
            <div id="client-trans-items-${trans.id}"></div>
            <div class="acc-actions" style="margin-top:10px; border-top:1px solid var(--border); padding-top:10px;">
              <button class="btn btn-ghost btn-sm" onclick='viewTransactionItems(${idsJson})'>👁️ ${t("Tafsilotlar")}</button>
              <button class="btn btn-primary btn-sm" onclick='downloadTransactionPdf(${idsJson})'>📄 ${t("PDF")}</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  const listContainer = document.getElementById('client-history-list');
  if (listContainer) {
    listContainer.innerHTML = rows;
  }
  return rows;
};

window.searchClientHistory = function (query) {
  const q = (query || '').toLowerCase();
  const filtered = window.currentClientTransactions.filter(t =>
    t.ids.join(', ').includes(q) || formatDateTime(t.createdAt).includes(q)
  );
  renderClientHistoryRows(filtered);
};

async function showClientTransactions(id, name) {
  try {
    showToast(t("Yuklanmoqda..."), 'info');
    const list = await api.get(`/transactions/client/${id}`);

    const groupedMap = new Map();
    (list || []).forEach(trans => {
      const date = trans.createdAt.substring(0, 10);
      const key = `${date}`;
      if (groupedMap.has(key)) {
        const group = groupedMap.get(key);
        group.ids.push(trans.id);
        group.total += trans.total;
        group.cash += trans.cash;
        group.card += trans.card;
        group.click += (trans.click || 0);
        group.debt += trans.debt;
        if (new Date(trans.createdAt) > new Date(group.createdAt)) {
          group.createdAt = trans.createdAt;
        }
      } else {
        groupedMap.set(key, { ...trans, ids: [trans.id] });
      }
    });

    window.currentClientTransactions = Array.from(groupedMap.values());

    let rowsHtml = window.renderClientHistoryRows(window.currentClientTransactions);

    const html = `
      <style>
        .client-history-modal { max-width: 900px !important; width: 100% !important; }
        @media (max-width: 1024px) { .client-history-modal { max-width: 95% !important; } }
      </style>
      <div class="modal-header">
        <div>
          <h3 style="margin:0; font-family:'Outfit';">${t("Xaridlar tarixi")}</h3>
          <p style="margin:4px 0 0; font-size:13px; color:var(--text-muted);">👤 ${escapeHtml(name)}</p>
        </div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      
      <div style="margin: 15px 0;">
        <div class="search-box" style="max-width:100%;">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="${t("Qidirish (Sana yoki raqam)...")}" oninput="searchClientHistory(this.value)" class="form-control" autocomplete="off">
        </div>
      </div>
      
      <div style="max-height: calc(100vh - 220px); overflow-y: auto; padding-right: 5px;" class="custom-scroll">
        <div class="acc-list" id="client-history-list">${rowsHtml}</div>
      </div>
    `;
    openModal(html, null, 'client-history-modal');
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
window.showClientTransactions = showClientTransactions;
window.clientPage = clientPage;
window.allClientsList = allClientsList;
window.currentClients = currentClients;
