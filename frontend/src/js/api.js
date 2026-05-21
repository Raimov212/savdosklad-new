export const API_BASE = '/api/v1';
export const api = {
    getToken() {
        return localStorage.getItem('customer_token') || localStorage.getItem('token');
    },

    setToken(token) {
        localStorage.setItem('token', token);
    },

    setCustomerToken(token) {
        localStorage.setItem('customer_token', token);
    },

    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    getUser() {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    },

    getCustomerUser() {
        const u = localStorage.getItem('customer_user');
        return u ? JSON.parse(u) : null;
    },

    logout(reason = '') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        // Do NOT clear selectedBusinessId or currentPage as requested
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

        const bid = getSelectedBusinessId();
        if (bid) headers['X-Business-ID'] = bid.toString();

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
    // Cashback Tiers
    getCashbackTiers(bid) { return this.get(`/cashback/tiers?businessId=${bid}`); },
    createCashbackTier(data) { return this.post('/cashback/tiers', data); },
    updateCashbackTier(id, data) { return this.put(`/cashback/tiers/${id}`, data); },
    deleteCashbackTier(id) { return this.delete(`/cashback/tiers/${id}`); },
};

// Global error handler for Webview debugging
window.onerror = function (message, source, lineno, colno, error) {
    if (message === "Script error.") {
        console.error("CORS Script Error: Details hidden by browser. Check network tab or use 'crossorigin' attribute.");
        return false;
    }
    const stack = error?.stack ? `\nStack: ${error.stack}` : '';
    const fullMsg = `JS Error: ${message} | ${source?.split('/').pop()} ${lineno}:${colno}`;
    console.error(fullMsg, error);

    if (window.showErrorBoundary) {
        window.showErrorBoundary(message, error?.stack || fullMsg);
    } else {
        showToast(`Xatolik: ${message}`, 'error');
    }
    return false;
};

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', function (event) {
    console.error("Unhandled promise rejection:", event.reason);
    const msg = event.reason?.message || event.reason || "Noma'lum xatolik (Promise)";
    const stack = event.reason?.stack || '';

    if (window.showErrorBoundary) {
        window.showErrorBoundary(msg, stack);
    } else {
        showToast(`Xatolik: ${msg}`, 'error');
    }
});

// ==================== ERROR BOUNDARY ====================
export function showErrorBoundary(message, stack) {
    if (document.getElementById('error-boundary-modal')) return;

    const translate = window.t || (str => str);

    const modalHtml = `
      <div id="error-boundary-modal" style="position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px); padding: 20px;">
        <div style="background:var(--bg-card, #fff); color:var(--text-primary, #333); border-radius:16px; width:100%; max-width:550px; box-shadow:0 10px 40px rgba(0,0,0,0.5); overflow:hidden; border: 1px solid var(--danger, #ef4444); animation: slideDown 0.3s ease;">
          <div style="background:rgba(239, 68, 68, 0.1); padding: 20px; border-bottom: 1px solid rgba(239, 68, 68, 0.2); display: flex; align-items: center; gap: 12px;">
            <div style="font-size:32px;">⚠️</div>
            <div>
              <h2 style="margin:0; font-size:18px; color:var(--danger, #ef4444);">${escapeHtml(translate('Kutilmagan xatolik yuz berdi'))}</h2>
              <p style="margin:4px 0 0; font-size:13px; opacity:0.8;">${escapeHtml(translate('Iltimos, sahifani yangilang yoki qo\'llab-quvvatlash xizmatiga murojaat qiling.'))}</p>
            </div>
          </div>
          <div style="padding: 20px;">
            <div style="background:var(--bg-input, #f3f4f6); padding:12px; border-radius:8px; font-family:monospace; font-size:13px; color:var(--danger, #ef4444); margin-bottom: 16px; word-break: break-all; border-left: 4px solid var(--danger, #ef4444);">
              <strong>${escapeHtml(message)}</strong>
            </div>
            ${stack ? `<div style="background:var(--bg-input, #f3f4f6); padding:12px; border-radius:8px; font-family:monospace; font-size:11px; white-space:pre-wrap; max-height:200px; overflow-y:auto; opacity:0.8; border: 1px solid var(--border, #e5e7eb);">${escapeHtml(stack)}</div>` : ''}
          </div>
          <div style="padding: 16px 20px; border-top: 1px solid var(--border, #e5e7eb); display:flex; justify-content:flex-end; gap:10px; background:var(--bg-secondary, #fafafa);">
            <button onclick="document.getElementById('error-boundary-modal').remove()" class="btn btn-ghost" style="padding: 8px 16px;">${escapeHtml(translate('Yopish'))}</button>
            <button onclick="window.location.reload()" class="btn btn-danger" style="padding: 8px 16px; background:var(--danger, #ef4444); color:#fff; border:none; border-radius:6px; cursor:pointer;">${escapeHtml(translate('Sahifani yangilash'))}</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}


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

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
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
    const val = localStorage.getItem('selectedBusinessId');
    return parseInt(val) || 0;
}

export function setSelectedBusinessId(id) {
    localStorage.setItem('selectedBusinessId', id);
}

export function getSelectedPage() {
    return localStorage.getItem('currentPage') || 'dashboard';
}

export function setSelectedPage(page) {
    localStorage.setItem('currentPage', page);
}

// In-memory cache for date periods to reset on page refresh (F5)
const memoryDatePeriods = {};

// Clean up any old localStorage date periods to avoid interference
try {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('datePeriod_')) {
            localStorage.removeItem(key);
            i--; // Adjust index after removal
        }
    }
} catch (e) {
    console.warn("Failed to clear localStorage date periods:", e);
}

export function getDatePeriod() {
    const page = window.currentPage || 'dashboard';
    const cached = memoryDatePeriods[page];
    if (cached) {
        return cached;
    }

    // Default: 10 days ago to current date
    const now = new Date();
    const start = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const end = new Date();

    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    };
}

export function setDatePeriod(start, end) {
    const page = window.currentPage || 'dashboard';
    memoryDatePeriods[page] = { start, end };
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

export function hasPermission(action) {
    const user = api.getUser();
    if (!user) return false;
    // SuperAdmin (2) and Admin/Owner (1) have all permissions
    if (user.role >= 1) return true;

    // For employees (role 0), check business-specific permissions
    const bid = getSelectedBusinessId();
    if (!bid) return false;

    if (!user.businessPermissions) return false;

    const perms = user.businessPermissions.find(p => p.businessId === bid);
    if (!perms) return false;

    if (action === 'add') return perms.canAdd;
    if (action === 'edit') return perms.canEdit;
    if (action === 'delete') return perms.canDelete;

    return false;
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
            if (typeof lucide !== 'undefined') lucide.createIcons();
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
window.getSelectedPage = getSelectedPage;
window.setSelectedPage = setSelectedPage;
window.getDatePeriod = getDatePeriod;
window.setDatePeriod = setDatePeriod;
window.getDateQuery = getDateQuery;
window.escapeHtml = escapeHtml;
window.hasPermission = hasPermission;
window.toggleTheme = toggleTheme;
window.updateThemeIcon = updateThemeIcon;
window.toggleAcc = toggleAcc;
window.showErrorBoundary = showErrorBoundary;

// ==================== CAMERA BARCODE SCANNER ====================
let activeCameraScanner = null;
export function openCameraScanner(onScanCallback) {
  // Prevent multiple scanners
  if (document.getElementById('camera-scanner-overlay')) return;

  const translate = window.t || (s => s);
  const overlay = document.createElement('div');
  overlay.id = 'camera-scanner-overlay';
  overlay.className = 'camera-scanner-overlay';
  overlay.innerHTML = `
    <div class="camera-scanner-modal">
      <div class="camera-scanner-header">
        <h3>📷 ${translate("Kamerani skanerlash")}</h3>
        <button class="modal-close" id="camera-scanner-close">✕</button>
      </div>
      <div class="camera-scanner-body">
        <div id="camera-scanner-reader"></div>
        <p class="camera-scanner-hint">${translate("Shtrix-kodni kamera oldiga olib keling")}</p>
      </div>
      <div class="camera-scanner-footer">
        <button class="btn btn-ghost" id="camera-scanner-cancel">${translate("Bekor qilish")}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => overlay.classList.add('active'));

  const closeScannerUI = () => {
    if (activeCameraScanner) {
      try {
        const state = activeCameraScanner.getState();
        if (state === 2 || state === 3) { // SCANNING (2) or PAUSED (3)
          activeCameraScanner.stop().then(() => {
            activeCameraScanner.clear();
            activeCameraScanner = null;
          }).catch(err => {
            console.warn("Scanner stop failed:", err);
            activeCameraScanner = null;
          });
        } else {
          activeCameraScanner.clear();
          activeCameraScanner = null;
        }
      } catch (e) {
        console.warn("Error getting scanner state:", e);
        activeCameraScanner = null;
      }
    }
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  };

  document.getElementById('camera-scanner-close').onclick = closeScannerUI;
  document.getElementById('camera-scanner-cancel').onclick = closeScannerUI;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeScannerUI();
  });

  // Initialize html5-qrcode
  try {
    if (typeof Html5Qrcode === 'undefined') {
        throw new Error("Html5Qrcode library not loaded");
    }
    const scanner = new Html5Qrcode("camera-scanner-reader");
    activeCameraScanner = scanner;

    const config = {
      fps: 10,
      qrbox: { width: 280, height: 120 },
      aspectRatio: 1.0,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.QR_CODE
      ]
    };

    scanner.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        // Success — vibrate if available
        if (navigator.vibrate) navigator.vibrate(200);
        showToast(`✅ ${translate("Kod aniqlandi")}: ${decodedText}`, 'success');
        closeScannerUI();
        if (typeof onScanCallback === 'function') {
          onScanCallback(decodedText);
        }
      },
      () => { /* ignore scan errors */ }
    ).catch(err => {
      console.error("Camera scanner error:", err);
      const readerEl = document.getElementById('camera-scanner-reader');
      if (readerEl) {
        readerEl.innerHTML = `
          <div style="padding:30px; text-align:center; color:var(--danger);">
            <div style="font-size:48px; margin-bottom:16px;">📵</div>
            <p style="font-weight:700; margin-bottom:8px;">${translate("Kameraga ruxsat berilmadi")}</p>
            <p style="font-size:12px; color:var(--text-muted);">${translate("Brauzer sozlamalaridan kameraga ruxsat bering")}</p>
          </div>
        `;
      }
    });
  } catch (err) {
    console.error("Html5Qrcode error:", err);
    showToast(translate("Kamera skanerlash kutubxonasi yuklanmadi"), 'error');
    closeScannerUI();
  }
}
window.openCameraScanner = openCameraScanner;

console.log("%cSavdoSklad Frontend v1.0.6 (Defensive) Loaded", "color: #10b981; font-weight: bold; font-size: 12px;");
