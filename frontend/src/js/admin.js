import { api, showToast, formatDate, escapeHtml } from './api.js';
import { t } from './i18n.js';

// ==================== ADMIN MODULE ====================
let activeAdminTab = 'users';

async function renderAdmin() {
    const content = document.getElementById('page-content');
    const me = api.getUser() || {};
    const isSuperAdmin = me.role === 2;
    content.innerHTML = `
        <div class="admin-tabs">
            <button class="btn btn-secondary active" onclick="showAdminTab('users')" id="tab-users">👥 ${t("Foydalanuvchilar")}</button>
            ${isSuperAdmin ? `
            <button class="btn btn-secondary" onclick="showAdminTab('regions')" id="tab-regions">🗺️ ${t("Viloyatlar")}</button>
            <button class="btn btn-secondary" onclick="showAdminTab('districts')" id="tab-districts">🏘️ ${t("Tumanlar")}</button>
            <button class="btn btn-secondary" onclick="showAdminTab('markets')" id="tab-markets">🏪 ${t("Bozorlar")}</button>
            ` : ''}
        </div>
        <div id="admin-content"></div>
    `;
    showAdminTab(activeAdminTab);
}

function showAdminTab(tab) {
    // Admin (role=1) faqat 'users' tabini ko'ra oladi
    const me = api.getUser() || {};
    if (me.role !== 2 && ['regions', 'districts', 'markets'].includes(tab)) {
        tab = 'users';
    }
    activeAdminTab = tab;
    document.querySelectorAll('.admin-tabs .btn').forEach(b => {
        b.classList.remove('active');
        b.classList.replace('btn-primary', 'btn-secondary');
    });
    const btn = document.getElementById('tab-' + tab);
    if (btn) {
        btn.classList.add('active');
        btn.classList.replace('btn-secondary', 'btn-primary');
    }

    switch (tab) {
        case 'users': loadAdminUsers(); break;
        case 'regions': loadAdminRegions(); break;
        case 'districts': loadAdminDistricts(); break;
        case 'markets': loadAdminMarkets(); break;
    }
}

// ==================== USERS ====================
let adminUserPage = 1;
let currentAdminUsers = [];
let allAdminUsersList = [];

async function loadAdminUsers() {
    const container = document.getElementById('admin-content');
    container.innerHTML = '<div class="loader"></div>';

    try {
        const me = api.getUser() || {};
        let users;
        if (me.role === 2) {
            // Super Admin — barcha foydalanuvchilar
            users = await api.get('/admin/users');
        } else {
            // Admin — faqat o'zining xodimlari
            users = await api.get('/users/my-employees');
        }
        allAdminUsersList = users || [];
        renderAdminUsersTable(allAdminUsersList);
    } catch (e) {
        container.innerHTML = `<p class="error">${t("Xatolik")}: ` + e.message + '</p>';
    }
}

let mpCategoryPage = 1;
let allMpCategoriesList = [];
let filteredMpCategoriesList = [];

let mpProductPage = 1;
let allMpProductsList = [];
let filteredMpProductsList = [];

let mpSalesPage = 1;
let allMpSalesList = [];
let filteredMpSalesList = [];

function renderAdminUsersTable(list, isAppend = false) {
    if (list === true) {
        isAppend = true;
        list = null;
    }
    if (Array.isArray(list)) {
        currentAdminUsers = list;
        adminUserPage = 1;
    }

    const limit = 10;
    const totalPages = Math.ceil(currentAdminUsers.length / limit);
    if (adminUserPage > totalPages) adminUserPage = totalPages || 1;
    const start = (adminUserPage - 1) * limit;
    const paginated = currentAdminUsers.slice(start, start + limit);
    
    const me = api.getUser() || {};
    const isSuperAdmin = me.role === 2;
    const colCount = isSuperAdmin ? 10 : 9;

    const rowsHtml = paginated.length === 0 && !isAppend ? `<tr><td colspan="${colCount}" style="text-align:center;color:var(--text-muted);">${t("Ma'lumot yo'q")}</td></tr>` :
        paginated.map((u, i) => {
            const roleName = u.role === 2 ? 'Super Admin' : u.role === 1 ? 'Admin' : u.role === 3 ? 'Client' : 'Employee';
            return `
                <tr>
                    <td style="text-align:center">${start + i + 1}</td>
                    <td style="text-align:center">${u.id}</td>
                    <td>${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</td>
                    <td>${escapeHtml(u.userName)}</td>
                    <td style="text-align:center">${u.phoneNumber || '—'}</td>
                    <td style="text-align:center"><span class="badge ${u.role === 2 ? 'badge-success' : u.role === 1 ? 'badge-warning' : u.role === 3 ? 'badge-info' : ''}">${t(roleName)}</span></td>
                    <td style="text-align:center">${formatDate(u.expirationDate)}</td>
                    <td style="text-align:center">${(u.isExpired && u.role !== 2) ? `<span class="badge badge-danger">${t("Muddati tugagan")}</span>` : `<span class="badge badge-success">${t("Faol")}</span>`}</td>
                    ${isSuperAdmin ? `
                    <td style="text-align:center">
                        ${u.role === 1 ? `
                            <button class="btn btn-sm ${u.isMarketplaceEnabled ? 'btn-success' : 'btn-secondary'}" 
                                onclick="toggleMarketplaceAccess(${u.id}, ${u.isMarketplaceEnabled})">
                                ${u.isMarketplaceEnabled ? '✅ MP' : '❌ MP'}
                            </button>
                        ` : '—'}
                    </td>
                    ` : ''}
                    <td class="actions" style="justify-content:center">
                        <button class="btn-icon" onclick='openEditUserModal(${u.id}, ${JSON.stringify(JSON.stringify(u)).replace(/'/g, "&#39;")})' title="${t("Tahrirlash")}">✏️</button>
                        <button class="btn-icon danger" onclick="deleteAdminUser(${u.id})" title="${t("O'chirish")}">🗑️</button>
                    </td>
                </tr>
            `}).join('');

    if (isAppend) {
        const tbody = document.querySelector('#admin-content tbody');
        if (tbody) tbody.insertAdjacentHTML('beforeend', rowsHtml);
        const sentinel = document.getElementById('adminUserPage-sentinel');
        if (sentinel) sentinel.outerHTML = renderPageControls('adminUserPage', totalPages, 'renderAdminUsersTable');
        setTimeout(() => { attachInfiniteScroll('adminUserPage', totalPages, 'renderAdminUsersTable'); }, 100);
        return;
    }

    const container = document.getElementById('admin-content');
    container.innerHTML = `
        <div class="card" style="margin-top:20px">
            <div class="card-header">
              <div class="toolbar" style="width:100%">
                <div class="search-box">
                  <span class="search-icon">🔍</span>
                  <input type="text" placeholder="${t("Qidirish...")}" id="admin-user-search" value="${escapeHtml(document.getElementById('admin-user-search')?.value || '')}" oninput="filterAdminUsers(this.value)">
                </div>
                <button class="btn btn-primary btn-sm" onclick="openCreateUserModal()">${t("Qo'shish")}</button>
              </div>
            </div>
            <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                <table style="min-width: 1000px; white-space: nowrap; width: 100%;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);">
                        <tr>
                            <th style="text-align:center; color: white; border: none;">№</th>
                            <th style="text-align:center; color: white; border: none;">ID</th>
                            <th style="text-align:center; color: white; border: none;">${t("Ism")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Foydalanuvchi nomi")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Telefon")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Rol")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Muddati")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Holati")}</th>
                            ${isSuperAdmin ? `<th style="text-align:center; color: white; border: none;">Marketplace</th>` : ''}
                            <th style="text-align:center; color: white; border: none;">${t("Amallar")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                ${renderPageControls('adminUserPage', totalPages, 'renderAdminUsersTable')}
            </div>
        </div>
    `;
    setTimeout(() => { attachInfiniteScroll('adminUserPage', totalPages, 'renderAdminUsersTable'); }, 100);
}

function filterAdminUsers(query) {
    const q = (query || '').toLowerCase();
    const filtered = allAdminUsersList.filter(u => {
        const roleName = u.role === 2 ? 'super admin' : u.role === 1 ? 'admin' : u.role === 3 ? 'client' : 'employee';
        return (u.firstName && String(u.firstName).toLowerCase().includes(q)) ||
            (u.lastName && String(u.lastName).toLowerCase().includes(q)) ||
            (u.userName && String(u.userName).toLowerCase().includes(q)) ||
            (u.phoneNumber && String(u.phoneNumber).toLowerCase().includes(q)) ||
            roleName.includes(q);
    });
    const _inputEl = document.getElementById('admin-user-search');
    const _cursor = _inputEl ? _inputEl.selectionStart : 0;

    renderAdminUsersTable(filtered);

    setTimeout(() => {
        const input = document.getElementById('admin-user-search');
        if (input) {
            input.focus();
            try { input.setSelectionRange(_cursor, _cursor); } catch (e) { }
        }
    }, 0);
}

function openCreateUserModal() {
    openModal(t('Yangi foydalanuvchi'), `
        <form onsubmit="createAdminUser(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>${t("Ism")}</label>
                    <input type="text" id="add-firstName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>${t("Familiya")}</label>
                    <input type="text" id="add-lastName" class="form-control" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${t("Foydalanuvchi nomi")}</label>
                    <input type="text" id="add-userName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>${t("Telefon")}</label>
                    <input type="text" id="add-phone" class="form-control">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${t("Parol")}</label>
                    <input type="password" id="add-password" class="form-control" required minlength="6">
                </div>
                <div class="form-group">
                    <label>${t("Rol")}</label>
                    <select id="add-role" class="form-control">
                        <option value="1">${t("Admin")} (1)</option>
                        <option value="0">${t("Employee")} (0)</option>
                        <option value="2">${t("Super Admin")} (2)</option>
                        <option value="3">${t("Client")} (3)</option>
                    </select>
                </div>
            </div>
            <div style="margin-top:20px; padding-top:15px; border-top:1px dashed var(--border);">
                <div class="form-group">
                    <label>${t("Profil rasmi")}</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="file" class="form-control" accept="image/*" onchange="previewAdminImage(this, 'add-image', 'add-image-preview')">
                        <input type="hidden" id="add-image" value="">
                        <div id="add-image-preview" style="width:50px; height:50px; border:1px solid var(--border); border-radius:8px; overflow:hidden;"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${t("Bekor qilish")}</button>
                <button type="submit" class="btn btn-primary">${t("Saqlash")}</button>
            </div>
        </form>
    `);
}

async function createAdminUser(e) {
    e.preventDefault();
    const currentUser = api.getUser() || {};
    const data = {
        firstName: document.getElementById('add-firstName').value,
        lastName: document.getElementById('add-lastName').value,
        userName: document.getElementById('add-userName').value,
        phoneNumber: document.getElementById('add-phone').value,
        password: document.getElementById('add-password').value,
        brandName: currentUser.brandName || '',
        brandImage: currentUser.brandImage || '',
        image: document.getElementById('add-image').value,
    };
    const role = parseInt(document.getElementById('add-role').value);

    try {
        // Yangi foydalanuvchini /users/employees orqali qo'shish (auth kerak)
        // Bu backbendda admin brand ma'lumotlarini avtomat biriktiradi
        const res = await api.post('/users/employees', { ...data, role: role });

        showToast(t('Foydalanuvchi yaratildi'), 'success');
        closeModal();
        loadAdminUsers();
    } catch (e) {
        showToast(t(e.message), 'error');
    }
}

function openEditUserModal(id, userJson) {
    const u = JSON.parse(userJson);
    const expDate = u.expirationDate ? u.expirationDate.substring(0, 10) : '';

    openModal(t('Foydalanuvchini tahrirlash'), `
        <form onsubmit="saveAdminUser(event, ${id})">
            <div class="form-row">
                <div class="form-group">
                    <label>${t("Ism")}</label>
                    <input type="text" id="edit-firstName" class="form-control" value="${escapeHtml(u.firstName)}" required>
                </div>
                <div class="form-group">
                    <label>${t("Familiya")}</label>
                    <input type="text" id="edit-lastName" class="form-control" value="${escapeHtml(u.lastName)}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${t("Telefon")}</label>
                    <input type="text" id="edit-phone" class="form-control" value="${u.phoneNumber || ''}">
                </div>
                <div class="form-group">
                    <label>${t("Rol")}</label>
                    <select id="edit-role" class="form-control">
                        <option value="0" ${u.role === 0 ? 'selected' : ''}>${t("Employee")} (0)</option>
                        <option value="1" ${u.role === 1 ? 'selected' : ''}>${t("Admin")} (1)</option>
                        <option value="2" ${u.role === 2 ? 'selected' : ''}>${t("Super Admin")} (2)</option>
                        <option value="3" ${u.role === 3 ? 'selected' : ''}>${t("Client")} (3)</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${t("Obuna muddati")}</label>
                    <input type="date" id="edit-expiration" class="form-control" value="${expDate}">
                </div>
                <div class="form-group">
                    <label>${t("Holati")}</label>
                    <select id="edit-expired" class="form-control">
                        <option value="false" ${!u.isExpired ? 'selected' : ''}>${t("Faol")}</option>
                        <option value="true" ${u.isExpired ? 'selected' : ''}>${t("Muddati tugagan")}</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label style="display:flex; align-items:center; gap:10px; cursor:pointer; background:var(--bg-glass); padding:10px; border-radius:8px; border:1px solid var(--border);">
                    <input type="checkbox" id="edit-mp-enabled" ${u.isMarketplaceEnabled ? 'checked' : ''}>
                    <span style="font-weight:600;">🛒 ${t("Marketplace xizmatini yoqish")}</span>
                </label>
            </div>
            <div class="form-group">
                <label>${t("Yangi parol")}</label>
                <input type="password" id="edit-password" class="form-control" placeholder="${t("Yangi parol")}">
            </div>
            <div style="margin-top:20px; padding-top:15px; border-top:1px dashed var(--border);">
                <div class="form-group">
                    <label>${t("Profil rasmi")}</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="file" class="form-control" accept="image/*" onchange="previewAdminImage(this, 'edit-image', 'edit-image-preview')">
                        <input type="hidden" id="edit-image" value="${escapeHtml(u.image || '')}">
                        <div id="edit-image-preview" style="width:50px; height:50px; border:1px solid var(--border); border-radius:8px; overflow:hidden;">
                            ${u.image ? `<img src="${u.image}" style="width:100%; height:100%; object-fit:cover;">` : ''}
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>${t("Brend nomi")}</label>
                    <input type="text" id="edit-brandName" class="form-control" value="${escapeHtml(u.brandName || '')}">
                </div>
                <div class="form-group">
                    <label>${t("Brend rasmi")}</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="file" class="form-control" accept="image/*" onchange="previewAdminImage(this, 'edit-brandImage', 'admin-brand-preview')">
                        <input type="hidden" id="edit-brandImage" value="${escapeHtml(u.brandImage || '')}">
                        <div id="admin-brand-preview" style="width:50px; height:50px; border:1px solid var(--border); border-radius:8px; overflow:hidden;">
                            ${u.brandImage ? `<img src="${u.brandImage}" style="width:100%; height:100%; object-fit:cover;">` : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${t("Bekor qilish")}</button>
                <button type="submit" class="btn btn-primary">${t("Saqlash")}</button>
            </div>
        </form>
    `);
}

async function saveAdminUser(e, id) {
    e.preventDefault();
    const data = {
        firstName: document.getElementById('edit-firstName').value,
        lastName: document.getElementById('edit-lastName').value,
        phoneNumber: document.getElementById('edit-phone').value,
        role: parseInt(document.getElementById('edit-role').value),
        isExpired: document.getElementById('edit-expired').value === 'true',
        isMarketplaceEnabled: document.getElementById('edit-mp-enabled').checked,
    };

    const expDate = document.getElementById('edit-expiration').value;
    if (expDate) {
        data.expirationDate = new Date(expDate).toISOString();
    }

    data.brandName = document.getElementById('edit-brandName').value;
    data.brandImage = document.getElementById('edit-brandImage').value;
    data.image = document.getElementById('edit-image').value;

    const pwd = document.getElementById('edit-password').value;
    if (pwd) data.password = pwd;

    try {
        await api.put('/admin/users/' + id, data);
        showToast(t('Foydalanuvchi yangilandi'), 'success');
        closeModal();
        loadAdminUsers();
    } catch (e) {
        showToast(t(e.message), 'error');
    }
}

async function previewAdminImage(input, hiddenId, previewId) {
    if (input.files && input.files[0]) {
        const formData = new FormData();
        formData.append('file', input.files[0]);
        try {
            const res = await api.post('/upload', formData);
            if (res.url) {
                document.getElementById(hiddenId).value = res.url;
                document.getElementById(previewId).innerHTML = `<img src="${res.url}" style="width:100%; height:100%; object-fit:cover;">`;
            }
        } catch (e) { showToast(e.message, 'error'); }
    }
}

// Qolgan eski funksiya (xatosizlik uchun qoldirildi, garchi biz uni o'zgartirgan bo'lsak ham)
async function previewAdminBrandImage(input) {
    previewAdminImage(input, 'edit-brandImage', 'admin-brand-preview');
}

async function toggleMarketplaceAccess(id, current) {
    try {
        await api.put('/admin/users/' + id, { isMarketplaceEnabled: !current });
        showToast(t('Marketplace ruxsati o\'zgartirildi'), 'success');
        loadAdminUsers();
    } catch (e) {
        showToast(t(e.message), 'error');
    }
}

async function deleteAdminUser(id) {
    if (!confirm(t('Foydalanuvchini o\'chirishni xohlaysizmi?'))) return;
    try {
        await api.delete('/admin/users/' + id);
        showToast(t('Foydalanuvchi o\'chirildi'), 'success');
        loadAdminUsers();
    } catch (e) {
        showToast(t(e.message), 'error');
    }
}

// ==================== REGIONS ====================
let adminRegionPage = 1;
let currentAdminRegions = [];
let allAdminRegionsList = [];

async function loadAdminRegions() {
    const container = document.getElementById('admin-content');
    container.innerHTML = '<div class="loader"></div>';

    try {
        const regions = await api.get('/admin/regions');
        allAdminRegionsList = regions || [];
        renderAdminRegionsTable(allAdminRegionsList);
    } catch (e) {
        container.innerHTML = `<p class="error">${t("Xatolik")}: ` + e.message + '</p>';
    }
}

function renderAdminRegionsTable(list, isAppend = false) {
    if (list === true) {
        isAppend = true;
        list = null;
    }
    if (Array.isArray(list)) {
        currentAdminRegions = list;
        adminRegionPage = 1;
    }

    const limit = 10;
    const totalPages = Math.ceil(currentAdminRegions.length / limit);
    if (adminRegionPage > totalPages) adminRegionPage = totalPages || 1;
    const start = (adminRegionPage - 1) * limit;
    const paginated = currentAdminRegions.slice(start, start + limit);

    const rowsHtml = paginated.length === 0 && !isAppend ? `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">${t("Ma'lumot yo'q")}</td></tr>` :
        paginated.map((r, i) => `
            <tr>
                <td style="text-align:center">${start + i + 1}</td>
                <td style="text-align:center">${escapeHtml(r.name)}</td>
                <td class="actions" style="justify-content:center">
                    <button class="btn-icon" onclick="openRegionModal(${r.id}, '${escapeHtml(r.name)}')" title="${t("Tahrirlash")}">✏️</button>
                    <button class="btn-icon danger" onclick="deleteRegion(${r.id})" title="${t("O'chirish")}">🗑️</button>
                </td>
            </tr>
        `).join('');

    if (isAppend) {
        const tbody = document.querySelector('#admin-content tbody');
        if (tbody) tbody.insertAdjacentHTML('beforeend', rowsHtml);
        const sentinel = document.getElementById('adminRegionPage-sentinel');
        if (sentinel) sentinel.outerHTML = renderPageControls('adminRegionPage', totalPages, 'renderAdminRegionsTable');
        setTimeout(() => { attachInfiniteScroll('adminRegionPage', totalPages, 'renderAdminRegionsTable'); }, 100);
        return;
    }

    const container = document.getElementById('admin-content');
    container.innerHTML = `
        <div class="card" style="margin-top:20px">
            <div class="card-header">
              <div class="toolbar" style="width:100%">
                <div class="search-box">
                  <span class="search-icon">🔍</span>
                  <input type="text" placeholder="${t("Qidirish...")}" id="admin-region-search" value="${escapeHtml(document.getElementById('admin-region-search')?.value || '')}" oninput="filterAdminRegions(this.value)">
                </div>
                <button class="btn btn-primary btn-sm" onclick="openRegionModal()">${t("Qo'shish")}</button>
              </div>
            </div>
            <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                <table style="min-width: 500px; white-space: nowrap; width: 100%;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);"><tr><th style="text-align:center; color: white; border: none;">№</th><th style="text-align:center; color: white; border: none;">${t("Nomi")}</th><th style="text-align:center; color: white; border: none;">${t("Amallar")}</th></tr></thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                ${renderPageControls('adminRegionPage', totalPages, 'renderAdminRegionsTable')}
            </div>
        </div>
    `;
    setTimeout(() => { attachInfiniteScroll('adminRegionPage', totalPages, 'renderAdminRegionsTable'); }, 100);
}

function filterAdminRegions(query) {
    const q = (query || '').toLowerCase();
    const filtered = allAdminRegionsList.filter(r =>
        (r.name && String(r.name).toLowerCase().includes(q))
    );
    const _inputEl = document.getElementById('admin-region-search');
    const _cursor = _inputEl ? _inputEl.selectionStart : 0;

    renderAdminRegionsTable(filtered);

    setTimeout(() => {
        const input = document.getElementById('admin-region-search');
        if (input) {
            input.focus();
            try { input.setSelectionRange(_cursor, _cursor); } catch (e) { }
        }
    }, 0);
}

function openRegionModal(id, name) {
    const isEdit = !!id;
    openModal(isEdit ? t('Viloyatni tahrirlash') : t('Yangi viloyat'), `
        <form onsubmit="${isEdit ? `updateRegion(event, ${id})` : 'createRegion(event)'}">
            <div class="form-group">
                <label>${t("Nomi")}</label>
                <input type="text" id="region-name" class="form-control" value="${name || ''}" required>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${t("Bekor qilish")}</button>
                <button type="submit" class="btn btn-primary">${t("Saqlash")}</button>
            </div>
        </form>
    `);
}

async function createRegion(e) {
    e.preventDefault();
    try {
        await api.post('/admin/regions', { name: document.getElementById('region-name').value });
        showToast(t('Viloyat yaratildi'), 'success');
        closeModal();
        loadAdminRegions();
    } catch (e) { showToast(e.message, 'error'); }
}

async function updateRegion(e, id) {
    e.preventDefault();
    try {
        await api.put('/admin/regions/' + id, { name: document.getElementById('region-name').value });
        showToast(t('Viloyat yangilandi'), 'success');
        closeModal();
        loadAdminRegions();
    } catch (e) { showToast(e.message, 'error'); }
}

async function deleteRegion(id) {
    if (!confirm(t('Viloyatni o\'chirishni xohlaysizmi?'))) return;
    try {
        await api.delete('/admin/regions/' + id);
        showToast(t('Viloyat o\'chirildi'), 'success');
        loadAdminRegions();
    } catch (e) { showToast(e.message, 'error'); }
}

// ==================== DISTRICTS ====================
let adminDistrictPage = 1;
let currentAdminDistricts = [];
let allAdminDistrictsList = [];
let allAdminRegionsRef = [];

async function loadAdminDistricts() {
    const container = document.getElementById('admin-content');
    container.innerHTML = '<div class="loader"></div>';

    try {
        const [districts, regions] = await Promise.all([
            api.get('/admin/districts'),
            api.get('/admin/regions')
        ]);

        allAdminRegionsRef = regions || [];
        allAdminDistrictsList = districts || [];
        renderAdminDistrictsTable(allAdminDistrictsList);
    } catch (e) {
        container.innerHTML = `<p class="error">${t("Xatolik")}: ` + e.message + '</p>';
    }
}

function renderAdminDistrictsTable(list, isAppend = false) {
    if (list === true) {
        isAppend = true;
        list = null;
    }
    if (Array.isArray(list)) {
        currentAdminDistricts = list;
        adminDistrictPage = 1;
    }

    const limit = 10;
    const totalPages = Math.ceil(currentAdminDistricts.length / limit);
    if (adminDistrictPage > totalPages) adminDistrictPage = totalPages || 1;
    const start = (adminDistrictPage - 1) * limit;
    const paginated = currentAdminDistricts.slice(start, start + limit);

    const rowsHtml = paginated.length === 0 && !isAppend ? `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">${t("Ma'lumot yo'q")}</td></tr>` :
        paginated.map((d, i) => `
            <tr>
                <td style="text-align:center">${start + i + 1}</td>
                <td style="text-align:center">${escapeHtml(d.name)}</td>
                <td style="text-align:center">${escapeHtml(d.regionName || '')}</td>
                <td class="actions" style="justify-content:center">
                    <button class="btn-icon" onclick='openDistrictModal(${d.id}, "${escapeHtml(d.name)}", ${d.regionId}, ${JSON.stringify(JSON.stringify(allAdminRegionsRef)).replace(/'/g, "&#39;")})' title="${t("Tahrirlash")}">✏️</button>
                    <button class="btn-icon danger" onclick="deleteDistrict(${d.id})" title="${t("O'chirish")}">🗑️</button>
                </td>
            </tr>
        `).join('');

    if (isAppend) {
        const tbody = document.querySelector('#admin-content tbody');
        if (tbody) tbody.insertAdjacentHTML('beforeend', rowsHtml);
        const sentinel = document.getElementById('adminDistrictPage-sentinel');
        if (sentinel) sentinel.outerHTML = renderPageControls('adminDistrictPage', totalPages, 'renderAdminDistrictsTable');
        setTimeout(() => { attachInfiniteScroll('adminDistrictPage', totalPages, 'renderAdminDistrictsTable'); }, 100);
        return;
    }

    const container = document.getElementById('admin-content');
    container.innerHTML = `
        <div class="card" style="margin-top:20px">
            <div class="card-header">
              <div class="toolbar" style="width:100%">
                <div class="search-box">
                  <span class="search-icon">🔍</span>
                  <input type="text" placeholder="${t("Qidirish...")}" id="admin-district-search" value="${escapeHtml(document.getElementById('admin-district-search')?.value || '')}" oninput="filterAdminDistricts(this.value)">
                </div>
                <button class="btn btn-primary btn-sm" onclick='openDistrictModal(null, null, null, ${JSON.stringify(JSON.stringify(allAdminRegionsRef)).replace(/'/g, "&#39;")})'>${t("Qo'shish")}</button>
              </div>
            </div>
            <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                <table style="min-width: 600px; white-space: nowrap; width: 100%;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);"><tr><th style="text-align:center; color: white; border: none;">№</th><th style="text-align:center; color: white; border: none;">${t("Nomi")}</th><th style="text-align:center; color: white; border: none;">${t("Viloyat")}</th><th style="text-align:center; color: white; border: none;">${t("Amallar")}</th></tr></thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                ${renderPageControls('adminDistrictPage', totalPages, 'renderAdminDistrictsTable')}
            </div>
        </div>
    `;
    setTimeout(() => { attachInfiniteScroll('adminDistrictPage', totalPages, 'renderAdminDistrictsTable'); }, 100);
}

function filterAdminDistricts(query) {
    const q = (query || '').toLowerCase();
    const filtered = allAdminDistrictsList.filter(d =>
        (d.name && String(d.name).toLowerCase().includes(q)) ||
        (d.regionName && String(d.regionName).toLowerCase().includes(q))
    );
    const _inputEl = document.getElementById('admin-district-search');
    const _cursor = _inputEl ? _inputEl.selectionStart : 0;

    renderAdminDistrictsTable(filtered);

    setTimeout(() => {
        const input = document.getElementById('admin-district-search');
        if (input) {
            input.focus();
            try { input.setSelectionRange(_cursor, _cursor); } catch (e) { }
        }
    }, 0);
}

function openDistrictModal(id, name, regionId, regionsJson) {
    const isEdit = !!id;
    const regions = JSON.parse(regionsJson);
    openModal(isEdit ? t('Tumanni tahrirlash') : t('Yangi tuman'), `
        <form onsubmit="${isEdit ? `updateDistrict(event, ${id})` : 'createDistrict(event)'}">
            <div class="form-group">
                <label>${t("Nomi")}</label>
                <input type="text" id="district-name" class="form-control" value="${name || ''}" required>
            </div>
            <div class="form-group">
                <label>${t("Viloyat")}</label>
                <select id="district-regionId" class="form-control" required>
                    <option value="">${t("Tanlang...")}</option>
                    ${regions.map(r => `<option value="${r.id}" ${r.id === regionId ? 'selected' : ''}>${escapeHtml(r.name)}</option>`).join('')}
                </select>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${t("Bekor qilish")}</button>
                <button type="submit" class="btn btn-primary">${t("Saqlash")}</button>
            </div>
        </form>
    `);
}

async function createDistrict(e) {
    e.preventDefault();
    try {
        await api.post('/admin/districts', {
            name: document.getElementById('district-name').value,
            regionId: parseInt(document.getElementById('district-regionId').value)
        });
        showToast(t('Tuman yaratildi'), 'success');
        closeModal();
        loadAdminDistricts();
    } catch (e) { showToast(e.message, 'error'); }
}

async function updateDistrict(e, id) {
    e.preventDefault();
    try {
        await api.put('/admin/districts/' + id, {
            name: document.getElementById('district-name').value,
            regionId: parseInt(document.getElementById('district-regionId').value)
        });
        showToast(t('Tuman yangilandi'), 'success');
        closeModal();
        loadAdminDistricts();
    } catch (e) { showToast(e.message, 'error'); }
}

async function deleteDistrict(id) {
    if (!confirm(t('Tumanni o\'chirishni xohlaysizmi?'))) return;
    try {
        await api.delete('/admin/districts/' + id);
        showToast(t('Tuman o\'chirildi'), 'success');
        loadAdminDistricts();
    } catch (e) { showToast(e.message, 'error'); }
}

// ==================== MARKETS ====================
let adminMarketPage = 1;
let currentAdminMarkets = [];
let allAdminMarketsList = [];
let allAdminDistrictsRef = [];

async function loadAdminMarkets() {
    const container = document.getElementById('admin-content');
    container.innerHTML = '<div class="loader"></div>';

    try {
        const [markets, districts] = await Promise.all([
            api.get('/admin/markets'),
            api.get('/admin/districts')
        ]);

        allAdminDistrictsRef = districts || [];
        allAdminMarketsList = markets || [];
        renderAdminMarketsTable(allAdminMarketsList);
    } catch (e) {
        container.innerHTML = `<p class="error">${t("Xatolik")}: ` + e.message + '</p>';
    }
}

function renderAdminMarketsTable(list, isAppend = false) {
    if (list === true) {
        isAppend = true;
        list = null;
    }
    if (Array.isArray(list)) {
        currentAdminMarkets = list;
        adminMarketPage = 1;
    }

    const limit = 10;
    const totalPages = Math.ceil(currentAdminMarkets.length / limit);
    if (adminMarketPage > totalPages) adminMarketPage = totalPages || 1;
    const start = (adminMarketPage - 1) * limit;
    const paginated = currentAdminMarkets.slice(start, start + limit);

    const rowsHtml = paginated.length === 0 && !isAppend ? `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">${t("Ma'lumot yo'q")}</td></tr>` :
        paginated.map((m, i) => `
            <tr>
                <td style="text-align:center">${start + i + 1}</td>
                <td style="text-align:center">${escapeHtml(m.name)}</td>
                <td style="text-align:center">${escapeHtml(m.address || '—')}</td>
                <td style="text-align:center">${escapeHtml(m.districtName || '')}</td>
                <td class="actions" style="justify-content:center">
                    <button class="btn-icon" onclick='openMarketModal(${m.id}, "${escapeHtml(m.name)}", "${escapeHtml(m.address || '')}", ${m.districtId}, ${JSON.stringify(JSON.stringify(allAdminDistrictsRef)).replace(/'/g, "&#39;")})' title="${t("Tahrirlash")}">✏️</button>
                    <button class="btn-icon danger" onclick="deleteMarket(${m.id})" title="${t("O'chirish")}">🗑️</button>
                </td>
            </tr>
        `).join('');

    if (isAppend) {
        const tbody = document.querySelector('#admin-content tbody');
        if (tbody) tbody.insertAdjacentHTML('beforeend', rowsHtml);
        const sentinel = document.getElementById('adminMarketPage-sentinel');
        if (sentinel) sentinel.outerHTML = renderPageControls('adminMarketPage', totalPages, 'renderAdminMarketsTable');
        setTimeout(() => { attachInfiniteScroll('adminMarketPage', totalPages, 'renderAdminMarketsTable'); }, 100);
        return;
    }

    const container = document.getElementById('admin-content');
    container.innerHTML = `
        <div class="card" style="margin-top:20px">
            <div class="card-header">
              <div class="toolbar" style="width:100%">
                <div class="search-box">
                  <span class="search-icon">🔍</span>
                  <input type="text" placeholder="${t("Qidirish...")}" id="admin-market-search" value="${escapeHtml(document.getElementById('admin-market-search')?.value || '')}" oninput="filterAdminMarkets(this.value)">
                </div>
                <button class="btn btn-primary btn-sm" onclick='openMarketModal(null, null, null, null, ${JSON.stringify(JSON.stringify(allAdminDistrictsRef)).replace(/'/g, "&#39;")})'>${t("Qo'shish")}</button>
              </div>
            </div>
            <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                <table style="min-width: 700px; white-space: nowrap; width: 100%;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);"><tr><th style="text-align:center; color: white; border: none;">№</th><th style="text-align:center; color: white; border: none;">${t("Nomi")}</th><th style="text-align:center; color: white; border: none;">${t("Manzil")}</th><th style="text-align:center; color: white; border: none;">${t("Tuman")}</th><th style="text-align:center; color: white; border: none;">${t("Amallar")}</th></tr></thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                ${renderPageControls('adminMarketPage', totalPages, 'renderAdminMarketsTable')}
            </div>
        </div>
    `;
    setTimeout(() => { attachInfiniteScroll('adminMarketPage', totalPages, 'renderAdminMarketsTable'); }, 100);
}

function filterAdminMarkets(query) {
    const q = (query || '').toLowerCase();
    const filtered = allAdminMarketsList.filter(m =>
        (m.name && String(m.name).toLowerCase().includes(q)) ||
        (m.address && String(m.address).toLowerCase().includes(q)) ||
        (m.districtName && String(m.districtName).toLowerCase().includes(q))
    );
    const _inputEl = document.getElementById('admin-market-search');
    const _cursor = _inputEl ? _inputEl.selectionStart : 0;

    renderAdminMarketsTable(filtered);

    setTimeout(() => {
        const input = document.getElementById('admin-market-search');
        if (input) {
            input.focus();
            try { input.setSelectionRange(_cursor, _cursor); } catch (e) { }
        }
    }, 0);
}

function openMarketModal(id, name, address, districtId, districtsJson) {
    const isEdit = !!id;
    const districts = JSON.parse(districtsJson);
    openModal(isEdit ? t('Bozorni tahrirlash') : t('Yangi bozor'), `
        <form onsubmit="${isEdit ? `updateMarket(event, ${id})` : 'createMarket(event)'}">
            <div class="form-group">
                <label>${t("Nomi")}</label>
                <input type="text" id="market-name" class="form-control" value="${name || ''}" required>
            </div>
            <div class="form-group">
                <label>${t("Manzil")}</label>
                <input type="text" id="market-address" class="form-control" value="${address || ''}">
            </div>
            <div class="form-group">
                <label>${t("Tuman")}</label>
                <select id="market-districtId" class="form-control" required>
                    <option value="">${t("Tanlang...")}</option>
                    ${districts.map(d => `<option value="${d.id}" ${d.id === districtId ? 'selected' : ''}>${escapeHtml(d.name)} (${escapeHtml(d.regionName || '')})</option>`).join('')}
                </select>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${t("Bekor qilish")}</button>
                <button type="submit" class="btn btn-primary">${t("Saqlash")}</button>
            </div>
        </form>
    `);
}

async function createMarket(e) {
    e.preventDefault();
    try {
        await api.post('/admin/markets', {
            name: document.getElementById('market-name').value,
            address: document.getElementById('market-address').value,
            districtId: parseInt(document.getElementById('market-districtId').value)
        });
        showToast(t('Bozor yaratildi'), 'success');
        closeModal();
        loadAdminMarkets();
    } catch (e) { showToast(e.message, 'error'); }
}

async function updateMarket(e, id) {
    e.preventDefault();
    try {
        await api.put('/admin/markets/' + id, {
            name: document.getElementById('market-name').value,
            address: document.getElementById('market-address').value,
            districtId: parseInt(document.getElementById('market-districtId').value)
        });
        showToast(t('Bozor yangilandi'), 'success');
        closeModal();
        loadAdminMarkets();
    } catch (e) { showToast(e.message, 'error'); }
}

async function deleteMarket(id) {
    if (!confirm(t('Bozorni o\'chirishni xohlaysizmi?'))) return;
    try {
        await api.delete('/admin/markets/' + id);
        showToast(t('Bozor o\'chirildi'), 'success');
        loadAdminMarkets();
    } catch (e) { showToast(e.message, 'error'); }
}

// ==================== MARKETPLACE ADMIN ====================
async function loadAdminMarketplace() {
    const container = document.getElementById('admin-content');
    container.innerHTML = '<div class="loader"></div>';

    try {
        const [mpProducts, mpCategories] = await Promise.all([
            api.get('/admin/marketplace/products'),
            api.get('/admin/marketplace/categories')
        ]);

        container.innerHTML = `
            <!-- Categories Card -->
            <div class="card" style="margin-top:20px">
                <div class="card-header">
                    <h3>🛒 ${t("Marketplace kategoriyalari")}</h3>
                    <button class="btn btn-primary btn-sm" onclick="openMpCategoryModal()">${t("Qo'shish")}</button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr><th style="text-align:center">№</th><th style="text-align:center">${t("Nomi")}</th><th style="text-align:center">${t("Amallar")}</th></tr></thead>
                        <tbody>
                            ${(mpCategories || []).length === 0 ? `<tr><td colspan="3" style="text-align:center">${t("Ma'lumot yo'q")}</td></tr>` : mpCategories.map(c => `
                                <tr>
                                    <td style="text-align:center">${c.id}</td>
                                    <td style="text-align:center">${escapeHtml(c.name)}</td>
                                    <td class="actions" style="justify-content: center;">
                                        <button class="btn-icon" onclick='openMpCategoryModal(${c.id}, "${escapeHtml(c.name)}")'>✏️</button>
                                        <button class="btn-icon danger" onclick="deleteMpCategory(${c.id})">🗑️</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Products Card -->
            <div class="card" style="margin-top:20px">
                <div class="card-header">
                    <h3>📦 ${t("Marketplace mahsulotlari")}</h3>
                    <button class="btn btn-primary btn-sm" onclick="openCreateMpProductModal()">${t("Qo'shish")}</button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style="text-align:center">№</th>
                                <th style="text-align:center">${t("Biznes")}</th>
                                <th style="text-align:center">${t("Nomi")}</th>
                                <th style="text-align:center">${t("Narxi")}</th>
                                <th style="text-align:center">${t("Soni")}</th>
                                <th style="text-align:center">${t("Holati")}</th>
                                <th style="text-align:center">${t("Amallar")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(mpProducts || []).length === 0 ? `<tr><td colspan="7" style="text-align:center">${t("Ma'lumot yo'q")}</td></tr>` : mpProducts.map(p => `
                                <tr>
                                    <td style="text-align:center">${p.id}</td>
                                    <td>${escapeHtml(p.businessName || '—')}</td>
                                    <td style="text-align:center">${escapeHtml(p.name)}</td>
                                    <td style="text-align:center">${p.price.toLocaleString()}</td>
                                    <td style="text-align:center">${p.quantity}</td>
                                    <td style="text-align:center"><span class="badge ${p.isVisible ? 'badge-success' : 'badge-danger'}">${p.isVisible ? t("Ko'rinadi") : t("Berkitilgan")}</span></td>
                                    <td class="actions" style="justify-content:center">
                                        <button class="btn-icon" onclick="toggleMpProductVisibility(${p.id}, ${p.isVisible})">👁️</button>
                                        <button class="btn-icon danger" onclick="deleteMpProduct(${p.id})">🗑️</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (e) {
        container.innerHTML = `<p class="error">${t("Xatolik")}: ${t(e.message)}</p>`;
    }
}

function openMpCategoryModal(id, name) {
    const isEdit = !!id;
    openModal(isEdit ? t('Kategoriyani tahrirlash') : t('Yangi kategoriya'), `
        <form onsubmit="submitMpCategory(event, ${id || 'null'})">
            <div class="form-group">
                <label>${t("Kategoriya nomi")}</label>
                <input type="text" id="mp-cat-name" class="form-control" value="${name || ''}" required>
            </div>
            <div class="form-group">
                <label>${t("Rasm")}</label>
                <input type="file" id="mp-cat-image" class="form-control" accept="image/*">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${t("Bekor qilish")}</button>
                <button type="submit" class="btn btn-primary">${t("Saqlash")}</button>
            </div>
        </form>
    `);
}

async function submitMpCategory(e, id) {
    e.preventDefault();
    const name = document.getElementById('mp-cat-name').value;
    const imageFile = document.getElementById('mp-cat-image').files[0];

    try {
        let image = '';
        if (imageFile) {
            const fd = new FormData();
            fd.append('file', imageFile);
            const res = await api.post('/upload', fd);
            image = res.url;
        }

        const data = { name };
        if (image) data.image = image;

        if (id) {
            await api.put(`/admin/marketplace/categories/${id}`, data);
            showToast(t("Yangilandi"), 'success');
        } else {
            await api.post('/admin/marketplace/categories', data);
            showToast(t("Yaratildi"), 'success');
        }
        closeModal();
        if (window.currentPage === 'mp-categories') renderMpCategories();
        else if (window.currentPage === 'mp-products') renderMpProducts();
        else renderAdmin();
    } catch (e) { showToast(e.message, 'error'); }
}

async function deleteMpCategory(id) {
    if (!confirm(t("O'chirishni xohlaysizmi?"))) return;
    try {
        await api.delete(`/admin/marketplace/categories/${id}`);
        showToast(t("O'chirildi"), 'success');
        renderMpCategories();
    } catch (e) { showToast(e.message, 'error'); }
}

async function toggleMpProductVisibility(id, current) {
    try {
        await api.put(`/admin/marketplace/products/${id}`, { isVisible: !current });
        showToast(t("Muvaffaqiyatli"), 'success');
        renderMpProducts();
    } catch (e) { showToast(e.message, 'error'); }
}

async function deleteMpProduct(id) {
    if (!confirm(t("O'chirishni xohlaysizmi?"))) return;
    try {
        await api.delete(`/admin/marketplace/products/${id}`);
        showToast(t("O'chirildi"), 'success');
        renderMpProducts();
    } catch (e) { showToast(e.message, 'error'); }
}

async function openCreateMpProductModal() {
    openModal(t('Marketplace\'ga mahsulot qo\'shish'), `
        <div id="mp-create-step1">
            <div class="form-group">
                <label>${t("Biznesni tanlang")}</label>
                <select id="mp-biz-id" class="form-control" onchange="loadMpCategories(this.value)">
                    <option value="">${t("Tanlang...")}</option>
                </select>
            </div>
            <div class="form-group" id="mp-cat-container" style="display:none">
                <label>${t("Marketplace Kategoriyasi")}</label>
                <select id="mp-category-id" class="form-control" onchange="showMpForm()">
                    <option value="">${t("Tanlang...")}</option>
                </select>
            </div>
            
            <form id="mp-prod-form" style="display:none" onsubmit="submitMpProduct(event)">
                <div class="form-group">
                    <label>${t("Marketplace Nomi")}</label>
                    <input type="text" id="mp-name" class="form-control" required placeholder="${t('Masalan')}: Samsung Galaxy S24">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>${t("Narxi")}</label>
                        <input type="number" id="mp-price" class="form-control" required placeholder="0">
                    </div>
                    <div class="form-group">
                        <label>${t("Soni")}</label>
                        <input type="number" id="mp-qty" class="form-control" required placeholder="1">
                    </div>
                </div>
                <div class="form-group">
                    <label>${t("Qisqa tavsif")}</label>
                    <input type="text" id="mp-short-desc" class="form-control" placeholder="${t('Mahsulot haqida qisqacha...')}">
                </div>
                <div class="form-group">
                    <label>${t("Rasm")}</label>
                    <input type="file" id="mp-image" class="form-control" accept="image/*">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">${t("Bekor qilish")}</button>
                    <button type="submit" class="btn btn-primary">${t("Qo'shish")}</button>
                </div>
            </form>

            <div id="mp-initial-footer" class="modal-footer" style="margin-top:20px;">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${t("Bekor qilish")}</button>
            </div>
        </div>
    `);

    try {
        const user = api.getUser();
        const bizEndpoint = (user && user.role === 2) ? '/businesses' : '/businesses/my';
        const businesses = await api.get(bizEndpoint);
        const select = document.getElementById('mp-biz-id');
        (businesses || []).forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = b.name;
            select.appendChild(opt);
        });
    } catch (e) { showToast(t(e.message), 'error'); }
}

async function loadMpCategories(bizId) {
    if (!bizId) return;
    try {
        const mpCategories = await api.get('/marketplace/categories');
        const catSelect = document.getElementById('mp-category-id');
        catSelect.innerHTML = `<option value="">${t("Tanlang...")}</option>`;
        (mpCategories || []).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            catSelect.appendChild(opt);
        });
        document.getElementById('mp-cat-container').style.display = 'block';
        document.getElementById('mp-prod-form').style.display = 'none';
    } catch (e) { showToast(t(e.message), 'error'); }
}

function showMpForm() {
    const catId = document.getElementById('mp-category-id').value;
    if (catId) {
        document.getElementById('mp-prod-form').style.display = 'block';
        document.getElementById('mp-initial-footer').style.display = 'none';
    }
}

async function submitMpProduct(e) {
    e.preventDefault();
    const imageFile = document.getElementById('mp-image').files[0];

    try {
        let image = '';
        if (imageFile) {
            const fd = new FormData();
            fd.append('file', imageFile);
            const res = await api.post('/upload', fd);
            image = res.url;
        }

        const data = {
            businessId: document.getElementById('mp-biz-id').value ? parseInt(document.getElementById('mp-biz-id').value) : null,
            marketplaceCategoryId: document.getElementById('mp-category-id').value ? parseInt(document.getElementById('mp-category-id').value) : null,
            name: document.getElementById('mp-name').value,
            price: parseFloat(document.getElementById('mp-price').value),
            quantity: parseInt(document.getElementById('mp-qty').value),
            shortDescription: document.getElementById('mp-short-desc').value,
            images: image
        };

        await api.post('/admin/marketplace/products', data);
        showToast(t("Qo'shildi"), 'success');
        closeModal();
        renderMpProducts();
    } catch (e) { showToast(e.message, 'error'); }
}

// ==================== NEW MARKETPLACE ADMIN PAGES ====================

async function renderMpStats() {
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="loader"></div>';

    try {
        const [products, categories] = await Promise.all([
            api.get('/admin/marketplace/products'),
            api.get('/admin/marketplace/categories')
        ]);

        const totalProducts = (products || []).length;
        const totalCategories = (categories || []).length;
        const activeProducts = (products || []).filter(p => p.isVisible).length;
        const totalStock = (products || []).reduce((sum, p) => sum + p.quantity, 0);

        content.innerHTML = `
            <div class="stats-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:20px; margin-bottom:30px;">
                <div class="stat-card" style="background:var(--bg-glass); padding:24px; border-radius:20px; border:1px solid var(--border); box-shadow:var(--shadow-sm);">
                    <div style="font-size:14px; color:var(--text-muted); margin-bottom:8px;">${t("Jami mahsulotlar")}</div>
                    <div style="font-size:32px; font-weight:800; color:var(--primary);">${totalProducts}</div>
                </div>
                <div class="stat-card" style="background:var(--bg-glass); padding:24px; border-radius:20px; border:1px solid var(--border); box-shadow:var(--shadow-sm);">
                    <div style="font-size:14px; color:var(--text-muted); margin-bottom:8px;">${t("Faol mahsulotlar")}</div>
                    <div style="font-size:32px; font-weight:800; color:#10b981;">${activeProducts}</div>
                </div>
                <div class="stat-card" style="background:var(--bg-glass); padding:24px; border-radius:20px; border:1px solid var(--border); box-shadow:var(--shadow-sm);">
                    <div style="font-size:14px; color:var(--text-muted); margin-bottom:8px;">${t("Kategoriyalar soni")}</div>
                    <div style="font-size:32px; font-weight:800; color:var(--warning);">${totalCategories}</div>
                </div>
                <div class="stat-card" style="background:var(--bg-glass); padding:24px; border-radius:20px; border:1px solid var(--border); box-shadow:var(--shadow-sm);">
                    <div style="font-size:14px; color:var(--text-muted); margin-bottom:8px;">${t("Jami qoldiq")}</div>
                    <div style="font-size:32px; font-weight:800; color:var(--text-primary);">${totalStock}</div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>📊 ${t("Marketplace tahlili")}</h3>
                </div>
                <div style="padding:40px; text-align:center; color:var(--text-muted);">
                    <div style="font-size:48px; margin-bottom:20px;">📈</div>
                    <p>${t("Batafsil grafiklar va hisobotlar tez kunda qo'shiladi.")}</p>
                </div>
            </div>
        `;
    } catch (e) {
        content.innerHTML = `<p class="error">${t(e.message)}</p>`;
    }
}

async function renderMpCategories() {
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="loader"></div>';

    try {
        const categories = await api.get('/admin/marketplace/categories');
        allMpCategoriesList = categories || [];
        mpCategoryPage = 1;
        renderMpCategoriesTable(allMpCategoriesList);
    } catch (e) {
        content.innerHTML = `<p class="error">${t(e.message)}</p>`;
    }
}

function renderMpCategoriesTable(list, isAppend = false) {
    if (list === true) {
        isAppend = true;
        list = null;
    }
    if (Array.isArray(list)) {
        filteredMpCategoriesList = list;
        mpCategoryPage = 1;
    }

    const content = document.getElementById('page-content');
    const limit = 10;
    const totalPages = Math.ceil(filteredMpCategoriesList.length / limit);
    if (mpCategoryPage > totalPages) mpCategoryPage = totalPages || 1;
    const start = (mpCategoryPage - 1) * limit;
    const paginated = filteredMpCategoriesList.slice(start, start + limit);

    const rowsHtml = paginated.length === 0 && !isAppend ? `<tr><td colspan="3" style="text-align:center; padding:40px; color:var(--text-muted);">${t("Ma'lumot yo'q")}</td></tr>` :
        paginated.map((c, i) => `
            <tr>
                <td style="text-align:center; font-weight:600;">${start + i + 1}</td>
                <td style="text-align:center">${escapeHtml(c.name)}</td>
                <td class="actions" style="justify-content: center;">
                    <button class="btn-icon" onclick='openMpCategoryModal(${c.id}, "${escapeHtml(c.name)}")' title="${t("Tahrirlash")}">✏️</button>
                    <button class="btn-icon danger" onclick="deleteMpCategory(${c.id})" title="${t("O'chirish")}">🗑️</button>
                </td>
            </tr>
        `).join('');

    if (isAppend) {
        const tbody = document.querySelector('#page-content tbody');
        if (tbody) tbody.insertAdjacentHTML('beforeend', rowsHtml);
        const sentinel = document.getElementById('mpCategoryPage-sentinel');
        if (sentinel) sentinel.outerHTML = renderPageControls('mpCategoryPage', totalPages, 'renderMpCategoriesTable');
        setTimeout(() => { attachInfiniteScroll('mpCategoryPage', totalPages, 'renderMpCategoriesTable'); }, 100);
        return;
    }

    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 style="margin:0;">📁 ${t("Marketplace Kategoriyalari")}</h3>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-primary btn-sm" onclick="openMpCategoryModal()">${t("Qo'shish")}</button>
                </div>
            </div>
            
            <div class="search-container" style="padding:15px 24px;">
                <div class="search-wrapper">
                    <i data-lucide="search" class="search-icon"></i>
                    <input type="text" id="mp-category-search" class="form-control search-input" 
                        placeholder="${t("Qidirish...")}" oninput="filterMpCategories(this.value)">
                </div>
            </div>

            <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                <table style="min-width: 800px; white-space: nowrap; width: 100%;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);">
                        <tr>
                            <th style="text-align:center; color: white; border: none;">№</th>
                            <th style="text-align:center; color: white; border: none;">${t("Nomi")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Amallar")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                ${renderPageControls('mpCategoryPage', totalPages, 'renderMpCategoriesTable')}
            </div>
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => { attachInfiniteScroll('mpCategoryPage', totalPages, 'renderMpCategoriesTable'); }, 100);
}

function filterMpCategories(query) {
    const q = query.toLowerCase();
    const filtered = allMpCategoriesList.filter(c => c.name.toLowerCase().includes(q));
    mpCategoryPage = 1;
    renderMpCategoriesTable(filtered);

    // Focus search input and keep cursor
    setTimeout(() => {
        const input = document.getElementById('mp-category-search');
        if (input) {
            input.focus();
            input.value = query;
        }
    }, 0);
}


async function renderMpProducts() {
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="loader"></div>';

    try {
        const bid = getSelectedBusinessId();
        const mpProducts = await api.get(`/admin/marketplace/products?businessId=${bid}`);
        allMpProductsList = mpProducts || [];
        mpProductPage = 1;
        renderMpProductsTable(allMpProductsList);
    } catch (e) {
        content.innerHTML = `<p class="error">${t(e.message)}</p>`;
    }
}

function renderMpProductsTable(list, isAppend = false) {
    if (list === true) {
        isAppend = true;
        list = null;
    }
    if (Array.isArray(list)) {
        filteredMpProductsList = list;
        mpProductPage = 1;
    }

    const content = document.getElementById('page-content');
    const limit = 10;
    const totalPages = Math.ceil(filteredMpProductsList.length / limit);
    if (mpProductPage > totalPages) mpProductPage = totalPages || 1;
    const start = (mpProductPage - 1) * limit;
    const paginated = filteredMpProductsList.slice(start, start + limit);

    const rowsHtml = paginated.length === 0 && !isAppend ? `<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--text-muted);">${t("Ma'lumot yo'q")}</td></tr>` :
        paginated.map((p, i) => `
            <tr>
                <td style="text-align:center; font-weight:600;">${start + i + 1}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${p.images ? `<img src="${p.images}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">` : `<div style="width:40px;height:40px;border-radius:8px;background:var(--bg-glass);display:flex;align-items:center;justify-content:center;font-size:18px;">📦</div>`}
                        <div>
                            <div style="font-weight:600;">${escapeHtml(p.name)}</div>
                            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${escapeHtml(p.shortDescription || '')}</div>
                        </div>
                    </div>
                </td>
                <td style="text-align:center">${escapeHtml(p.businessName)}</td>
                <td style="text-align:center">${escapeHtml(p.categoryName || '—')}</td>
                <td style="text-align:center; font-weight:700;">${p.price.toLocaleString()}</td>
                <td style="text-align:center">
                   <span style="background:var(--bg-glass); padding:2px 8px; border-radius:12px; font-weight:700;">${p.quantity}</span>
                </td>
                <td style="text-align:center">
                    <span class="badge ${p.isVisible ? 'badge-success' : 'badge-danger'}" style="cursor:pointer" onclick="toggleMpProductVisibility(${p.id}, ${p.isVisible})">
                        ${p.isVisible ? t("Faol") : t("Yopiq")}
                    </span>
                </td>
                <td class="actions" style="justify-content:center">
                    <button class="btn-icon" onclick="toggleMpProductVisibility(${p.id}, ${p.isVisible})" title="${p.isVisible ? t("Yashirish") : t("Ko'rsatish")}">${p.isVisible ? '👁️' : '🚫'}</button>
                    <button class="btn-icon danger" onclick="deleteMpProduct(${p.id})" title="${t("O'chirish")}">🗑️</button>
                </td>
            </tr>
        `).join('');

    if (isAppend) {
        const tbody = document.querySelector('#page-content tbody');
        if (tbody) tbody.insertAdjacentHTML('beforeend', rowsHtml);
        const sentinel = document.getElementById('mpProductPage-sentinel');
        if (sentinel) sentinel.outerHTML = renderPageControls('mpProductPage', totalPages, 'renderMpProductsTable');
        setTimeout(() => { attachInfiniteScroll('mpProductPage', totalPages, 'renderMpProductsTable'); }, 100);
        return;
    }

    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 style="margin:0;">📦 ${t("Marketplace mahsulotlari")}</h3>
                <button class="btn btn-primary btn-sm" onclick="openCreateMpProductModal()">${t("Qo'shish")}</button>
            </div>

            <div class="search-container" style="padding:15px 24px;">
                <div class="search-wrapper">
                    <i data-lucide="search" class="search-icon"></i>
                    <input type="text" id="mp-product-search" class="form-control search-input" 
                        placeholder="${t("Qidirish...")}" oninput="filterMpProducts(this.value)">
                </div>
            </div>

            <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                <table style="min-width: 1000px; white-space: nowrap; width: 100%;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);">
                        <tr>
                            <th style="text-align:center; color: white; border: none;">№</th>
                            <th style="text-align:center; color: white; border: none;">${t("Biznes")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Mahsulot")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Narxi")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Qoldiq")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Holati")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Amallar")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                ${renderPageControls('mpProductPage', totalPages, 'renderMpProductsTable')}
            </div>
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => { attachInfiniteScroll('mpProductPage', totalPages, 'renderMpProductsTable'); }, 100);
}

function filterMpProducts(query) {
    const q = query.toLowerCase();
    const filtered = allMpProductsList.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.businessName && p.businessName.toLowerCase().includes(q)) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(q))
    );
    mpProductPage = 1;
    renderMpProductsTable(filtered);

    setTimeout(() => {
        const input = document.getElementById('mp-product-search');
        if (input) {
            input.focus();
            input.value = query;
        }
    }, 0);
}

async function renderMpSales() {
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="loader"></div>';

    try {
        const bid = getSelectedBusinessId();
        // Fetch only confirmed/delivered orders as 'sales'
        const orders = await api.get(`/admin/marketplace/orders?businessId=${bid}&status=CONFIRMED,DELIVERED`);
        
        // Map order structure to what sales table expects
        const sales = (orders || []).map(o => ({
            id: o.id,
            createdAt: o.createdAt,
            customerName: `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`,
            productNames: (o.items || []).map(item => item.product?.name).join(', '),
            total: o.totalSum,
            status: o.status
        }));

        allMpSalesList = sales;
        mpSalesPage = 1;
        renderMpSalesTable(allMpSalesList);
    } catch (e) {
        content.innerHTML = `<p class="error">${t(e.message)}</p>`;
    }
}

function renderMpSalesTable(list, isAppend = false) {
    if (list === true) {
        isAppend = true;
        list = null;
    }
    if (Array.isArray(list)) {
        filteredMpSalesList = list;
        mpSalesPage = 1;
    }

    const content = document.getElementById('page-content');
    const limit = 10;
    const totalPages = Math.ceil(filteredMpSalesList.length / limit);
    if (mpSalesPage > totalPages) mpSalesPage = totalPages || 1;
    const start = (mpSalesPage - 1) * limit;
    const paginated = filteredMpSalesList.slice(start, start + limit);

    const rowsHtml = paginated.length === 0 && !isAppend ? `
        <tr>
            <td colspan="6" style="text-align:center; padding:100px; color:var(--text-muted);">
                <div style="font-size:48px; margin-bottom:15px;">📦</div>
                <h4>${t("Hozircha sotuvlar yo'q")}</h4>
                <p>${t("Marketplace orqali buyurtmalar kelib tushganda bu erda paydo bo'ladi.")}</p>
            </td>
        </tr>
    ` : paginated.map((s, i) => `
        <tr>
            <td style="text-align:center; font-weight:600;">${start + i + 1}</td>
            <td style="text-align:center">${formatDateTime(s.createdAt)}</td>
            <td>${escapeHtml(s.customerName)}</td>
            <td>${escapeHtml(s.productNames)}</td>
            <td style="text-align:center; font-weight:700;">${s.total.toLocaleString()} UZS</td>
            <td style="text-align:center">
                <span class="badge badge-info">${t(s.status || "Kutilmoqda")}</span>
            </td>
        </tr>
    `).join('');

    if (isAppend) {
        const tbody = document.querySelector('#page-content tbody');
        if (tbody) tbody.insertAdjacentHTML('beforeend', rowsHtml);
        const sentinel = document.getElementById('mpSalesPage-sentinel');
        if (sentinel) sentinel.outerHTML = renderPageControls('mpSalesPage', totalPages, 'renderMpSalesTable');
        setTimeout(() => { attachInfiniteScroll('mpSalesPage', totalPages, 'renderMpSalesTable'); }, 100);
        return;
    }

    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 style="margin:0;">💰 ${t("Marketplace sotuvlari")}</h3>
            </div>

            <div class="search-container" style="padding:15px 24px;">
                <div class="search-wrapper">
                    <i data-lucide="search" class="search-icon"></i>
                    <input type="text" id="mp-sales-search" class="form-control search-input" 
                        placeholder="${t("Qidirish...")}" oninput="filterMpSales(this.value)">
                </div>
            </div>

            <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                <table style="min-width: 1000px; white-space: nowrap; width: 100%;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);">
                        <tr>
                            <th style="text-align:center; color: white; border: none;">№</th>
                            <th style="text-align:center; color: white; border: none;">${t("Sana")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Mijoz")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Mahsulot")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Summa")}</th>
                            <th style="text-align:center; color: white; border: none;">${t("Holati")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                ${renderPageControls('mpSalesPage', totalPages, 'renderMpSalesTable')}
            </div>
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => { attachInfiniteScroll('mpSalesPage', totalPages, 'renderMpSalesTable'); }, 100);
}

function filterMpSales(query) {
    const q = query.toLowerCase();
    const filtered = allMpSalesList.filter(s =>
        (s.customerName && s.customerName.toLowerCase().includes(q)) ||
        (s.productNames && s.productNames.toLowerCase().includes(q))
    );
    mpSalesPage = 1;
    renderMpSalesTable(filtered);

    setTimeout(() => {
        const input = document.getElementById('mp-sales-search');
        if (input) {
            input.focus();
            input.value = query;
        }
    }, 0);
}

// Global exports
window.renderMpStats = renderMpStats;
window.renderMpCategories = renderMpCategories;
window.renderMpProducts = renderMpProducts;
window.renderMpSales = renderMpSales;

window.renderMpSalesTable = renderMpSalesTable;
window.filterMpSales = filterMpSales;
window.renderMpCategoriesTable = renderMpCategoriesTable;
window.filterMpCategories = filterMpCategories;
window.renderMpProductsTable = renderMpProductsTable;
window.filterMpProducts = filterMpProducts;

Object.defineProperty(window, 'mpCategoryPage', { get: () => mpCategoryPage, set: (v) => mpCategoryPage = v });
Object.defineProperty(window, 'mpProductPage', { get: () => mpProductPage, set: (v) => mpProductPage = v });
Object.defineProperty(window, 'mpSalesPage', { get: () => mpSalesPage, set: (v) => mpSalesPage = v });

window.renderAdmin = renderAdmin;
window.activeAdminTab = activeAdminTab;
window.showAdminTab = showAdminTab;
window.loadAdminMarketplace = loadAdminMarketplace;
window.openMpCategoryModal = openMpCategoryModal;
window.submitMpCategory = submitMpCategory;
window.deleteMpCategory = deleteMpCategory;
window.openCreateMpProductModal = openCreateMpProductModal;
window.loadMpCategories = loadMpCategories;
window.showMpForm = showMpForm;
window.submitMpProduct = submitMpProduct;
window.toggleMpProductVisibility = toggleMpProductVisibility;
window.deleteMpProduct = deleteMpProduct;
window.openEditUserModal = openEditUserModal;
window.saveAdminUser = saveAdminUser;
window.deleteAdminUser = deleteAdminUser;
window.renderAdminUsersTable = renderAdminUsersTable;
window.filterAdminUsers = filterAdminUsers;
window.openCreateUserModal = openCreateUserModal;
window.createAdminUser = createAdminUser;
window.previewAdminBrandImage = previewAdminBrandImage;

Object.defineProperty(window, 'adminUserPage', { get: () => adminUserPage, set: (v) => adminUserPage = v });
Object.defineProperty(window, 'adminRegionPage', { get: () => adminRegionPage, set: (v) => adminRegionPage = v });
Object.defineProperty(window, 'adminDistrictPage', { get: () => adminDistrictPage, set: (v) => adminDistrictPage = v });
Object.defineProperty(window, 'adminMarketPage', { get: () => adminMarketPage, set: (v) => adminMarketPage = v });

window.loadAdminRegions = loadAdminRegions;
window.renderAdminRegionsTable = renderAdminRegionsTable;
window.filterAdminRegions = filterAdminRegions;
window.openRegionModal = openRegionModal;
window.createRegion = createRegion;
window.updateRegion = updateRegion;
window.deleteRegion = deleteRegion;
window.loadAdminDistricts = loadAdminDistricts;
window.renderAdminDistrictsTable = renderAdminDistrictsTable;
window.filterAdminDistricts = filterAdminDistricts;
window.openDistrictModal = openDistrictModal;
window.createDistrict = createDistrict;
window.updateDistrict = updateDistrict;
window.deleteDistrict = deleteDistrict;
window.loadAdminMarkets = loadAdminMarkets;
window.renderAdminMarketsTable = renderAdminMarketsTable;
window.filterAdminMarkets = filterAdminMarkets;
window.openMarketModal = openMarketModal;
window.createMarket = createMarket;
window.updateMarket = updateMarket;
window.deleteMarket = deleteMarket;
async function renderMpOrders() {
    const container = document.getElementById('page-content');
    container.innerHTML = '<div class="loader"></div>';

    try {
        const bid = getSelectedBusinessId();
        const orders = await api.get(`/admin/marketplace/orders?businessId=${bid}`);
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>📦 ${t("Marketplace buyurtmalari")}</h3>
                </div>
                <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                    <table style="min-width: 1200px; white-space: nowrap; width: 100%;">
                        <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);">
                            <tr>
                                <th style="text-align:center; color: white; border: none;">№</th>
                                <th style="text-align:center; color: white; border: none;">${t("Mijoz")}</th>
                                <th style="text-align:center; color: white; border: none;">${t("Mahsulotlar")}</th>
                                <th style="text-align:center; color: white; border: none;">${t("Summa")}</th>
                                <th style="text-align:center; color: white; border: none;">${t("Sana")}</th>
                                <th style="text-align:center; color: white; border: none;">${t("Holati")}</th>
                                <th style="text-align:center; color: white; border: none;">${t("Amallar")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(orders || []).length === 0 ? `<tr><td colspan="7" style="text-align:center; padding: 20px;">${t("Hozircha buyurtmalar yo'q")}</td></tr>` : orders.map(o => `
                                <tr>
                                    <td style="text-align:center; font-weight:600;">#${o.id}</td>
                                    <td>
                                        <div style="font-weight:600;">${escapeHtml(o.customer?.firstName)} ${escapeHtml(o.customer?.lastName)}</div>
                                        <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(o.customer?.phoneNumber)}</div>
                                    </td>
                                    <td>
                                        <div style="font-size:13px;">
                                            ${(o.items || []).map(item => `
                                                <div style="margin-bottom:4px; display:flex; justify-content:space-between; gap:10px;">
                                                    <span>• ${escapeHtml(item.product?.name)} <small>(${item.quantity} ta)</small></span>
                                                    <span style="color:var(--text-muted);">${(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </td>
                                    <td style="text-align:center; font-weight:700; color:var(--primary);">${o.totalSum.toLocaleString()}</td>
                                    <td style="text-align:center; font-size:13px;">${new Date(o.createdAt).toLocaleString()}</td>
                                    <td style="text-align:center">
                                        <span class="badge ${o.status === 'PENDING' ? 'badge-warning' : o.status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}">
                                            ${t(o.status)}
                                        </span>
                                    </td>
                                    <td class="actions" style="justify-content:center">
                                        ${o.status === 'PENDING' ? `
                                            <button class="btn btn-primary btn-sm" onclick="updateMpOrderStatus(${o.id}, 'CONFIRMED')" title="${t("Tasdiqlash")}">✓</button>
                                            <button class="btn btn-danger btn-sm" onclick="updateMpOrderStatus(${o.id}, 'REJECTED')" title="${t("Rad etish")}">✕</button>
                                        ` : '—'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (e) {
        container.innerHTML = `<div class="error-state">${t(e.message)}</div>`;
    }
}

async function updateMpOrderStatus(id, status) {
    if (!confirm(t(`Buyurtmani ${status === 'CONFIRMED' ? 'tasdiqlashni' : 'rad etishni'} xohlaysizmi?`))) return;
    try {
        await api.put(`/admin/marketplace/orders/${id}/status`, { status });
        showToast(t("Holat yangilandi"), 'success');
        renderMpOrders();
    } catch (e) {
        showToast(t(e.message), 'error');
    }
}

window.renderMpOrders = renderMpOrders;
window.updateMpOrderStatus = updateMpOrderStatus;
window.toggleMarketplaceAccess = toggleMarketplaceAccess;
