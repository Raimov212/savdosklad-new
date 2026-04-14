import { api, showToast, escapeHtml } from './api.js';
import { t } from './i18n.js';

let currentOrgs = [];

export async function renderOrganizations() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>🏢 ${t("Tashkilotlar")}</h2>
                <button class="btn btn-primary btn-sm" onclick="openOrgModal()">${t("Qo'shish")}</button>
            </div>
            <div id="org-list-container" class="org-list-grid">
                <div class="loader"></div>
            </div>
        </div>
    `;
    loadOrganizations();
}

async function loadOrganizations() {
    const container = document.getElementById('org-list-container');
    
    // Add custom styles for cards if not already added
    if (!document.getElementById('org-card-styles')) {
        const style = document.createElement('style');
        style.id = 'org-card-styles';
        style.textContent = `
            .org-list-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 20px;
                padding: 10px 0;
            }
            .org-card {
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: 20px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                transition: transform 0.2s, box-shadow 0.2s;
                position: relative;
                overflow: hidden;
            }
            .org-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            }
            .org-card-header {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                align-items: center;
            }
            .org-card-logo {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                object-fit: cover;
                background: var(--bg-input);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                border: 1px solid var(--border);
            }
            .org-card-title {
                flex: 1;
            }
            .org-card-title h3 {
                margin: 0;
                font-size: 18px;
                color: var(--text-primary);
            }
            .org-card-title span {
                font-size: 13px;
                color: var(--text-secondary);
                background: var(--bg-input);
                padding: 2px 8px;
                border-radius: 6px;
            }
            .org-card-body {
                flex: 1;
                display: grid;
                grid-template-columns: 1fr;
                gap: 8px;
                font-size: 14px;
            }
            .org-info-item {
                display: flex;
                justify-content: space-between;
                border-bottom: 1px dashed var(--border);
                padding-bottom: 4px;
            }
            .org-info-label {
                color: var(--text-secondary);
                font-weight: 500;
            }
            .org-info-value {
                color: var(--text-primary);
                font-weight: 600;
                text-align: right;
            }
            .org-card-footer {
                margin-top: 20px;
                display: flex;
                gap: 10px;
            }
            .org-card-footer .btn {
                flex: 1;
            }
        `;
        document.head.appendChild(style);
    }

    try {
        currentOrgs = await api.get('/organizations/my');
        if (!currentOrgs || currentOrgs.length === 0) {
            container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">
                <div class="icon">🏢</div>
                <h4>${t("Tashkilotlar mavjud emas")}</h4>
            </div>`;
            return;
        }

        container.innerHTML = currentOrgs.map(org => {
            const orgStr = JSON.stringify(org).replace(/'/g, "&#39;");
            return `
                <div class="org-card">
                    <div class="org-card-header">
                        <div class="org-card-logo">
                            ${org.logo ? `<img src="${org.logo}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">` : '🏢'}
                        </div>
                        <div class="org-card-title">
                            <h3>${escapeHtml(org.orgName)}</h3>
                            <span>${org.orgType}</span>
                        </div>
                    </div>
                    <div class="org-card-body">
                        <div class="org-info-item">
                            <span class="org-info-label">${t("STIR")}:</span>
                            <span class="org-info-value">${org.stir || '—'}</span>
                        </div>
                        <div class="org-info-item">
                            <span class="org-info-label">${t("Aloqa telefoni")}:</span>
                            <span class="org-info-value">${org.phoneNumber || '—'}</span>
                        </div>
                         <div class="org-info-item">
                            <span class="org-info-label">${t("Elektron pochta")}:</span>
                            <span class="org-info-value">${org.email || '—'}</span>
                        </div>
                        <div class="org-info-item">
                            <span class="org-info-label">${t("Huquqiy manzil")}:</span>
                            <span class="org-info-value">${org.legalAddress || '—'}</span>
                        </div>
                        <div style="margin-top:10px; padding-top:10px; border-top: 1px solid var(--border);">
                            <div class="org-info-item">
                                <span class="org-info-label">${t("Bank nomi")}:</span>
                                <span class="org-info-value">${org.bankName || '—'}</span>
                            </div>
                            <div class="org-info-item">
                                <span class="org-info-label">${t("MFO")}:</span>
                                <span class="org-info-value">${org.mfo || '—'}</span>
                            </div>
                            <div class="org-info-item">
                                <span class="org-info-label">${t("Hisob raqami")}:</span>
                                <span class="org-info-value">${org.bankAccount || '—'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="org-card-footer">
                        <button class="btn btn-secondary btn-sm" onclick='openOrgModal(${org.id}, \`${orgStr}\`)'>
                            <i data-lucide="edit"></i> ${t("Tahrirlash")}
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteOrg(${org.id})">
                            <i data-lucide="trash-2"></i> ${t("O'chirish")}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        setTimeout(() => lucide.createIcons(), 50);
    } catch (e) {
        container.innerHTML = `<p class="error">${e.message}</p>`;
    }
}

window.openOrgModal = async function(id, orgJson) {
    const isEdit = !!id;
    const org = isEdit ? JSON.parse(orgJson) : {};
    
    // Load regions and districts for the modal
    let regions = [];
    try {
        regions = await api.get('/geography/regions');
    } catch (e) {
        console.error("Failed to load regions", e);
    }

    openModal(isEdit ? t('Tashkilotni tahrirlash') : t('Yangi tashkilot'), `
        <form onsubmit="saveOrg(event, ${id || 'null'})">
            <div class="form-row">
                <div class="form-group">
                    <label>${t("Tashkilot nomi")}</label>
                    <input type="text" id="org-name" class="form-control" value="${escapeHtml(org.orgName || '')}" required>
                </div>
                <div class="form-group">
                    <label>${t("Turi")}</label>
                    <select id="org-type" class="form-control" required>
                        <option value="YATT" ${org.orgType === 'YATT' ? 'selected' : ''}>YATT</option>
                        <option value="MChJ" ${org.orgType === 'MChJ' ? 'selected' : ''}>MChJ</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${t("STIR")}</label>
                    <input type="text" id="org-stir" class="form-control" value="${escapeHtml(org.stir || '')}" maxlength="9">
                </div>
                <div class="form-group">
                    <label>${t("Aloqa telefoni")}</label>
                    <input type="text" id="org-phone" class="form-control" value="${escapeHtml(org.phoneNumber || '')}" placeholder="+998901234567">
                </div>
            </div>
            <div class="form-group">
                <label>${t("Elektron pochta")}</label>
                <input type="email" id="org-email" class="form-control" value="${escapeHtml(org.email || '')}" placeholder="example@mail.com">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${t("Viloyat")} *</label>
                    <select id="org-region" class="form-control" onchange="loadDistrictsForOrg(this.value)" required>
                        <option value="">${t("Tanlang...")}</option>
                        ${regions.map(r => `<option value="${r.id}" ${r.id === org.regionId ? 'selected' : ''}>${escapeHtml(r.name)}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>${t("Tuman")} *</label>
                    <select id="org-district" class="form-control" required>
                        <option value="">${t("Tanlang...")}</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>${t("Huquqiy manzil")}</label>
                <input type="text" id="org-address" class="form-control" value="${escapeHtml(org.legalAddress || '')}" placeholder="${t("Ko'cha, uy raqami...")}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${t("Bank nomi")}</label>
                    <input type="text" id="org-bank" class="form-control" value="${escapeHtml(org.bankName || '')}">
                </div>
                <div class="form-group">
                    <label>${t("MFO")}</label>
                    <input type="text" id="org-mfo" class="form-control" value="${escapeHtml(org.mfo || '')}" maxlength="5">
                </div>
            </div>
            <div class="form-group">
                <label>${t("Hisob raqami")}</label>
                <input type="text" id="org-acc" class="form-control" value="${escapeHtml(org.bankAccount || '')}" maxlength="20">
            </div>
            <div class="form-group">
                <label>${t("Logotip")}</label>
                <div style="display:flex; gap:20px; align-items: center; margin-top: 5px;">
                    <div id="org-logo-preview" style="width:80px; height:80px; border-radius:15px; background:var(--bg-input); border:2px dashed var(--border); overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        ${org.logo ? `<img src="${org.logo}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size:24px; opacity:0.3;">🖼️</span>`}
                    </div>
                    <div style="flex:1">
                        <input type="file" class="form-control" accept="image/*" onchange="previewOrgLogo(this)">
                        <input type="hidden" id="org-logo-url" value="${escapeHtml(org.logo || '')}">
                        <p style="font-size:11px; color:var(--text-muted); margin-top:5px;">${t("JPEG, PNG formatlar, maksimal 2MB.")}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${t("Bekor qilish")}</button>
                <button type="submit" class="btn btn-primary">${t("Saqlash")}</button>
            </div>
        </form>
    `);

    if (org.regionId) {
        await loadDistrictsForOrg(org.regionId, org.districtId);
    }
};

window.previewOrgLogo = async function(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const formData = new FormData();
        formData.append('file', file);
        try {
            showToast(t("Rasm yuklanmoqda..."), 'info');
            const result = await api.post('/upload', formData);
            if (result && result.url) {
                document.getElementById('org-logo-url').value = result.url;
                document.getElementById('org-logo-preview').innerHTML = `<img src="${result.url}" style="width:100%; height:100%; object-fit:cover;">`;
                showToast(t("Rasm yuklandi"));
            }
        } catch (err) {
            showToast(err.message, 'error');
        }
    }
};

window.loadDistrictsForOrg = async function(regionId, selectedDistrictId = null) {
    const districtSelect = document.getElementById('org-district');
    if (!regionId) {
        districtSelect.innerHTML = `<option value="">${t("Tanlang...")}</option>`;
        return;
    }

    try {
        const districts = await api.get(`/geography/districts?regionId=${regionId}`);
        districtSelect.innerHTML = `<option value="">${t("Tanlang...")}</option>` + 
            districts.map(d => `<option value="${d.id}" ${d.id === selectedDistrictId ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('');
    } catch (e) {
        showToast(e.message, 'error');
    }
};

window.saveOrg = async function(e, id) {
    e.preventDefault();
    const data = {
        orgName: document.getElementById('org-name').value,
        orgType: document.getElementById('org-type').value,
        stir: document.getElementById('org-stir').value,
        phoneNumber: document.getElementById('org-phone').value,
        email: document.getElementById('org-email').value,
        legalAddress: document.getElementById('org-address').value,
        logo: document.getElementById('org-logo-url').value,
        bankName: document.getElementById('org-bank').value,
        bankAccount: document.getElementById('org-acc').value,
        mfo: document.getElementById('org-mfo').value,
        regionId: parseInt(document.getElementById('org-region').value) || null,
        districtId: parseInt(document.getElementById('org-district').value) || null,
    };

    try {
        if (id) {
            await api.put(`/organizations/${id}`, data);
            showToast(t('Tashkilot yangilandi'), 'success');
        } else {
            await api.post('/organizations', data);
            showToast(t('Tashkilot yaratildi'), 'success');
        }
        closeModal();
        loadOrganizations();
    } catch (e) {
        showToast(e.message, 'error');
    }
};

window.deleteOrg = async function(id) {
    if (!confirm(t('Tashkilotni o\'chirishni xohlaysizmi?'))) return;
    try {
        await api.delete(`/organizations/${id}`);
        showToast(t('Tashkilot o\'chirildi'), 'success');
        loadOrganizations();
    } catch (e) {
        showToast(e.message, 'error');
    }
};

window.renderOrganizations = renderOrganizations;
