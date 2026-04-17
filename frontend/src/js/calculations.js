import { api, showToast, formatPrice, escapeHtml, getSelectedBusinessId, toggleAcc, formatDate } from './api.js';
import { t } from './i18n.js';

// ==================== CALCULATIONS MODULE ====================

let calculationPage = 1;
let currentCalculations = [];
let allCalculationsList = [];

async function renderCalculations() {
  const content = document.getElementById('page-content');
  const bid = getSelectedBusinessId();

  if (!bid) {
    content.innerHTML = `<div class="empty-state"><div class="icon">📊</div><h4>${t("Avval biznes tanlang")}</h4></div>`;
    return;
  }

  try {
    const calculations = await api.get(`/calculations?businessId=${bid}`);
    allCalculationsList = calculations || [];

    // Sort by year desc, month desc
    allCalculationsList.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    renderCalculationsTable(allCalculationsList);
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><h4>${t("Xatolik")}</h4><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function renderCalculationsTable(list, isAppend = false) {
  if (list) {
    if (!isAppend) window.calculationPage = 1;
    currentCalculations = list;
  }

  const limit = 15;
  const totalPages = Math.ceil(currentCalculations.length / limit);
  // Infinite scroll
  const end = window.calculationPage * limit;
  const paginated = currentCalculations.slice(end - limit, end);

  const months = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  const content = document.getElementById('page-content');

  const cards = paginated.map(c => {
    const monthText = t(months[c.month] || c.month);
    const isProfit = c.profit >= 0;
    return `
        <div class="stat-card" style="cursor:pointer; display:block; height:auto; padding:20px; transition:all 0.3s; border:1px solid var(--border);" onclick='viewCalculationDetail(${JSON.stringify(c).replace(/'/g, "&#39;")})'>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:10px;">
            <span style="font-size:16px; font-weight:700; color:var(--text-primary);">${monthText} ${c.year}</span>
            <span class="badge" style="background:${isProfit ? '#4CAF5020' : '#f4433620'}; color:${isProfit ? '#4CAF50' : '#f44336'}; padding:6px 12px; font-weight:700;">
                ${isProfit ? t("Foyda") : t("Zarar")}
            </span>
            </div>
            
            <div style="margin-bottom:15px">
                <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">${t("Sof foyda")}</div>
                <div style="font-size:24px; font-weight:800; color:${isProfit ? 'var(--success)' : 'var(--danger)'};">
                ${isProfit ? '' : '-'}${formatPrice(Math.abs(c.profit))} <small style="font-size:12px; font-weight:400; opacity:0.6;">UZS</small>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:13px; background:var(--bg-glass); border-radius:8px; padding:12px;">
            <div>
                <div style="color:var(--text-muted); font-size:10px; text-transform:uppercase;">${t("Sotuv")}</div>
                <div style="font-weight:700; color:var(--success)">${formatPrice(c.totalSale)}</div>
            </div>
            <div>
                <div style="color:var(--text-muted); font-size:10px; text-transform:uppercase;">${t("Xarajat")}</div>
                <div style="font-weight:700; color:var(--danger)">${formatPrice(c.totalExpense + c.totalFixedCosts)}</div>
            </div>
            </div>
            
            <div style="margin-top:10px; text-align:right; font-size:11px; color:var(--text-muted); font-style:italic;">
            ${t("Batafsil ko'rish")} →
            </div>
        </div>
        `;
  }).join('');

  if (!isAppend) {
    content.innerHTML = `
      <div class="card" style="margin-bottom:20px">
        <div class="card-header">
           <h3 style="margin:0; font-size:16px;">${t("Oylik hisob-kitoblar")}</h3>
           <div class="toolbar">
             <div class="search-box">
               <span class="search-icon">🔍</span>
               <input type="text" placeholder="${t("Yil bo'yicha")}" id="calculation-search" value="${escapeHtml(document.getElementById('calculation-search')?.value || '')}" oninput="filterCalculations(this.value)">
             </div>
             <button class="btn btn-primary btn-sm" onclick="openCalculationModal()">${t("Qo'shish")}</button>
           </div>
        </div>
      </div>

      <div class="stats-grid" id="calculations-grid">
           ${paginated.length === 0 ? `<div class="empty-state"><div class="icon">📊</div><h4>${t("Hisob-kitoblar yo'q")}</h4><p>${t("Yangi hisob-kitob yarating.")}</p></div>` : cards}
      </div>
      <div id="calculations-pagination-area">
        ${renderPageControls('calculationPage', totalPages, 'renderCalculationsTable')}
      </div>
      <div class="page-bottom-bar">
        <div class="search-box" style="flex:1; max-width:none;">
          <span class="search-icon" style="color:rgba(255,255,255,0.6);">🔍</span>
          <input type="text" placeholder="${t("Yil bo'yicha")}" id="calculation-search-bottom" 
            oninput="filterCalculations(this.value)"
            style="background:rgba(255,255,255,0.15); border-color:rgba(255,255,255,0.25); color:white;">
        </div>
        <button class="btn btn-ghost" onclick="openDateFilterModal()" style="padding: 10px 15px;" title="${t("Sana bo'yicha filter")}">📅</button>
        <button class="btn btn-primary" onclick="openCalculationModal()">${t("Qo'shish")}</button>
      </div>
    `;
  } else {
    const grid = document.getElementById('calculations-grid');
    if (grid) {
      grid.insertAdjacentHTML('beforeend', cards);
    }
    const pagArea = document.getElementById('calculations-pagination-area');
    if (pagArea) {
      pagArea.innerHTML = renderPageControls('calculationPage', totalPages, 'renderCalculationsTable');
    }
  }
}

function filterCalculations(query) {
  const q = query.toLowerCase();
  const filtered = allCalculationsList.filter(c =>
    String(c.year).includes(q)
  );
  const _inputEl = document.getElementById('calculation-search');
  const _cursor = _inputEl ? _inputEl.selectionStart : 0;

  renderCalculationsTable(filtered);

  setTimeout(() => {
    const input = document.getElementById('calculation-search');
    if (input) {
      input.focus();
      try { input.setSelectionRange(_cursor, _cursor); } catch (e) { }
    }
  }, 0);
}

function viewCalculationDetail(c) {
  const months = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  const monthText = t(months[c.month] || c.month);

  openModal(`
    <div class="modal-header">
      <h3>📊 ${monthText} ${c.year} — ${t('Hisob-kitob tafsilotlari')}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div style="padding:0 10px">
      <div class="table-container" style="border:none; background:none;">
        <table style="border-collapse: separate; border-spacing: 0 8px;">
          <tbody>
            <tr style="background:var(--bg-glass); border-radius:8px;">
              <td style="padding:12px; border:none; color:var(--text-secondary)">${t("Jami sotuv")}</td>
              <td class="price" style="padding:12px; border:none; text-align:right; font-weight:700;">${formatPrice(c.totalSale)} ${t("so'm")}</td>
            </tr>
            <tr>
              <td style="padding:12px; border:none; color:var(--text-secondary)">${t("Jami daromad")}</td>
              <td class="price" style="padding:12px; border:none; text-align:right; color:var(--success); font-weight:700;">${formatPrice(c.totalIncome)} ${t("so'm")}</td>
            </tr>
            <tr>
              <td style="padding:12px; border:none; color:var(--text-secondary)">${t("Jami xarajat")}</td>
              <td class="price" style="padding:12px; border:none; text-align:right; color:var(--danger); font-weight:700;">-${formatPrice(c.totalExpense + c.totalFixedCosts)} ${t("so'm")}</td>
            </tr>
            <tr style="border-bottom: 2px solid var(--border);">
              <td style="padding:12px; border:none; color:var(--text-secondary)">${t("Ish haqi va soliqlar")}</td>
              <td class="price" style="padding:12px; border:none; text-align:right; color:var(--danger); opacity:0.8;">-${formatPrice(c.salary + c.salaryTax + c.incomeTax)} ${t("so'm")}</td>
            </tr>
            <tr>
              <td style="padding:12px; border:none; color:var(--text-secondary)">${t("Qo'shilgan mablag'lar")}</td>
              <td class="price" style="padding:12px; border:none; text-align:right;">${formatPrice(c.addedMoney)} ${t("so'm")}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background:var(--accent-glow); border-radius:12px;">
              <td style="padding:20px; border:none; font-weight:800; font-size:18px; color:var(--text-primary); border-radius:12px 0 0 12px;">${t("Sof foyda")}</td>
              <td class="price" style="padding:20px; border:none; text-align:right; font-size:22px; font-weight:800; color:${c.profit >= 0 ? 'var(--success)' : 'var(--danger)'}; border-radius:0 12px 12px 0;">
                ${formatPrice(c.profit)} ${t("so'm")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    <div class="modal-footer">
       <button class="btn btn-primary" onclick="closeModal()" style="width:100%">${t("Yopish")}</button>
    </div>
  `);
}

function openCalculationModal() {
  const now = new Date();
  const months = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

  openModal(`
    <div class="modal-header">
      <h3>${t("Yangi hisob-kitob")}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <form onsubmit="createCalculation(event)" style="min-width:550px">
      <div class="form-row">
        <div class="form-group">
          <label>${t("Oy")}</label>
          <select class="form-control" id="calc-month" required>
            ${months.map((m, i) => i === 0 ? '' : `<option value="${i}">${t(m)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>${t("Yil")}</label>
          <input type="number" class="form-control" id="calc-year" value="${now.getFullYear()}" required>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
        <div>
          <h4 style="font-size:12px; color:var(--success); border-bottom:1px solid var(--border); padding-bottom:5px; margin-bottom:12px;">${t("Daromadlar")}</h4>
          <div class="form-group">
            <label>${t("Jami sotuv")}</label>
            <input type="number" step="0.01" class="form-control" id="calc-sale" value="0">
          </div>
          <div class="form-group">
            <label>${t("Jami daromad")}</label>
            <input type="number" step="0.01" class="form-control" id="calc-income" value="0">
          </div>
          <div class="form-group">
            <label>${t("Qo'shilgan mablag'lar")}</label>
            <input type="number" step="0.01" class="form-control" id="calc-added" value="0">
          </div>
        </div>

        <div>
          <h4 style="font-size:12px; color:var(--danger); border-bottom:1px solid var(--border); padding-bottom:5px; margin-bottom:12px;">${t("Xarajatlar")}</h4>
          <div class="form-group">
            <label>${t("Xarajatlar")}</label>
            <input type="number" step="0.01" class="form-control" id="calc-expense" value="0">
          </div>
          <div class="form-group">
            <label>${t("Doimiy xarajatlar")}</label>
            <input type="number" step="0.01" class="form-control" id="calc-fixed" value="0">
          </div>
          <div class="form-group">
            <label>${t("Ish haqi va soliqlar")}</label>
            <input type="number" step="0.01" class="form-control" id="calc-salary-total" value="0" placeholder="${t('Ish haqi va soliqlar')}">
          </div>
        </div>
      </div>
      
      <div style="background:var(--accent-glow); padding:15px; border-radius:12px; border:1px solid var(--accent);">
        <div class="form-group" style="margin-bottom:0">
          <label style="font-weight:700; color:var(--text-primary)">${t("Hisoblangan sof foyda")}</label>
          <input type="number" step="0.01" class="form-control" id="calc-profit" value="0" style="font-size:20px; font-weight:800; color:var(--accent);">
        </div>
      </div>

      <div class="modal-footer" style="padding-top:10px">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
        <button type="submit" class="btn btn-primary" style="padding:10px 40px;">${t("Yaratish")}</button>
      </div>
    </form>
  `);

  // Set current month
  document.getElementById('calc-month').value = now.getMonth() + 1;
}

async function createCalculation(e) {
  e.preventDefault();
  const bid = getSelectedBusinessId();

  try {
    await api.post('/calculations', {
      businessId: bid,
      month: parseInt(document.getElementById('calc-month').value),
      year: parseInt(document.getElementById('calc-year').value),
      totalSale: parseFloat(document.getElementById('calc-sale').value) || 0,
      totalIncome: parseFloat(document.getElementById('calc-income').value) || 0,
      incomeTax: parseFloat(document.getElementById('calc-income-tax').value) || 0,
      totalExpense: parseFloat(document.getElementById('calc-expense').value) || 0,
      totalFixedCosts: parseFloat(document.getElementById('calc-fixed').value) || 0,
      salary: parseFloat(document.getElementById('calc-salary').value) || 0,
      salaryTax: parseFloat(document.getElementById('calc-salary-tax').value) || 0,
      profit: parseFloat(document.getElementById('calc-profit').value) || 0,
      addedMoney: parseFloat(document.getElementById('calc-added').value) || 0,
    });
    showToast(t('Hisob-kitob yaratildi'));
    closeModal();
    renderCalculations();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Global exports
window.renderCalculations = renderCalculations;
window.renderCalculationsTable = renderCalculationsTable;
window.filterCalculations = filterCalculations;
window.openCalculationModal = openCalculationModal;
window.createCalculation = createCalculation;
window.viewCalculationDetail = viewCalculationDetail;
window.calculationPage = calculationPage;
window.allCalculationsList = allCalculationsList;
window.currentCalculations = currentCalculations;
