export const API_BASE = '/api/v1';
export const api = {
    getToken() {
        return localStorage.getItem('token');
    },

    setToken(token) {
        localStorage.setItem('token', token);
    },

    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    getUser() {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    },

    logout(reason = '') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedBusinessId');
        let url = 'index.html';
        if (reason) url += `?reason=${encodeURIComponent(reason)}`;
        window.location.href = url;
    },

    async request(method, path, body = null) {
        const headers = {};
        if (!(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const token = this.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const lang = localStorage.getItem('appLang') || 'uz';
        headers['Accept-Language'] = lang;

        // Timeout: 10 soniya
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const opts = { method, headers, signal: controller.signal };
        if (body) {
            opts.body = (body instanceof FormData) ? body : JSON.stringify(body);
        }

        try {
            const res = await fetch(`${API_BASE}${path}`, opts);
            clearTimeout(timeoutId);

            if (res.status === 401) {
                // Login sahifasida 401 bo'lsa logout qilmaslik kerak
                if (!path.includes('/auth/login') && !path.includes('/auth/register')) {
                    this.logout();
                    return null;
                }
            }

            const data = await res.json().catch(() => null);

            if (res.status === 403 && data && data.expired) {
                alert(data.error);
                this.logout();
                return null;
            }

            if (!res.ok) {
                const errMsg = data?.error || `Xatolik: ${res.status}`;
                throw new Error(errMsg);
            }

            return data;
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                throw new Error('Server javob bermayapti. Timeout (10s). Backend ishlab turganini tekshiring.');
            }
            if (err.message === 'Failed to fetch') {
                throw new Error('Server bilan aloqa yo\'q. Backend ishlab turganini tekshiring.');
            }
            throw err;
        }
    },

    get(path) { return this.request('GET', path); },
    post(path, body) { return this.request('POST', path, body); },
    put(path, body) { return this.request('PUT', path, body); },
    delete(path) { return this.request('DELETE', path); },
};

// Global error handler for Webview debugging
window.onerror = function (message, source, lineno, colno, error) {
    if (message === "Script error.") {
        console.error("CORS Script Error: Details hidden by browser. Check network tab or use 'crossorigin' attribute.");
        return false;
    }
    const stack = error?.stack ? `\nStack: ${error.stack.split('\n').slice(0, 2).join('\n')}` : '';
    const fullMsg = `JS Error: ${message} | ${source?.split('/').pop()} ${lineno}:${colno}${stack}`;
    console.error(fullMsg, error);
    showToast(`Xatolik: ${message}`, 'error');
    return false;
};

// ==================== TOAST NOTIFICATIONS ====================
export function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

// ==================== HELPER FUNCTIONS ====================
export function formatPrice(n) {
    if (n == null) return '0';
    return Number(n).toLocaleString('uz-UZ');
}

export function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}.${d.getFullYear()}`;
}

export function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${d.getFullYear()} ${hours}:${minutes}`;
}

export function getSelectedBusinessId() {
    const page = window.currentPage || 'dashboard';
    const key = `selectedBusinessId_${page}`;
    const val = localStorage.getItem(key);
    if (val === null) {
        // Fallback to global if page-specific doesn't exist
        return parseInt(localStorage.getItem('selectedBusinessId')) || 0;
    }
    return parseInt(val) || 0;
}

export function setSelectedBusinessId(id) {
    const page = window.currentPage || 'dashboard';
    const key = `selectedBusinessId_${page}`;
    localStorage.setItem(key, id);
    // Also update global as a "last used" fallback
    localStorage.setItem('selectedBusinessId', id);
}

// ==================== DATE PERIOD HELPERS ====================
export function getDatePeriod() {
    const page = window.currentPage || 'dashboard';
    const key = `datePeriod_${page}`;
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {}
    }

    // Default: Last 7 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    };
}

export function setDatePeriod(start, end) {
    const page = window.currentPage || 'dashboard';
    const key = `datePeriod_${page}`;
    localStorage.setItem(key, JSON.stringify({ start, end }));
}

export function getDateQuery() {
    const period = getDatePeriod();
    return `&startDate=${period.start}&endDate=${period.end}`;
}


export function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==================== THEME TOGGLE ====================
export function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('appTheme', newTheme);
    updateThemeIcon(newTheme);
}

export function updateThemeIcon(theme) {
    const btns = document.querySelectorAll('.theme-toggle');
    btns.forEach(btn => {
        const lucideIcon = btn.querySelector('i[data-lucide]');
        if (lucideIcon) {
            lucideIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
            lucide.createIcons();
        } else {
            // Fallback for non-lucide buttons (dashboard uses emoji for now)
            btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        btn.setAttribute('title', theme === 'dark' ? t('Kunduzgi rejim') : t('Tungi rejim'));
    });
}

// ==================== ACCORDION TOGGLE ====================
export function toggleAcc(id) {
    const item = document.getElementById(id);
    if (!item) return;
    const wasOpen = item.classList.contains('open');
    // Close all others in same list
    const list = item.closest('.acc-list');
    if (list) {
        list.querySelectorAll('.acc-item.open').forEach(el => {
            if (el !== item) el.classList.remove('open');
        });
    }
    item.classList.toggle('open', !wasOpen);
}
window.api = api;
window.showToast = showToast;
window.formatPrice = formatPrice;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.getSelectedBusinessId = getSelectedBusinessId;
window.setSelectedBusinessId = setSelectedBusinessId;
window.getDatePeriod = getDatePeriod;
window.setDatePeriod = setDatePeriod;
window.getDateQuery = getDateQuery;
window.escapeHtml = escapeHtml;
window.toggleTheme = toggleTheme;
window.updateThemeIcon = updateThemeIcon;
window.toggleAcc = toggleAcc;
