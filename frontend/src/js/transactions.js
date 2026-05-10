import { api, showToast, formatPrice, escapeHtml, getSelectedBusinessId, toggleAcc, formatDateTime } from './api.js';
import { t, currentLang } from './i18n.js';

// ==================== TRANSACTIONS MODULE ====================

let saleProducts = [];
let saleItems = [];

window.transactionPage = 1;
let currentTransactions = [];
let allTransactionsList = [];

let currentTotalTransactionID = null;
let savedBatchItems = [];
let cumulativePayments = { cash: 0, card: 0, click: 0, debt: 0 };
let currentSaleStep = 1; // 1: Products, 2: Payment
let globalClients = [];

async function renderTransactions() {
  const content = document.getElementById('page-content');
  const bid = getSelectedBusinessId();

  if (!bid) {
    content.innerHTML = `<div class="empty-state"><div class="icon">🛒</div><h4>${t("Avval biznes tanlang")}</h4></div>`;
    return;
  }

  try {
    const transactions = await api.get(`/transactions?businessId=${bid}${getDateQuery()}`);
    allTransactionsList = transactions || [];
    renderTransactionsTable(allTransactionsList);
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><h4>${t("Xatolik")}</h4><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function renderTransactionsTable(list, isAppend = false) {
  // Handle case where it's called from infinite scroll trigger: fn(true)
  if (list === true) {
    isAppend = true;
    list = null;
  }

  if (Array.isArray(list)) {
    if (!isAppend) window.transactionPage = 1;
    // Group transactions by Client ID/Number and Date
    const groupedMap = new Map();
    list.forEach(trans => {
      const date = trans.createdAt.substring(0, 10);
      const clientKey = trans.clientId ? `id_${trans.clientId}` : (trans.clientNumber ? `num_${trans.clientNumber}` : `trans_${trans.id}`);
      const key = `${clientKey}_${date}`;

      if (groupedMap.has(key)) {
        const group = groupedMap.get(key);
        group.ids.push(trans.id);
        group.total += trans.total;
        group.cash += trans.cash;
        group.card += trans.card;
        group.click += (trans.click || 0);
        group.debt += trans.debt;
        group.pointsEarned = (group.pointsEarned || 0) + (trans.pointsEarned || 0);
        group.pointsUsed = (group.pointsUsed || 0) + (trans.pointsUsed || 0);
        group.cashbackEarned = (group.cashbackEarned || 0) + (trans.cashbackEarned || 0);
        group.cashbackUsed = (group.cashbackUsed || 0) + (trans.cashbackUsed || 0);
        // Keep the latest timestamp for the row title
        if (new Date(trans.createdAt) > new Date(group.createdAt)) {
          group.createdAt = trans.createdAt;
        }
      } else {
        groupedMap.set(key, {
          ...trans,
          ids: [trans.id],
          isGroup: true
        });
      }
    });

    currentTransactions = Array.from(groupedMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (!isAppend) window.transactionPage = 1;
  }

  const limit = 15;
  const totalPages = Math.ceil(currentTransactions.length / limit);
  const end = window.transactionPage * limit;
  const paginated = currentTransactions.slice(end - limit, end);

  const content = document.getElementById('page-content');

  const items = paginated.length === 0
    ? `<div class="empty-state"><div class="icon">🛒</div><h4>${t("Sotuvlar yo'q")}</h4></div>`
    : paginated.map((trans, i) => {
      const absoluteIndex = ((window.transactionPage - 1) * limit) + i + 1;
      const hasDebt = trans.debt > 0;
      const idsJson = JSON.stringify(trans.ids);
      return `
        <div class="acc-item" id="trans-acc-${trans.id}">
          <div class="acc-header" onclick="toggleAcc('trans-acc-${trans.id}')">
            <div class="acc-header-left">
              <div class="acc-avatar acc-avatar-indigo" style="${hasDebt ? 'background:linear-gradient(135deg,#EF4444,#DC2626)' : ''}">🛒</div>
              <div>
                <div class="acc-title">№ ${trans.ids.join(', ')} — ${formatDateTime(trans.createdAt)}</div>
                <div class="acc-subtitle">
                  ${trans.clientName ? `<strong>${escapeHtml(trans.clientName)}</strong>` : (trans.clientNumber ? escapeHtml(trans.clientNumber) : t('Begona xaridor'))}
                  ${hasDebt ? `<span class="badge badge-danger" style="margin-left:6px;">${t("Qarz")}: ${formatPrice(trans.debt)}</span>` : ''}
                </div>
              </div>
            </div>
            <div class="acc-header-right">
              <span class="acc-price" style="color:var(--success);">${formatPrice(trans.total)} ${t("so'm")}</span>
              <span class="acc-chevron">▼</span>
            </div>
          </div>
          <div class="acc-body">
            <div class="acc-detail-grid">
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
                <div><div class="acc-detail-label">${t("Click/Payme")}</div><div class="acc-detail-value">${formatPrice(trans.click)} ${t("so'm")}</div></div>
              </div>` : ''}
              ${hasDebt ? `<div class="acc-detail-item" style="border-color:#FCA5A5;">
                <span class="acc-detail-icon">⚠️</span>
                <div><div class="acc-detail-label" style="color:#EF4444;">${t("Qarz")}</div><div class="acc-detail-value" style="color:#EF4444;">${formatPrice(trans.debt)} ${t("so'm")}</div></div>
              </div>` : ''}
              ${(trans.pointsEarned || 0) > 0 ? `<div class="acc-detail-item" style="border-left: 2px solid var(--success-glass);">
                <span class="acc-detail-icon">⭐</span>
                <div><div class="acc-detail-label" style="color:var(--success);">${t("To'plangan ballar")}</div><div class="acc-detail-value" style="color:var(--success); font-weight:800;">+${trans.pointsEarned}</div></div>
              </div>` : ''}
              ${(trans.pointsUsed || 0) > 0 ? `<div class="acc-detail-item" style="border-left: 2px solid var(--accent);">
                <span class="acc-detail-icon">💫</span>
                <div><div class="acc-detail-label" style="color:var(--accent);">${t("Ishlatilgan ballar")}</div><div class="acc-detail-value" style="color:var(--accent); font-weight:800;">-${trans.pointsUsed}</div></div>
              </div>` : ''}
              ${(trans.cashbackEarned || 0) > 0 ? `<div class="acc-detail-item" style="border-left: 2px solid var(--success);">
                <span class="acc-detail-icon">💰</span>
                <div><div class="acc-detail-label" style="color:var(--success);">${t("To'plangan keshbek")}</div><div class="acc-detail-value" style="color:var(--success); font-weight:800;">+${formatPrice(trans.cashbackEarned)}</div></div>
              </div>` : ''}
              ${(trans.cashbackUsed || 0) > 0 ? `<div class="acc-detail-item" style="border-left: 2px solid var(--danger);">
                <span class="acc-detail-icon">💸</span>
                <div><div class="acc-detail-label" style="color:var(--danger);">${t("Ishlatilgan keshbek")}</div><div class="acc-detail-value" style="color:var(--danger); font-weight:800;">-${formatPrice(trans.cashbackUsed)}</div></div>
              </div>` : ''}
              <div class="acc-detail-item">
                <span class="acc-detail-icon">👤</span>
                <div><div class="acc-detail-label">${t("Mijoz")}</div><div class="acc-detail-value">${trans.clientName ? escapeHtml(trans.clientName) : (trans.clientNumber ? escapeHtml(trans.clientNumber) : t('Begona xaridor'))}</div></div>
              </div>
              <div class="acc-detail-item">
                <span class="acc-detail-icon">🏢</span>
                <div><div class="acc-detail-label">${t("Mas'ul")}</div><div class="acc-detail-value">${escapeHtml(trans.createdByName || t("Tizim"))}</div></div>
              </div>
            </div>
            <div class="acc-actions">
              <button class="btn btn-ghost btn-sm" onclick='viewTransactionItems(${idsJson})'>👁️ ${t("Tafsilotlar")}</button>
              <button class="btn btn-primary btn-sm" onclick='downloadTransactionPdf(${idsJson})'>📄 ${t("PDF")}</button>
              ${window.hasPermission('delete') ? `<button class="btn btn-danger btn-sm" onclick='deleteTransaction(${trans.id})'>🗑️ ${t("O'chirish")}</button>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');

  if (!isAppend) {
    content.innerHTML = `
      <div class="card-header" style="padding: 15px 20px; background: var(--bg-glass); border-bottom: 1px solid var(--border); border-radius: 20px 20px 0 0;">
        <div class="toolbar" style="width: 100%; display: flex; gap: 10px; align-items: center;">
          <div class="toolbar-actions" style="display: flex; gap: 10px; width: 100%;">
            <button class="btn btn-ghost" onclick="openDateFilterModal()" style="height: 42px; flex: 1; justify-content: center; font-size: 13px;" title="${t("Sana bo'yicha filter")}">📅 ${t("Sana")}</button>
            <button class="btn btn-primary" onclick="openSaleModal()" style="height: 42px; flex: 1.5; justify-content: center; font-size: 13px;">${t("Qo'shish")}</button>
          </div>
          <div class="search-box" style="width: 100%; margin: 0;">
            <span class="search-icon" style="left: 12px;">🔍</span>
            <input type="text" placeholder="${t("Mijoz bo'yicha qidirish...")}" id="transaction-search"
              value="${escapeHtml(document.getElementById('transaction-search')?.value || '')}"
              oninput="filterTransactions(this.value)"
              style="padding-left: 38px !important; height: 42px; font-size: 13px;" class="form-control" autocomplete="off">
          </div>
        </div>
      </div>
      <div class="acc-list" id="transaction-acc-list" style="margin-top: 10px;">${items}</div>
      <div id="transaction-pagination-area">
        ${renderPageControls('transactionPage', totalPages, 'renderTransactionsTable')}
      </div>
    `;
    attachInfiniteScroll('transactionPage', totalPages, 'renderTransactionsTable');
  } else {
    const listContainer = document.getElementById('transaction-acc-list');
    if (listContainer) {
      listContainer.insertAdjacentHTML('beforeend', items);
    }
    const pagArea = document.getElementById('transaction-pagination-area');
    if (pagArea) {
      pagArea.innerHTML = renderPageControls('transactionPage', totalPages, 'renderTransactionsTable');
    }
    attachInfiniteScroll('transactionPage', totalPages, 'renderTransactionsTable');
  }
}

function filterTransactions(query) {
  const q = (query || '').toLowerCase();
  const filtered = allTransactionsList.filter(trans =>
    (trans.clientNumber && String(trans.clientNumber).toLowerCase().includes(q)) ||
    (trans.clientName && String(trans.clientName).toLowerCase().includes(q))
  );
  const _inputEl = document.getElementById('transaction-search');
  const _cursor = _inputEl ? _inputEl.selectionStart : 0;

  renderTransactionsTable(filtered);

  setTimeout(() => {
    const input = document.getElementById('transaction-search');
    if (input) {
      input.focus();
      try { input.setSelectionRange(_cursor, _cursor); } catch (e) { }
    }
  }, 0);
}

async function deleteTransaction(id) {
  if (!confirm(t("Haqiqatan ham bu sotuvni o'chirmoqchimisiz? Bu mahsulotlarni omborga qaytaradi."))) return;

  const bid = getSelectedBusinessId();
  try {
    showToast(t("O'chirilmoqda..."), 'info');
    await api.delete(`/transactions/${id}?businessId=${bid}`);
    showToast(t("Muvaffaqiyatli o'chirildi"));
    renderTransactions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}


async function openSaleModal() {
  const bid = getSelectedBusinessId();
  try {
    const businesses = (await api.get('/businesses/my').catch(() => [])) || [];
    const [products, clientsResults] = await Promise.all([
      api.get('/products/my'),
      Promise.all((businesses || []).filter(b => b).map(b => api.get(`/clients?businessId=${b.id}`).catch(() => [])))
    ]);

    const rawClients = clientsResults.flat().filter(c => c);
    const uniqueClientsMap = new Map();
    rawClients.forEach(c => uniqueClientsMap.set(c.id, c));
    const clients = Array.from(uniqueClientsMap.values());

    saleProducts = (products || []).filter(p => p && !p.isDeleted && p.quantity > 0).map(p => {
      const b = (businesses || []).find(bus => bus && bus.id === p.businessId);
      return { ...p, businessName: b ? b.name : t("Noma'lum") };
    });
    globalClients = clients || [];
    currentTotalTransactionID = null;
    savedBatchItems = [];
    cumulativePayments = { cash: 0, card: 0, click: 0, debt: 0 };
    saleItems = [];
    currentSaleStep = 1;

    openModal(`
      <div class="modal-header">
        <div style="display:flex; flex-direction:column; gap:4px;">
          <h3 id="sale-modal-title">${t("Yangi sotuv")}</h3>
          <div class="sale-steps">
            <div class="step active" id="step-1-indicator">1. ${t("Mahsulotlar")}</div>
            <div class="step-divider"></div>
            <div class="step" id="step-2-indicator">2. ${t("To'lov")}</div>
          </div>
        </div>
        <button type="button" class="modal-close" onclick="closeModal()">✕</button>
      </div>
      
      <div id="sale-step-1" class="sale-segment">
        <div class="form-group" style="position:relative; margin-bottom: 20px;">
          <div class="barcode-input-group">
            <div class="search-box" style="flex: 1; max-width: none; margin: 0;">
              <span class="search-icon">🔍</span>
              <input type="text" class="form-control" id="sale-product-search" placeholder="${t("Qidirish (Nomi, Barcode)...")}" oninput="searchSaleProduct(this.value)" autocomplete="off">
            </div>
            <button type="button" class="btn-camera-scan" title="${t('Kamera orqali skanerlash')}" onclick="window.openCameraScanner(function(code){ addSaleProductByBarcode(code); })">📷</button>
          </div>
          <div id="sale-search-results" class="search-results-dropdown"></div>
        </div>

        <div id="sale-batches-container" style="margin-bottom: 15px; max-height: 120px; overflow-y: auto;"></div>
        <div id="sale-items-container" style="min-height: 200px; max-height: 350px; overflow-y: auto;"></div>
        
        <div class="modal-footer" style="margin-top: 25px; border-top: 1px solid var(--border); padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div id="sale-total-qty-mini" style="font-size: 16px; font-weight: 600; color: var(--text-muted);">0 ${t("ta")}</div>
            <div id="sale-total-mini" style="font-size: 20px; font-weight: 700; color: var(--primary);">0 ${t("so'm")}</div>
          </div>
          <button type="button" class="btn btn-primary" onclick="goToSalePaymentStep()" style="padding: 10px 30px;">${t("To'lovga o'tish")} →</button>
        </div>
      </div>

      <div id="sale-step-2" class="sale-segment" style="display:none;">
        <div style="background: var(--bg-glass); padding: 15px 20px; border-radius: 16px; border: 1px solid var(--border); margin-bottom: 25px;">
          <h4 style="margin:0 0 15px 0; font-size:14px; color:var(--text-primary); text-align:center; text-transform:uppercase; letter-spacing:1px;">${t("To'lov yoyilmasi")}</h4>
          <div style="display:flex; flex-direction:column; gap:8px; font-size:14px;">
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">${t("Mahsulotlar jami")}:</span>
              <span id="breakdown-subtotal" style="font-weight:600;">0 ${t("so'm")}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">${t("Chegirma")}:</span>
              <span id="breakdown-discount" style="font-weight:600; color:var(--danger);">- 0 ${t("so'm")}</span>
            </div>
            <div style="display:flex; justify-content:space-between; display:none;" id="breakdown-cashback-row">
              <span style="color:var(--text-muted);">${t("Keshbek ishlatildi")}:</span>
              <span id="breakdown-cashback" style="font-weight:600; color:var(--success);">- 0 ${t("so'm")}</span>
            </div>
            <div style="display:flex; justify-content:space-between; display:none;" id="breakdown-points-row">
              <span style="color:var(--text-muted);">${t("Ball ishlatildi")}:</span>
              <span id="breakdown-points" style="font-weight:600; color:var(--accent);">- 0 ${t("so'm")}</span>
            </div>
            <div style="height:1px; background:var(--border); margin:4px 0;"></div>
            <div style="display:flex; justify-content:space-between; font-size:18px;">
              <span style="font-weight:700;">${t("To'lanishi kerak")}:</span>
              <span id="breakdown-payable" style="font-weight:800; color:var(--primary);">0 ${t("so'm")}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:8px;">
              <span style="color:var(--text-muted);">${t("To'lanayotgan summa")}:</span>
              <span id="breakdown-paid" style="font-weight:600; color:var(--success);">0 ${t("so'm")}</span>
            </div>
            <div style="display:flex; justify-content:space-between;" id="breakdown-remaining-row">
              <span style="color:var(--text-muted);">${t("Qoldiq")}:</span>
              <span id="breakdown-remaining" style="font-weight:700; color:var(--primary);">0 ${t("so'm")}</span>
            </div>
          </div>
          <!-- Hidden old element for backward compatibility with scripts if missed -->
          <span id="sale-total-value" style="display:none;"></span>
          <div id="cumulative-total" style="display:none;"></div>
        </div>

        <div class="payment-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          <div class="form-group">
            <label>💵 ${t("Naqd")}</label>
            <input type="number" step="0.01" class="form-control form-control-lg" id="sale-cash" value="0" oninput="updateSalePayment()">
          </div>
          <div class="form-group">
            <label>💳 ${t("Karta")}</label>
            <input type="number" step="0.01" class="form-control form-control-lg" id="sale-card" value="0" oninput="updateSalePayment()">
          </div>
          <div class="form-group">
            <label>📱 Click/Payme</label>
            <input type="number" step="0.01" class="form-control form-control-lg" id="sale-click" value="0" oninput="updateSalePayment()">
          </div>
          <div class="form-group">
            <label>⚠️ ${t("Qarz")}</label>
            <input type="number" step="0.01" class="form-control form-control-lg" id="sale-debt" value="0" readonly style="color: var(--warning); font-weight: 800;">
          </div>
          <div class="form-group">
            <label>🏷️ ${t("Chegirma")}</label>
            <input type="number" step="0.01" class="form-control form-control-lg" id="sale-discount" value="0" oninput="updateSalePayment()">
          </div>
        </div>

        <!-- Improved Bonus Section -->
        <div id="bonus-section" style="display:none; margin-top:15px; padding:15px; background:var(--bg-secondary); border-radius:16px; border:1px solid var(--primary-glass);">
          <h5 style="margin:0 0 12px 0; font-size:12px; color:var(--primary); text-transform:uppercase; letter-spacing:0.5px; display:flex; align-items:center; gap:8px;">
            <i data-lucide="sparkles" style="width:14px;"></i> ${t("Bonuslar va Takliflar")}
          </h5>
          <div id="bonus-cards-container" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <!-- Dynamic Bonus Cards -->
          </div>
          
          <!-- Hidden inputs for backward compatibility with updateSalePayment logic -->
          <input type="hidden" id="sale-cashback-used" value="0">
          <input type="hidden" id="sale-points-used" value="0">
        </div>

        <div id="payment-error-msg" style="color: #EF4444; font-size: 13px; font-weight: 700; margin: 15px 0; display: none; text-align: center; background: rgba(239, 68, 68, 0.1); padding: 8px; border-radius: 8px;">
          ⚠️ ${t('"JAMI" dan katta summani kirita olmaysiz!')}
        </div>

        <div class="form-row" style="margin-top:10px">
          <div class="form-group" style="flex: 1.5; position: relative;">
            <label>${t("Mijoz (ixtiyoriy)")}</label>
            <div class="search-box" style="max-width: 100%;">
              <span class="search-icon">🔍</span>
              <input type="text" class="form-control" id="sale-client-search" placeholder="${t("Mijoz nomi yoki tel...")}" oninput="searchSaleClient(this.value)" autocomplete="off">
              <input type="hidden" id="sale-client-id" value="">
            </div>
            <div id="sale-client-results" class="search-results-dropdown"></div>
          </div>
          <div class="form-group" style="flex: 1;">
            <label>${t("Izoh")}</label>
            <input type="text" class="form-control" id="sale-desc" placeholder="${t("Izoh")}">
          </div>
        </div>

        <div class="modal-footer" style="margin-top: 25px; border-top: 1px solid var(--border); padding-top: 20px;">
          <button type="button" class="btn btn-ghost" onclick="backToSaleProducts()">${t("Orqaga")}</button>
          <button type="button" class="btn btn-primary" onclick="finalizeSale(event)" style="padding: 12px 50px; font-size: 16px;">✅ ${t("Saqlash")}</button>
        </div>
      </div>

      <style>
        .sale-steps { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
        .sale-steps .step { font-size: 11px; font-weight: 600; color: var(--text-muted); padding: 2px 8px; border-radius: 4px; background: var(--bg-secondary); }
        .sale-steps .step.active { color: white; background: var(--primary); }
        .sale-steps .step-divider { width: 20px; height: 1px; background: var(--border); }
        
        .sale-catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
          max-height: 220px;
          overflow-y: auto;
          padding: 5px;
          background: var(--bg-input);
          border-radius: 12px;
          border: 1px solid var(--border);
          margin-bottom: 20px;
        }
        .catalog-item-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px;
          cursor: pointer;
          transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: relative;
        }
        .catalog-item-card:hover { border-color: var(--primary); transform: translateY(-3px); box-shadow: var(--shadow-md); background: var(--bg-glass); }
        .catalog-item-card:active { transform: scale(0.95); }
        .cic-name { font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cic-price { font-size: 12px; font-weight: 800; color: var(--success); }
        .cic-stock { font-size: 10px; font-weight: 600; color: var(--text-muted); }
        .cic-badge { position: absolute; top: 6px; right: 6px; font-size: 9px; padding: 1px 4px; border-radius: 4px; background: rgba(0,0,0,0.2); }
        .cic-low-stock { color: #EF4444 !important; }

        .search-results-dropdown {
          position: absolute; top: 100%; left: 0; right: 0;
          background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-md);
          max-height: 250px; overflow-y: auto; z-index: 1100; box-shadow: var(--shadow-lg); display: none;
        }
        .search-result-item {
          padding: 14px 18px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid var(--border); transition: 0.2s;
        }
        .search-result-item:hover { background: var(--bg-glass); }
        .btn-remove { 
          background: rgba(239, 68, 68, 0.1); color: #EF4444; border: none; padding: 6px 12px; 
          border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: 0.2s;
        }
        .btn-remove:hover { background: #EF4444; color: white; }
      </style>
    `, null, 'modal-wide');

    renderSaleItems();
    setTimeout(() => document.getElementById('sale-product-search').focus(), 150);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

window.goToSalePaymentStep = function () {
  if (saleItems.length === 0 && savedBatchItems.length === 0) {
    showToast(t("Avval mahsulotlarni tanlang"), 'warning');
    return;
  }
  document.getElementById('sale-step-1').style.display = 'none';
  document.getElementById('sale-step-2').style.display = 'block';
  document.getElementById('step-1-indicator').classList.remove('active');
  document.getElementById('step-2-indicator').classList.add('active');
  currentSaleStep = 2;
  updateSaleTotal();
};

window.backToSaleProducts = function () {
  document.getElementById('sale-step-1').style.display = 'block';
  document.getElementById('sale-step-2').style.display = 'none';
  document.getElementById('step-1-indicator').classList.add('active');
  document.getElementById('step-2-indicator').classList.remove('active');
  currentSaleStep = 1;
};

function searchSaleProduct(query) {
  const dropdown = document.getElementById('sale-search-results');
  if (!query.trim()) {
    dropdown.style.display = 'none';
    return;
  }

  const q = (query || '').toLowerCase();
  
  // Check for exact barcode match (Scanner support)
  const exactBarcodeMatch = saleProducts.find(p => p.barcode === (query || '').trim());
  
  const filtered = saleProducts.filter(p =>
    (p.name && String(p.name).toLowerCase().includes(q)) || (p.barcode && String(p.barcode).toLowerCase().includes(q))
  ).slice(0, 10);

  if (filtered.length === 0) {
    dropdown.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-muted); font-size: 13px;">${t("Mahsulot topilmadi")}</div>`;
  } else {
    dropdown.innerHTML = filtered.map(p => `
      <div class="search-result-item" style="${p.quantity <= 0 ? 'opacity: 0.6; filter: grayscale(1);' : ''}" 
           onclick="addSaleProductById(${p.id})">
        <div>
          <div class="p-name">${escapeHtml(p.name)} <span style="font-size:10px; opacity:0.6; font-weight:normal;">🏢 ${escapeHtml(p.businessName)}</span></div>
          <div class="p-info">${p.barcode ? p.barcode : ''}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 700; color: ${p.quantity <= 0 ? '#EF4444' : 'var(--success)'};">
            ${p.discount > 0 ? `<span style="text-decoration: line-through; font-size: 11px; opacity: 0.6; margin-right: 5px;">${formatPrice(p.price)}</span>` : ''}
            ${formatPrice(p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price)}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: ${p.quantity <= 10 ? '#EF4444' : 'inherit'};">
            ${p.quantity} ${t("dona")}
          </div>
        </div>
      </div>
    `).join('');
  }
  dropdown.style.display = 'block';
}

// Barcode Scanner Event Listener (NETUM HID Support)
document.addEventListener('keydown', (e) => {
  const searchInput = document.getElementById('sale-product-search');
  if (searchInput && document.activeElement === searchInput && e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) {
      const exactMatch = saleProducts.find(p => p.barcode === query);
      if (exactMatch) {
        e.preventDefault();
        addSaleProductById(exactMatch.id);
      }
    }
  }
});

window.searchSaleClient = function(query) {
  const dropdown = document.getElementById('sale-client-results');
  if (!dropdown) return;
  if (!query.trim()) {
    dropdown.style.display = 'none';
    return;
  }

  const q = (query || '').toLowerCase();
  const filtered = globalClients.filter(c =>
    (c.fullName && String(c.fullName).toLowerCase().includes(q)) ||
    (c.phone && String(c.phone).toLowerCase().includes(q))
  ).slice(0, 10);

  if (filtered.length === 0) {
    dropdown.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-muted); font-size: 13px;">${t("Mijoz topilmadi")}</div>`;
  } else {
    dropdown.innerHTML = filtered.map(c => `
      <div class="search-result-item" onclick="selectSaleClient(${c.id})">
        <div>
          <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(c.fullName)}</div>
          <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(c.phone)}</div>
        </div>
        <div style="text-align: right;">
           <span class="badge" style="background:var(--primary-glass); color:var(--primary); font-size:10px;">${formatPrice(c.cashbackBalance)} ${t("keshbek")}</span>
        </div>
      </div>
    `).join('');
  }
  dropdown.style.display = 'block';
};

window.selectSaleClient = function(id) {
  const client = globalClients.find(c => c.id == id);
  if (!client) return;

  const input = document.getElementById('sale-client-search');
  if (input) input.value = client.fullName;
  
  const hiddenInput = document.getElementById('sale-client-id');
  if (hiddenInput) hiddenInput.value = id;

  const dropdown = document.getElementById('sale-client-results');
  if (dropdown) dropdown.style.display = 'none';
  
  window.onSaleClientChange(id);
};


function addSaleProductById(id) {
  const product = saleProducts.find(p => p.id === id);
  if (!product) return;

  const existing = saleItems.find(item => item.productId == id);
  const currentTotalQty = existing ? existing.quantity + 1 : 1;

  if (currentTotalQty > product.quantity) {
    showToast(t("Sotuvda yetarli mahsulot qoldig'i mavjud emas!"), 'warning');
    return;
  }

  if (existing) {
    existing.quantity++;
  } else {
    const priceAfterDiscount = product.discount > 0 
      ? product.price * (1 - product.discount / 100) 
      : product.price;

    saleItems.push({
      productId: id,
      quantity: 1,
      price: priceAfterDiscount,
      name: product.name,
      businessId: product.businessId,
      businessName: product.businessName
    });
  }

  // Clear search
  const searchInput = document.getElementById('sale-product-search');
  searchInput.value = '';
  document.getElementById('sale-search-results').style.display = 'none';
  searchInput.focus();

  renderSaleItems();
}

function renderSaleItems() {
  const container = document.getElementById('sale-items-container');
  if (!container) return;

  if (saleItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 20px; background: var(--bg-input); border-radius: var(--radius-md); border: 1px dashed var(--border);">
        <p style="font-size: 13px;">${t("Hali mahsulot qo'shilmadi. Yuqoridan qidiring.")}</p>
      </div>`;
    updateSaleTotal();
    return;
  }

  container.innerHTML = `
    <div class="sale-items" style="border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; margin: 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: var(--bg-secondary); border-bottom: 2px solid var(--border);">
          <tr>
            <th style="padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: var(--text-primary) !important; background: transparent !important; text-transform: uppercase; letter-spacing: 0.5px;">${t("Mahsulot")}</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 11px; font-weight: 700; color: var(--text-primary) !important; background: transparent !important; text-transform: uppercase; letter-spacing: 0.5px; width: 90px;">${t("Soni")}</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 700; color: var(--text-primary) !important; background: transparent !important; text-transform: uppercase; letter-spacing: 0.5px; width: 140px;">${t("Narxi")}</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 700; color: var(--text-primary) !important; background: transparent !important; text-transform: uppercase; letter-spacing: 0.5px; width: 130px;">${t("Jami")}</th>
            <th style="padding: 10px; width: 44px; background: transparent !important;"></th>
          </tr>
        </thead>
        <tbody>
          ${saleItems.map((item, idx) => `
            <tr class="sale-item-row" style="border-bottom: 1px solid var(--border);">
              <td class="td-product" data-label="${t("Mahsulot")}">
                <div class="product-info">
                  <div class="product-name" style="font-weight:600; color:var(--text-primary);">${escapeHtml(item.name || 'Unknown')}</div>
                  <div class="product-business" style="font-size:11px; color:var(--text-muted);">🏢 ${escapeHtml(item.businessName)}</div>
                </div>
              </td>
              <td class="td-qty" data-label="${t("Soni")}">
                <div style="display:flex; align-items:center; gap:4px; justify-content:center;">
                  <input type="number" class="form-control sale-item-input" value="${item.quantity}" min="1" oninput="onSaleQtyChange(${idx}, this.value)" style="width:60px; text-align:center; font-weight:700; color: var(--text-primary) !important; background: var(--bg-input) !important; border: 1px solid var(--border) !important;">
                  <span style="font-size:10px; color:var(--text-muted);">${t("ta")}</span>
                </div>
              </td>
              <td class="td-price" data-label="${t("Narxi")}">
                <input type="number" step="0.01" class="form-control sale-item-input" value="${item.price}" oninput="onSalePriceChange(${idx}, this.value)">
              </td>
              <td class="td-total" data-label="${t("Jami")}">
                <div id="item-total-${idx}" class="item-total-val" style="font-weight:700; color:var(--success); text-align:right;">${formatPrice(item.price * item.quantity)}</div>
              </td>
              <td class="td-action">
                <button type="button" class="btn-remove" onclick="removeSaleItem(${idx})" title="${t("O'chirish")}">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div > `;

  updateSaleTotal();
}

function removeSaleItem(idx) {
  saleItems.splice(idx, 1);
  renderSaleItems();
}

function onSaleQtyChange(idx, val) {
  const qty = parseInt(val) || 1;
  const productId = saleItems[idx].productId;
  const product = saleProducts.find(p => p.id === productId);

  if (product && qty > product.quantity) {
    showToast(`${t("Zaxirada atigi")} ${product.quantity} ${t("dona mavjud")}`, 'warning');
    saleItems[idx].quantity = product.quantity;
    renderSaleItems(); // Re-render to force correct quantity in input
    updateSaleTotal();
    return;
  }

  saleItems[idx].quantity = qty;
  const total = saleItems[idx].price * qty;
  const el = document.getElementById(`item-total-${idx}`);
  if (el) el.textContent = formatPrice(total);
  updateSaleTotal();
}

function onSalePriceChange(idx, val) {
  const price = parseFloat(val) || 0;
  saleItems[idx].price = price;
  const total = price * saleItems[idx].quantity;
  const el = document.getElementById(`item-total-${idx}`);
  if (el) el.textContent = formatPrice(total);
  updateSaleTotal();
}

function updateSaleTotal() {
  const totalQty = saleItems.reduce((s, i) => s + parseInt(i.quantity || 0), 0) + savedBatchItems.reduce((s, i) => s + parseInt(i.quantity || 0), 0);
  const total = saleItems.reduce((s, i) => s + (i.price * i.quantity), 0);

  const miniQtyEl = document.getElementById('sale-total-qty-mini');
  if (miniQtyEl) miniQtyEl.textContent = `${totalQty} ${t("ta")}`;

  const miniEl = document.getElementById('sale-total-mini');
  if (miniEl) miniEl.textContent = `${formatPrice(total)} ${t("so'm")}`;

  const el = document.getElementById('sale-total-value');
  if (el) el.textContent = `${formatPrice(total + (savedBatchItems.reduce((s, i) => s + (i.price * i.quantity), 0)))} ${t("so'm")}`;

  updateSalePayment();
}

function updateSalePayment() {
  const currentTotal = saleItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  const savedTotal = savedBatchItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  const overallTotal = currentTotal + savedTotal;

  const cashInp = document.getElementById('sale-cash');
  const cardInp = document.getElementById('sale-card');
  const clickInp = document.getElementById('sale-click');

  if (!cashInp) return; // Not in step 2 yet

  const cash = parseFloat(cashInp.value) || 0;
  const card = parseFloat(cardInp.value) || 0;
  const click = parseFloat(clickInp.value) || 0;
  const cashbackUsed = parseFloat(document.getElementById('sale-cashback-used')?.value || 0) || 0;
  const pointsUsedValue = parseFloat(document.getElementById('sale-points-used')?.value || 0) || 0;
  const discount = parseFloat(document.getElementById('sale-discount')?.value || 0) || 0;

  const overallPaidSoFar = cumulativePayments.cash + cumulativePayments.card + cumulativePayments.click;
  const currentPayments = cash + card + click + cashbackUsed + pointsUsedValue;
  const totalPaid = overallPaidSoFar + currentPayments;

  const debtEl = document.getElementById('sale-debt');
  const errorEl = document.getElementById('payment-error-msg');

  // Update Breakdown UI
  const bdSubtotal = document.getElementById('breakdown-subtotal');
  const bdDiscount = document.getElementById('breakdown-discount');
  const bdCashbackRow = document.getElementById('breakdown-cashback-row');
  const bdCashback = document.getElementById('breakdown-cashback');
  const bdPointsRow = document.getElementById('breakdown-points-row');
  const bdPoints = document.getElementById('breakdown-points');
  const bdPayable = document.getElementById('breakdown-payable');
  const bdPaid = document.getElementById('breakdown-paid');
  const bdRemaining = document.getElementById('breakdown-remaining');
  const bdRemainingRow = document.getElementById('breakdown-remaining-row');

  if (bdSubtotal) bdSubtotal.textContent = `${formatPrice(overallTotal)} ${t("so'm")}`;
  if (bdDiscount) bdDiscount.textContent = `- ${formatPrice(discount)} ${t("so'm")}`;
  
  if (cashbackUsed > 0) {
    if (bdCashbackRow) bdCashbackRow.style.display = 'flex';
    if (bdCashback) bdCashback.textContent = `- ${formatPrice(cashbackUsed)} ${t("so'm")}`;
  } else {
    if (bdCashbackRow) bdCashbackRow.style.display = 'none';
  }

  if (pointsUsedValue > 0) {
    if (bdPointsRow) bdPointsRow.style.display = 'flex';
    if (bdPoints) bdPoints.textContent = `- ${formatPrice(pointsUsedValue)} ${t("so'm")}`;
  } else {
    if (bdPointsRow) bdPointsRow.style.display = 'none';
  }

  const payableTotal = overallTotal - discount;
  const finalPayable = payableTotal - cashbackUsed - pointsUsedValue;
  if (bdPayable) bdPayable.textContent = `${formatPrice(Math.max(0, finalPayable))} ${t("so'm")}`;

  // Mijoz real to'layotgan puli
  const customerPayingNow = cash + card + click;
  const totalPaidNow = customerPayingNow + overallPaidSoFar;
  if (bdPaid) bdPaid.textContent = `${formatPrice(totalPaidNow)} ${t("so'm")}`;

  const remainingToPay = finalPayable - totalPaidNow;
  if (bdRemaining) {
    bdRemaining.textContent = `${formatPrice(Math.max(0, remainingToPay))} ${t("so'm")}`;
    if (remainingToPay <= 0) {
        bdRemaining.style.color = 'var(--success)';
    } else {
        bdRemaining.style.color = 'var(--primary)';
    }
  }

  if (totalPaid > payableTotal + 0.01) {
    if (bdPayable) bdPayable.style.color = '#EF4444';
    debtEl.style.color = '#EF4444';
    if (errorEl) errorEl.style.display = 'block';
  } else {
    if (bdPayable) bdPayable.style.color = 'var(--primary)';
    debtEl.style.color = 'var(--warning)';
    if (errorEl) errorEl.style.display = 'none';
  }

  // Debt is calculated for the whole transaction
  const remainingDebt = payableTotal - totalPaid;
  const currentDebt = Math.max(0, remainingToPay);
  if (debtEl) debtEl.value = currentDebt;

  if (window.updatePointsEarnedPreview) window.updatePointsEarnedPreview();
}

async function addToSaleBatch() {
  const bid = getSelectedBusinessId();
  const validItems = saleItems.filter(i => i.productId);

  if (validItems.length === 0) {
    showToast(t('Kamida bitta mahsulot tanlang'), 'warning');
    return;
  }

  try {
    let bid = getSelectedBusinessId();
    if (!bid && validItems.length > 0) {
      bid = validItems[0].businessId;
    }

    if (!bid) {
      showToast(t("Iltimos, avval biznesni tanlang"), 'error');
      return;
    }

    const total = validItems.reduce((s, i) => s + (i.price * i.quantity), 0);
    const clientId = document.getElementById('sale-client-id').value;
    const cash = parseFloat(document.getElementById('sale-cash').value) || 0;
    const card = parseFloat(document.getElementById('sale-card').value) || 0;
    const click = parseFloat(document.getElementById('sale-click').value) || 0;
    const debt = parseFloat(document.getElementById('sale-debt').value) || 0;

    const currentTotal = validItems.reduce((s, i) => s + (i.price * i.quantity), 0);
    const savedTotal = savedBatchItems.reduce((s, i) => s + (i.price * i.quantity), 0);
    const overallTotal = currentTotal + savedTotal;

    const overallPaidSoFar = cumulativePayments.cash + cumulativePayments.card + cumulativePayments.click;
    const currentPayments = cash + card + click;

    if (overallPaidSoFar + currentPayments > overallTotal) {
      showToast(t('"JAMI" dan katta summani kirita olmaysiz!'), 'error');
      const totalValEl = document.getElementById('sale-total-value');
      if (totalValEl) {
        totalValEl.classList.add('shake');
        setTimeout(() => totalValEl.classList.remove('shake'), 500);
      }
      return;
    }

    if (!currentTotalTransactionID) {
      // Create first TotalTransaction
      const resp = await api.post('/transactions', {
        businessId: bid,
        total: total,
        cash: cash,
        card: card,
        click: click,
        debt: debt,
        clientId: clientId ? parseInt(clientId) : null,
        description: document.getElementById('sale-desc').value.trim(),
        items: validItems.map(i => ({
          productId: parseInt(i.productId),
          productQuantity: i.quantity,
          productPrice: i.price,
          businessId: i.businessId
        }))
      });
      currentTotalTransactionID = resp.id;
      cumulativePayments.cash = cash;
      cumulativePayments.card = card;
      cumulativePayments.click = click;
      cumulativePayments.debt = debt;
    } else {
      // Add items to existing one
      await api.post(`/transactions/${currentTotalTransactionID}/items?businessId=${bid}`,
        validItems.map(i => ({
          productId: parseInt(i.productId),
          productQuantity: i.quantity,
          productPrice: i.price,
          businessId: i.businessId
        }))
      );
      // Track payments cumulatively
      cumulativePayments.cash += cash;
      cumulativePayments.card += card;
      cumulativePayments.click += click;
      cumulativePayments.debt += debt;
    }

    // Success! Update local lists
    savedBatchItems = [...savedBatchItems, ...validItems];
    saleItems = [];

    // Reset payment fields for THIS batch
    document.getElementById('sale-cash').value = 0;
    document.getElementById('sale-card').value = 0;
    document.getElementById('sale-click').value = 0;

    renderSaleItems();
    renderSavedBatches();
    showToast(t("Xarid saqlandi"), 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderSavedBatches() {
  const container = document.getElementById('sale-batches-container');
  if (!container) return;

  if (savedBatchItems.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div style="background: var(--bg-glass); padding: 10px; border-radius: 8px; border: 1px solid var(--border); font-size:12px;">
      <div style="font-weight:bold; margin-bottom:5px; opacity:0.8;">${t("Saqlangan mahsulotlar")}:</div>
      <div style="display:flex; flex-wrap:wrap; gap:5px;">
        ${savedBatchItems.map(item => `
          <span style="background:var(--primary-glass); color:var(--primary); padding:2px 8px; border-radius:10px; font-weight:600;">
            ${escapeHtml(item.name)} x ${item.quantity}
          </span>
        `).join('')}
      </div>
    </div>
  `;

  const cumulativeEl = document.getElementById('cumulative-total');
  if (cumulativeEl) {
    const cumulative = savedBatchItems.reduce((s, i) => s + (i.price * i.quantity), 0);
    cumulativeEl.textContent = `${t("Avval saqlangan")}: ${formatPrice(cumulative)} ${t("so'm")}`;
  }
}

async function finalizeSale(e) {
  if (e) e.preventDefault();

  const cash = parseFloat(document.getElementById('sale-cash').value) || 0;
  const card = parseFloat(document.getElementById('sale-card').value) || 0;
  const click = parseFloat(document.getElementById('sale-click').value) || 0;
  const discount = parseFloat(document.getElementById('sale-discount').value) || 0;

  const currentTotal = saleItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  const savedTotal = savedBatchItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  const overallTotal = currentTotal + savedTotal;
  const payableTotal = overallTotal - discount;

  const overallPaidSoFar = cumulativePayments.cash + cumulativePayments.card + cumulativePayments.click;

  if (overallPaidSoFar + cash + card + click > payableTotal + 0.01) {
    showToast(t('"JAMI" dan katta summani kirita olmaysiz!'), 'error');
    return;
  }

  try {
    showToast(t("Yakunlanmoqda..."), 'info');
    let bid = getSelectedBusinessId();

    // Fallback: If no business is selected in the UI (e.g., "All" is selected),
    // use the business of the first item in the sale.
    if (!bid) {
      if (saleItems.length > 0) bid = saleItems[0].businessId;
      else if (savedBatchItems.length > 0) bid = savedBatchItems[0].businessId;
    }

    if (!bid) {
      showToast(t("Iltimos, avval biznesni tanlang"), 'error');
      return;
    }

    const clientId = document.getElementById('sale-client-id').value;
    const desc = document.getElementById('sale-desc').value.trim();
    const cashbackUsed = parseFloat(document.getElementById('sale-cashback-used')?.value || 0) || 0;
    const pointsUsedAmount = parseFloat(document.getElementById('sale-points-used')?.value || 0) || 0;
    const debt = Math.max(0, payableTotal - (overallPaidSoFar + cash + card + click + cashbackUsed + pointsUsedAmount));

    // Calculate first batch total or just use it
    if (!currentTotalTransactionID) {
      // Create TotalTransaction with everything
      const resp = await api.post('/transactions', {
        businessId: bid,
        total: overallTotal,
        cash: cash,
        card: card,
        click: click,
        debt: debt,
        discount: discount,
        useCashbackAmount: cashbackUsed,
        usePointsAmount: pointsUsedAmount,
        clientId: clientId ? parseInt(clientId) : null,
        description: desc,
        items: saleItems.map(i => ({
          productId: parseInt(i.productId),
          productQuantity: i.quantity,
          productPrice: i.price,
          businessId: i.businessId
        }))
      });
      currentTotalTransactionID = resp.id;
    } else {
      // We already have some batches saved. 
      // 1. Add current items as a batch
      if (saleItems.length > 0) {
        await api.post(`/transactions/${currentTotalTransactionID}/items?businessId=${bid}`,
          saleItems.map(i => ({
            productId: parseInt(i.productId),
            productQuantity: i.quantity,
            productPrice: i.price,
            businessId: i.businessId
          }))
        );
      }
      // 2. Update the final TotalTransaction with new payments
      await api.put(`/transactions/${currentTotalTransactionID}`, {
        total: overallTotal,
        cash: cumulativePayments.cash + cash,
        card: cumulativePayments.card + card,
        click: cumulativePayments.click + click,
        debt: debt,
        discount: discount,
        usePointsAmount: pointsUsedAmount,
        clientId: clientId ? parseInt(clientId) : null,
        description: desc,
      });
    }

    showToast(t('Sotuv muvaffaqiyatli yakunlandi!'), 'success');
    
    // Reset sale state and return to step 1
    saleItems = [];
    savedBatchItems = [];
    currentTotalTransactionID = null;
    cumulativePayments = { cash: 0, card: 0, click: 0, debt: 0 };
    
    if (document.getElementById('sale-step-1')) {
      document.getElementById('sale-step-1').style.display = 'block';
      document.getElementById('sale-step-2').style.display = 'none';
      document.getElementById('step-1-indicator').classList.add('active');
      document.getElementById('step-2-indicator').classList.remove('active');
      
      const cashInp = document.getElementById('sale-cash');
      const cardInp = document.getElementById('sale-card');
      const clickInp = document.getElementById('sale-click');
      if (cashInp) cashInp.value = 0;
      if (cardInp) cardInp.value = 0;
      if (clickInp) clickInp.value = 0;
      const discountInp = document.getElementById('sale-discount');
      if (discountInp) discountInp.value = 0;
      
      const clientInp = document.getElementById('sale-client-search');
      if (clientInp) clientInp.value = '';
      const clientIdInp = document.getElementById('sale-client-id');
      if (clientIdInp) clientIdInp.value = '';
      
      const descInp = document.getElementById('sale-desc');
      if (descInp) descInp.value = '';
      
      renderSaleItems();
      updateSaleTotal();
      
      const searchInp = document.getElementById('sale-product-search');
      if (searchInp) {
        searchInp.value = '';
        searchInp.focus();
      }
    } else {
        closeModal();
    }
    renderTransactions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function viewTransactionItems(ids) {
  if (!Array.isArray(ids)) ids = [ids];
  try {
    showToast(t('Tafsilotlar yuklanmoqda...'), 'info');

    const allTrans = await Promise.all(ids.map(id => api.get(`/transactions/${id}`)));
    const allItems = await Promise.all(ids.map(id => api.get(`/transactions/${id}/items`)));
    
    const list = allItems.filter(items => items !== null).flat();
    
    // Sum up totals from all transactions in the set
    const totalCashback = allTrans.reduce((s, t) => s + (t.cashbackUsed || 0), 0);
    const totalPointsMoney = allTrans.reduce((s, t) => s + (t.pointsUsed || 0), 0);
    const totalPointsEarned = allTrans.reduce((s, t) => s + (t.pointsEarned || 0), 0);
    const totalCashbackEarned = allTrans.reduce((s, t) => s + (t.cashbackEarned || 0), 0);
    const totalDiscount = allTrans.reduce((s, t) => s + (t.discount || 0), 0);
    const overallSubtotal = list.reduce((s, item) => s + ((item.productPrice || 0) * (item.productQuantity || 0)), 0);

    openModal(`
      <div class="modal-header">
        <h3 style="color: var(--text);">${t("Sotuv tafsilotlari")}</h3>
        <span style="opacity:0.6; color: var(--text-muted);">№: ${ids.join(', ')}</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="background: var(--accent-gradient) !important; color: white !important; width: 40px; text-align: center;">№</th>
              <th style="text-align: center; color: white !important;">${t("Mahsulot nomi")}</th>
              <th style="text-align: center; color: white !important;">${t("Narxi")}</th>
              <th style="text-align: center; color: white !important;">${t("Soni")}</th>
              <th style="text-align: center; color: white !important;">${t("Jami")}</th>
              <th style="background: var(--accent-gradient) !important; text-align: center; color: white !important;">${t("Amallar")}</th>
            </tr>
          </thead>
          <tbody>
            ${list.length === 0 ? `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">${t("Ma'lumot yo'q")}</td></tr>` :
        list.map((item, i) => {
          const pName = item.productName || `${t("Mahsulot")} #${item.productId}`;
          return `
                <tr>
                  <td style="color: var(--text);">${i + 1}</td>
                  <td style="font-weight:600; color: var(--text);">${escapeHtml(pName)} ${item.productBarcode ? `<small style="opacity:0.5">(${item.productBarcode})</small>` : ''}</td>
                  <td class="price" style="text-align:right; color: var(--text);">${formatPrice(item.productPrice)}</td>
                  <td style="text-align:center; color: var(--text);">${item.productQuantity}</td>
                  <td class="price" style="text-align:right; color: var(--text);"><strong>${formatPrice(item.productPrice * item.productQuantity)}</strong></td>
                  <td style="text-align:center;">
                    <div style="display:flex; gap:5px; justify-content:center;">
                      <button class="btn btn-ghost btn-sm" onclick='editTransactionItem(${item.id}, ${JSON.stringify(ids)})' title="${t("Tahrirlash")}">✏️</button>
                      <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick='deleteTransactionItem(${item.id}, ${JSON.stringify(ids)})' title="${t("O'chirish")}">🗑️</button>
                    </div>
                  </td>
                </tr>`;
        }).join('')}
          </tbody>
          ${list.length > 0 ? `
          <tfoot>
            <tr style="background: rgba(0, 0, 0, 0.02);">
              <td colspan="3" style="text-align:right; font-size: 13px; color: var(--text-muted);">${t("Mahsulotlar jami")}:</td>
              <td style="text-align:center; font-size: 13px; color: var(--text-muted);">${list.reduce((sum, item) => sum + (item.productQuantity || 0), 0)}</td>
              <td style="text-align:right; font-size: 13px; color: var(--text);">${formatPrice(overallSubtotal)} ${t("so'm")}</td>
              <td></td>
            </tr>
            ${totalDiscount > 0 ? `
            <tr style="background: rgba(0, 0, 0, 0.02);">
              <td colspan="4" style="text-align:right; font-size: 13px; color: var(--text-muted);">${t("Chegirma")}:</td>
              <td style="text-align:right; font-size: 13px; color: var(--danger);">- ${formatPrice(totalDiscount)} ${t("so'm")}</td>
              <td></td>
            </tr>` : ''}
            ${totalCashback > 0 ? `
            <tr style="background: rgba(0, 0, 0, 0.02);">
              <td colspan="4" style="text-align:right; font-size: 13px; color: var(--text-muted);">${t("Keshbek ishlatildi")}:</td>
              <td style="text-align:right; font-size: 13px; color: var(--success);">- ${formatPrice(totalCashback)} ${t("so'm")}</td>
              <td></td>
            </tr>` : ''}
            ${totalPointsMoney > 0 ? `
            <tr style="background: rgba(0, 0, 0, 0.02);">
              <td colspan="4" style="text-align:right; font-size: 13px; color: var(--text-muted);">${t("Ball ishlatildi")}:</td>
              <td style="text-align:right; font-size: 13px; color: var(--accent);">- ${formatPrice(totalPointsMoney)} ${t("so'm")}</td>
              <td></td>
            </tr>` : ''}
            ${totalCashbackEarned > 0 ? `
            <tr style="background: rgba(0, 0, 0, 0.02);">
              <td colspan="4" style="text-align:right; font-size: 13px; color: var(--text-muted);">${t("To'plangan keshbek")}:</td>
              <td style="text-align:right; font-size: 13px; color: var(--success);">+ ${formatPrice(totalCashbackEarned)}</td>
              <td></td>
            </tr>` : ''}
            ${totalPointsEarned > 0 ? `
            <tr style="background: rgba(0, 0, 0, 0.02);">
              <td colspan="4" style="text-align:right; font-size: 13px; color: var(--text-muted);">${t("To'plangan ballar")}:</td>
              <td style="text-align:right; font-size: 13px; color: var(--accent);">+ ${totalPointsEarned}</td>
              <td></td>
            </tr>` : ''}
            <tr style="background: rgba(0, 0, 0, 0.05); font-weight: bold;">
              <td colspan="4" style="text-align:right; font-size: 14px; color: var(--text);">${t("Jami to'lov")}:</td>
              <td class="price" style="text-align:right; font-size: 15px; color: var(--primary);">${formatPrice(overallSubtotal - totalDiscount - totalCashback - totalPointsMoney)} ${t("so'm")}</td>
              <td></td>
            </tr>
          </tfoot>` : ''}
        </table>
      </div>
      <div class="modal-footer" style="justify-content: space-between; gap: 10px; margin-top:20px;">
        <div style="display:flex; gap:10px;">
          <button class="btn btn-ghost btn-sm" onclick='downloadTransactionPdf(${JSON.stringify(ids)})'>📄 PDF</button>
          <button class="btn btn-ghost btn-sm" onclick='downloadTransactionJpg(${JSON.stringify(ids)})'>🖼️ JPG</button>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">${t("Bekor qilish")}</button>
          <button class="btn btn-primary btn-sm" onclick='sendTransactionToTelegram(${JSON.stringify(ids)})'>📤 Telegram</button>
        </div>
      </div>
    `);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function editTransactionItem(itemId, transIds) {
  try {
    const item = await api.get(`/transactions/items/${itemId}`);
    if (!item) return;

    const newQty = prompt(t("Yangi miqdorni kiriting:"), item.productQuantity);
    if (newQty === null) return;
    
    const newPrice = prompt(t("Yangi narxni kiriting:"), item.productPrice);
    if (newPrice === null) return;

    await api.put(`/transactions/items/${itemId}`, {
      productQuantity: parseInt(newQty),
      productPrice: parseFloat(newPrice)
    });

    showToast(t("Muvaffaqiyatli yangilandi"), 'success');
    viewTransactionItems(transIds);
    renderTransactions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
window.editTransactionItem = editTransactionItem;

async function deleteTransactionItem(itemId, transIds) {
  if (!confirm(t("Ushbu mahsulotni sotuvdan o'chirishni tasdiqlaysizmi?"))) return;
  try {
    await api.delete(`/transactions/items/${itemId}`);
    showToast(t("Muvaffaqiyatli o'chirildi"), 'success');
    viewTransactionItems(transIds);
    renderTransactions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
window.deleteTransactionItem = deleteTransactionItem;


async function downloadTransactionPdf(ids, groupedTrans = null) {
  if (!Array.isArray(ids)) ids = [ids];
  const { jsPDF } = window.jspdf;
  const bid = getSelectedBusinessId();
  try {
    showToast(t('PDF tayyorlanmoqda...'), 'info');

    // Fetch necessary data
    const businesses = await api.get('/businesses/my').catch(() => []);
    const [allItems, clientsResults] = await Promise.all([
      Promise.all(ids.map(id => api.get(`/transactions/${id}/items`))),
      Promise.all(businesses.map(b => api.get(`/clients?businessId=${b.id}`).catch(() => [])))
    ]);
    const clients = clientsResults.flat();
    const transItems = allItems.flat();

    // Use the provided grouped metadata or find the first one
    const transaction = groupedTrans || allTransactionsList.find(t => t.id === ids[0]);

    const doc = new jsPDF();
    let fontName = 'helvetica';
    // ... font loading logic ...
    try {
      const fontUrl = '/fonts/Roboto-Regular.ttf';
      const response = await fetch(fontUrl);
      if (response.ok) {
        const blob = await response.blob();
        const base64Font = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(blob);
        });

        doc.addFileToVFS('Roboto-Regular.ttf', base64Font);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto');
        fontName = 'Roboto';
      }
    } catch (e) { }

    // Header info (Left Top)
    doc.setFont(fontName);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const client = clients && transaction.clientId ? clients.find(c => c.id === transaction.clientId) : null;

    let currentY = 15;
    if (client) {
      doc.text(`${t("Mijoz")}: ${client.fullName}`, 15, currentY); currentY += 6;
      doc.text(`${t("Manzil")}: ${client.address || "-"}`, 15, currentY); currentY += 6;
      doc.text(`${t("Telefon")}: ${client.phone || "-"}`, 15, currentY);
    } else {
      const clientName = transaction.clientName || transaction.clientNumber || t('Begona xaridor');
      doc.text(`${t("Mijoz")}: ${clientName}`, 10, currentY); currentY += 6;
      doc.text(`${t("Telefon")}: ${transaction.clientNumber || "-"}`, 10, currentY);
    }

    // Table Data
    const tableData = transItems.map((item, index) => {
      const pName = item.productName || `${t("Mahsulot")} #${item.productId}`;
      return [
        index + 1,
        pName,
        item.productQuantity,
        formatPrice(item.productPrice),
        formatPrice(item.productPrice * item.productQuantity),
        item.productBarcode || "-"
      ];
    });

    const totalQty = transItems.reduce((sum, item) => sum + (item.productQuantity || 0), 0);
    const totalAmount = transItems.reduce((sum, item) => sum + ((item.productPrice || 0) * (item.productQuantity || 0)), 0);

    // AutoTable
    doc.autoTable({
      startY: 35,
      head: [['№', t('Mahsulot nomi'), t('Soni'), t('Narxi'), t('Jami'), t('Barcode')]],
      body: tableData,
      foot: [['', t('Jami') + ':', totalQty, '', formatPrice(totalAmount), '']],
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'normal', font: fontName, halign: 'center' },
      footStyles: { fillColor: [240, 240, 240], textColor: [239, 68, 68], fontStyle: 'bold', font: fontName, halign: 'center' },
      styles: { fontSize: 10, textColor: 0, font: fontName, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' }
      }
    });

    // Totals section
    let finalY = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`${t("Naqd")}: ${formatPrice(transaction.cash)}`, 15, finalY); finalY += 5;
    doc.text(`${t("Karta")}: ${formatPrice(transaction.card)}`, 15, finalY); finalY += 5;
    doc.text(`${t("Click")}: ${formatPrice(transaction.click || 0)}`, 15, finalY); finalY += 5;
    doc.text(`${t("Qarz")}: ${formatPrice(transaction.debt)}`, 15, finalY);

    // Footer subtle
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`${formatDateTime(transaction.createdAt)} ${t("da generatsiya qilindi")} [IDs: ${ids.join(',')}]`, 10, 285);

    doc.text(`${t("Sotuv tafsilotlari")}` + ` ` + `№: ${ids.join(', ')}`, 105, 10, { align: "center" });
    doc.save(`${t("Sotuv_")}${ids.join('_')}.pdf`);
    showToast(t('PDF yuklab olindi'));
    return doc.output('blob'); // Return for Telegram use
  } catch (err) {
    console.error(err);
    showToast(t('PDF yarata olmadim: ') + err.message, 'error');
  }
}

async function downloadTransactionJpg(ids) {
  if (!Array.isArray(ids)) ids = [ids];
  const id = ids[0];
  try {
    const modal = document.querySelector('.modal');
    if (!modal) return;

    // Temporarily hide buttons for clean screenshot
    const footer = modal.querySelector('.modal-footer');
    if (footer) footer.style.display = 'none';

    const canvas = await html2canvas(modal, {
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary'),
      scale: 2
    });

    if (footer) footer.style.display = 'flex';

    const link = document.createElement('a');
    link.download = `Sotuv_${id}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
    showToast(t('Rasm yuklab olindi'));

    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  } catch (err) {
    showToast(t('Rasm yarata olmadim: ') + err.message, 'error');
  }
}

async function sendTransactionToTelegram(ids) {
  if (!Array.isArray(ids)) ids = [ids];
  try {
    showToast(t('Telegramga yuborilmoqda...'), 'info');

    // 1. Generate PDF blob
    const pdfBlob = await downloadTransactionPdf(ids);

    if (!pdfBlob) {
      throw new Error("Could not generate receipt files");
    }

    // 3. Send to API (using the first ID as reference for the endpoint)
    const formData = new FormData();
    if (pdfBlob) formData.append('pdf', pdfBlob, `Receipt_${ids[0]}.pdf`);

    const resp = await api.post(`/transactions/${ids[0]}/send-telegram`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    showToast(t('Telegramga yuborildi!'));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function resetSaleForm() {
  saleItems = [];
  const clientSearch = document.getElementById('sale-client-search');
  if (clientSearch) clientSearch.value = '';
  const prodSearch = document.getElementById('sale-product-search');
  if (prodSearch) prodSearch.value = '';
  const cashInput = document.getElementById('sale-cash');
  if (cashInput) cashInput.value = '';
  const cardInput = document.getElementById('sale-card');
  if (cardInput) cardInput.value = '';
  const clickInput = document.getElementById('sale-click');
  if (clickInput) clickInput.value = '';

  renderSaleItems();
  updateSaleTotal();
  showToast(t("Forma tozalandi"));
}

function addSaleProductByBarcode(barcode) {
  if (!barcode) return;
  const product = saleProducts.find(p => p.barcode === barcode);
  if (product) {
    addSaleProductById(product.id);
  } else {
    showToast(t("Mahsulot topilmadi"), 'warning');
  }
}

// Global exports
window.addToSaleBatch = addToSaleBatch;
window.renderSavedBatches = renderSavedBatches;
window.finalizeSale = finalizeSale;
window.renderTransactions = renderTransactions;
window.renderTransactionsTable = renderTransactionsTable;
window.filterTransactions = filterTransactions;
window.openSaleModal = openSaleModal;
window.addSaleProductByBarcode = addSaleProductByBarcode;
window.searchSaleProduct = searchSaleProduct;
window.addSaleProductById = addSaleProductById;
window.renderSaleItems = renderSaleItems;
window.removeSaleItem = removeSaleItem;
window.onSaleQtyChange = onSaleQtyChange;
window.onSalePriceChange = onSalePriceChange;
window.updateSaleTotal = updateSaleTotal;
window.updateSalePayment = updateSalePayment;
window.viewTransactionItems = viewTransactionItems;
window.downloadTransactionPdf = downloadTransactionPdf;
window.downloadTransactionJpg = downloadTransactionJpg;
window.sendTransactionToTelegram = sendTransactionToTelegram;
window.deleteTransaction = deleteTransaction;
window.transactionPage = transactionPage;
window.allTransactionsList = allTransactionsList;
window.currentTransactions = currentTransactions;
window.saleProducts = saleProducts;
window.saleItems = saleItems;
window.onSaleClientChange = function(clientId) {
  const bid = getSelectedBusinessId();
  const bonusSection = document.getElementById('bonus-section');
  const bonusCards = document.getElementById('bonus-cards-container');
  const cbInput = document.getElementById('sale-cashback-used');
  const ptInput = document.getElementById('sale-points-used');

  // Reset
  cbInput.value = 0;
  ptInput.value = 0;
  if (bonusSection) bonusSection.style.display = 'none';
  if (bonusCards) bonusCards.innerHTML = '';

  if (!clientId) {
    updateSalePayment();
    return;
  }
  
  const client = globalClients.find(c => c.id == clientId);
  if (!client) return;

  if (bonusSection) bonusSection.style.display = 'block';

  // 1. Cashback Card
  const cbBalance = client.cashbackBalance || 0;
  const cbCard = document.createElement('div');
  cbCard.className = 'bonus-card';
  cbCard.style = `background:var(--bg-glass); border:1px solid var(--border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px;`;
  cbCard.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span style="font-size:11px; opacity:0.7;">💰 ${t("Keshbek")}</span>
      <span style="font-size:12px; font-weight:800; color:var(--success);">${formatPrice(cbBalance)} ${t("so'm")}</span>
    </div>
    <div style="position:relative;">
      <input type="number" id="cb-manual-input" class="form-control" style="width:100%; height:36px; font-size:13px; font-weight:700; padding-right:85px; color:var(--success) !important; background:var(--bg-input) !important;" value="0" step="0.01">
      <button type="button" id="btn-cb-all" class="btn btn-primary" style="position:absolute; right:4px; top:4px; height:28px; font-size:10px; padding:0 10px;">${t("Hammasi")}</button>
    </div>
  `;
  if (bonusCards) bonusCards.appendChild(cbCard);

  const cbManual = cbCard.querySelector('#cb-manual-input');
  const btnCbAll = cbCard.querySelector('#btn-cb-all');
  cbManual.oninput = (e) => { cbInput.value = Math.min(parseFloat(e.target.value) || 0, cbBalance); updateSalePayment(); };
  btnCbAll.onclick = () => { cbManual.value = cbBalance; cbInput.value = cbBalance; updateSalePayment(); };

  // 2. Points Card (Redesigned with Checkboxes)
  const ptCard = document.createElement('div');
  ptCard.className = 'bonus-card';
  ptCard.style = `background:var(--bg-glass); border:1px solid var(--border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:10px;`;
  
  const pointsBalance = client.pointsBalance || 0;
  let pointValue = 100; 
  let earnRate = 10000; 

  ptCard.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:8px;">
      <span style="font-size:11px; font-weight:700; color:var(--accent);">⭐ ${t("Ballar")}</span>
      <span style="font-size:12px; font-weight:800;">${pointsBalance}</span>
    </div>
    
    <div style="display:flex; flex-direction:column; gap:8px;">
      <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px;">
        <input type="checkbox" id="pt-use-check" style="width:16px; height:16px;">
        <span>${t("Ballarni ishlatish")}</span>
      </label>
      <div id="pt-spend-area" style="display:none; position:relative; margin-left:24px;">
        <input type="number" id="pt-spend-input" class="form-control" style="width:100%; height:32px; font-size:12px; padding-right:70px; color:var(--accent) !important;" value="0">
        <button type="button" id="btn-pt-spend-all" class="btn btn-primary" style="position:absolute; right:3px; top:3px; height:26px; font-size:9px; padding:0 8px; background:var(--accent); border:none;">${t("Hammasi")}</button>
      </div>

      <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px;">
        <input type="checkbox" id="pt-earn-check" checked style="width:16px; height:16px;">
        <span>${t("Ballar to'plash")}</span>
      </label>
      <div id="pt-earn-area" style="margin-left:24px; font-size:11px; color:var(--success);">
        ${t("To'planadigan ballar")}: <strong id="pt-earn-preview">0</strong>
      </div>
    </div>
  `;
  if (bonusCards) bonusCards.appendChild(ptCard);

  const ptUseCheck = ptCard.querySelector('#pt-use-check');
  const ptSpendArea = ptCard.querySelector('#pt-spend-area');
  const ptSpendInput = ptCard.querySelector('#pt-spend-input');
  const btnPtSpendAll = ptCard.querySelector('#btn-pt-spend-all');
  const ptEarnCheck = ptCard.querySelector('#pt-earn-check');
  const ptEarnPreview = ptCard.querySelector('#pt-earn-preview');

  ptUseCheck.onchange = () => {
    ptSpendArea.style.display = ptUseCheck.checked ? 'block' : 'none';
    if (!ptUseCheck.checked) { ptSpendInput.value = 0; ptInput.value = 0; updateSalePayment(); }
  };
  ptSpendInput.oninput = (e) => { ptInput.value = Math.min(parseFloat(e.target.value) || 0, pointsBalance * pointValue); updateSalePayment(); };
  btnPtSpendAll.onclick = () => { ptSpendInput.value = pointsBalance * pointValue; ptInput.value = pointsBalance * pointValue; updateSalePayment(); };

  window.updatePointsEarnedPreview = () => {
    if (!ptEarnCheck.checked) { ptEarnPreview.textContent = '0'; return; }
    const cash = parseFloat(document.getElementById('sale-cash').value) || 0;
    const card = parseFloat(document.getElementById('sale-card').value) || 0;
    const click = parseFloat(document.getElementById('sale-click').value) || 0;
    ptEarnPreview.textContent = Math.floor((cash + card + click) / earnRate);
  };
  ptEarnCheck.onchange = window.updatePointsEarnedPreview;

  let targetBid = bid;
  if (!targetBid && saleItems.length > 0) targetBid = saleItems[0].businessId;
  if (targetBid) {
      api.get(`/businesses/${targetBid}`).then(business => {
        if (business) {
          pointValue = business.pointValue || 100;
          earnRate = business.pointsRate || 10000;
          if (window.updatePointsEarnedPreview) window.updatePointsEarnedPreview();
        }
      });
  }
  updateSalePayment();
};
