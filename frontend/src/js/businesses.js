import { api, showToast, formatPrice, formatDate, getSelectedBusinessId, setSelectedBusinessId, escapeHtml } from './api.js';
import { t } from './i18n.js';

// ==================== BUSINESSES MODULE ====================

window.businessPage = 1;
let currentBusinesses = [];
let allBusinessesList = [];

async function renderBusinesses() {
  const content = document.getElementById('page-content');
  try {
    const businesses = await api.get('/businesses/my');
    allBusinessesList = businesses || [];
    renderBusinessesTable(allBusinessesList);
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><h4>${t("Xatolik")}</h4><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function renderBusinessesTable(list) {
  if (list) {
    currentBusinesses = list;
    window.businessPage = 1;
  }

  const limit = 10;
  const totalPages = Math.ceil(currentBusinesses.length / limit);
  if (window.businessPage > totalPages) window.businessPage = totalPages || 1;
  const start = (window.businessPage - 1) * limit;
  const paginated = currentBusinesses.slice(start, start + limit);

  const content = document.getElementById('page-content');
  content.innerHTML = `
      <div class="card">
        <div class="card-header">
           <h3 style="margin:0; font-size:16px;">${t("Mening bizneslarim")}</h3>
           <div class="toolbar">
             <div class="search-box">
               <span class="search-icon">🔍</span>
               <input type="text" placeholder="${t("Qidirish...")}" id="business-search" value="${escapeHtml(document.getElementById('business-search')?.value || '')}" oninput="filterBusinesses(this.value)">
             </div>
             <button class="btn btn-primary btn-sm" onclick="openBusinessModal()">${t("Qo'shish")}</button>
           </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="text-align:center">№</th>
                <th style="text-align:center">${t("Nomi")}</th>
                <th style="text-align:center">${t("Manzil")}</th>
                <th style="text-align:center">${t("Balans")}</th>
                <th style="text-align:center">${t("Hisob raqam")}</th>
                <th style="text-align:center">${t("Yaratilgan")}</th>
                <th style="text-align:center">${t("Amallar")}</th>
              </tr>
            </thead>
            <tbody>
              ${paginated.length === 0 ? `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">${t("Bizneslar yo'q")}</td></tr>` :
      paginated.map((b, i) => `
                  <tr>
                    <td style="text-align:center;">${start + i + 1}</td>
                    <td>
                       <div style="font-weight:700; color:var(--text-primary); font-size:15px;">${escapeHtml(b.name)}</div>
                       <div style="font-size:11px; color:var(--text-muted); opacity:0.8;">${escapeHtml(b.description) || t('Tavsif yo\'q')}</div>
                    </td>
                    <td>
                      ${b.regionName ? `<div style="font-size:13px;">📍 ${escapeHtml(b.regionName)}</div>` : ''}
                      ${b.districtName ? `<div style="font-size:11px; opacity:0.7;">${escapeHtml(b.districtName)}, ${escapeHtml(b.marketName || '')}</div>` : '—'}
                      ${b.address ? `<div style="font-size:10px; opacity:0.6; font-style:italic;">🏠 ${escapeHtml(b.address)}</div>` : ''}
                    </td>
                    <td class="price" style="text-align:center; font-weight:700; ${b.balance < 0 ? 'color: #ef4444;' : ''}">${formatPrice(b.balance)} ${t("so'm")}</td>
                    <td style="text-align:center;"><code style="background:var(--bg-glass); padding:2px 6px; border-radius:4px; font-size:12px;">${escapeHtml(b.businessAccountNumber) || '—'}</code></td>
                    <td style="text-align:center; font-size:12px; opacity:0.7;">${formatDate(b.createdAt)}</td>
                    <td class="actions" style="justify-content:center">
                      <button class="btn-icon" onclick='openBusinessModal(${JSON.stringify(b).replace(/'/g, "&#39;")})' title="${t("Tahrirlash")}">✏️</button>
                      <button class="btn-icon danger" onclick="deleteBusiness(${b.id})" title="${t("O'chirish")}">🗑️</button>
                    </td>
                  </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ${renderPageControls('businessPage', totalPages, 'renderBusinessesTable()')}
    `;
}

function filterBusinesses(query) {
  const q = (query || '').toLowerCase();
  const filtered = allBusinessesList.filter(b =>
    (b.name && String(b.name).toLowerCase().includes(q)) ||
    (b.description && String(b.description).toLowerCase().includes(q))
  );
  const _inputEl = document.getElementById('business-search');
  const _cursor = _inputEl ? _inputEl.selectionStart : 0;

  renderBusinessesTable(filtered);

  setTimeout(() => {
    const input = document.getElementById('business-search');
    if (input) {
      input.focus();
      try { input.setSelectionRange(_cursor, _cursor); } catch (e) { }
    }
  }, 0);
}


function openBusinessModal(b = null) {
  const isEdit = !!b;

  // Create a placeholder for orgs list
  let orgsHtml = `<option value="">${t("Yuklanmoqda...")}</option>`;

  openModal(`
    <div class="modal-header">
      <h3>${isEdit ? t('Biznesni tahrirlash') : t('Yangi biznes')}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <form onsubmit="saveBusiness(event, ${isEdit ? b.id : 0})" style="min-width:450px">
      <div class="form-group">
        <label>${t("Nomi")}</label>
        <input type="text" class="form-control" id="biz-name" value="${isEdit ? escapeHtml(b.name) : ''}" placeholder="${t('Nomini kiriting')}" required>
      </div>
      <div class="form-group">
        <label>${t("Tavsifi")}</label>
        <textarea class="form-control" id="biz-desc" rows="2" style="resize:none" placeholder="${t('Biznes tavsifi')}">${isEdit ? escapeHtml(b.description) : ''}</textarea>
      </div>

      <div class="form-group">
        <label>${t("Tashkilot")}</label>
        <select class="form-control" id="biz-org-sel">
          <option value="">${t("Tashkilotni tanlang")}</option>
        </select>
      </div>

      <div class="form-group">
        <label>${t("Viloyat")}</label>
        <select class="form-control" id="biz-region-sel" required onchange="if(window.onRegionChangeGlobal) window.onRegionChangeGlobal(this.value)">
          <option value="">${t("Viloyatni tanlang")}</option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>${t("Tuman")}</label>
          <select class="form-control" id="biz-district-sel" required onchange="if(window.onDistrictChangeGlobal) window.onDistrictChangeGlobal(this.value)">
            <option value="">${t("Tumanni tanlang")}</option>
          </select>
        </div>
        <div class="form-group">
          <label>${t("Bozor")}</label>
          <select class="form-control" id="biz-market-sel">
            <option value="">${t("Bozorni tanlang")}</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>${t("Manzil")}</label>
          <input type="text" class="form-control" id="biz-address" value="${isEdit ? escapeHtml(b.address || '') : ''}" placeholder="${t('Manzilni kiriting')}">
        </div>
        <div class="form-group">
          <label>${t("Do'kon / Bino raqami")}</label>
          <input type="text" class="form-control" id="biz-extra-address" placeholder="${t('D-123 yoki 1-do\'kon')}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>${t("Hisob raqami")}</label>
          <input type="text" class="form-control" id="biz-account" value="${isEdit ? escapeHtml(b.businessAccountNumber) : ''}" placeholder="123456789">
        </div>
        <div class="form-group">
          <label>${t("Balans")}</label>
          <div style="position:relative">
            <input type="number" step="0.01" class="form-control" id="biz-balance" value="${isEdit ? b.balance : 0}">
            <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); opacity:0.5; font-size:12px;">UZS</span>
          </div>
        </div>
      </div>
      <div class="form-group" style="margin-top:10px; padding:12px; background:rgba(0,0,0,0.02); border-radius:8px;">
        <label style="font-weight:700; margin-bottom:8px; display:block;">${t("Barcode qidiruv sozlamalari")}</label>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <label style="display:flex; align-items:center; gap:8px; font-weight:400; cursor:pointer;">
            <input type="checkbox" id="biz-local-lookup" ${(!isEdit || b.localBarcodeLookup) ? 'checked' : ''}>
            <span>${t("Mahalliy bazadan qidirish")}</span>
          </label>
          <label style="display:flex; align-items:center; gap:8px; font-weight:400; cursor:pointer;">
            <input type="checkbox" id="biz-global-lookup" ${isEdit && b.globalBarcodeLookup ? 'checked' : ''}>
            <span>${t("Global bazadan qidirish (Open Food Facts)")}</span>
          </label>
        </div>
      </div>
      <div class="form-group" style="margin-top:10px; padding:12px; background:rgba(var(--primary-rgb), 0.05); border-radius:8px; border:1px solid rgba(var(--primary-rgb), 0.1);">
        <label style="font-weight:700; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="biz-cashback-enabled" ${isEdit && b.cashbackEnabled ? 'checked' : ''} onchange="toggleCashbackSettings(this.checked)">
          <span>${t("Keshbek tizimi")}</span>
        </label>
        <div id="cashback-settings-group" style="display: ${isEdit && b.cashbackEnabled ? 'flex' : 'none'}; flex-direction:column; gap:10px; margin-top:10px; padding-top:10px; border-top:1px dashed rgba(0,0,0,0.1);">
          <div class="form-row">
            <div class="form-group">
              <label>${t("Keshbek turi")}</label>
              <select class="form-control" id="biz-cashback-type" onchange="toggleCashbackTypeFields(this.value)">
                <option value="percentage" ${isEdit && b.cashbackType === 'percentage' ? 'selected' : ''}>${t("Foizli")}</option>
                <option value="tiered" ${isEdit && b.cashbackType === 'tiered' ? 'selected' : ''}>${t("Darajali (Tiered)")}</option>
                <option value="product_specific" ${isEdit && b.cashbackType === 'product_specific' ? 'selected' : ''}>${t("Mahsulotga xos")}</option>
              </select>
            </div>
            <div class="form-group" id="cashback-pct-group" style="display: ${!isEdit || b.cashbackType === 'percentage' ? 'block' : 'none'}">
              <label>${t("Keshbek foizi")} (%)</label>
              <input type="number" step="0.1" class="form-control" id="biz-cashback-pct" value="${isEdit ? b.cashbackPercentage : 0}">
            </div>
          </div>
          <div id="tiered-cashback-btn-group" style="display: ${isEdit && b.cashbackType === 'tiered' ? 'block' : 'none'}">
            <button type="button" class="btn btn-sm btn-outline" onclick="openCashbackTiersModal(${isEdit ? b.id : 0})">⚙️ ${t("Keshbek darajalari")}</button>
          </div>
        </div>
      </div>
      <div class="form-group" style="margin-top:10px; padding:12px; background:rgba(var(--accent-rgb), 0.05); border-radius:8px; border:1px solid rgba(var(--accent-rgb), 0.1);">
        <label style="font-weight:700; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="biz-points-enabled" ${isEdit && b.pointsEnabled ? 'checked' : ''} onchange="togglePointsSettings(this.checked)">
          <span>${t("Ballar tizimi")}</span>
        </label>
        <div id="points-settings-group" style="display: ${isEdit && b.pointsEnabled ? 'flex' : 'none'}; flex-direction:column; gap:10px; margin-top:10px; padding-top:10px; border-top:1px dashed rgba(0,0,0,0.1);">
          <div class="form-row">
            <div class="form-group">
              <label>${t("Ballar kursi (1 ball uchun UZS)")}</label>
              <div style="position:relative">
                <input type="number" step="100" class="form-control" id="biz-points-rate" value="${isEdit ? b.pointsRate : 1000}">
                <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); opacity:0.5; font-size:12px;">UZS</span>
              </div>
              <p style="font-size:10px; color:var(--text-muted); margin-top:4px;">${t("Masalan: 1000 so'm uchun 1 ball")}</p>
            </div>
            <div class="form-group">
              <label>${t("1 ball qiymati (UZS)")}</label>
              <div style="position:relative">
                <input type="number" step="1" class="form-control" id="biz-point-value" value="${isEdit ? b.pointValue : 1}">
                <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); opacity:0.5; font-size:12px;">UZS</span>
              </div>
              <p style="font-size:10px; color:var(--text-muted); margin-top:4px;">${t("Masalan: 1 ball = 1 so'm")}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="padding-top:10px">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
        <button type="submit" class="btn btn-primary" style="padding:10px 40px;">${isEdit ? t('Saqlash') : t('Yaratish')}</button>
      </div>
    </form>
  `);

  loadRegionsForBusiness(b);
  loadOrganizationsForBusiness(b);

  // Fallback programmatic attachment
  setTimeout(() => {
    const rs = document.getElementById('biz-region-sel');
    if (rs) rs.onchange = (e) => window.onRegionChangeGlobal(e.target.value);
    const ds = document.getElementById('biz-district-sel');
    if (ds) ds.onchange = (e) => window.onDistrictChangeGlobal(e.target.value);
  }, 100);
}

// Global scope functions
window.onRegionChangeGlobal = function (val) {
  // console.log('Region change global trigger for:', val);
  // alert('Tanlangan viloyat ID: ' + val); // Direct feedback
  onRegionChangeForBusiness(val).catch(e => showToast(e.message, 'error'));
};

window.onDistrictChangeGlobal = function (val) {
  onDistrictChangeForBusiness(val).catch(e => showToast(e.message, 'error'));
};

async function previewBusinessImage(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      showToast(t("Rasm yuklanmoqda..."), 'info');
      const result = await api.post('/upload', formData);
      if (result && result.url) {
        document.getElementById('biz-image-url').value = result.url;
        document.getElementById('biz-image-preview').innerHTML = `<img src="${result.url}" style="width:100%; height:100%; object-fit:cover;">`;
        showToast(t("Rasm yuklandi"));
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}

async function loadRegionsForBusiness(b = null) {
  const regionSelect = document.getElementById('biz-region-sel');
  try {
    const regions = await api.get('/geography/regions');
    if (regionSelect) {
      regionSelect.innerHTML = `<option value="">${t("Viloyatni tanlang")}</option>` +
        regions.map(r => `<option value="${r.id}" ${b && b.regionId == r.id ? 'selected' : ''}>${r.name}</option>`).join('');
    }

    if (b && b.regionId) {
      await onRegionChangeForBusiness(b.regionId, b);
    }
  } catch (err) {
    console.error('Viloyatlarni yuklashda xatolik:', err);
    showToast(err.message, 'error');
  }
}

async function loadOrganizationsForBusiness(b = null) {
  const orgSelect = document.getElementById('biz-org-sel');
  try {
    const list = await api.get('/organizations/my');
    if (orgSelect) {
      orgSelect.innerHTML = `<option value="">${t("Tashkilotni tanlang")}</option>` +
        list.map(o => `<option value="${o.id}" ${b && b.organizationId == o.id ? 'selected' : ''}>${o.orgName}</option>`).join('');
    }
  } catch (err) {
    console.error('Tashkilotlarni yuklashda xatolik:', err);
  }
}


async function onRegionChangeForBusiness(regionId, b = null) {
  const districtSelect = document.getElementById('biz-district-sel');
  const marketSelect = document.getElementById('biz-market-sel');

  if (districtSelect) districtSelect.innerHTML = `<option value="">${t("Yuklanmoqda...")}</option>`;
  if (marketSelect) marketSelect.innerHTML = `<option value="">${t("Bozorni tanlang")}</option>`;

  if (!regionId) {
    districtSelect.innerHTML = `<option value="">${t("Tumanni tanlang")}</option>`;
    return;
  }

  try {
    const districts = await api.get(`/geography/districts?regionId=${regionId}`);

    if (!districts || districts.length === 0) {
      showToast(t('Bu viloyat uchun tumanlar topilmadi'), 'warning');
    }
    districtSelect.innerHTML = `<option value="">${t("Tumanni tanlang")}</option>` +
      districts.map(d => `<option value="${d.id}" ${b && b.districtId == d.id ? 'selected' : ''}>${d.name}</option>`).join('');

    if (b && b.districtId) {
      await onDistrictChangeForBusiness(b.districtId, b);
    }
  } catch (err) {
    console.error('Tumanlarni yuklashda xatolik:', err);
    showToast(t('Tumanlarni yuklab bo\'lmadi') + ': ' + err.message, 'error');
  }
}

async function onDistrictChangeForBusiness(districtId, b = null) {
  const marketSelect = document.getElementById('biz-market-sel');
  if (marketSelect) marketSelect.innerHTML = `<option value="">${t("Yuklanmoqda...")}</option>`;

  console.log('District changed to:', districtId);
  if (!districtId) {
    marketSelect.innerHTML = `<option value="">${t("Bozorni tanlang")}</option>`;
    return;
  }

  try {
    const markets = await api.get(`/geography/markets?districtId=${districtId}`);
    console.log('Markets received:', markets);
    if (!markets || markets.length === 0) {
      showToast(t('Bu tuman uchun bozorlar topilmadi'), 'warning');
    }
    marketSelect.innerHTML = `<option value="">${t("Bozorni tanlang")}</option>` +
      markets.map(m => `<option value="${m.id}" ${b && b.marketId == m.id ? 'selected' : ''}>${m.name}</option>`).join('');
  } catch (err) {
    console.error('Bozorlarni yuklashda xatolik:', err);
    showToast(t('Bozorlarni yuklab bo\'lmadi') + ': ' + err.message, 'error');
  }
}

async function saveBusiness(e, id) {
  e.preventDefault();
  const marketId = parseInt(document.getElementById('biz-market-sel')?.value) || null;
  const address = document.getElementById('biz-address').value.trim();
  const extraAddress = document.getElementById('biz-extra-address').value.trim();

  if (!marketId && !address && !extraAddress) {
    showToast(t("Bozor tanlanishi yoki manzil kiritilishi shart!"), 'error');
    return;
  }

  // Combine manual address components if needed
  let finalAddress = address;
  if (extraAddress) {
    finalAddress = address ? `${address}, ${extraAddress}` : extraAddress;
  }

  const data = {
    name: document.getElementById('biz-name').value.trim(),
    description: document.getElementById('biz-desc').value.trim(),
    businessAccountNumber: document.getElementById('biz-account').value.trim(),
    balance: parseFloat(document.getElementById('biz-balance').value) || 0,
    regionId: parseInt(document.getElementById('biz-region-sel')?.value) || null,
    districtId: parseInt(document.getElementById('biz-district-sel')?.value) || null,
    marketId: marketId,
    address: finalAddress,
    image: document.getElementById('biz-image-url')?.value.trim() || null,
    localBarcodeLookup: document.getElementById('biz-local-lookup').checked,
    globalBarcodeLookup: document.getElementById('biz-global-lookup').checked,
    cashbackEnabled: document.getElementById('biz-cashback-enabled').checked,
    cashbackType: document.getElementById('biz-cashback-type').value,
    cashbackPercentage: parseFloat(document.getElementById('biz-cashback-pct').value) || 0,
    pointsEnabled: document.getElementById('biz-points-enabled').checked,
    pointsRate: parseFloat(document.getElementById('biz-points-rate').value) || 0,
    pointValue: parseFloat(document.getElementById('biz-point-value').value) || 0
  };

  try {
    if (id) {
      await api.put(`/businesses/${id}`, data);
      showToast(t('Biznes yangilandi'));
      closeModal();
    } else {
      await api.post('/businesses', data);
      showToast(t('Biznes yaratildi'));
      // Clear form
      document.getElementById('biz-name').value = '';
      document.getElementById('biz-desc').value = '';
      document.getElementById('biz-account').value = '';
      document.getElementById('biz-balance').value = '0';
      document.getElementById('biz-address').value = '';
      document.getElementById('biz-extra-address').value = '';
      document.getElementById('biz-image-url').value = '';
      document.getElementById('biz-image-preview').innerHTML = `<span style="font-size:32px; opacity:0.3;">🖼️</span>`;
      document.getElementById('biz-name').focus();
    }
    if (typeof loadBusinesses === 'function') loadBusinesses();
    renderBusinesses();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteBusiness(id) {
  if (!confirm(t('Biznesni o\'chirishga ishonchingiz komilmi?'))) return;
  try {
    await api.delete(`/businesses/${id}`);
    showToast(t('Biznes o\'chirildi'));
    loadBusinesses();
    renderBusinesses();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Global exports
window.renderBusinesses = renderBusinesses;
window.renderBusinessesTable = renderBusinessesTable;
window.filterBusinesses = filterBusinesses;
window.openBusinessModal = openBusinessModal;
window.saveBusiness = saveBusiness;
window.deleteBusiness = deleteBusiness;
window.previewBusinessImage = previewBusinessImage;
window.businessPage = businessPage;
window.allBusinessesList = allBusinessesList;
window.currentBusinesses = currentBusinesses;
window.toggleCashbackSettings = function (enabled) {
  const group = document.getElementById('cashback-settings-group');
  if (group) group.style.display = enabled ? 'flex' : 'none';
};
window.toggleCashbackTypeFields = function (type) {
  const pctGroup = document.getElementById('cashback-pct-group');
  const tieredGroup = document.getElementById('tiered-cashback-btn-group');
  if (pctGroup) pctGroup.style.display = type === 'percentage' ? 'block' : 'none';
  if (tieredGroup) tieredGroup.style.display = type === 'tiered' ? 'block' : 'none';
};

window.openCashbackTiersModal = async function (businessId) {
  if (!businessId) {
    showToast(t("Avval biznesni saqlang"), 'warning');
    return;
  }

  openModal(`
    <div class="modal-header">
      <h3>${t("Keshbek darajalari")}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div id="cashback-tiers-list" style="min-width:500px; max-height:400px; overflow-y:auto; padding:10px;">
      <div style="text-align:center; padding:20px;">${t("Yuklanmoqda...")}</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="addCashbackTierUI(${businessId})">+ ${t("Qo'shish")}</button>
      <button class="btn btn-ghost" onclick="closeModal()">${t("Yopish")}</button>
    </div>
  `, true); // Use secondary modal if supported, or just overwrite (SavdoSklad usually uses one modal)

  await renderCashbackTiers(businessId);
};

async function renderCashbackTiers(businessId) {
  const container = document.getElementById('cashback-tiers-list');
  try {
    const tiers = await api.getCashbackTiers(businessId);
    if (!tiers || tiers.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:30px; color:var(--text-muted);">
          <div style="font-size:32px; margin-bottom:8px;">🎯</div>
          <div>${t("Hali darajalar qo'shilmagan")}</div>
        </div>`;
      return;
    }

    container.innerHTML = `
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <thead>
          <tr style="background:var(--bg-secondary); border-bottom:2px solid var(--border);">
            <th style="padding:10px 12px; text-align:left; font-weight:700; color:var(--text-primary);">${t("Minimal harid summasi")}</th>
            <th style="padding:10px 12px; text-align:center; font-weight:700; color:var(--text-primary);">${t("Keshbek foizi")} (%)</th>
            <th style="padding:10px 12px; text-align:center; width:60px;"></th>
          </tr>
        </thead>
        <tbody>
          ${tiers.map(tier => `
            <tr style="border-bottom:1px solid var(--border);">
              <td style="padding:10px 12px; font-weight:600; color:var(--text-primary);">${formatPrice(tier.minSpend || tier.minAmount || 0)} ${t("so'm")}</td>
              <td style="padding:10px 12px; text-align:center;">
                <span style="background:rgba(var(--primary-rgb),0.1); color:var(--primary); font-weight:700; padding:3px 10px; border-radius:10px;">${tier.percentage}%</span>
              </td>
              <td style="padding:10px 12px; text-align:center;">
                <button style="background:rgba(239,68,68,0.1); color:#ef4444; border:none; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:14px;" onclick="deleteCashbackTier(${businessId}, ${tier.id})">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:#ef4444; padding:16px;">${escapeHtml(err.message)}</div>`;
  }
}

window.addCashbackTierUI = function (businessId) {
  const minAmount = prompt(t("Minimal harid summasi"));
  if (minAmount === null) return;
  const percentage = prompt(t("Keshbek foizi") + " (%)");
  if (percentage === null) return;

  api.createCashbackTier({
    businessId: businessId,
    minAmount: parseFloat(minAmount),
    percentage: parseFloat(percentage)
  }).then(() => {
    showToast(t("Saqlandi"));
    renderCashbackTiers(businessId);
  }).catch(err => showToast(err.message, 'error'));
};

window.deleteCashbackTier = function (businessId, tierId) {
  if (!confirm(t("O'chirishni xohlaysizmi?"))) return;
  api.deleteCashbackTier(tierId).then(() => {
    showToast(t("O'chirildi"));
    renderCashbackTiers(businessId);
  }).catch(err => showToast(err.message, 'error'));
};

window.togglePointsSettings = function (enabled) {
  const group = document.getElementById('points-settings-group');
  if (group) group.style.display = enabled ? 'flex' : 'none';
};
