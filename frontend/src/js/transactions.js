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
    const transactions = await api.get(`/transactions?businessId=${bid}`);
    allTransactionsList = transactions || [];
    renderTransactionsTable(allTransactionsList);
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><h4>${t("Xatolik")}</h4><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function renderTransactionsTable(list) {
  if (list) {
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

    currentTransactions = Array.from(groupedMap.values());
    window.transactionPage = 1;
  }

  const limit = 15;
  const totalPages = Math.ceil(currentTransactions.length / limit);
  if (window.transactionPage > totalPages) window.transactionPage = totalPages || 1;
  const start = (window.transactionPage - 1) * limit;
  const paginated = currentTransactions.slice(start, start + limit);

  const content = document.getElementById('page-content');

  const items = paginated.length === 0
    ? `<div class="empty-state"><div class="icon">🛒</div><h4>${t("Sotuvlar yo'q")}</h4></div>`
    : paginated.map((trans, i) => {
      const hasDebt = trans.debt > 0;
      const idsJson = JSON.stringify(trans.ids);
      return `
        <div class="acc-item" id="trans-acc-${trans.id}">
          <div class="acc-header" onclick="toggleAcc('trans-acc-${trans.id}')">
            <div class="acc-header-left">
              <div class="acc-avatar acc-avatar-indigo" style="${hasDebt ? 'background:linear-gradient(135deg,#EF4444,#DC2626)' : ''}">🛒</div>
              <div>
                <div class="acc-title">№ ${start + i + 1} — ${formatDateTime(trans.createdAt)}</div>
                <div class="acc-subtitle">
                  ${trans.clientName ? `<strong>${escapeHtml(trans.clientName)}</strong>` : (trans.clientNumber ? escapeHtml(trans.clientNumber) : t('Begona xaridor'))}
                  <span style="opacity:0.6; margin-left:8px;">№: ${trans.ids.join(',')}</span>
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
            </div>
          </div>
        </div>`;
    }).join('');

  content.innerHTML = `
    <div class="acc-list">${items}</div>
    ${renderPageControls('transactionPage', totalPages, 'renderTransactionsTable()')}
    <div class="page-bottom-bar">
      <div class="search-box" style="flex:1; max-width:none;">
        <span class="search-icon" style="color:rgba(255,255,255,0.6);">🔍</span>
        <input type="text" placeholder="${t("Mijoz bo'yicha qidirish...")}" id="transaction-search"
          value="${escapeHtml(document.getElementById('transaction-search')?.value || '')}"
          oninput="filterTransactions(this.value)"
          style="background:rgba(255,255,255,0.15); border-color:rgba(255,255,255,0.25); color:white;">
      </div>
      <button class="btn btn-primary" onclick="openSaleModal()">${t("Qo'shish")}</button>
    </div>
  `;
}

function filterTransactions(query) {
  const q = query.toLowerCase();
  const filtered = allTransactionsList.filter(trans =>
    (trans.clientNumber && trans.clientNumber.toLowerCase().includes(q)) ||
    (trans.clientName && trans.clientName.toLowerCase().includes(q))
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


async function openSaleModal() {
  const bid = getSelectedBusinessId();
  try {
    const businesses = await api.get('/businesses/my').catch(() => []);
    const [products, clientsResults] = await Promise.all([
      api.get('/products/my'),
      Promise.all(businesses.map(b => api.get(`/clients?businessId=${b.id}`).catch(() => [])))
    ]);

    const clients = clientsResults.flat();

    saleProducts = (products || []).filter(p => !p.isDeleted && p.quantity > 0).map(p => {
       const b = (businesses || []).find(bus => bus.id === p.businessId);
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
          <div class="search-box" style="max-width: 100%;">
            <span class="search-icon">🔍</span>
            <input type="text" class="form-control" id="sale-product-search" placeholder="${t("Qidirish (Nomi, Barcode)...")}" oninput="searchSaleProduct(this.value)" autocomplete="off">
          </div>
          <div id="sale-search-results" class="search-results-dropdown"></div>
        </div>

        <div id="sale-batches-container" style="margin-bottom: 15px; max-height: 120px; overflow-y: auto;"></div>
        <div id="sale-items-container" style="min-height: 200px; max-height: 350px; overflow-y: auto;"></div>
        
        <div class="modal-footer" style="margin-top: 25px; border-top: 1px solid var(--border); padding-top: 20px;">
          <div id="sale-total-mini" style="font-size: 18px; font-weight: 700; color: var(--primary);">0 ${t("so'm")}</div>
          <button type="button" class="btn btn-primary" onclick="goToSalePaymentStep()" style="padding: 10px 30px;">${t("To'lovga o'tish")} →</button>
        </div>
      </div>

      <div id="sale-step-2" class="sale-segment" style="display:none;">
        <div style="background: var(--bg-glass); padding: 20px; border-radius: 16px; border: 1px solid var(--border); margin-bottom: 25px; display: flex; flex-direction: column; align-items: center;">
          <span style="font-size: 13px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px;">${t("Jami summa")}</span>
          <span id="sale-total-value" style="font-size: 36px; font-weight: 800; color: var(--success); margin: 5px 0;">0 ${t("so'm")}</span>
          <div id="cumulative-total" style="font-size: 11px; opacity: 0.6;"></div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
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
        </div>

        <div id="payment-error-msg" style="color: #EF4444; font-size: 13px; font-weight: 700; margin: 15px 0; display: none; text-align: center; background: rgba(239, 68, 68, 0.1); padding: 8px; border-radius: 8px;">
          ⚠️ ${t('"JAMI" dan katta summani kirita olmaysiz!')}
        </div>

        <div class="form-row" style="margin-top:10px">
          <div class="form-group" style="flex: 1.5;">
            <label>${t("Mijoz (ixtiyoriy)")}</label>
            <select class="form-control" id="sale-client">
              <option value="">${t("Tanlang...")}</option>
              ${globalClients.map(c => `<option value="${c.id}">${escapeHtml(c.fullName)} — ${escapeHtml(c.phone)}</option>`).join('')}
            </select>
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
          padding: 10px 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid var(--border); transition: 0.2s;
        }
        .search-result-item:hover { background: var(--bg-glass); }
        .form-control-lg { padding: 12px; font-size: 16px; font-weight: 600; }
      </style>
    `);

    renderSaleItems();
    setTimeout(() => document.getElementById('sale-product-search').focus(), 150);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

window.goToSalePaymentStep = function() {
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

window.backToSaleProducts = function() {
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

  const q = query.toLowerCase();
  const filtered = saleProducts.filter(p =>
    p.name.toLowerCase().includes(q) || (p.barcode && p.barcode.includes(q))
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
          <div style="font-weight: 700; color: ${p.quantity <= 0 ? '#EF4444' : 'var(--success)'};">${formatPrice(p.price)}</div>
          <div style="font-size: 11px; font-weight: 600; color: ${p.quantity <= 10 ? '#EF4444' : 'inherit'};">
            ${p.quantity} ${t("dona")}
          </div>
        </div>
      </div>
    `).join('');
  }
  dropdown.style.display = 'block';
}

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
    saleItems.push({ 
      productId: id, 
      quantity: 1, 
      price: product.price, 
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
        <thead style="background: var(--bg-glass);">
          <tr>
            <th style="padding: 10px; text-align: left; font-size: 11px;">${t("Mahsulot")}</th>
            <th style="padding: 10px; text-align: center; font-size: 11px; width: 80px;">${t("Soni")}</th>
            <th style="padding: 10px; text-align: right; font-size: 11px; width: 120px;">${t("Narxi")}</th>
            <th style="padding: 10px; text-align: right; font-size: 11px; width: 120px;">${t("Jami")}</th>
            <th style="padding: 10px; width: 40px;"></th>
          </tr>
        </thead>
        <tbody>
          ${saleItems.map((item, idx) => `
            <tr style="border-top: 1px solid var(--border);">
              <td style="padding: 8px 10px;">
                <div style="font-weight: 600; font-size: 14px;">${escapeHtml(item.name || 'Unknown')}</div>
                <div style="font-size: 10px; opacity: 0.6;">🏢 ${escapeHtml(item.businessName)}</div>
              </td>
              <td style="padding: 8px 10px;">
                <input type="number" class="form-control" style="padding: 6px; text-align: center;" value="${item.quantity}" min="1" oninput="onSaleQtyChange(${idx}, this.value)">
              </td>
              <td style="padding: 8px 10px;">
                <input type="number" step="0.01" class="form-control" style="padding: 6px; text-align: right;" value="${item.price}" oninput="onSalePriceChange(${idx}, this.value)">
              </td>
              <td style="padding: 8px 10px; text-align: right;">
                <div id="item-total-${idx}" style="font-weight: 700; font-size: 14px;">${formatPrice(item.price * item.quantity)}</div>
              </td>
              <td style="padding: 8px 10px; text-align: center;">
                <button type="button" class="btn-remove" onclick="removeSaleItem(${idx})">✕</button>
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
  const total = saleItems.reduce((s, i) => s + (i.price * i.quantity), 0);
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
  
  const overallPaidSoFar = cumulativePayments.cash + cumulativePayments.card + cumulativePayments.click;
  const currentPayments = cash + card + click;
  const totalPaid = overallPaidSoFar + currentPayments;

  const debtEl = document.getElementById('sale-debt');
  const totalValEl = document.getElementById('sale-total-value');
  const errorEl = document.getElementById('payment-error-msg');

  if (totalPaid > overallTotal) {
    totalValEl.style.color = '#EF4444';
    debtEl.style.color = '#EF4444';
    if (errorEl) errorEl.style.display = 'block';
  } else {
    totalValEl.style.color = '';
    debtEl.style.color = 'var(--warning)';
    if (errorEl) errorEl.style.display = 'none';
  }

  // Debt is calculated for the whole transaction
  const remainingDebt = overallTotal - totalPaid;
  debtEl.value = Math.max(0, remainingDebt).toFixed(2);
}

async function addToSaleBatch() {
  const bid = getSelectedBusinessId();
  const validItems = saleItems.filter(i => i.productId);

  if (validItems.length === 0) {
    showToast(t('Kamida bitta mahsulot tanlang'), 'warning');
    return;
  }

  try {
    const total = validItems.reduce((s, i) => s + (i.price * i.quantity), 0);
    const clientId = document.getElementById('sale-client').value;
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

  const currentTotal = saleItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  const savedTotal = savedBatchItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  const overallTotal = currentTotal + savedTotal;
  
  const overallPaidSoFar = cumulativePayments.cash + cumulativePayments.card + cumulativePayments.click;
  
  if (overallPaidSoFar + cash + card + click > overallTotal + 0.01) {
    showToast(t('"JAMI" dan katta summani kirita olmaysiz!'), 'error');
    return;
  }

  try {
    showToast(t("Yakunlanmoqda..."), 'info');
    const bid = getSelectedBusinessId();
    const clientId = document.getElementById('sale-client').value;
    const desc = document.getElementById('sale-desc').value.trim();
    const debt = Math.max(0, overallTotal - (overallPaidSoFar + cash + card + click));

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
          clientId: clientId ? parseInt(clientId) : null,
          description: desc,
        });
    }

    showToast(t('Sotuv muvaffaqiyatli yakunlandi!'), 'success');
    closeModal();
    renderTransactions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function viewTransactionItems(ids) {
  if (!Array.isArray(ids)) ids = [ids];
  try {
    showToast(t('Tafsilotlar yuklanmoqda...'), 'info');

    // Fetch items for all IDs in the group and merge them
    const allItems = await Promise.all(ids.map(id => api.get(`/transactions/${id}/items`)));
    const list = allItems.filter(items => items !== null).flat();

    openModal(`
      <div class="modal-header">
        <h3>${t("Sotuv tafsilotlari")}</h3>
        <span style="opacity:0.6;">№: ${ids.join(', ')}</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr><th>#</th><th style="text-align:center">${t("Mahsulot nomi")}</th><th style="text-align:center">${t("Narxi")}</th><th style="text-align:center">${t("Soni")}</th><th style="text-align:center">${t("Jami")}</th></tr>
          </thead>
          <tbody>
            ${list.length === 0 ? `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">${t("Ma'lumot yo'q")}</td></tr>` :
        list.map((item, i) => {
          const pName = item.productName || `${t("Mahsulot")} #${item.productId}`;
          return `
                <tr>
                  <td>${i + 1}</td>
                  <td style="font-weight:600;">${escapeHtml(pName)} ${item.productBarcode ? `<small style="opacity:0.5">(${item.productBarcode})</small>` : ''}</td>
                  <td class="price" style="text-align:right">${formatPrice(item.productPrice)}</td>
                  <td style="text-align:center">${item.productQuantity}</td>
                  <td class="price" style="text-align:right"><strong>${formatPrice(item.productPrice * item.productQuantity)}</strong></td>
                </tr>`;
        }).join('')}
          </tbody>
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
        item.productPrice,
        (item.productPrice * item.productQuantity),
        item.productBarcode || "-"
      ];
    });

    // AutoTable
    doc.autoTable({
      startY: 35,
      head: [['#', t('Mahsulot nomi'), t('Soni'), t('Narxi'), t('Jami'), t('Barcode')]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'normal', font: fontName, halign: 'center' },
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

    doc.setFontSize(12);
    doc.setTextColor(239, 68, 68); // Red color
    doc.text(`${t("Jami summa")}: ${formatPrice(transaction.total)}`, 15, finalY);

    finalY += 10;
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

// Global exports
window.addToSaleBatch = addToSaleBatch;
window.renderSavedBatches = renderSavedBatches;
window.finalizeSale = finalizeSale;
window.renderTransactions = renderTransactions;
window.renderTransactionsTable = renderTransactionsTable;
window.filterTransactions = filterTransactions;
window.openSaleModal = openSaleModal;
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
window.transactionPage = transactionPage;
window.allTransactionsList = allTransactionsList;
window.currentTransactions = currentTransactions;
window.saleProducts = saleProducts;
window.saleItems = saleItems;
