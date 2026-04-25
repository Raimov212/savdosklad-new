import { api, showToast, formatPrice, escapeHtml, getSelectedBusinessId, toggleAcc, formatDateTime } from './api.js';
import { t } from './i18n.js';

// ==================== DEBTS MODULE ====================

window.activeDebtPage = 1;
window.paidDebtPage = 1;
let activeDebtsList = [];
let paidDebtsList = [];
let allDebtsSource = [];

async function renderDebts() {
  const content = document.getElementById('page-content');
  const bid = getSelectedBusinessId();

  if (!bid) {
    content.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><h4>${t("Avval biznes tanlang")}</h4></div>`;
    return;
  }

  try {
    const transactions = await api.get(`/transactions?businessId=${bid}`);
    allDebtsSource = transactions || [];

    // Process and segment debts
    activeDebtsList = [];
    paidDebtsList = [];

    allDebtsSource.forEach(trans => {
      // It's a debt if it currently has debt > 0
      if (trans.debt > 0) {
        activeDebtsList.push(trans);
      }
      // It's a paid debt if:
      // 1. It has a debtLimitDate (explicitly marked as debt)
      // 2. OR it has a clientId and was updated after creation (likely a debt that was paid later)
      else if (trans.debtLimitDate || (trans.clientId && new Date(trans.updatedAt) > new Date(new Date(trans.createdAt).getTime() + 1000))) {
        paidDebtsList.push(trans);
      }
    });

    renderDebtsTabs();
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><h4>${t("Xatolik")}</h4><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function renderDebtsTabs() {
  const content = document.getElementById('page-content');

  // Use session storage or simple state to remember which tab is open
  const currentTab = window.currentDebtTab || 'active';

  content.innerHTML = `
    <div style="margin-bottom: 24px; display: flex; justify-content: flex-start;">
      <div style="background: rgba(255,255,255,0.05); padding: 4px; border-radius: 12px; display: inline-flex; border: 1px solid var(--border);">
        <button onclick="switchDebtTab('active')" style="
          border: none; background: ${currentTab === 'active' ? 'var(--accent-glow)' : 'transparent'};
          color: ${currentTab === 'active' ? 'var(--accent)' : 'var(--text-secondary)'};
          padding: 10px 24px; border-radius: 8px; font-weight: 600; font-family: 'Outfit'; cursor: pointer;
          transition: all 0.3s;
        ">⚠️ ${t("Qarzdorlar")}</button>
        <button onclick="switchDebtTab('paid')" style="
          border: none; background: ${currentTab === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'transparent'};
          color: ${currentTab === 'paid' ? 'var(--success)' : 'var(--text-secondary)'};
          padding: 10px 24px; border-radius: 8px; font-weight: 600; font-family: 'Outfit'; cursor: pointer;
          transition: all 0.3s;
        ">✅ ${t("To'langan qarzlar")}</button>
      </div>
    </div>
    <div id="debts-table-container"></div>
    <div class="page-bottom-bar">
      <div class="search-box" style="flex:1; max-width:none;">
        <span class="search-icon" style="color:rgba(255,255,255,0.6);">🔍</span>
        <input type="text" placeholder="${t("Mijoz bo'yicha qidirish...")}" id="debt-search"
          oninput="filterDebts(this.value)"
          style="background:rgba(255,255,255,0.15); border-color:rgba(255,255,255,0.25); color:white;">
      </div>
      <button class="btn btn-ghost" onclick="openDateFilterModal()" style="padding: 10px 15px;" title="${t("Sana bo'yicha filter")}">📅</button>
      <div style="width: 100px;"></div> <!-- Spacer because there is no 'Add' debt button directly -->
    </div>
  `;

  renderDebtsTable(currentTab);
}

window.filterDebts = function (query) {
  const q = query.toLowerCase();
  renderDebtsTable(window.currentDebtTab || 'active', q);
}

window.switchDebtTab = function (tab) {
  window.currentDebtTab = tab;
  renderDebtsTabs();
}

function renderDebtsTable(tab, filter = '', isAppend = false) {
  // If called from infinite scroll: fn('active', true) or fn('paid', true)
  if (typeof filter === 'boolean') {
    isAppend = filter;
    filter = '';
  }

  const container = document.getElementById('debts-table-container');
  if (!container) return;

  const pageVar = tab === 'active' ? 'activeDebtPage' : 'paidDebtPage';
  if (!isAppend) window[pageVar] = 1;

  const period = getDatePeriod();
  let fullList = tab === 'active' ? activeDebtsList : paidDebtsList;
  let list = fullList.filter(d => {
    // Local date filter
    const transDate = d.createdAt.substring(0, 10);
    const isInRange = transDate >= period.start && transDate <= period.end;
    if (!isInRange) return false;

    const name = (d.clientName || d.clientNumber || t('Begona xaridor')).toLowerCase();
    return !filter || name.includes(filter) || d.id.toString().includes(filter);
  });

  // Infinite scroll logic
  const limit = 15;
  const totalPages = Math.ceil(list.length / limit);
  // Slice from 0 up to current page * limit
  const end = window[pageVar] * limit;
  const paginated = list.slice(end - limit, end);

  const items = paginated.length === 0 && !isAppend
    ? `<div class="empty-state"><div class="icon">✅</div><h4>${tab === 'active' ? t("Qarzdorlar topilmadi") : t("Hech qanday to'langan qarz yo'q")}</h4></div>`
    : paginated.map((trans, i) => {
      const clientName = trans.clientName ? escapeHtml(trans.clientName) : (trans.clientNumber ? escapeHtml(trans.clientNumber) : t('Begona xaridor'));
      return `
        <div class="acc-item" id="debt-acc-${trans.id}">
          <div class="acc-header" onclick="toggleAcc('debt-acc-${trans.id}')">
            <div class="acc-header-left">
              <div class="acc-avatar" style="${tab === 'active' ? 'background:linear-gradient(135deg,#EF4444,#DC2626)' : 'background:linear-gradient(135deg,#10B981,#059669)'}">$</div>
              <div>
                <div class="acc-title">${clientName}</div>
                <div class="acc-subtitle">
                  ${t("Sotuv")} № ${trans.id} — ${formatDateTime(trans.createdAt)}
                  ${tab === 'active' && trans.debtLimitDate ? `<span class="badge badge-warning" style="margin-left:6px;">${t("Muddat")}: ${escapeHtml(trans.debtLimitDate.substring(0, 10))}</span>` : ''}
                </div>
              </div>
            </div>
            <div class="acc-header-right">
              ${tab === 'active'
          ? `<span class="acc-price" style="color:var(--danger);">${formatPrice(trans.debt)} ${t("so'm")}</span>`
          : `<span class="acc-price" style="color:var(--success);"><del style="opacity:0.5">${formatPrice(trans.total)}</del> ${formatPrice(0)} ${t("so'm")}</span>`
        }
              <span class="acc-chevron">▼</span>
            </div>
          </div>
          <div class="acc-body">
            <div class="acc-detail-grid">
              <div class="acc-detail-item">
                <span class="acc-detail-icon">💰</span>
                <div><div class="acc-detail-label">${t("Jami summa")}</div><div class="acc-detail-value">${formatPrice(trans.total)} ${t("so'm")}</div></div>
              </div>
              <div class="acc-detail-item">
                <span class="acc-detail-icon">💵</span>
                <div><div class="acc-detail-label">${t("To'langan summasi")}</div><div class="acc-detail-value">${formatPrice(trans.cash + trans.card + trans.click)} ${t("so'm")}</div></div>
              </div>
              ${tab === 'active' ? `
              <div class="acc-detail-item" style="border-color:#FCA5A5;">
                <span class="acc-detail-icon">⚠️</span>
                <div><div class="acc-detail-label" style="color:#EF4444;">${t("Qolgan qarz")}</div><div class="acc-detail-value" style="color:#EF4444;">${formatPrice(trans.debt)} ${t("so'm")}</div></div>
              </div>` : ''}
              <div class="acc-detail-item">
                <span class="acc-detail-icon">🏢</span>
                <div><div class="acc-detail-label">${t("Mas'ul")}</div><div class="acc-detail-value">${escapeHtml(trans.createdByName || t("Tizim"))}</div></div>
              </div>
            </div>
            <div class="acc-actions">
              ${tab === 'active' && window.hasPermission('edit') ? `<button class="btn btn-success btn-sm" onclick='openDebtPayModal(${JSON.stringify(trans)})'>💵 ${t("To'lash")}</button>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');

  if (!isAppend) {
    container.innerHTML = `
      <div class="acc-list" id="debts-acc-list">${items}</div>
      <div id="debts-pagination-area">
        ${renderPageControls(pageVar, totalPages, 'renderDebtsTable')}
      </div>
    `;
    attachInfiniteScroll(pageVar, totalPages, 'renderDebtsTable', tab);
  } else {
    const listContainer = document.getElementById('debts-acc-list');
    if (listContainer) {
      listContainer.insertAdjacentHTML('beforeend', items);
    }
    const pagArea = document.getElementById('debts-pagination-area');
    if (pagArea) {
      pagArea.innerHTML = renderPageControls(pageVar, totalPages, 'renderDebtsTable');
    }
    attachInfiniteScroll(pageVar, totalPages, 'renderDebtsTable', tab);
  }
}

window.openDebtPayModal = function (trans) {
  openModal(`
    <div class="modal-header">
      <h3>${t("Qarzni to'lash")}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <form onsubmit="payDebt(event, ${trans.id}, ${trans.total}, ${trans.cash}, ${trans.card}, ${trans.click}, ${trans.debt}, ${trans.clientId ? trans.clientId : 'null'})" class="modal-wide" style="min-width: 400px;">
      <div style="background: var(--bg-glass); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
         <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span style="opacity:0.7;">${t("Mijoz")}:</span>
            <strong>${escapeHtml(trans.clientName || trans.clientNumber || t('Begona'))}</strong>
         </div>
         <div style="display:flex; justify-content:space-between;">
            <span style="opacity:0.7;">${t("Jami qarz")}:</span>
            <strong style="color:var(--danger); font-size:18px;">${formatPrice(trans.debt)} ${t("so'm")}</strong>
         </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>${t("Naqd")}</label>
          <input type="number" step="0.01" class="form-control" id="pay-cash" value="${trans.debt}" oninput="calcRemainingDebt(${trans.debt})">
        </div>
        <div class="form-group">
          <label>${t("Karta")}</label>
          <input type="number" step="0.01" class="form-control" id="pay-card" value="0" oninput="calcRemainingDebt(${trans.debt})">
        </div>
        <div class="form-group">
          <label>${t("Click")}</label>
          <input type="number" step="0.01" class="form-control" id="pay-click" value="0" oninput="calcRemainingDebt(${trans.debt})">
        </div>
      </div>
      
      <div style="display:flex; justify-content:space-between; margin-top:10px; padding: 10px; background:rgba(0,0,0,0.1); border-radius:6px;">
        <span style="font-weight:600;">${t("Qoldiq qarz")}:</span>
        <strong id="remaining-debt-label" style="color:var(--warning);">${formatPrice(0)} ${t("so'm")}</strong>
      </div>
      
      <div id="pay-error" style="color:red; text-align:center; margin-top:10px; display:none;">
        ${t("To'lov summasi qarzdan ko'p bo'lishi mumkin emas!")}
      </div>

      <div class="modal-footer" style="margin-top:20px;">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
        <button type="submit" class="btn btn-primary">${t("To'lash")}</button>
      </div>
    </form>
  `);
}

window.calcRemainingDebt = function (totalDebt) {
  const cash = parseFloat(document.getElementById('pay-cash').value) || 0;
  const card = parseFloat(document.getElementById('pay-card').value) || 0;
  const click = parseFloat(document.getElementById('pay-click').value) || 0;

  const totalPay = cash + card + click;
  const rem = totalDebt - totalPay;

  const errorEl = document.getElementById('pay-error');
  const remLabel = document.getElementById('remaining-debt-label');

  if (rem < 0) {
    errorEl.style.display = 'block';
    remLabel.style.color = 'var(--danger)';
    remLabel.textContent = formatPrice(0) + " " + t("so'm");
  } else {
    errorEl.style.display = 'none';
    remLabel.style.color = 'var(--warning)';
    remLabel.textContent = formatPrice(rem) + " " + t("so'm");
  }
}

window.payDebt = async function (e, transId, origTotal, origCash, origCard, origClick, origDebt, clientId) {
  e.preventDefault();

  const payCash = parseFloat(document.getElementById('pay-cash').value) || 0;
  const payCard = parseFloat(document.getElementById('pay-card').value) || 0;
  const payClick = parseFloat(document.getElementById('pay-click').value) || 0;

  const totalPay = payCash + payCard + payClick;
  if (totalPay > origDebt) {
    showToast(t("To'lov summasi qarzdan ko'p bo'lishi mumkin emas!"), "error");
    return;
  }

  if (totalPay <= 0) {
    showToast(t("To'lov summasini kiriting"), "warning");
    return;
  }

  const newCash = origCash + payCash;
  const newCard = origCard + payCard;
  const newClick = origClick + payClick;
  const newDebt = origDebt - totalPay;

  try {
    showToast(t("Saqlanmoqda..."), 'info');
    await api.put(`/transactions/${transId}`, {
      total: origTotal,
      cash: newCash,
      card: newCard,
      click: newClick,
      debt: newDebt,
      clientId: clientId
    });

    showToast(t("Qarz muvaffaqiyatli to'landi!"), "success");
    closeModal();
    renderDebts(); // Refresh lists
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Global exports
window.renderDebts = renderDebts;
window.renderDebtsTabs = renderDebtsTabs;
window.renderDebtsTable = renderDebtsTable;
