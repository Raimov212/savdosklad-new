import { api, showToast, formatPrice, escapeHtml, getSelectedBusinessId, toggleAcc, formatDate } from './api.js';
import { t } from './i18n.js';

// ==================== CALCULATIONS MODULE ====================

let calculationPage = 1;
let currentCalculations = [];
let allCalculationsList = [];

async function renderCalculations() {
  const content = document.getElementById('page-content');
  const bid = getSelectedBusinessId();

  try {
    let calculations = [];
    if (!bid) {
      const businesses = await api.get('/businesses/my').catch(() => []);
      if (businesses && businesses.length > 0) {
        const all = await Promise.all(businesses.map(b => api.get(`/calculations?businessId=${b.id}`).catch(() => [])));
        calculations = all.flat();
      }
    } else {
      calculations = await api.get(`/calculations?businessId=${bid}`);
    }
    
    allCalculationsList = (calculations || []).filter(c => c && typeof c === 'object');

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
  if (typeof list === 'boolean') {
    isAppend = list;
    list = null;
  }
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
            <span style="font-size:11px; font-weight:700; color:var(--text-primary);">${monthText} ${c.year}</span>
            <span class="badge" style="background:${isProfit ? '#4CAF5020' : '#f4433620'}; color:${isProfit ? '#4CAF50' : '#f44336'}; padding:6px 12px; font-weight:700;">
                ${isProfit ? t("Foyda") : t("Zarar")}
            </span>
            </div>
            
            <div style="margin-bottom:15px">
                <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">${t("Sof foyda")}</div>
                <div style="font-size:18px; font-weight:800; text-align: center; color:${isProfit ? 'var(--success)' : 'var(--danger)'};">
                ${isProfit ? '' : '-'}${formatPrice(Math.abs(c.profit))} <small style="font-size:12px; font-weight:400; text-align: center; opacity:0.6;"></small>
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
        </div >
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
            <input type="text" placeholder="${t("Oy/Yil bo'yicha")}" id="calculation-search" value="${escapeHtml(document.getElementById('calculation-search')?.value || '')}" oninput="filterCalculations(this.value)">
          </div>
          <button class="btn btn-primary btn-sm" onclick="openCalculationModal()">${t("Qo'shish")}</button>
        </div>
      </div>
    </div>

      <div class="stats-grid" id="calculations-grid">
           ${paginated.length === 0 && !isAppend ? `<div class="empty-state"><div class="icon">📊</div><h4>${t("Hisob-kitoblar yo'q")}</h4><p>${t("Yangi hisob-kitob yarating.")}</p></div>` : cards}
      </div>
      <div id="calculations-pagination-area">
        ${renderPageControls('calculationPage', totalPages, 'renderCalculationsTable')}
      </div>
      <div class="page-bottom-bar">
        <div class="search-box" style="flex:1; max-width:none;">
          <span class="search-icon" style="color:rgba(255,255,255,0.6);">🔍</span>
          <input type="text" placeholder="${t("Oy/Yil bo'yicha")}" id="calculation-search-bottom" 
            oninput="filterCalculations(this.value)"
            style="background:rgba(255,255,255,0.15); border-color:rgba(255,255,255,0.25); color:white;">
        </div>
        <button class="btn btn-primary" onclick="openCalculationModal()">${t("Qo'shish")}</button>
      </div >
    `;
    attachInfiniteScroll('calculationPage', totalPages, 'renderCalculationsTable');
  } else {
    const grid = document.getElementById('calculations-grid');
    if (grid) {
      grid.insertAdjacentHTML('beforeend', cards);
    }
    const pagArea = document.getElementById('calculations-pagination-area');
    if (pagArea) {
      pagArea.innerHTML = renderPageControls('calculationPage', totalPages, 'renderCalculationsTable');
    }
    attachInfiniteScroll('calculationPage', totalPages, 'renderCalculationsTable');
  }
}

function filterCalculations(query) {
  const q = query.toLowerCase();
  const months = ['', 'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  
  const filtered = allCalculationsList.filter(c => {
    const monthName = t(months[c.month] || '').toLowerCase();
    return String(c.year).includes(q) || monthName.includes(q);
  });
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
              <td style="padding:12px; border:none; color:var(--text-secondary); display:flex; align-items:center; gap:8px;">
                ${t("Jami daromad")}
                <button type="button" class="btn btn-ghost" style="padding:0; height:auto; font-size:10px; opacity:0.5;" onclick="showIncomeBreakdown(${c.businessId}, ${c.month}, ${c.year})" title="${t("Daromad yoyilmasini ko'rish")}">ℹ️</button>
              </td>
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
    <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center;">
      <h3>${t("Yangi hisob-kitob")}</h3>
      <div style="display:flex; gap:10px; align-items:center;">
        <button type="button" class="btn btn-ghost" onclick="syncCalculationStats()" title="${t("Hisoblash")}" style="padding:8px; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.05);">🔄</button>
        <button class="modal-close" onclick="closeModal()" title="${t("Yopish")}" style="position:static; margin:0;">✕</button>
      </div>
    </div>
    <form onsubmit="createCalculation(event)" style="min-width:600px; padding: 0 10px;">
      <div class="form-row" style="margin-bottom: 20px; background: var(--bg-glass); padding: 15px; border-radius: 12px; border: 1px solid var(--border);">
        <div class="form-group" style="margin-bottom:0">
          <label style="font-size:11px; text-transform:uppercase; opacity:0.6; letter-spacing:0.5px;">${t("Oy")}</label>
          <select class="form-control" id="calc-month" required style="background:transparent; border-color:rgba(255,255,255,0.1);">
            ${months.map((m, i) => i === 0 ? '' : `<option value="${i}">${t(m)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label style="font-size:11px; text-transform:uppercase; opacity:0.6; letter-spacing:0.5px;">${t("Yil")}</label>
          <input type="number" class="form-control" id="calc-year" value="${now.getFullYear()}" required style="background:transparent; border-color:rgba(255,255,255,0.1);">
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
        <!-- Daromadlar Section -->
        <div style="background:rgba(16, 185, 129, 0.03); border:1px solid rgba(16, 185, 129, 0.1); padding:20px; border-radius:16px;">
          <h4 style="font-size:13px; color:var(--success); border-bottom:1px solid rgba(16, 185, 129, 0.2); padding-bottom:10px; margin-bottom:15px; display:flex; align-items:center; gap:8px;">
            <span style="background:var(--success); color:white; width:24px; height:24px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:12px;">💰</span>
            ${t("Daromadlar")}
          </h4>
          <div class="form-group">
            <label style="font-size:12px; font-weight:600;">${t("Jami sotuv")}</label>
            <input type="number" step="0.01" class="form-control" id="calc-sale" value="0">
          </div>
          <div class="form-group">
            <label style="font-size:12px; font-weight:600; display:flex; justify-content:space-between; align-items:center;">
              ${t("Jami daromad")}
              <button type="button" class="btn btn-ghost" style="padding:0; height:auto; font-size:10px; opacity:0.5;" onclick="const bid = getSelectedBusinessId(); const month = document.getElementById('calc-month').value; const year = document.getElementById('calc-year').value; showIncomeBreakdown(bid, month, year);" title="${t("Daromad yoyilmasini ko'rish")}">ℹ️</button>
            </label>
            <input type="number" step="0.01" class="form-control" id="calc-income" value="0" oninput="calculateNetProfit()">
          </div>
          <div class="form-group">
            <label style="font-size:12px; font-weight:600;">${t("Qo'shilgan mablag'lar")}</label>
            <input type="number" step="0.01" class="form-control" id="calc-added" value="0" oninput="calculateNetProfit()">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label style="font-size:12px; font-weight:600;">${t("Daromad solig'i")}</label>
            <input type="number" step="0.01" class="form-control" id="calc-income-tax" value="0" oninput="calculateNetProfit()">
          </div>
        </div>

        <!-- Xarajatlar Section -->
        <div style="background:rgba(239, 68, 68, 0.03); border:1px solid rgba(239, 68, 68, 0.1); padding:20px; border-radius:16px;">
          <h4 style="font-size:13px; color:var(--danger); border-bottom:1px solid rgba(239, 68, 68, 0.2); padding-bottom:10px; margin-bottom:15px; display:flex; align-items:center; gap:8px;">
            <span style="background:var(--danger); color:white; width:24px; height:24px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:12px;">📉</span>
            ${t("Xarajatlar")}
          </h4>
          <div class="form-group">
            <label style="font-size:12px; font-weight:600;">${t("Xarajatlar")}</label>
            <input type="number" step="0.01" class="form-control" id="calc-expense" value="0" oninput="calculateNetProfit()">
          </div>
          <div class="form-group">
            <label style="font-size:12px; font-weight:600;">${t("Doimiy xarajatlar")}</label>
            <input type="number" step="0.01" class="form-control" id="calc-fixed" value="0" oninput="calculateNetProfit()">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label style="font-size:12px; font-weight:600;">${t("Ish haqi va soliqlar")}</label>
            <input type="number" step="0.01" class="form-control" id="calc-salary-total" value="0" placeholder="${t('Ish haqi va soliqlar')}" oninput="calculateNetProfit()">
          </div>
        </div>
      </div>

      <div style="background:linear-gradient(135deg, var(--accent-glow), rgba(16, 185, 129, 0.1)); padding:20px; border-radius:16px; border:1px solid var(--accent); position:relative; overflow:hidden;">
        <div style="position:absolute; right:-20px; top:-20px; font-size:80px; opacity:0.05; transform:rotate(-15deg);">💎</div>
        <div class="form-group" style="margin-bottom:0; position:relative; z-index:1;">
          <label style="font-weight:700; color:var(--text-primary); font-size:14px; margin-bottom:8px; display:block;">${t("Hisoblangan sof foyda")}</label>
          <div style="display:flex; align-items:center; gap:12px;">
            <input type="number" step="0.01" class="form-control" id="calc-profit" value="0" readonly style="font-size:24px; font-weight:800; color:var(--accent); background:transparent; border:none; padding:0; height:auto;">
            <span style="font-size:14px; font-weight:700; color:var(--accent); opacity:0.7;">UZS</span>
          </div>
        </div>
      </div>

      <div class="modal-footer" style="padding: 20px 0 10px 0; border-top: 1px solid var(--border); margin-top:20px;">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
        <button type="submit" class="btn btn-primary" style="padding:12px 50px; border-radius:12px; font-weight:700; box-shadow:0 4px 15px rgba(16, 185, 129, 0.2);">${t("Yaratish")}</button>
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
      salary: parseFloat(document.getElementById('calc-salary-total').value) || 0,
      salaryTax: 0, // Currently bundled in total if entered that way
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

async function syncCalculationStats() {
  const bid = getSelectedBusinessId();
  const month = document.getElementById('calc-month').value;
  const year = document.getElementById('calc-year').value;

  if (!bid || !month || !year) return;

  try {
    const res = await api.get(`/calculations/stats?businessId=${bid}&month=${month}&year=${year}`);

    document.getElementById('calc-sale').value = res.totalSale || 0;
    document.getElementById('calc-income').value = res.totalIncome || 0;
    document.getElementById('calc-expense').value = res.totalExpense || 0;
    document.getElementById('calc-fixed').value = res.totalFixedCosts || 0;
    document.getElementById('calc-salary-total').value = res.totalSalary || 0;

    calculateNetProfit();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function calculateNetProfit() {
  const income = parseFloat(document.getElementById('calc-income').value) || 0;
  const expense = parseFloat(document.getElementById('calc-expense').value) || 0;
  const fixed = parseFloat(document.getElementById('calc-fixed').value) || 0;
  const salary = parseFloat(document.getElementById('calc-salary-total').value) || 0;
  const added = parseFloat(document.getElementById('calc-added').value) || 0;
  const incomeTax = parseFloat(document.getElementById('calc-income-tax').value) || 0;

  const profit = income - expense - fixed - salary + added - incomeTax;
  document.getElementById('calc-profit').value = profit.toFixed(2);
}


window.showIncomeBreakdown = async function(bid, month, year) {
  try {
    const data = await api.get(`/calculations/income-breakdown?businessId=${bid}&month=${month}&year=${year}`);
    if (!data || data.length === 0) {
      showToast(t("Ma'lumot topilmadi"), 'info');
      return;
    }

    let rows = '';
    data.forEach(item => {
      rows += `
        <tr>
          <td style="padding:10px; border-bottom:1px solid var(--border); font-size:13px;">${item.productName}</td>
          <td style="padding:10px; border-bottom:1px solid var(--border); text-align:center; font-size:13px;">${item.quantity}</td>
          <td style="padding:10px; border-bottom:1px solid var(--border); text-align:right; font-size:13px;">${formatPrice(item.avgPrice)}</td>
          <td style="padding:10px; border-bottom:1px solid var(--border); text-align:right; font-size:13px; color:var(--danger);">${formatPrice(item.buyPrice)}</td>
          <td style="padding:10px; border-bottom:1px solid var(--border); text-align:right; font-size:13px; font-weight:700; color:${item.totalProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">
            ${formatPrice(item.totalProfit)}
          </td>
        </tr>
      `;
    });

    const breakdownHtml = `
      <div class="modal-header">
        <h3>${t("Daromad yoyilmasi")}</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>
      <div style="max-height:400px; overflow-y:auto; padding:10px;">
        <table style="width:100%; border-collapse:collapse;">
          <thead style="position:sticky; top:0; background:var(--bg-card); z-index:1;">
            <tr>
              <th style="text-align:left; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${t("Mahsulot")}</th>
              <th style="text-align:center; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${t("Soni")}</th>
              <th style="text-align:right; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${t("Sotish narxi")}</th>
              <th style="text-align:right; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${t("Tan narxi")}</th>
              <th style="text-align:right; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${t("Foyda")}</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">${t("Yopish")}</button>
      </div>
    `;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '2000';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.width = '700px';
    modal.innerHTML = breakdownHtml;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

  } catch (err) {
    showToast(err.message, 'error');
  }
};

// Global exports
window.renderCalculations = renderCalculations;
window.renderCalculationsTable = renderCalculationsTable;
window.filterCalculations = filterCalculations;
window.openCalculationModal = openCalculationModal;
window.createCalculation = createCalculation;
window.viewCalculationDetail = viewCalculationDetail;
window.syncCalculationStats = syncCalculationStats;
window.calculateNetProfit = calculateNetProfit;
window.calculationPage = calculationPage;
window.allCalculationsList = allCalculationsList;
window.currentCalculations = currentCalculations;
