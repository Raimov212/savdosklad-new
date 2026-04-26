import { api, API_BASE, showToast, escapeHtml, getSelectedBusinessId, toggleAcc } from './api.js';
import { t } from './i18n.js';

// ==================== CATEGORIES MODULE ====================

window.categoryPage = 1;
let currentCategories = [];
let allCategoriesList = [];

async function renderCategories() {
  const content = document.getElementById('page-content');
  const bid = getSelectedBusinessId();

  if (!bid) {
    content.innerHTML = `<div class="empty-state"><div class="icon">📂</div><h4>${t("Avval biznes tanlang")}</h4></div>`;
    return;
  }

  try {
    const categories = await api.get(`/categories?businessId=${bid}`);
    allCategoriesList = categories || [];
    renderCategoriesTable(allCategoriesList);
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><h4>${t("Xatolik")}</h4><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function renderCategoriesTable(list) {
  if (list) {
    currentCategories = list;
    window.categoryPage = 1;
  }

  const limit = 10;
  const totalPages = Math.ceil(currentCategories.length / limit);
  if (window.categoryPage > totalPages) window.categoryPage = totalPages || 1;
  const start = (window.categoryPage - 1) * limit;
  const paginated = currentCategories.slice(start, start + limit);

  const content = document.getElementById('page-content');
  content.innerHTML = `
      <div class="card">
        <div class="card-header">
           <h3 style="margin:0; font-size:16px;">${t("Kategoriyalar")}</h3>
           <div class="toolbar">
             <div class="search-box">
               <span class="search-icon">🔍</span>
               <input type="text" placeholder="${t("Qidirish...")}" id="category-search" value="${escapeHtml(document.getElementById('category-search')?.value || '')}" oninput="filterCategories(this.value)">
             </div>
             ${window.hasPermission('add') ? `<button class="btn btn-primary btn-sm" onclick="openCategoryModal()">${t("Qo'shish")}</button>` : ''}
           </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="text-align:center">№</th>
                <th style="text-align:center">${t("Nomi")}</th>
                <th style="text-align:center">${t("Yaratilgan")}</th>
                <th style="text-align:center">${t("Amallar")}</th>
              </tr>
            </thead>
            <tbody>
              ${paginated.length === 0 ? `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted);">${t(`Kategoriyalar yo'q`)}</td></tr>` :
      paginated.map((c, i) => `
                  <tr>
                    <td style="text-align:center;">${start + i + 1}</td>
                    <td><strong style="color:var(--text-primary); font-size:15px;">${escapeHtml(c.name)}</strong></td>
                    <td style="text-align:center; font-size:12px; opacity:0.7;">${formatDate(c.createdAt)}</td>
                    <td class="actions" style="justify-content:center">
                      ${window.hasPermission('edit') ? `<button class="btn-icon" onclick='openCategoryModal(${JSON.stringify(c).replace(/'/g, "&#39;")})' title="${t("Tahrirlash")}">✏️</button>` : ''}
                      ${window.hasPermission('delete') ? `<button class="btn-icon danger" onclick="deleteCategory(${c.id})" title="${t("O'chirish")}">🗑️</button>` : ''}
                    </td>
                  </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ${renderPageControls('categoryPage', totalPages, 'renderCategoriesTable()')}
    `;
}

function filterCategories(query) {
  const q = query.toLowerCase();
  const filtered = allCategoriesList.filter(c =>
    c.name && c.name.toLowerCase().includes(q)
  );
  const _inputEl = document.getElementById('category-search');
  const _cursor = _inputEl ? _inputEl.selectionStart : 0;

  renderCategoriesTable(filtered);

  setTimeout(() => {
    const input = document.getElementById('category-search');
    if (input) {
      input.focus();
      try { input.setSelectionRange(_cursor, _cursor); } catch (e) { }
    }
  }, 0);
}

function openCategoryModal(c = null) {
  const isEdit = !!c;
  openModal(`
    <div class="modal-header">
      <h3>${isEdit ? t('Kategoriyani tahrirlash') : t('Yangi kategoriya')}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body-wrapper">
      ${!isEdit ? `
      <div class="excel-actions-row" style="margin-bottom: 20px; padding: 15px; background: var(--bg-glass); border: 1px dashed var(--border); border-radius: 8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-size:14px;">${t("Excel orqali ommaviy yuklash")}</h4>
          <a href="#" onclick="handleCategoryTemplate(event)" style="font-size:12px; color:var(--primary);">${t("Shablonni yuklab olish")}</a>
        </div>
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button class="btn btn-ghost btn-sm" onclick="handleCategoryExport()"><span class="icon">📥</span> ${t("Eksport (Excel)")}</button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('cat-excel-import').click()"><span class="icon">📤</span> ${t("Import (Excel)")}</button>
          <input type="file" id="cat-excel-import" style="display:none" accept=".xlsx,.xls" onchange="handleCategoryImport(this)">
        </div>
      </div>
      ` : ''}
      <form onsubmit="saveCategory(event, ${isEdit ? c.id : 0})" style="min-width:400px">
        <div class="form-group">
          <label>${t("Nomi")}</label>
          <input type="text" class="form-control" id="cat-name" value="${isEdit ? escapeHtml(c.name) : ''}" placeholder="${t('Nomini kiriting')}" required>
        </div>
        <div class="form-group">
          <label>${t("Kategoriya rasmi")}</label>
          <div style="display:flex; gap:16px; align-items: flex-start;">
             <div id="cat-image-preview" style="width:100px; height:100px; border-radius:12px; background:var(--bg-input); border:2px dashed var(--border); overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
               ${isEdit && c.image ? `<img src="${c.image}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size:32px; opacity:0.3;">🖼️</span>`}
             </div>
             <div style="flex:1">
               <input type="file" class="form-control" id="cat-image-file" accept="image/*" onchange="previewCategoryImage(this)">
               <input type="hidden" id="cat-image-url" value="${isEdit && c.image ? escapeHtml(c.image) : ''}">
               <p style="font-size:11px; color:var(--text-muted); margin-top:6px;">${t("Tavsiya etilgan o'lcham: 500x500px. JPG, PNG.")}</p>
             </div>
          </div>
        </div>
        <div class="modal-footer" style="padding-top:10px">
          <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
          <button type="submit" class="btn btn-primary" style="padding:10px 40px;">${isEdit ? t('Saqlash') : t('Yaratish')}</button>
        </div>
      </form>
    </div>
  `);
}

async function handleCategoryExport() {
  const bid = getSelectedBusinessId();
  try {
    const token = api.getToken();
    window.location.href = `${API_BASE}/excel/categories/export?businessId=${bid}&token=${token}`;
    showToast(t("Excel fayl tayyorlanmoqda..."));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleCategoryTemplate(e) {
  e.preventDefault();
  try {
    const token = api.getToken();
    window.location.href = `${API_BASE}/excel/categories/template?token=${token}`;
    showToast(t("Shablon yuklab olinmoqda..."));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleCategoryImport(input) {
  if (!input.files || input.files.length === 0) return;
  const bid = getSelectedBusinessId();
  const file = input.files[0];
  const formData = new FormData();
  formData.append('businessId', bid);
  formData.append('file', file);

  try {
    showToast(t("Import qilinmoqda..."), 'info');
    const token = api.getToken();
    const resp = await fetch(`${API_BASE}/excel/categories/import`, {
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
      renderCategories();
    } else {
      throw new Error(result.error || t("Importda xatolik"));
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    input.value = '';
  }
}

async function previewCategoryImage(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      showToast(t("Rasm yuklanmoqda..."), 'info');
      const result = await api.post('/upload', formData);
      if (result && result.url) {
        document.getElementById('cat-image-url').value = result.url;
        document.getElementById('cat-image-preview').innerHTML = `<img src="${result.url}" style="width:100%; height:100%; object-fit:cover;">`;
        showToast(t("Rasm yuklandi"));
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}

function resetCategoryForm() {
  const nameInput = document.getElementById('cat-name');
  const urlInput = document.getElementById('cat-image-url');
  const preview = document.getElementById('cat-image-preview');
  const fileInput = document.getElementById('cat-image-file');

  if (nameInput) nameInput.value = '';
  if (urlInput) urlInput.value = '';
  if (preview) preview.innerHTML = `<span style="font-size:32px; opacity:0.3;">🖼️</span>`;
  if (fileInput) fileInput.value = '';
  showToast(t("Forma tozalandi"));
}

async function saveCategory(e, id) {
  e.preventDefault();
  const bid = getSelectedBusinessId();
  const name = document.getElementById('cat-name').value.trim();
  const image = document.getElementById('cat-image-url').value.trim();

  try {
    if (id) {
      await api.put(`/categories/${id}`, { businessId: bid || 0, name, image: image || null });
      showToast(t('Kategoriya yangilandi'));
      closeModal();
    } else {
      await api.post('/categories', { businessId: bid, name, image: image || null });
      showToast(t('Kategoriya yaratildi'));
      resetCategoryForm();
    }
    renderCategories();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteCategory(id) {
  if (!confirm(t('Kategoriyani o\'chirishga ishonchingiz komilmi?'))) return;
  try {
    const bid = getSelectedBusinessId();
    await api.delete(`/categories/${id}${bid ? '?businessId=' + bid : ''}`);
    showToast(t('Kategoriya o\'chirildi'));
    renderCategories();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Global exports
window.renderCategories = renderCategories;
window.renderCategoriesTable = renderCategoriesTable;
window.filterCategories = filterCategories;
window.openCategoryModal = openCategoryModal;
window.saveCategory = saveCategory;
window.deleteCategory = deleteCategory;
window.handleCategoryExport = handleCategoryExport;
window.handleCategoryImport = handleCategoryImport;
window.handleCategoryTemplate = handleCategoryTemplate;
window.previewCategoryImage = previewCategoryImage;
window.resetCategoryForm = resetCategoryForm;
window.categoryPage = categoryPage;
window.allCategoriesList = allCategoriesList;
window.currentCategories = currentCategories;
