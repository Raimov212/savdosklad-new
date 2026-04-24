import { api, showToast, escapeHtml, formatDate } from './api.js';
import { t } from './i18n.js';

let allEmployees = [];
let allBusinesses = [];
window.employeesPage = 1;
const employeesPerPage = 10;

export async function renderEmployees() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
        <div class="card" style="padding:24px;">
            <div class="card-header" style="margin-bottom:20px;">
                <h3 style="font-family:'Outfit'; font-size:18px;">${t("Xodimlar")}</h3>
                <button class="btn btn-primary" onclick="window.openAddEmployeeModal()">
                    <i data-lucide="user-plus"></i> ${t("Xodim qo'shish")}
                </button>
            </div>
            
            <div class="table-container">
                <table class="premium-table">
                    <thead>
                        <tr>
                            <th style="text-align:center">№</th>
                            <th>${t("Ism Familiya")}</th>
                            <th>${t("Foydalanuvchi nomi")}</th>
                            <th>${t("Biznes")}</th>
                            <th style="text-align:center">${t("Telefon")}</th>
                            <th style="text-align:center">${t("Muddati")}</th>
                            <th style="text-align:center">${t("Amallar")}</th>
                        </tr>
                    </thead>
                    <tbody id="employees-table-body">
                        <tr><td colspan="7" style="text-align:center; padding:40px;"><div class="loader-inline"></div></td></tr>
                    </tbody>
                </table>
            </div>
            <div id="employees-pagination"></div>
        </div>
    `;

    try {
        const [employees, businesses] = await Promise.all([
            api.get('/users/my-employees'),
            api.get('/businesses/my')
        ]);
        allEmployees = employees || [];
        allBusinesses = businesses || [];
        renderEmployeesTable();
        lucide.createIcons();
    } catch (err) {
        showToast(err.message, 'error');
        document.getElementById('employees-table-body').innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger);">${err.message}</td></tr>`;
    }
}

function renderEmployeesTable(isAppend = false) {
    if (typeof isAppend !== 'boolean') isAppend = false; // it receives `true` from observer

    const tbody = document.getElementById('employees-table-body');
    const pag = document.getElementById('employees-pagination');
    if (!tbody) return;

    if (!isAppend) window.employeesPage = 1;

    if (allEmployees.length === 0 && !isAppend) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">${t("Sizda hali xodimlar yo'q")}</td></tr>`;
        pag.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(allEmployees.length / employeesPerPage);
    if (window.employeesPage > totalPages) window.employeesPage = totalPages;
    const end = window.employeesPage * employeesPerPage;
    const paginated = allEmployees.slice(end - employeesPerPage, end);

    const rows = paginated.map((emp, i) => {
        const empBids = emp.businessIds || [];
        const linkedBizNames = allBusinesses
            .filter(b => empBids.includes(b.id))
            .map(b => b.name)
            .join(', ');

        return `
            <tr>
                <td style="text-align:center; color:var(--text-muted);">${(window.employeesPage - 1) * employeesPerPage + i + 1}</td>
                <td style="font-weight:600;">${escapeHtml(emp.firstName)} ${escapeHtml(emp.lastName)}</td>
                <td>@${escapeHtml(emp.userName)}</td>
                <td><span class="badge" style="background:var(--accent-glow); color:var(--accent);">${escapeHtml(linkedBizNames || t("Biriktirilmagan"))}</span></td>
                <td style="text-align:center;">${emp.phoneNumber || '—'}</td>
                <td style="text-align:center; font-size:12px; font-weight:500;">${emp.expirationDate ? emp.expirationDate.split('T')[0] : '—'}</td>
                <td class="actions" style="justify-content:center">
                    <button class="btn-icon" onclick="window.openSalaryModal(${emp.id})" title="${t("Ish haqi")}">
                        <i data-lucide="banknote"></i>
                    </button>
                    <button class="btn-icon" onclick="window.openEditEmployeeModal(${emp.id})" title="${t("Tahrirlash")}">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="btn-icon danger" onclick="window.deleteEmployee(${emp.id})" title="${t("O'chirish")}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    if (!isAppend) {
        tbody.innerHTML = rows;
        pag.innerHTML = window.renderPageControls('employeesPage', totalPages, 'renderEmployeesTable');
        window.attachInfiniteScroll('employeesPage', totalPages, 'renderEmployeesTable');
    } else {
        tbody.insertAdjacentHTML('beforeend', rows);
        pag.innerHTML = window.renderPageControls('employeesPage', totalPages, 'renderEmployeesTable');
        window.attachInfiniteScroll('employeesPage', totalPages, 'renderEmployeesTable');
    }

    lucide.createIcons();
}

window.renderEmployeesTable = renderEmployeesTable;

window.openAddEmployeeModal = function () {
    const bizCheckboxes = allBusinesses.map(b => `
        <div style="margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600;">
                <input type="checkbox" name="emp-businesses" value="${b.id}" onchange="window.toggleBizPermissions(${b.id}, this.checked)">
                <span>${escapeHtml(b.name)}</span>
            </label>
            <div id="biz-perms-${b.id}" style="display:none; gap:15px; margin-left:25px; margin-top:5px; font-size:12px;">
                <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" class="perm-add" data-biz="${b.id}"> ${t("Qo'shish")}
                </label>
                <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" class="perm-edit" data-biz="${b.id}"> ${t("Tahrirlash")}
                </label>
                <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" class="perm-delete" data-biz="${b.id}"> ${t("O'chirish")}
                </label>
            </div>
        </div>
    `).join('');

    const body = `
        <form onsubmit="window.handleAddEmployee(event)" id="employee-form">
            <div class="form-row">
                <div class="form-group">
                    <label>${t("Ism")} </label>
                    <input type="text" class="form-control" id="emp-firstName" required>
                </div>
                <div class="form-group">
                    <label>${t("Familiya")} </label>
                    <input type="text" class="form-control" id="emp-lastName" required>
                </div>
            </div>
            <div class="form-group">
                <label style="margin-bottom:12px; display:block;">${t("Biriktirilgan bizneslar")} </label>
                <div style="max-height:150px; overflow-y:auto; padding:12px; border:1px solid var(--border-color); border-radius:8px;">
                    ${bizCheckboxes || `<p style="color:var(--text-muted); font-size:13px;">${t("Hozircha bizneslar yo'q")}</p>`}
                </div>
            </div>
            <div class="form-group">
                <label>${t("Telefon")}</label>
                <input type="text" class="form-control" id="emp-phone" placeholder="+998901234567">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${t("Foydalanuvchi nomi")} </label>
                    <input type="text" class="form-control" id="emp-user" required>
                </div>
                <div class="form-group">
                    <label>${t("Parol")} </label>
                    <input type="password" class="form-control" id="emp-pass" required>
                </div>
            </div>
            <div class="form-group">
                <label>${t("Obuna muddati")} </label>
                <input type="date" class="form-control" id="emp-expiration" value="${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}" required>
            </div>
            <div style="margin-top:20px; padding-top:15px; border-top:1px dashed var(--border);">
                <div class="form-group">
                    <label>${t("Profil rasmi")}</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="file" class="form-control" accept="image/*" onchange="window.previewEmployeeImage(this, 'emp-image', 'emp-image-preview')">
                        <input type="hidden" id="emp-image" value="">
                        <div id="emp-image-preview" style="width:50px; height:50px; border:1px solid var(--border); border-radius:8px; overflow:hidden;"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer" style="padding-top:20px;">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
                <button type="submit" class="btn btn-primary">${t("Saqlash")}</button>
            </div>
        </form>
    `;
    window.openModal(t("Yangi xodim qo'shish"), body);
};

window.handleAddEmployee = async function (e) {
    e.preventDefault();
    const businessPermissions = selectedBids.map(bid => {
        const row = document.getElementById(`biz-perms-${bid}`);
        return {
            businessId: bid,
            canAdd: row.querySelector('.perm-add').checked,
            canEdit: row.querySelector('.perm-edit').checked,
            canDelete: row.querySelector('.perm-delete').checked
        };
    });

    const req = {
        firstName: document.getElementById('emp-firstName').value,
        lastName: document.getElementById('emp-lastName').value,
        userName: document.getElementById('emp-user').value,
        phoneNumber: document.getElementById('emp-phone').value,
        password: document.getElementById('emp-pass').value,
        expirationDate: document.getElementById('emp-expiration').value ? new Date(document.getElementById('emp-expiration').value).toISOString() : undefined,
        businessIds: selectedBids,
        businessPermissions: businessPermissions,
        image: document.getElementById('emp-image').value
    };

    try {
        await api.post('/users/employees', req);
        showToast(t("Xodim muvaffaqiyatli qo'shildi"));
        closeModal();
        renderEmployees();
    } catch (err) {
        showToast(err.message, 'error');
    }
};

window.openEditEmployeeModal = async function (id) {
    const emp = allEmployees.find(e => e.id === id);
    if (!emp) return;

    const empBids = emp.businessIds || [];
    const bizCheckboxes = allBusinesses.map(b => {
        const isLinked = empBids.includes(b.id);
        const perms = emp.businessPermissions ? emp.businessPermissions.find(p => p.businessId === b.id) : null;
        const canAdd = perms ? perms.canAdd : false;
        const canEdit = perms ? perms.canEdit : false;
        const canDelete = perms ? perms.canDelete : false;

        return `
            <div style="margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600;">
                    <input type="checkbox" name="emp-businesses" value="${b.id}" ${isLinked ? 'checked' : ''} onchange="window.toggleBizPermissions(${b.id}, this.checked)">
                    <span>${escapeHtml(b.name)}</span>
                </label>
                <div id="biz-perms-${b.id}" style="display:${isLinked ? 'flex' : 'none'}; gap:15px; margin-left:25px; margin-top:5px; font-size:12px;">
                    <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                        <input type="checkbox" class="perm-add" data-biz="${b.id}" ${canAdd ? 'checked' : ''}> ${t("Qo'shish")}
                    </label>
                    <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                        <input type="checkbox" class="perm-edit" data-biz="${b.id}" ${canEdit ? 'checked' : ''}> ${t("Tahrirlash")}
                    </label>
                    <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                        <input type="checkbox" class="perm-delete" data-biz="${b.id}" ${canDelete ? 'checked' : ''}> ${t("O'chirish")}
                    </label>
                </div>
            </div>
        `;
    }).join('');

    const body = `
        <form onsubmit="window.handleUpdateEmployee(event, ${emp.id})" id="employee-form">
            <div class="form-row">
                <div class="form-group">
                    <label>${t("Ism")} </label>
                    <input type="text" class="form-control" id="emp-firstName" value="${escapeHtml(emp.firstName)}" required>
                </div>
                <div class="form-group">
                    <label>${t("Familiya")} </label>
                    <input type="text" class="form-control" id="emp-lastName" value="${escapeHtml(emp.lastName)}" required>
                </div>
            </div>
            <div class="form-group">
                <label style="margin-bottom:12px; display:block;">${t("Biriktirilgan bizneslar")}</label>
                <div style="max-height:150px; overflow-y:auto; padding:12px; border:1px solid var(--border-color); border-radius:8px;">
                    ${bizCheckboxes || `<p style="color:var(--text-muted); font-size:13px;">${t("Hozircha bizneslar yo'q")}</p>`}
                </div>
            </div>
            <div class="form-group">
                <label>${t("Telefon")}</label>
                <input type="text" class="form-control" id="emp-phone" value="${escapeHtml(emp.phoneNumber || '')}">
            </div>
            <div class="form-group">
                <label>${t("Yangi parol (ixtiyoriy)")}</label>
                <input type="password" class="form-control" id="edit-emp-pass" placeholder="******">
            </div>
            <div style="margin-top:20px; padding-top:15px; border-top:1px dashed var(--border);">
                <div class="form-group">
                    <label>${t("Profil rasmi")}</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="file" class="form-control" accept="image/*" onchange="window.previewEmployeeImage(this, 'edit-emp-image', 'edit-emp-image-preview')">
                        <input type="hidden" id="edit-emp-image" value="${escapeHtml(emp.image || '')}">
                        <div id="edit-emp-image-preview" style="width:50px; height:50px; border:1px solid var(--border); border-radius:8px; overflow:hidden;">
                            ${emp.image ? `<img src="${emp.image}" style="width:100%; height:100%; object-fit:cover;">` : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>${t("Obuna muddati")} *</label>
                <input type="date" class="form-control" id="emp-expiration" value="${emp.expirationDate ? emp.expirationDate.split('T')[0] : ''}" required>
            </div>
            <div class="modal-footer" style="padding-top:20px;">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
                <button type="submit" class="btn btn-primary">${t("Yangilash")}</button>
            </div>
        </form>
    `;
    window.openModal(t("Xodimni tahrirlash"), body);
};

window.handleUpdateEmployee = async function (e, id) {
    e.preventDefault();
    const selectedBids = Array.from(document.querySelectorAll('input[name="emp-businesses"]:checked')).map(cb => parseInt(cb.value));
    const businessPermissions = selectedBids.map(bid => {
        const row = document.getElementById(`biz-perms-${bid}`);
        return {
            businessId: bid,
            canAdd: row.querySelector('.perm-add').checked,
            canEdit: row.querySelector('.perm-edit').checked,
            canDelete: row.querySelector('.perm-delete').checked
        };
    });

    const req = {
        firstName: document.getElementById('emp-firstName').value,
        lastName: document.getElementById('emp-lastName').value,
        phoneNumber: document.getElementById('emp-phone').value,
        expirationDate: document.getElementById('emp-expiration').value ? new Date(document.getElementById('emp-expiration').value).toISOString() : undefined,
        businessIds: selectedBids,
        businessPermissions: businessPermissions,
        image: document.getElementById('edit-emp-image') ? document.getElementById('edit-emp-image').value : ''
    };
    const pass = document.getElementById('edit-emp-pass') ? document.getElementById('edit-emp-pass').value : '';
    if (pass) req.password = pass;

    try {
        await api.put(`/users/${id}`, req);
        showToast(t("Xodim ma'lumotlari yangilandi"));
        closeModal();
        renderEmployees();
    } catch (err) {
        showToast(err.message, 'error');
    }
};

window.deleteEmployee = async function (id) {
    if (!confirm(t("Ushbu xodimni o'chirishga ishonchingiz komilmi?"))) return;
    try {
        await api.delete(`/users/${id}`);
        showToast(t("Xodim o'chirildi"));
        renderEmployees();
    } catch (err) {
        showToast(err.message, 'error');
    }
};

window.previewEmployeeImage = async function (input, hiddenId, previewId) {
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
};
window.toggleBizPermissions = function(bid, checked) {
    const el = document.getElementById(`biz-perms-${bid}`);
    if (el) el.style.display = checked ? 'flex' : 'none';
};

window.openSalaryModal = async function(empId) {
    const emp = allEmployees.find(e => e.id === empId);
    if (!emp) return;

    const bid = getSelectedBusinessId(); // No longer mandatory to show the modal

    const now = new Date();
    const months = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

    try {
        const salaries = await api.get(`/salaries/employee/${empId}`);
        const historyRows = (salaries || []).map(s => `
            <tr>
                <td>${months[s.month]} ${s.year}</td>
                <td style="font-weight:700; color:var(--accent);">${window.formatPrice(s.amount)}</td>
                <td style="font-size:12px; color:var(--text-muted);">${escapeHtml(s.description || '')}</td>
                <td style="text-align:right;">
                    <button class="btn-icon danger" onclick="window.deleteSalary(${s.id}, ${empId})" title="${t("O'chirish")}">
                        <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        const body = `
            <div style="margin-bottom:20px; padding:15px; background:var(--bg-glass); border-radius:12px; border:1px solid var(--accent-glow);">
                <h4 style="margin-top:0; margin-bottom:10px; font-size:14px;">${t("Yangi to'lov qo'shish")}</h4>
                <form onsubmit="window.handleSalaryPayment(event, ${empId}, ${bid})">
                    <div class="form-row">
                        <div class="form-group">
                            <label>${t("Oy")}</label>
                            <select class="form-control" id="salary-month" required>
                                ${months.map((m, i) => i === 0 ? '' : `<option value="${i}" ${i === now.getMonth() + 1 ? 'selected' : ''}>${t(m)}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>${t("Yil")}</label>
                            <input type="number" class="form-control" id="salary-year" value="${now.getFullYear()}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>${t("Summa")}</label>
                        <input type="number" class="form-control" id="salary-amount" placeholder="0" required>
                    </div>
                    <div class="form-group">
                        <label>${t("Izoh")}</label>
                        <input type="text" class="form-control" id="salary-desc" placeholder="${t("Masalan: Bonus bilan")}">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%">${t("Qo'shish")}</button>
                </form>
            </div>

            <h4 style="font-size:14px; margin-bottom:10px;">${t("To'lovlar tarixi")}</h4>
            <div class="table-container" style="max-height:200px; overflow-y:auto;">
                <table class="premium-table">
                    <thead>
                        <tr>
                            <th>${t("DAVR")}</th>
                            <th>${t("SUMMA")}</th>
                            <th>${t("Izoh")}</th>
                            <th style="text-align:right"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${historyRows || `<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">${t("Hozircha to'lovlar yo'q")}</td></tr>`}
                    </tbody>
                </table>
            </div>
        `;
        window.openModal(`💸 ${emp.firstName} ${emp.lastName} — ${t("Ish haqi")}`, body);
        lucide.createIcons();
    } catch (err) {
        showToast(err.message, 'error');
    }
};

window.handleSalaryPayment = async function(e, empId, bid) {
    e.preventDefault();
    if (!bid) {
        showToast(t("Avval biznes tanlang"), 'warning');
        return;
    }
    const req = {
        employeeId: empId,
        businessId: bid,
        month: parseInt(document.getElementById('salary-month').value),
        year: parseInt(document.getElementById('salary-year').value),
        amount: parseFloat(document.getElementById('salary-amount').value),
        description: document.getElementById('salary-desc').value
    };

    try {
        await api.post('/salaries', req);
        showToast(t("Ish haqi muvaffaqiyatli qo'shildi"));
        window.openSalaryModal(empId); // Refresh history
    } catch (err) {
        showToast(err.message, 'error');
    }
};

window.deleteSalary = async function(id, empId) {
    if (!confirm(t("Ushbu to'lovni o'chirishni xohlaysizmi?"))) return;
    try {
        await api.delete(`/salaries/${id}`);
        showToast(t("O'chirildi"));
        window.openSalaryModal(empId);
    } catch (err) {
        showToast(err.message, 'error');
    }
};

function getSelectedBusinessId() {
    return parseInt(localStorage.getItem('selectedBusinessId'));
}
