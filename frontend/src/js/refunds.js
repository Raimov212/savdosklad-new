import { api, showToast, formatPrice, escapeHtml, getSelectedBusinessId, toggleAcc, formatDateTime } from './api.js';
import { t, currentLang } from './i18n.js';

window.refundPage = 1;
let currentRefunds = [];
let allRefundsList = [];

async function renderRefunds() {
  const content = document.getElementById('page-content');
  const bid = getSelectedBusinessId();

  if (!bid) {
    content.innerHTML = `<div class="empty-state"><div class="icon">🔄</div><h4>${t("Avval biznes tanlang")}</h4></div>`;
    return;
  }

  try {
    const refunds = await api.get(`/refunds?businessId=${bid}${getDateQuery()}`);
    allRefundsList = refunds || [];
    renderRefundsTable(allRefundsList);
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><h4>${t("Xatolik")}</h4><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function renderRefundsTable(list, isAppend = false) {
  if (typeof list === 'boolean') {
    isAppend = list;
    list = null;
  }

  if (list) {
    if (!isAppend) window.refundPage = 1;
    currentRefunds = list;
  }

  const limit = 15;
  const totalPages = Math.ceil(currentRefunds.length / limit);
  // Infinite scroll logic
  const end = window.refundPage * limit;
  const paginated = currentRefunds.slice(end - limit, end);

  const content = document.getElementById('page-content');

  const items = paginated.length === 0 && !isAppend
    ? `<div class="empty-state"><div class="icon">🔄</div><h4>${t("Qaytarishlar yo'q")}</h4></div>`
    : paginated.map((refund, i) => {
      return `
        <div class="acc-item" id="refund-acc-${refund.id}">
          <div class="acc-header" onclick="toggleAcc('refund-acc-${refund.id}')">
            <div class="acc-header-left">
              <div class="acc-avatar acc-avatar-orange">🔄</div>
              <div>
                <div class="acc-title">${formatDateTime(refund.createdAt)}</div>
                <div class="acc-subtitle">#${refund.id} — ${refund.clientName ? escapeHtml(refund.clientName) : t('Begona xaridor')}</div>
              </div>
            </div>
            <div class="acc-header-right">
              <span class="acc-price" style="color:var(--danger);">${formatPrice(refund.total)} ${t("so'm")}</span>
              <span class="acc-chevron">▼</span>
            </div>
          </div>
          <div class="acc-body">
            <div class="acc-detail-grid">
               <div class="acc-detail-item">
                <span class="acc-detail-icon">📄</span>
                <div><div class="acc-detail-label">${t("Izoh")}</div><div class="acc-detail-value">${refund.description || t("Tavsif yo'q")}</div></div>
              </div>
               <div class="acc-detail-item">
                <span class="acc-detail-icon">💰</span>
                <div><div class="acc-detail-label">${t("Jami summa")}</div><div class="acc-detail-value">${formatPrice(refund.total)} ${t("so'm")}</div></div>
              </div>
              <div class="acc-detail-item">
                <span class="acc-detail-icon">🏢</span>
                <div><div class="acc-detail-label">${t("Mas'ul")}</div><div class="acc-detail-value">${escapeHtml(refund.createdByName || t("Tizim"))}</div></div>
              </div>
            </div>
            <div class="acc-actions">
              <button class="btn btn-ghost btn-sm" onclick="viewRefundItems(${refund.id})">👁️ ${t("Tafsilotlar")}</button>
              <button class="btn btn-primary btn-sm" onclick="downloadRefundPdf(${refund.id})">📄 ${t("PDF")}</button>
            </div>
          </div>
        </div>`;
    }).join('');

  if (!isAppend) {
    content.innerHTML = `
      <div class="acc-list" id="refund-acc-list">${items}</div>
      <div id="refund-pagination-area">
        ${renderPageControls('refundPage', totalPages, 'renderRefundsTable')}
      </div>
      <div class="page-bottom-bar">
        <div class="search-box" style="flex:1; max-width:none;">
          <span class="search-icon" style="color:rgba(255,255,255,0.6);">🔍</span>
          <input type="text" placeholder="${t("Qidirish...")}" id="refund-search"
            value="${escapeHtml(document.getElementById('refund-search')?.value || '')}"
            oninput="filterRefunds(this.value)"
            style="background:rgba(255,255,255,0.15); border-color:rgba(255,255,255,0.25); color:white;">
        </div>
        <button class="btn btn-ghost" onclick="openDateFilterModal()" style="padding: 10px 15px;" title="${t("Sana bo'yicha filter")}">📅</button>
        ${window.hasPermission('add') ? `<button class="btn btn-primary" onclick="openRefundModal()">${t("Qo'shish")}</button>` : ''}
      </div>
    `;
    attachInfiniteScroll('refundPage', totalPages, 'renderRefundsTable');
  } else {
    const listContainer = document.getElementById('refund-acc-list');
    if (listContainer) {
      listContainer.insertAdjacentHTML('beforeend', items);
    }
    const pagArea = document.getElementById('refund-pagination-area');
    if (pagArea) {
      pagArea.innerHTML = renderPageControls('refundPage', totalPages, 'renderRefundsTable');
    }
    attachInfiniteScroll('refundPage', totalPages, 'renderRefundsTable');
  }
}

async function viewRefundItems(id) {
  try {
    showToast(t('Tafsilotlar yuklanmoqda...'), 'info');
    const items = await api.get(`/refunds/${id}/items`);
    const list = items || [];

    openModal(`
      <div class="modal-header">
        <h3>${t("Qaytarish tafsilotlari")} #${id}</h3>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th style="text-align:center">${t("Mahsulot nomi")}</th>
              <th style="text-align:center">${t("Narxi")}</th>
              <th style="text-align:center">${t("Soni")}</th>
              <th style="text-align:center">${t("Jami")}</th>
            </tr>
          </thead>
          <tbody>
            ${list.length === 0 ? `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">${t("Ma'lumot yo'q")}</td></tr>` :
        list.map((item, i) => {
          const pName = item.productName || `${t("Mahsulot")} #${item.productId}`;
          return `
                <tr>
                  <td>${i + 1}</td>
                  <td style="font-weight:600;">${escapeHtml(pName)}</td>
                  <td class="price" style="text-align:right">${formatPrice(item.productPrice)}</td>
                  <td style="text-align:center">${item.productQuantity}</td>
                  <td class="price" style="text-align:right"><strong>${formatPrice(item.productPrice * item.productQuantity)}</strong></td>
                </tr>`;
        }).join('')}
          </tbody>
          ${list.length > 0 ? `
          <tfoot>
            <tr style="background: rgba(255, 255, 255, 0.05); font-weight: bold;">
              <td colspan="3" style="text-align:right; font-size: 14px;">${t("Jami")}:</td>
              <td style="text-align:center; font-size: 14px;">${list.reduce((sum, item) => sum + (item.productQuantity || 0), 0)}</td>
              <td class="price" style="text-align:right; font-size: 14px; color: var(--success);">${formatPrice(list.reduce((sum, item) => sum + ((item.productPrice || 0) * (item.productQuantity || 0)), 0))}</td>
            </tr>
          </tfoot>` : ''}
        </table>
      </div>
      <div class="modal-footer" style="padding-top:10px">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
      </div>
    `);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function downloadRefundPdf(id) {
  const { jsPDF } = window.jspdf;
  const bid = getSelectedBusinessId();
  try {
    showToast(t('PDF tayyorlanmoqda...'), 'info');

    const businesses = await api.get('/businesses/my').catch(() => []);
    const [refundItems, clientsResults, refund] = await Promise.all([
      api.get(`/refunds/${id}/items`),
      Promise.all(businesses.map(b => api.get(`/clients?businessId=${b.id}`).catch(() => []))),
      Promise.resolve(allRefundsList.find(r => r.id === id))
    ]);

    const clients = clientsResults.flat();

    const doc = new jsPDF();
    let fontName = 'helvetica';
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
    } catch (e) {
      console.warn('Could not load Roboto font', e);
    }

    doc.setFont(fontName);
    doc.setFontSize(14);
    doc.text(`${t("Qaytarish")}: #${id}`, 15, 15);

    doc.setFontSize(10);
    doc.text(`${t("Sana")}: ${formatDateTime(refund.createdAt)}`, 15, 22);

    if (refund.clientName) {
      doc.text(`${t("Mijoz")}: ${refund.clientName}`, 15, 29);
    }

    const tableData = refundItems.map((item, index) => [
      index + 1,
      item.productName || `${t("Mahsulot")} #${item.productId}`,
      item.productQuantity,
      formatPrice(item.productPrice),
      formatPrice(item.productPrice * item.productQuantity)
    ]);

    const totalQty = refundItems.reduce((sum, item) => sum + (item.productQuantity || 0), 0);

    doc.autoTable({
      startY: 40,
      head: [['№', t('Mahsulot nomi'), t('Soni'), t('Narxi'), t('Jami')]],
      body: tableData,
      foot: [['', t('Jami') + ':', totalQty, '', formatPrice(refund.total)]],
      theme: 'grid',
      styles: { font: fontName, fontSize: 10, halign: 'center' },
      headStyles: { fillColor: [230, 230, 230], textColor: 0, font: fontName, halign: 'center' },
      footStyles: { fillColor: [240, 240, 240], textColor: [239, 68, 68], fontStyle: 'bold', font: fontName, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 40, halign: 'right' }
      }
    });

    let finalY = doc.lastAutoTable.finalY + 15;

    if (refund.description) {
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`${t("Izoh")}: ${refund.description}`, 15, finalY);
    }

    doc.save(`${t("Qaytarish_")}${id}.pdf`);
    showToast(t('PDF yuklab olindi'));
  } catch (err) {
    console.error(err);
    showToast(t('PDF yarata olmadim: ') + err.message, 'error');
  }
}

function filterRefunds(query) {
  const q = query.toLowerCase();
  const filtered = allRefundsList.filter(r =>
    (r.clientName && r.clientName.toLowerCase().includes(q)) ||
    (r.id.toString().includes(q))
  );
  renderRefundsTable(filtered);
}

// Store for managing modal state
let currentTransactionItems = [];

async function openRefundModal() {
  openModal(`
    <div class="modal-header">
      <h3>${t("Qaytarish qo'shish")}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body" style="padding: 20px;">
      <div class="form-group">
        <label>${t("Sotuv ID raqami")}</label>
        <div style="display:flex; gap:10px;">
          <input type="number" class="form-control" id="refund-trans-id" placeholder="${t("Masalan: 3468")}">
          <button type="button" class="btn btn-primary" onclick="checkTransactionForRefund()">${t("Tekshirish")}</button>
        </div>
      </div>
      <div id="refund-items-area" style="margin-top:20px;"></div>
      <div class="modal-footer" style="padding-top:10px">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
      </div>
    </div>
  `);
}

async function checkTransactionForRefund() {
  const tid = document.getElementById('refund-trans-id').value;
  if (!tid) return;

  try {
    showToast(t("Tafsilotlar yuklanmoqda..."), 'info');
    const items = await api.get(`/transactions/${tid}/items`);
    currentTransactionItems = items || [];

    if (currentTransactionItems.length === 0) {
      document.getElementById('refund-items-area').innerHTML = `<p style="color:var(--danger); text-align:center; padding:20px;">${t("Sotuv topilmadi")} yoki unda mahsulotlar yo'q.</p>`;
      return;
    }

    renderRefundSelection();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderRefundSelection() {
  const area = document.getElementById('refund-items-area');

  area.innerHTML = `
    <div class="table-container" style="max-height: 380px; overflow-y: auto; margin-bottom: 20px; border: 1px solid var(--border); border-radius: var(--radius-md);">
      <table style="font-size: 12px; width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: var(--bg-glass); border-bottom: 1px solid var(--border);">
            <th rowspan="2" style="padding: 10px; text-align: left; vertical-align: middle;">${t("Mahsulot")}</th>
            <th rowspan="2" style="padding: 10px; text-align:center; vertical-align: middle;">${t("Sotilgan")}</th>
            <th rowspan="2" style="padding: 10px; text-align:center; vertical-align: middle;">${t("Narxi")}</th>
            <th colspan="2" style="padding: 5px; text-align:center; border-left: 1px solid var(--border);">${t("Qaytarilgan")}</th>
            <th colspan="2" style="padding: 5px; text-align:center; border-left: 1px solid var(--border);">${t("Qaytarish")}</th>
          </tr>
          <tr style="background: var(--bg-glass); border-bottom: 2px solid var(--border);">
            <th style="padding: 5px; text-align:center; border-left: 1px solid var(--border); font-size: 10px;">${t("Miqdori")}</th>
            <th style="padding: 5px; text-align:center; font-size: 10px;">${t("Summa")}</th>
            <th style="padding: 5px; text-align:center; border-left: 1px solid var(--border); font-size: 10px;">${t("Miqdori")}</th>
            <th style="padding: 5px; text-align:center; font-size: 10px;">${t("Summa")}</th>
          </tr>
        </thead>
        <tbody>
          ${currentTransactionItems.map((item, idx) => {
    const availableQty = item.productQuantity - item.refundedQuantity;
    return `
            <tr style="border-bottom: 1px solid var(--border);">
              <td style="padding: 8px 10px;">
                <div style="font-weight:600;">${escapeHtml(item.productName)}</div>
                <small style="opacity:0.6;">${item.productBarcode || ''}</small>
              </td>
              <td style="padding: 8px; text-align:center;">${item.productQuantity}</td>
              <td style="padding: 8px; text-align:center;">${formatPrice(item.productPrice)}</td>
              <td style="padding: 8px; text-align:center; background: rgba(var(--danger-rgb), 0.02); border-left: 1px solid var(--border);">${item.refundedQuantity}</td>
              <td style="padding: 8px; text-align:right; background: rgba(var(--danger-rgb), 0.02);">${formatPrice(item.refundedSum)}</td>
              <td style="padding: 8px; width: 80px; border-left: 1px solid var(--border);">
                <input type="number" class="form-control" style="padding:4px; text-align:center; font-weight: 600;" 
                  id="refund-qty-${idx}" value="0" min="0" max="${availableQty}" 
                  oninput="onRefundQtyChange(${idx}, this.value)">
              </td>
              <td style="padding: 8px; width: 120px;">
                <input type="number" step="0.01" class="form-control" style="padding:4px; text-align:right; color: var(--danger); font-weight: 700;" 
                  id="refund-amount-${idx}" value="0" min="0"
                  oninput="validateRefundAmount(${idx}, this.value)">
              </td>
            </tr>
          `;
  }).join('')}
        </tbody>
      </table>
    </div>
    <div class="form-group">
      <label>${t("Izoh")}</label>
      <input type="text" class="form-control" id="refund-desc" placeholder="${t("Izoh")}">
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; background:var(--bg-glass); padding:15px; border-radius:var(--radius-md); border: 1px solid var(--border);">
      <div style="font-size:18px; font-weight:700;">${t("Jami")}: <span id="refund-total-amount">0</span> ${t("so'm")}</div>
      <div style="display:flex; gap:10px;">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
        <button type="button" class="btn btn-primary" style="padding: 10px 40px;" onclick="submitRefund()">${t("Qaytarish")}</button>
      </div>
    </div>
  `;
}

function onRefundQtyChange(idx, val) {
  const qty = parseInt(val) || 0;
  const item = currentTransactionItems[idx];
  const amountInput = document.getElementById(`refund-amount-${idx}`);

  // Default amount = qty * price
  const defaultAmount = qty * item.productPrice;
  amountInput.value = defaultAmount;

  updateRefundTotal();
}

function validateRefundAmount(idx, val) {
  const amount = parseFloat(val) || 0;
  const qty = parseInt(document.getElementById(`refund-qty(${idx})`) ? document.getElementById(`refund-qty(${idx})`).value : 0) || 0;
  // wait, I used refund-qty-${idx} in template
  const qtyInput = document.getElementById(`refund-qty-${idx}`);
  const actualQty = qtyInput ? (parseInt(qtyInput.value) || 0) : 0;

  const item = currentTransactionItems[idx];
  const maxAmount = actualQty * item.productPrice;

  if (amount > maxAmount) {
    document.getElementById(`refund-amount-${idx}`).value = maxAmount;
    showToast(t("Qaytarish summasi sotuv narxidan oshib keta olmaydi"), 'warning');
  }

  updateRefundTotal();
}

function updateRefundTotal() {
  let total = 0;
  currentTransactionItems.forEach((item, idx) => {
    const el = document.getElementById(`refund-amount-${idx}`);
    if (el) {
      total += (parseFloat(el.value) || 0);
    }
  });
  const totalEl = document.getElementById('refund-total-amount');
  if (totalEl) totalEl.textContent = formatPrice(total);
}

async function submitRefund() {
  const bid = getSelectedBusinessId();
  const tid = document.getElementById('refund-trans-id').value;
  const desc = document.getElementById('refund-desc').value;

  const items = [];
  let total = 0;

  currentTransactionItems.forEach((item, idx) => {
    const qtyInput = document.getElementById(`refund-qty-${idx}`);
    const amountInput = document.getElementById(`refund-amount-${idx}`);

    if (qtyInput && amountInput) {
      const qty = parseInt(qtyInput.value) || 0;
      const amount = parseFloat(amountInput.value) || 0;

      if (qty > 0) {
        items.push({
          productId: item.productId,
          productQuantity: qty,
          productPrice: item.productPrice,
          transactionId: item.id,
          description: desc
        });
        total += amount;
      }
    }
  });

  if (items.length === 0) {
    showToast(t("Kamida bitta mahsulot miqdorini kiriting"), 'error');
    return;
  }

  try {
    await api.post('/refunds', {
      businessId: bid,
      total: total,
      description: desc,
      cash: total,
      items: items
    });

    showToast(t("Qaytarish muvaffaqiyatli amalga oshirildi!"));
    
    // Clear form
    const tidInput = document.getElementById('refund-trans-id');
    if (tidInput) {
      tidInput.value = '';
      document.getElementById('refund-items-area').innerHTML = '';
      tidInput.focus();
    } else {
      closeModal();
    }
    renderRefunds();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Global exports
window.renderRefunds = renderRefunds;
window.renderRefundsTable = renderRefundsTable;
window.filterRefunds = filterRefunds;
window.openRefundModal = openRefundModal;
window.checkTransactionForRefund = checkTransactionForRefund;
window.onRefundQtyChange = onRefundQtyChange;
window.validateRefundAmount = validateRefundAmount;
window.updateRefundTotal = updateRefundTotal;
window.submitRefund = submitRefund;
window.viewRefundItems = viewRefundItems;
window.downloadRefundPdf = downloadRefundPdf;
window.refundPage = refundPage;
