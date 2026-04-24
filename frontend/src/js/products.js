import { api, API_BASE, showToast, formatPrice, escapeHtml, getSelectedBusinessId, toggleAcc } from './api.js';
import { t } from './i18n.js';

// ==================== PRODUCTS MODULE ====================

let allProducts = [];
let allCategories = [];

async function renderProducts() {
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
        businesses.map(b => 
          Promise.all([
            api.get(`/products?businessId=${b.id}`).catch(() => []),
            api.get(`/categories?businessId=${b.id}`).catch(() => [])
          ]).then(([prods, cats]) => {
            // Tag with business name for UI
            prods.forEach(p => { p._businessName = b.name; p._businessId = b.id; });
            cats.forEach(c => { c._businessId = b.id; });
            return { prods, cats };
          })
        )
      );

      allProducts = results.flatMap(r => r.prods).filter(p => !p.isDeleted);
      allCategories = results.flatMap(r => r.cats);
    } else {
      const [products, categories] = await Promise.all([
        api.get(`/products?businessId=${bid}`),
        api.get(`/categories?businessId=${bid}`)
      ]);
      allProducts = (products || []).filter(p => !p.isDeleted);
      allCategories = categories || [];
    }

    renderProductsTable(allProducts);
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><h4>${t("Xatolik")}</h4><p>${escapeHtml(err.message)}</p></div>`;
  }
}

window.productPage = 1;
let currentProducts = [];

function renderProductsTable(list, isAppend = false) {
  if (typeof list === 'boolean') {
    isAppend = list;
    list = null;
  }
  if (list) {
    if (!isAppend) window.productPage = 1;
    currentProducts = list;
  }

  const limit = 15;
  const totalPages = Math.ceil(currentProducts.length / limit);
  // Infinite scroll: slice from 0 to current page * limit
  const end = window.productPage * limit;
  const paginated = currentProducts.slice(end - limit, end);

  const content = document.getElementById('page-content');
  const avatarColors = ['acc-avatar-indigo', 'acc-avatar-green', 'acc-avatar-blue', 'acc-avatar-orange'];

  const items = paginated.length === 0 && !isAppend
    ? `<div class="empty-state"><div class="icon">📦</div><h4>${t("Mahsulotlar yo'q")}</h4></div>`
    : paginated.map((p, i) => {
      const cat = allCategories.find(c => c.id === p.categoryId && (p._businessId ? c._businessId === p._businessId : true));
      const colorClass = avatarColors[i % avatarColors.length];
      const initial = (p.name || '?')[0].toUpperCase();
      const finalPrice = p.price * (1 - (p.discount || 0) / 100);
      const bizBadge = p._businessName ? `<span class="badge" style="background:rgba(255,255,255,0.05); border:1px solid var(--border); font-size:10px; opacity:0.7;">${escapeHtml(p._businessName)}</span>` : '';
      const stockBadge = p.quantity <= 5
        ? `<span class="badge badge-danger">${p.quantity} ${t("ta")}</span>`
        : `<span class="badge" style="background:#ECFDF5; color:#059669;">${p.quantity} ${t("ta")}</span>`;

      return `
        <div class="acc-item" id="prod-acc-${p.id}">
          <div class="acc-header" onclick="toggleAcc('prod-acc-${p.id}')">
            <div class="acc-header-left">
              ${p.images
          ? `<img src="${p.images}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid var(--border);flex-shrink:0;" alt="">`
          : `<div class="acc-avatar ${colorClass}">${initial}</div>`
        }
              <div>
                <div class="acc-title">${escapeHtml(p.name)}</div>
                <div class="acc-subtitle">${cat ? escapeHtml(cat.name) : '—'} ${p.barcode ? '· ' + escapeHtml(p.barcode) : ''} ${bizBadge}</div>
              </div>
            </div>
            <div class="acc-header-right">
              ${stockBadge}
              <span class="acc-price">${formatPrice(finalPrice)} ${t("so'm")}</span>
              <span class="acc-chevron">▼</span>
            </div>
          </div>
          <div class="acc-body">
            <div class="acc-detail-grid">
              <div class="acc-detail-item">
                <span class="acc-detail-icon">📊</span>
                <div><div class="acc-detail-label">${t("Miqdori")}</div><div class="acc-detail-value">${p.quantity}</div></div>
              </div>
              <div class="acc-detail-item">
                <span class="acc-detail-icon">💰</span>
                <div><div class="acc-detail-label">${t("Sotish narxi")}</div><div class="acc-detail-value">${formatPrice(p.price)} ${t("so'm")}</div></div>
              </div>
              <div class="acc-detail-item">
                <span class="acc-detail-icon">📥</span>
                <div><div class="acc-detail-label">${t("Tan narxi")} (Buy)</div><div class="acc-detail-value">${formatPrice(p.buyPrice || 0)} ${t("so'm")}</div></div>
              </div>
              ${p.discount > 0 ? `<div class="acc-detail-item">
                <span class="acc-detail-icon">🏷️</span>
                <div><div class="acc-detail-label">${t("Chegirma")}</div><div class="acc-detail-value">${p.discount}%</div></div>
              </div>` : ''}
              ${p.barcode ? `<div class="acc-detail-item">
                <span class="acc-detail-icon">📋</span>
                <div><div class="acc-detail-label">${t("Barcode")}</div><div class="acc-detail-value" style="font-family:monospace;">${escapeHtml(p.barcode)}</div></div>
              </div>` : ''}
              ${p.country ? `<div class="acc-detail-item">
                <span class="acc-detail-icon">🌍</span>
                <div><div class="acc-detail-label">${t("Mamlakat")}</div><div class="acc-detail-value">${escapeHtml(p.country)}</div></div>
              </div>` : ''}
			  ${p.lokalCode ? `<div class="acc-detail-item">
                <span class="acc-detail-icon">🔖</span>
                <div><div class="acc-detail-label">${t("Lokal kod")}</div><div class="acc-detail-value">${escapeHtml(p.lokalCode)}</div></div>
              </div>` : ''}
              ${p.shortDescription ? `<div class="acc-detail-item" style="grid-column: 1/-1;">
                <span class="acc-detail-icon">📝</span>
                <div><div class="acc-detail-label">${t("Tavsifi")}</div><div class="acc-detail-value">${escapeHtml(p.shortDescription)}</div></div>
              </div>` : ''}
            </div>
            <div class="acc-actions">
              ${window.hasPermission('edit') ? `<button class="btn btn-success btn-sm" onclick='openProductModal(${JSON.stringify(p).replace(/'/g, "&#39;")})'>✏️ ${t("Tahrirlash")}</button>` : ''}
              ${window.hasPermission('delete') ? `<button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">🗑️ ${t("O'chirish")}</button>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');

  if (!isAppend) {
    content.innerHTML = `
      <div class="acc-list" id="product-acc-list">${items}</div>
      <div id="product-pagination-area">
        ${renderPageControls('productPage', totalPages, 'renderProductsTable')}
      </div>
      <div class="page-bottom-bar">
        <div class="search-box" style="flex:1; max-width:none;">
          <span class="search-icon" style="color:rgba(255,255,255,0.6);">🔍</span>
          <input type="text" placeholder="${t("Qidirish...")}" id="product-search"
            value="${escapeHtml(document.getElementById('product-search')?.value || '')}"
            oninput="filterProducts(this.value)"
            style="background:rgba(255,255,255,0.15); border-color:rgba(255,255,255,0.25); color:white;">
        </div>
        <button class="btn btn-ghost" onclick="openDateFilterModal()" style="padding: 10px 15px;" title="${t("Sana bo'yicha filter")}">📅</button>
        ${getSelectedBusinessId() && window.hasPermission('add') ? `<button class="btn btn-primary" onclick="openProductModal()">${t("Qo'shish")}</button>` : ''}
      </div>
    `;
    attachInfiniteScroll('productPage', totalPages, 'renderProductsTable');
  } else {
    const listContainer = document.getElementById('product-acc-list');
    if (listContainer) {
      listContainer.insertAdjacentHTML('beforeend', items);
    }
    const pagArea = document.getElementById('product-pagination-area');
    if (pagArea) {
      pagArea.innerHTML = renderPageControls('productPage', totalPages, 'renderProductsTable');
    }
    attachInfiniteScroll('productPage', totalPages, 'renderProductsTable');
  }
}

function filterProducts(query) {
  const q = query.toLowerCase();
  const filtered = allProducts.filter(p =>
    (p.name && p.name.toLowerCase().includes(q)) ||
    (p.barcode && p.barcode.toLowerCase().includes(q))
  );
  const _inputEl = document.getElementById('product-search');
  const _cursor = _inputEl ? _inputEl.selectionStart : 0;

  renderProductsTable(filtered);

  setTimeout(() => {
    const input = document.getElementById('product-search');
    if (input) {
      input.focus();
      try { input.setSelectionRange(_cursor, _cursor); } catch (e) { }
    }
  }, 0);
}

function openProductModal(p = null) {
  const isEdit = !!p;
  const catOptions = allCategories.map(c =>
    `<option value="${c.id}" ${isEdit && p.categoryId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`
  ).join('');

  openModal(`
    <div class="modal-header">
      <h3>${isEdit ? t('Mahsulotni tahrirlash') : t('Yangi mahsulot')}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body-wrapper">
      ${!isEdit ? `
      <div class="excel-actions-row" style="margin-bottom: 20px; padding: 15px; background: var(--bg-glass); border: 1px dashed var(--border); border-radius: 8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-size:14px;">${t("Excel orqali ommaviy yuklash")}</h4>
          <a href="#" onclick="handleProductTemplate(event)" style="font-size:12px; color:var(--primary);">${t("Shablonni yuklab olish")}</a>
        </div>
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button class="btn btn-ghost btn-sm" onclick="handleProductExport()"><span class="icon">📥</span> ${t("Eksport (Excel)")}</button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('prod-excel-import').click()"><span class="icon">📤</span> ${t("Import (Excel)")}</button>
          <input type="file" id="prod-excel-import" style="display:none" accept=".xlsx,.xls" onchange="handleProductImport(this)">
        </div>
      </div>
      ` : ''}
      <form onsubmit="saveProduct(event, ${isEdit ? p.id : 0})" class="modal-wide" style="width: 650px;">
        <div class="form-group">
          <label>${t("Nomi")}</label>
          <input type="text" class="form-control" id="prod-name" value="${isEdit ? escapeHtml(p.name) : ''}" placeholder="${t('Mahsulot nomi')}" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>${t("Kategoriya")}</label>
            <select class="form-control" id="prod-cat" required>
              <option value="">${t("Tanlang...")}</option>
              ${catOptions}
            </select>
          </div>
          <div class="form-group">
            <label>${t("Barcode")}</label>
            <input type="text" class="form-control" id="prod-barcode" value="${isEdit && p.barcode ? escapeHtml(p.barcode) : ''}" placeholder="${t('Kodni skanerlang yoki qo‘lda kiriting')}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>${t("Sotish narxi")}</label>
            <div style="position:relative">
               <input type="number" step="0.01" class="form-control" id="prod-price" value="${isEdit ? p.price : ''}" required style="padding-right:45px">
               <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); font-size:12px; opacity:0.5;">UZS</span>
            </div>
          </div>
          <div class="form-group">
            <label>${t("Tan narxi")}</label>
            <div style="position:relative">
               <input type="number" step="0.01" class="form-control" id="prod-buy-price" value="${isEdit ? p.buyPrice : ''}" required style="padding-right:45px">
               <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); font-size:12px; opacity:0.5;">UZS</span>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>${t("Chegirma")} (%)</label>
            <input type="number" step="0.01" class="form-control" id="prod-discount" value="${isEdit ? p.discount : 0}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>${t("Miqdori")}</label>
            <input type="number" class="form-control" id="prod-qty" value="${isEdit ? p.quantity : ''}">
          </div>
          <div class="form-group">
            <label>${t("Mamlakat")}</label>
            <input type="text" class="form-control" id="prod-country" value="${isEdit && p.country ? escapeHtml(p.country) : ''}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>${t("Lokal kod")}</label>
            <input type="text" class="form-control" id="prod-lcode" value="${isEdit && p.lokalCode ? escapeHtml(p.lokalCode) : ''}" placeholder="${t('Ixtiyoriy')}">
          </div>
        </div>

        <div class="form-group">
          <label>${t("Qisqa tavsif")}</label>
          <textarea class="form-control" id="prod-short" rows="2" style="resize:none; padding:10px;">${isEdit && p.shortDescription ? escapeHtml(p.shortDescription) : ''}</textarea>
        </div>

        <div class="form-group">
          <label>${t("Mahsulot rasmi")}</label>
          <div style="display:flex; gap:16px; align-items: flex-start;">
             <div id="prod-image-preview" style="width:100px; height:100px; border-radius:12px; background:var(--bg-input); border:2px dashed var(--border); overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
               ${isEdit && p.images ? `<img src="${p.images}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size:32px; opacity:0.3;">🖼️</span>`}
             </div>
             <div style="flex:1">
               <input type="file" class="form-control" id="prod-image" accept="image/*" onchange="previewProductImage(this)">
               <p style="font-size:11px; color:var(--text-muted); margin-top:6px;">${t("Tavsiya etilgan o'lcham: 500x500px. JPG, PNG.")}</p>
             </div>
          </div>
          <input type="hidden" id="prod-image-url" value="${isEdit && p.images ? p.images : ''}">
        </div>

        <div class="modal-footer" style="padding-top:10px">
          <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
          <button type="submit" class="btn btn-primary" style="padding:10px 30px;">${isEdit ? t('Saqlash') : t('Yaratish')}</button>
        </div>
      </form>
    </div>
  `);
}

async function handleProductExport() {
  const bid = getSelectedBusinessId();
  try {
    const token = api.getToken();
    window.location.href = `${API_BASE}/excel/products/export?businessId=${bid}&token=${token}`;
    showToast(t("Excel fayl tayyorlanmoqda..."));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleProductTemplate(e) {
  e.preventDefault();
  const bid = getSelectedBusinessId();
  try {
    const token = api.getToken();
    window.location.href = `${API_BASE}/excel/products/template?businessId=${bid}&token=${token}`;
    showToast(t("Shablon yuklab olinmoqda..."));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleProductImport(input) {
  if (!input.files || input.files.length === 0) return;
  const bid = getSelectedBusinessId();
  const file = input.files[0];
  const formData = new FormData();
  formData.append('businessId', bid);
  formData.append('file', file);

  try {
    showToast(t("Import qilinmoqda..."), 'info');
    const token = api.getToken();
    const resp = await fetch(`${API_BASE}/excel/products/import`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });
    const result = await resp.json();
    if (resp.ok) {
      showToast(`${t("Muvaffaqiyatli")}: ${result.created} ${t("ta yaratildi")}`);
      if (result.errors && result.errors.length > 0) {
        console.error("Import errors:", result.errors);
        showToast(`${t("Xatoliklar bor")}: ${result.errors.length} ${t("ta")}`, 'warning');
      }
      closeModal();
      renderProducts();
    } else {
      throw new Error(result.error || t("Importda xatolik"));
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    input.value = '';
  }
}

async function saveProduct(e, id) {
  e.preventDefault();
  const bid = getSelectedBusinessId();

  // Upload image if selected
  let imageUrl = document.getElementById('prod-image-url').value;
  const fileInput = document.getElementById('prod-image');
  if (fileInput.files.length > 0) {
    try {
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      const token = api.getToken();
      const resp = await fetch(API_BASE.replace('/api/v1', '') + '/api/v1/upload', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
      });
      const result = await resp.json();
      if (result.url) imageUrl = result.url;
      else throw new Error(result.error || 'Upload xatolik');
    } catch (err) {
      showToast('Rasm yuklashda xatolik: ' + err.message, 'error');
      return;
    }
  }

  try {
    if (id) {
      await api.put(`/products/${id}`, {
        name: document.getElementById('prod-name').value.trim(),
        lokalCode: document.getElementById('prod-lcode').value.trim() || null,
        shortDescription: document.getElementById('prod-short').value.trim(),
        price: parseFloat(document.getElementById('prod-price').value),
        buyPrice: parseFloat(document.getElementById('prod-buy-price').value) || 0,
        discount: parseFloat(document.getElementById('prod-discount').value) || 0,
        quantity: parseInt(document.getElementById('prod-qty').value),
        barcode: document.getElementById('prod-barcode').value.trim() || null,
        country: document.getElementById('prod-country').value.trim() || null,
        categoryId: parseInt(document.getElementById('prod-cat').value),
        images: imageUrl || null,
      });
      showToast(t('Mahsulot yangilandi'));
    } else {
      await api.post('/products', {
        businessId: bid,
        name: document.getElementById('prod-name').value.trim(),
        lokalCode: document.getElementById('prod-lcode').value.trim() || null,
        shortDescription: document.getElementById('prod-short').value.trim(),
        price: parseFloat(document.getElementById('prod-price').value),
        buyPrice: parseFloat(document.getElementById('prod-buy-price').value) || 0,
        discount: parseFloat(document.getElementById('prod-discount').value) || 0,
        quantity: parseInt(document.getElementById('prod-qty').value),
        barcode: document.getElementById('prod-barcode').value.trim(),
        country: document.getElementById('prod-country').value.trim(),
        categoryId: parseInt(document.getElementById('prod-cat').value),
        images: imageUrl,
      });
      showToast(t('Mahsulot yaratildi'));
    }
    closeModal();
    renderProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function previewProductImage(input) {
  const preview = document.getElementById('prod-image-preview');
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = `<img src="${e.target.result}" style="max-width:120px;max-height:120px;border-radius:8px;object-fit:cover;">`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function deleteProduct(id) {
  if (!confirm(t('Mahsulotni o\'chirishga ishonchingiz komilmi?'))) return;
  try {
    await api.delete(`/products/${id}`);
    showToast(t('Mahsulot o\'chirildi'));
    renderProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function resetProductForm() {
  const fields = ['prod-name', 'prod-cat', 'prod-barcode', 'prod-price', 'prod-discount', 'prod-qty', 'prod-country', 'prod-lcode', 'prod-short', 'prod-image-url'];
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el) el.value = (f === 'prod-discount') ? '0' : '';
  });
  const preview = document.getElementById('prod-image-preview');
  if (preview) preview.innerHTML = `<span style="font-size:32px; opacity:0.3;">🖼️</span>`;
  const fileInput = document.getElementById('prod-image');
  if (fileInput) fileInput.value = '';

  showToast(t("Forma tozalandi"));
}

// Global exports
window.resetProductForm = resetProductForm;
window.renderProducts = renderProducts;
window.renderProductsTable = renderProductsTable;
window.filterProducts = filterProducts;
window.openProductModal = openProductModal;
window.saveProduct = saveProduct;
window.deleteProduct = deleteProduct;
window.handleProductExport = handleProductExport;
window.handleProductImport = handleProductImport;
window.handleProductTemplate = handleProductTemplate;
window.productPage = productPage;
window.allProducts = allProducts;
window.allCategories = allCategories;
window.currentProducts = currentProducts;
