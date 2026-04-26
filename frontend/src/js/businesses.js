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
  const q = query.toLowerCase();
  const filtered = allBusinessesList.filter(b =>
    (b.name && b.name.toLowerCase().includes(q)) ||
    (b.description && b.description.toLowerCase().includes(q))
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
          <option value="">${t("Tashkilotni tanlang")} (ixtiyoriy)</option>
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
      <div class="form-group">
        <label>${t("Biznes logotipi")}</label>
        <div style="display:flex; gap:16px; align-items: flex-start;">
           <div id="biz-image-preview" style="width:100px; height:100px; border-radius:12px; background:var(--bg-input); border:2px dashed var(--border); overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
             ${isEdit && b.image ? `<img src="${b.image}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size:32px; opacity:0.3;">🖼️</span>`}
           </div>
           <div style="flex:1">
             <input type="file" class="form-control" id="biz-image-file" accept="image/*" onchange="previewBusinessImage(this)">
             <input type="hidden" id="biz-image-url" value="${isEdit && b.image ? escapeHtml(b.image) : ''}">
             <p style="font-size:11px; color:var(--text-muted); margin-top:6px;">${t("Tavsiya etilgan: 500x500px. JPG, PNG.")}</p>
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
      orgSelect.innerHTML = `<option value="">${t("Tashkilotni tanlang")} (ixtiyoriy)</option>` +
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
    image: document.getElementById('biz-image-url')?.value.trim() || null
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
