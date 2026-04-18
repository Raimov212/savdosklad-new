import { api, showToast, formatPrice, escapeHtml, getSelectedBusinessId, toggleAcc, formatDateTime } from './api.js';
import { t } from './i18n.js';

// ==================== EXPENSES MODULE ====================

window.expensePage = 1;
window.expensePeriod = 'daily'; // daily, monthly, yearly
let currentExpenses = [];
let allExpensesList = [];

window.fixedPage = 1;
let currentFixed = [];
let allFixedList = [];

async function renderExpenses() {
  const content = document.getElementById('page-content');
  const bid = getSelectedBusinessId();

  if (!bid) {
    content.innerHTML = `<div class="empty-state"><div class="icon">💸</div><h4>${t("Avval biznes tanlang")}</h4></div>`;
    return;
  }

  try {
    const [expenses, fixedCosts] = await Promise.all([
      api.get(`/expenses?businessId=${bid}${getDateQuery()}`),
      api.get(`/fixed-costs?businessId=${bid}`)
    ]);

    allExpensesList = expenses || [];
    allFixedList = (fixedCosts || []).filter(f => !f.isDeleted);

    const periodList = filterExpensesByPeriod(allExpensesList, window.expensePeriod);
    const periodTotal = periodList.reduce((s, e) => s + (e.total || 0), 0);

    const periodLabel = window.expensePeriod === 'daily' ? t("Jami xarajatlar") :
                        window.expensePeriod === 'monthly' ? t("Shu oydagi xarajatlar") :
                        t("Shu yildagi xarajatlar");

    content.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card" style="background: linear-gradient(135deg, #ff4d4d1a 0%, #ff4d4d05 100%); border-left: 4px solid #ff4d4d;">
          <div class="stat-icon" style="background:#ff4d4d20; color:#ff4d4d;">💸</div>
          <div class="stat-value" style="color:#ff4d4d;">${formatPrice(periodTotal)}</div>
          <div class="stat-label">${periodLabel}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, var(--accent)1a 0%, var(--accent)05 100%); border-left: 4px solid var(--accent);">
          <div class="stat-icon" style="background:var(--accent-glow); color:var(--accent);">📌</div>
          <div class="stat-value" style="color:var(--accent);">${allFixedList.length}</div>
          <div class="stat-label">${t("Doimiy xarajatlar soni")}</div>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px; padding:10px;">
        <div class="segmented-control">
          <button class="segmented-item ${window.expensePeriod === 'daily' ? 'active' : ''}" onclick="setExpensePeriod('daily')">${t("Kundalik")}</button>
          <button class="segmented-item ${window.expensePeriod === 'monthly' ? 'active' : ''}" onclick="setExpensePeriod('monthly')">${t("Oylik")}</button>
          <button class="segmented-item ${window.expensePeriod === 'yearly' ? 'active' : ''}" onclick="setExpensePeriod('yearly')">${t("Yillik")}</button>
        </div>
      </div>

      <div id="expense-section" style="margin-bottom:30px"></div>
      <div id="fixed-section"></div>
        `;

    renderExpenseTable();
    renderFixedTable(allFixedList);
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><h4>${t("Xatolik")}</h4><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function setExpensePeriod(p) {
  window.expensePeriod = p;
  renderExpenses();
}

function filterExpensesByPeriod(list, period) {
  // We show all data grouped correctly in each tab
  return list; 
}

function renderExpenseTable(list, isAppend = false) {
  if (typeof list === 'boolean') {
    isAppend = list;
    list = null;
  }
  if (list) {
    if (!isAppend) window.expensePage = 1;
  }
  // Use allExpensesList filtered by search query
  const query = document.getElementById('expense-search')?.value.toLowerCase() || '';
  let filteredRaw = allExpensesList.filter(e => 
    !query || (e.description && e.description.toLowerCase().includes(query)) ||
    (e.createdAt && e.createdAt.toLowerCase().includes(query))
  );

  if (window.expensePeriod === 'monthly') {
    // Group by Day for all time
    const groups = {};
    filteredRaw.forEach(e => {
      const date = new Date(e.createdAt);
      if (isNaN(date.getTime())) return;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const d = `${year}-${month}-${day}`;
      
      if (!groups[d]) groups[d] = { total: 0, cash: 0, card: 0, date: d, isGroup: true };
      groups[d].total += (e.total || 0);
      groups[d].cash += (e.cash || 0);
      groups[d].card += (e.card || 0);
    });
    currentExpenses = Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  } else if (window.expensePeriod === 'yearly') {
    // Group by Month for all time
    const groups = {};
    filteredRaw.forEach(e => {
      const date = new Date(e.createdAt);
      if (isNaN(date.getTime())) return;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const m = `${year}-${month}`;
      
      if (!groups[m]) groups[m] = { total: 0, cash: 0, card: 0, date: m, isGroup: true };
      groups[m].total += (e.total || 0);
      groups[m].cash += (e.cash || 0);
      groups[m].card += (e.card || 0);
    });
    currentExpenses = Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  } else {
    // Daily: Individual items
    currentExpenses = filteredRaw;
  }

  const limit = 15;
  const totalPages = Math.ceil(currentExpenses.length / limit);
  const end = window.expensePage * limit;
  const paginated = currentExpenses.slice(end - limit, end);

  const section = document.getElementById('expense-section');
  if (!section) return;

  const title = window.expensePeriod === 'daily' ? t("Kundalik xarajatlar") :
                window.expensePeriod === 'monthly' ? t("Oylik xarajatlar") :
                t("Yillik xarajatlar");

  const isAggregated = window.expensePeriod !== 'daily';

  const rows = paginated.map((e, i) => {
    const startIdx = (window.expensePage - 1) * limit;
    return `
      <tr>
        <td style="text-align:center">${startIdx + i + 1}</td>
        <td class="price price-negative" style="text-align:center; font-weight:700;">-${formatPrice(e.total)} ${t("so'm")}</td>
        <td style="text-align:center">
          <div style="font-size:11px; display:flex; flex-direction:column; gap:2px; align-items:center;">
            ${e.cash > 0 ? `<span class="badge" style="background:#4CAF5020; color:#4CAF50; border:1px solid #4CAF5040;">${t("Naqd")}: ${formatPrice(e.cash)}</span>` : ''}
            ${e.card > 0 ? `<span class="badge" style="background:var(--accent)20; color:var(--accent); border:1px solid var(--accent)40;">${t("Karta")}: ${formatPrice(e.card)}</span>` : ''}
          </div>
        </td>
        ${!isAggregated ? `<td style="text-align:center">${escapeHtml(e.description) || '<span style="opacity:0.3">—</span>'}</td>` : ''}
        <td style="text-align:center; font-weight:600; font-size:12px;">${escapeHtml(e.createdByName || t("Tizim"))}</td>
        <td style="text-align:center; font-size:12px; opacity:0.7;">
            ${isAggregated ? (
            window.expensePeriod === 'yearly' ? 
            (() => {
                const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
                const [y, m] = e.date.split('-');
                return `${t(months[parseInt(m) - 1])} ${y}`;
            })() : 
            (() => {
                const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
                const [y, m, d] = e.date.split('-');
                return `${parseInt(d)} ${t(months[parseInt(m) - 1])}`;
            })()
          ) : formatDateTime(e.createdAt)}
        </td>
      </tr>`;
  }).join('');

  if (!isAppend) {
    section.innerHTML = `
        <div class="card">
          <div class="card-header">
             <h3 style="margin:0; font-size:16px;">${title}</h3>
             <div class="toolbar">
               <div class="search-box">
                 <span class="search-icon">🔍</span>
                 <input type="text" placeholder="${t("Qidirish...")}" id="expense-search" value="${escapeHtml(document.getElementById('expense-search')?.value || '')}" oninput="renderExpenseTable()">
               </div>
               <button class="btn btn-ghost" onclick="openDateFilterModal()" title="${t("Sana bo'yicha filter")}">📅</button>
               <button class="btn btn-primary btn-sm" onclick="openExpenseModal()">${t("Qo'shish")}</button>
             </div>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="text-align:center">№</th>
                  <th style="text-align:center">${t("Summa")}</th>
                  <th style="text-align:center">${t("To'lov turi")}</th>
                  ${!isAggregated ? `<th style="text-align:center">${t("Tavsifi")}</th>` : ''}
                  <th style="text-align:center">${t("Mas'ul")}</th>
                  <th style="text-align:center">${t("Sana")}</th>
                </tr>
              </thead>
              <tbody id="expense-tbody">
                ${paginated.length === 0 && !isAppend ? `<tr><td colspan="${isAggregated ? 5 : 6}" style="text-align:center;padding:30px;color:var(--text-muted);">${t("Xarajatlar mavjud emas")}</td></tr>` : rows}
              </tbody>
            </table>
          </div>
        </div>
        <div id="expense-pagination-area">
          ${renderPageControls('expensePage', totalPages, 'renderExpenseTable')}
        </div>
      `;
      attachInfiniteScroll('expensePage', totalPages, 'renderExpenseTable');
  } else {
    const tbody = document.getElementById('expense-tbody');
    if (tbody) tbody.insertAdjacentHTML('beforeend', rows);
    const pagArea = document.getElementById('expense-pagination-area');
    if (pagArea) pagArea.innerHTML = renderPageControls('expensePage', totalPages, 'renderExpenseTable');
    attachInfiniteScroll('expensePage', totalPages, 'renderExpenseTable');
  }
}

function renderFixedTable(list, isAppend = false) {
  if (typeof list === 'boolean') {
    isAppend = list;
    list = null;
  }
  if (list) {
    currentFixed = list;
    window.fixedPage = 1;
  }

  const limit = 10;
  const totalPages = Math.ceil(currentFixed.length / limit);
  if (window.fixedPage > totalPages) window.fixedPage = totalPages || 1;
  const start = (window.fixedPage - 1) * limit;
  const paginated = currentFixed.slice(start, start + limit);

  const section = document.getElementById('fixed-section');
  if (!section) return;

  const rows = paginated.map((f, i) => `
    <tr>
      <td style="text-align:center">${start + i + 1}</td>
      <td style="text-align:center"><strong style="color:var(--text-primary)">${escapeHtml(f.name)}</strong></td>
      <td class="price" style="text-align:center; font-weight:700;">${formatPrice(f.amount)} ${t("so'm")}</td>
      <td style="text-align:center">
        <span class="badge" style="background:var(--bg-glass); border:1px solid var(--border); color:var(--text-secondary);">
          ${f.type === 1 ? t('Oylik') : f.type === 2 ? t('Yillik') : t('Boshqa')}
        </span>
      </td>
      <td style="text-align:center"><span style="font-size:13px; color:var(--text-muted)">${escapeHtml(f.description) || '—'}</span></td>
      <td class="actions" style="justify-content:center">
        <button class="btn-icon" onclick='openFixedCostModal(${JSON.stringify(f).replace(/'/g, "&#39;")})' title="${t("Tahrirlash")}">✏️</button>
      </td>
    </tr>`).join('');

  if (!isAppend) {
    section.innerHTML = `
      <div class="card">
        <div class="card-header">
           <h3 style="margin:0; font-size:16px;">${t("Doimiy xarajatlar")}</h3>
           <div class="toolbar">
             <div class="search-box">
               <span class="search-icon">🔍</span>
               <input type="text" placeholder="${t("Qidirish...")}" id="fixed-search" value="${escapeHtml(document.getElementById('fixed-search')?.value || '')}" oninput="filterFixed(this.value)">
             </div>
             <button class="btn btn-primary btn-sm" onclick="openFixedCostModal()">${t("Qo'shish")}</button>
           </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="text-align:center">№</th>
                <th style="text-align:center">${t("Nomi")}</th>
                <th style="text-align:center">${t("Summa")}</th>
                <th style="text-align:center">${t("Turi")}</th>
                <th style="text-align:center">${t("Tavsifi")}</th>
                <th style="text-align:center">${t("Amallar")}</th>
              </tr>
            </thead>
            <tbody id="fixed-tbody">
              ${paginated.length === 0 ? `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">${t("Doimiy xarajatlar mavjud emas")}</td></tr>` : rows}
            </tbody>
          </table>
        </div>
      </div>
      <div id="fixed-pagination-area">
        ${renderPageControls('fixedPage', totalPages, 'renderFixedTable')}
      </div>
    `;
    attachInfiniteScroll('fixedPage', totalPages, 'renderFixedTable');
  } else {
    const tbody = document.getElementById('fixed-tbody');
    if (tbody) tbody.insertAdjacentHTML('beforeend', rows);
    const pagArea = document.getElementById('fixed-pagination-area');
    if (pagArea) pagArea.innerHTML = renderPageControls('fixedPage', totalPages, 'renderFixedTable');
    attachInfiniteScroll('fixedPage', totalPages, 'renderFixedTable');
  }
}

function filterExpenses(query) {
  const q = query.toLowerCase();
  const filtered = allExpensesList.filter(e =>
    (e.description && e.description.toLowerCase().includes(q))
  );
  const _inputEl = document.getElementById('expense-search');
  const _cursor = _inputEl ? _inputEl.selectionStart : 0;

  renderExpenseTable(filtered);

  setTimeout(() => {
    const input = document.getElementById('expense-search');
    if (input) {
      input.focus();
      try { input.setSelectionRange(_cursor, _cursor); } catch (e) { }
    }
  }, 0);
}

function filterFixed(query) {
  const q = query.toLowerCase();
  const filtered = allFixedList.filter(f =>
    (f.name && f.name.toLowerCase().includes(q)) ||
    (f.description && f.description.toLowerCase().includes(q))
  );
  const _inputEl = document.getElementById('fixed-search');
  const _cursor = _inputEl ? _inputEl.selectionStart : 0;

  renderFixedTable(filtered);

  setTimeout(() => {
    const input = document.getElementById('fixed-search');
    if (input) {
      input.focus();
      try { input.setSelectionRange(_cursor, _cursor); } catch (e) { }
    }
  }, 0);
}


function openExpenseModal() {
  openModal(`
    <div class="modal-header">
      <h3>${t("Yangi xarajat")}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <form onsubmit="createExpense(event)" style="min-width:400px">
      <div class="form-group">
        <label>${t("Jami summa")}</label>
        <div style="position:relative">
          <input type="number" step="0.01" class="form-control" id="exp-total" placeholder="0.00" required style="padding-right:45px; font-weight:700; font-size:18px;">
          <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); opacity:0.5; font-size:12px;">UZS</span>
        </div>
      </div>
      
      <div style="background:var(--bg-input); padding:15px; border-radius:12px; margin-bottom:20px; border:1px solid var(--border);">
        <p style="font-size:11px; margin-top:0; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">${t("To'lov usuli")}</p>
        <div class="form-row" style="margin-bottom:0">
          <div class="form-group" style="margin-bottom:0">
            <label style="font-size:11px">${t("Naqd")}</label>
            <input type="number" step="0.01" class="form-control" id="exp-cash" value="0">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label style="font-size:11px">${t("Karta")}</label>
            <input type="number" step="0.01" class="form-control" id="exp-card" value="0">
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>${t("Tavsifi")}</label>
        <textarea class="form-control" id="exp-desc" rows="2" placeholder="${t('Xarajat tavsifi')}" style="resize:none"></textarea>
      </div>

      <div class="modal-footer" style="padding-top:10px">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
        <button type="submit" class="btn btn-primary" style="padding:10px 40px;">${t("Saqlash")}</button>
      </div>
    </form>
  `);
}

async function createExpense(e) {
  e.preventDefault();
  const bid = getSelectedBusinessId();
  try {
    await api.post('/expenses', {
      businessId: bid,
      total: parseFloat(document.getElementById('exp-total').value),
      cash: parseFloat(document.getElementById('exp-cash').value) || 0,
      card: parseFloat(document.getElementById('exp-card').value) || 0,
      description: document.getElementById('exp-desc').value.trim(),
    });
    showToast(t('Xarajat qo\'shildi'));
    closeModal();
    renderExpenses();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openFixedCostModal(f = null) {
  const isEdit = !!f;
  openModal(`
    <div class="modal-header">
      <h3>${isEdit ? t('Doimiy xarajatni tahrirlash') : t('Yangi doimiy xarajat')}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <form onsubmit="saveFixedCost(event, ${isEdit ? f.id : 0})" style="min-width:450px">
      <div class="form-group">
        <label>${t("Turi")}</label>
        <input type="text" class="form-control" id="fc-name" value="${isEdit ? escapeHtml(f.name) : ''}" placeholder="${t('Turini kiriting')}" required>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>${t("Summa")}</label>
          <div style="position:relative">
            <input type="number" step="0.01" class="form-control" id="fc-amount" value="${isEdit ? f.amount : ''}" required style="padding-right:45px">
            <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); opacity:0.5; font-size:12px;">UZS</span>
          </div>
        </div>
        <div class="form-group">
          <label>${t("Turi")}</label>
          <select class="form-control" id="fc-type" required>
            <option value="1" ${isEdit && f.type === 1 ? 'selected' : ''}>${t('Oylik')}</option>
            <option value="2" ${isEdit && f.type === 2 ? 'selected' : ''}>${t('Yillik')}</option>
            <option value="3" ${isEdit && f.type === 3 ? 'selected' : ''}>${t('Boshqa')}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>${t("Tavsifi")}</label>
        <textarea class="form-control" id="fc-desc" rows="2" style="resize:none">${isEdit && f.description ? escapeHtml(f.description) : ''}</textarea>
      </div>

      <div class="modal-footer" style="padding-top:10px">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
        <button type="submit" class="btn btn-primary" style="padding:10px 40px;">${isEdit ? t('Saqlash') : t('Yaratish')}</button>
      </div>
    </form>
  `);
}

async function saveFixedCost(e, id) {
  e.preventDefault();
  const bid = getSelectedBusinessId();

  try {
    if (id) {
      await api.put(`/fixed-costs/${id}`, {
        name: document.getElementById('fc-name').value.trim(),
        description: document.getElementById('fc-desc').value.trim() || null,
        amount: parseFloat(document.getElementById('fc-amount').value),
        type: parseInt(document.getElementById('fc-type').value),
      });
      showToast(t('Doimiy xarajat yangilandi'));
    } else {
      await api.post('/fixed-costs', {
        businessId: bid,
        name: document.getElementById('fc-name').value.trim(),
        description: document.getElementById('fc-desc').value.trim(),
        amount: parseFloat(document.getElementById('fc-amount').value),
        type: parseInt(document.getElementById('fc-type').value),
      });
      showToast(t('Doimiy xarajat qo\'shildi'));
    }
    closeModal();
    renderExpenses();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Global exports
window.renderExpenses = renderExpenses;
window.renderExpenseTable = renderExpenseTable;
window.filterExpensesByPeriod = filterExpensesByPeriod;
window.setExpensePeriod = setExpensePeriod;
window.openExpenseModal = openExpenseModal;
window.createExpense = createExpense;
window.renderFixedTable = renderFixedTable;
window.filterFixed = filterFixed;
window.openFixedCostModal = openFixedCostModal;
window.saveFixedCost = saveFixedCost;
window.expensePage = expensePage;
window.expensePeriod = expensePeriod;
window.fixedPage = fixedPage;
window.allExpensesList = allExpensesList;
window.allFixedList = allFixedList;
window.currentExpenses = currentExpenses;
window.currentFixed = currentFixed;
