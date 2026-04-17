import { api, showToast, formatPrice, formatDateTime, getSelectedBusinessId, setSelectedBusinessId, escapeHtml, updateThemeIcon, toggleTheme } from './api.js';
import { t, currentLang } from './i18n.js';
import { renderEmployees } from './employees.js';


// ==================== APP MODULE (Dashboard Router) ====================

// Auth guard
(function () {
  if (!api.getToken()) {
    window.location.href = 'index.html';
  }
})();

let currentPage = 'dashboard';
let dashboardTransactions = [];
let dashboardProducts = [];
let salesTrendChartType = 'line';
let currentTrendChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Sync language selector UI with currentLang
  const langSelector = document.getElementById('lang-selector-app');
  if (langSelector) {
    langSelector.value = currentLang;
  }

  loadUserInfo();
  loadBusinesses().then(() => {
    if (typeof translateDOM === 'function') translateDOM();
  });
  navigateTo('dashboard');

  // Global UI listener for Modal Inputs (Selection start on focus)
  const handleModalInputFocus = (e) => {
    const input = e.target;
    if ((input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') && (input.closest('#modal-overlay') || input.closest('.modal'))) {
      setTimeout(() => {
        try {
          if (typeof input.select === 'function') {
            input.select();
          }
        } catch (err) { }
      }, 10);
    }
  };

  document.addEventListener('focusin', handleModalInputFocus);
  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') handleModalInputFocus(e);
  });

  // Handle placeholder on keydown to clear immediately
  document.addEventListener('keydown', (e) => {
    const input = e.target;
    if (input.tagName === 'INPUT' && input.closest('#modal-overlay')) {
      if (!input.dataset.origPlaceholder) {
        input.dataset.origPlaceholder = input.placeholder;
      }
      if (input.placeholder && e.key && e.key.length === 1) {
        input.placeholder = '';
      }
    }
  });

  // Restore placeholder or keep it cleared based on value
  document.addEventListener('input', (e) => {
    const input = e.target;
    if (input.tagName === 'INPUT' && input.closest('#modal-overlay')) {
      if (input.value.length === 0 && input.dataset.origPlaceholder) {
        input.placeholder = input.dataset.origPlaceholder;
      } else {
        input.placeholder = '';
      }
    }
  });
});

function loadUserInfo() {
  const user = api.getUser();
  if (user) {
    document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
    const avatarEl = document.getElementById('user-avatar');
    if (user.image && user.image.trim() !== '') {
      avatarEl.innerHTML = `<img src="${user.image}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
      avatarEl.style.background = 'none';
    } else {
      avatarEl.textContent = (user.firstName || 'U')[0].toUpperCase();
    }

    const role = parseInt(user.role);

    // Update body classes for CSS-based RBAC
    document.body.classList.remove('is-employee', 'is-owner', 'is-admin');
    if (role === 0) {
      document.body.classList.add('is-employee');
    } else if (role === 1) {
      document.body.classList.add('is-owner');
    } else if (role === 2) {
      document.body.classList.add('is-admin');
    }

    // Sidebar Brand Info update (barcha rollar uchun, shu jumladan xodimlar uchun ham)
    const brandNameEl = document.querySelector('.sidebar-logo .brand-name');
    if (brandNameEl) brandNameEl.textContent = user.brandName || 'SavdoSklad';
    document.title = `${user.brandName || 'SavdoSklad'} — Biznes Boshqaruv Tizimi`;

    if (user.brandImage) {
      const brandLogoEl = document.querySelector('.sidebar-logo .brand-logo-glow');
      if (brandLogoEl) {
        brandLogoEl.style.width = '32px';
        brandLogoEl.style.height = '32px';
        brandLogoEl.style.background = 'none';
        brandLogoEl.style.boxShadow = 'none';
        brandLogoEl.innerHTML = `<img src="${user.brandImage}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
      }
    }
  }
}

async function loadBusinesses() {
  try {
    const businesses = await api.get('/businesses/my');
    const selector = document.getElementById('business-selector');
    if (!selector) return;

    const pagesRequiringSelection = ['categories', 'transactions', 'refunds', 'debts', 'expenses', 'calculations', 'mp-categories', 'mp-stats', 'mp-products', 'mp-sales'];
    const isRequired = pagesRequiringSelection.includes(window.currentPage || 'dashboard');
    const labelKey = isRequired ? "Biznes tanlang" : "Hammasi";
    
    selector.innerHTML = `<option value="" data-i18n="${labelKey}">${t(labelKey)}</option>`;

    if (businesses && businesses.length > 0) {
      businesses.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = b.name || `Biznes #${b.id}`;
        selector.appendChild(opt);
      });

      const savedBid = getSelectedBusinessId();
      if (savedBid && businesses.find(b => b.id === savedBid)) {
        selector.value = savedBid;
      } else {
        selector.value = "";
        setSelectedBusinessId(0);
      }
    } else {
      setSelectedBusinessId(0);
    }
    navigateTo(currentPage);
  } catch (e) {
    showToast(e.message, 'error');
  }
}


function onBusinessChange(val) {
  setSelectedBusinessId(val);
  navigateTo(currentPage);
}


function navigateTo(page) {
  const user = api.getUser();
  const role = user ? parseInt(user.role) : 0;

  // RBAC for navigation
  const ownerPages = ['employees', 'expenses', 'businesses', 'calculations'];
  const adminPages = ['admin', 'mp-stats', 'mp-categories', 'mp-products', 'mp-sales'];

  if (role < 1 && (ownerPages.includes(page) || adminPages.includes(page))) {
    console.warn("RBAC: Access denied to", page);
    navigateTo('dashboard');
    return;
  }
  if (role < 2 && adminPages.includes(page)) {
    console.warn("RBAC: Access denied to", page);
    navigateTo('dashboard');
    return;
  }

  currentPage = page;
  window.currentPage = page;

  // Update active nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  const titles = {
    dashboard: 'Bosh sahifa',
    businesses: 'Bizneslar',
    categories: 'Kategoriyalar',
    products: 'Mahsulotlar',
    transactions: 'Sotuvlar',
    refunds: 'Qaytarishlar',
    debts: 'Qarzlar',
    clients: 'Mijozlar',
    employees: 'Xodimlar',
    expenses: 'Xarajatlar',
    calculations: 'Hisobotlar',
    admin: 'Admin panel',
    profile: 'Shaxsiy kabinet',
    'mp-stats': 'Marketplace: Statistika',
    'mp-categories': 'Marketplace: Kategoriyalar',
    'mp-products': 'Marketplace: Mahsulotlar',
    'mp-sales': 'Marketplace: Sotilgan tovarlar'
  };

  document.getElementById('page-title').textContent = t(titles[page] || page);
  document.title = `SavdoSklad — ${t(titles[page] || page)}`;

  // Dynamic business selector label
  const selector = document.getElementById('business-selector');
  if (selector && selector.options.length > 0) {
    const pagesRequiringSelection = ['categories', 'transactions', 'refunds', 'debts', 'expenses', 'calculations', 'mp-categories', 'mp-stats', 'mp-products', 'mp-sales'];
    const isRequired = pagesRequiringSelection.includes(page);
    const labelKey = isRequired ? "Biznes tanlang" : "Hammasi";
    selector.options[0].textContent = t(labelKey);
    selector.options[0].setAttribute('data-i18n', labelKey);

    // Sync selector value with the saved choice for THIS page
    const savedBid = getSelectedBusinessId();
    // Check if the saved business still exists in options
    const exists = Array.from(selector.options).some(o => o.value == savedBid);
    selector.value = exists ? (savedBid || "") : "";
  }

  // Update centered topbar (optomsavdo style)
  const centerTitle = document.getElementById('topbar-page-title-center');
  if (centerTitle) centerTitle.textContent = t(titles[page] || page);
  const dateEl = document.getElementById('topbar-date');
  if (dateEl) {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();
    const weekday = now.getDay();

    const monthNames = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];
    const dayNames = [
      'Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'
    ];

    // Format: 9 Aprel 2026, Payshanba
    dateEl.textContent = `${day} ${t(monthNames[month])} ${year}, ${t(dayNames[weekday])}`;
  }

  const content = document.getElementById('page-content');
  content.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
  content.className = 'content fade-in';

  // Route to page renderer
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'businesses': renderBusinesses(); break;
    case 'categories': renderCategories(); break;
    case 'products': renderProducts(); break;
    case 'transactions': renderTransactions(); break;
    case 'refunds': renderRefunds(); break;
    case 'debts': window.renderDebts(); break;
    case 'clients': renderClients(); break;
    case 'employees': renderEmployees(); break;
    case 'expenses': renderExpenses(); break;
    case 'calculations': renderCalculations(); break;
    case 'admin': renderAdmin(); break;
    case 'profile': renderProfile(); break;
    case 'mp-stats': renderMpStats(); break;
    case 'mp-categories': renderMpCategories(); break;
    case 'mp-products': renderMpProducts(); break;
    case 'mp-sales': renderMpSales(); break;
    default: content.innerHTML = `<div class="empty-state"><h4>${t("Sahifa topilmadi")}</h4></div>`;
  }
}// ==================== DASHBOARD HOME (PREMIUM DESIGN) ====================
async function renderDashboard() {
  const bid = getSelectedBusinessId();
  const content = document.getElementById('page-content');

  try {
    let products, transactions, clients;

    if (!bid) {
      // "Hammasi" tanlangan — barcha bizneslar bo'yicha ma'lumotlarni yuklaymiz
      const businesses = await api.get('/businesses/my').catch(() => []);
      if (!businesses || businesses.length === 0) {
        const user = api.getUser();
        content.innerHTML = `
          <div class="empty-state">
            <div class="icon">🏢</div>
            <h4>${t("Biznes yarating")}</h4>
            <p>${user.role >= 1 ? t("Yangi biznes yarating va ma'lumotlaringizni boshqaring.") : t("Hozircha biznes mavjud emas.")}</p>
            <br>
            ${user.role >= 1 ? `<button class="btn btn-primary" onclick="navigateTo('businesses')">${t("Biznes yaratish")}</button>` : ''}
          </div>`;
        return;
      }
      // Barcha bizneslar bo'yicha parallel so'rovlar
      const query = getDateQuery();
      const allProducts = await Promise.all(businesses.map(b => api.get(`/products?businessId=${b.id}`).catch(() => [])));
      const allTransactions = await Promise.all(businesses.map(b => api.get(`/transactions?businessId=${b.id}${query}`).catch(() => [])));
      const allClients = await Promise.all(businesses.map(b => api.get(`/clients?businessId=${b.id}`).catch(() => [])));
      products = allProducts.flat();
      transactions = allTransactions.flat();
      clients = allClients.flat();
    } else {
      const query = getDateQuery();
      [products, transactions, clients] = await Promise.all([
        api.get(`/products?businessId=${bid}`).catch(() => []),
        api.get(`/transactions?businessId=${bid}${query}`).catch(() => []),
        api.get(`/clients?businessId=${bid}`).catch(() => [])
      ]);
    }

    const productList = (products || []).filter(p => !p.isDeleted);
    const transactionList = (transactions || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const clientList = clients || [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const totalMonthSales = transactionList.filter(t => {
      const d = new Date(t.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).reduce((s, t) => s + (t.total || 0), 0);

    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    const totalLastMonthSales = transactionList.filter(t => {
      const d = new Date(t.createdAt);
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    }).reduce((s, t) => s + (t.total || 0), 0);

    let growthPercent = 0;
    let growthType = 'none';
    if (totalLastMonthSales > 0) {
      growthPercent = ((totalMonthSales - totalLastMonthSales) / totalLastMonthSales) * 100;
      growthType = growthPercent >= 0 ? 'up' : 'down';
    } else if (totalMonthSales > 0) {
      growthType = 'up';
      growthPercent = 100;
    }

    const newClientsThisMonth = clientList.filter(c => {
      const d = new Date(c.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
    const currentMonthLabel = t(monthNames[thisMonth]);
    const transactionsToday = transactionList.filter(t => t.createdAt.startsWith(todayStr)).length;
    const lowStock = productList.filter(p => !p.isDeleted && (p.quantity || 0) <= (p.minQuantity || 5)).length;
    const inventoryLevel = productList.length > 0 ? Math.round(((productList.length - lowStock) / productList.length) * 100) : 100;
    const totalInventoryValue = productList.reduce((s, p) => s + ((p.quantity || 0) * (p.price || 0)), 0);
    const totalProductsCount = productList.reduce((s, p) => s + (p.quantity || 0), 0);

    const user = api.getUser();
    const isEmployee = user && parseInt(user.role) === 0;

    if (isEmployee) {
      content.innerHTML = `
        <div class="card fade-in" style="padding:24px; margin-bottom:20px; background:var(--primary-glow); border-left:4px solid var(--primary-color);">
           <div style="display:flex; align-items:center; gap:16px;">
              <div style="width:48px; height:48px; border-radius:50%; background:var(--primary-color); display:flex; align-items:center; justify-content:center; color:#fff;">
                <i data-lucide="sun" style="width:24px; height:24px;"></i>
              </div>
              <div>
                <h3 style="margin:0; font-family:'Outfit'; color:var(--primary-color); font-size:20px;">${t("Assalomu alaykum")}!</h3>
                <p style="margin:4px 0 0 0; color:var(--text-secondary); font-size:14px;">${t("Bugungi ish kunida omad tilaymiz.")}</p>
              </div>
           </div>
        </div>
        
        <div class="dashboard-bottom-grid fade-in" style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-top:0;">
          <div class="card" style="padding:0; overflow:hidden;">
             <div class="card-header" style="padding:24px;">
                <h3 style="font-family:'Outfit'; font-size:18px;">${t("Ombor holati")}</h3>
                <button class="btn btn-ghost btn-sm" onclick="navigateTo('products')">${t("Hammasini ko'rish")}</button>
             </div>
             <div id="dashboard-inventory-container" style="padding:0 24px 24px 24px;"></div>
          </div>
          <div class="card" style="padding:24px;">
             <div class="card-header">
                <h3 style="font-family:'Outfit'; font-size:18px;">${t("Top mahsulotlar")}</h3>
             </div>
             <div id="top-products-list" style="display:flex; flex-direction:column; gap:16px;"></div>
          </div>
        </div>

        <div class="card fade-in" style="padding:0; overflow:hidden; margin-top:20px;">
           <div class="card-header" style="padding:24px;">
              <h3 style="font-family:'Outfit'; font-size:18px;">${t("So'nggi buyurtmalar")}</h3>
              <button class="btn btn-primary btn-sm" onclick="window.openSaleModal()">${t("Yangi sotuv")}</button>
           </div>
           <div id="dashboard-transactions-container"></div>
        </div>
      `;
    } else {
      content.innerHTML = `
        <div class="stats-grid fade-in">
          <div class="stat-card">
            <div class="card-header">
              <span class="stat-label">${t("Jami savdo")}</span>
              <div class="btn-icon" style="background:var(--success-bg); color:var(--success);"><i data-lucide="trending-up"></i></div>
            </div>
            <div class="stat-value" style="font-size:28px; font-family:'Outfit'; font-weight:800;">${formatPrice(totalMonthSales)}</div>
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:8px;">
              <div class="stat-trend" style="color:var(--text-muted); font-size:12px; font-weight:400;">${currentMonthLabel}</div>
              ${growthType !== 'none' ? `
                <div style="text-align:right;">
                  <div style="font-size:16px; font-weight:800; color:${growthType === 'up' ? 'var(--success)' : 'var(--danger)'}; display:flex; align-items:center; justify-content:flex-end; gap:2px;">
                    ${growthType === 'up' ? '↑' : '↓'} ${Math.abs(Math.round(growthPercent))}%
                  </div>
                  <div style="font-size:10px; color:var(--text-muted); font-weight:400;">${t("o'tgan oyga nisbatan")}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="stat-card">
            <div class="card-header">
              <span class="stat-label">${t("Buyurtmalar")}</span>
              <div class="btn-icon" style="background:var(--secondary-glow); color:var(--secondary);"><i data-lucide="shopping-bag"></i></div>
            </div>
            <div class="stat-value" style="font-size:28px; font-family:'Outfit'; font-weight:800;">${transactionList.length}</div>
            <div class="stat-trend" style="color:var(--success); font-size:12px; margin-top:8px;">
              ↑ ${transactionsToday} <span style="color:var(--text-muted); font-weight:400;">${t("bugun")}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="card-header">
              <span class="stat-label">${t("Faol mijozlar")}</span>
              <div class="btn-icon" style="background:var(--info-bg); color:var(--info);"><i data-lucide="users"></i></div>
            </div>
            <div class="stat-value" style="font-size:28px; font-family:'Outfit'; font-weight:800;">${clientList.length}</div>
            <div class="stat-trend" style="color:var(--success); font-size:12px; margin-top:8px;">
              <span style="color:var(--text-primary);">+${newClientsThisMonth}</span> <span style="color:var(--text-muted); font-weight:400;">${t("shu oyda qo'shilgan")}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="card-header">
              <span class="stat-label">${t("Ombor holati")} <span style="color:var(--warning); font-weight:800; margin-left:5px;">${inventoryLevel}%</span></span>
              <div class="btn-icon" style="background:var(--warning-bg); color:var(--warning);"><i data-lucide="package"></i></div>
            </div>
            <div class="stat-value" style="font-size:24px; font-family:'Outfit'; font-weight:800; line-height:1.2;">
              <div style="font-size:13px; color:var(--text-muted); font-weight:400; margin-bottom:4px;">${t("Jami mahsulotlar")}: <b style="color:var(--text-primary);">${totalProductsCount}</b></div>
              <div style="font-size:20px; color:var(--warning);">${formatPrice(totalInventoryValue)}</div>
            </div>
            <div class="stat-trend" style="color:var(--danger); font-size:12px; margin-top:8px; display:flex; align-items:center; gap:4px;">
              <span style="font-weight:800; background:rgba(239, 68, 68, 0.1); padding:2px 6px; border-radius:4px;">${lowStock}</span> 
              <span style="color:var(--text-muted); font-weight:400;">${t("ta mahsulot kam qolgan")}</span>
            </div>
          </div>
        </div>

        <div class="dashboard-main-grid fade-in" style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-top:20px;">
          <div class="card" style="padding:24px;">
            <div class="card-header">
              <h3 style="font-family:'Outfit'; font-size:18px;">${t("Oylik savdo ko'rsatkichi")}</h3>
            </div>
            <div style="height:350px;">
              <canvas id="salesTrendChart"></canvas>
            </div>
          </div>

          <div class="card" style="padding:24px;">
            <div class="card-header">
              <h3 style="font-family:'Outfit'; font-size:18px;">${t("Savdo manbalari")}</h3>
            </div>
            <div style="height:250px; margin-bottom:20px;">
               <canvas id="salesSourceChart"></canvas>
            </div>
            <div id="sales-sources-legend" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;"></div>
          </div>
        </div>

        <div class="dashboard-bottom-grid fade-in" style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-top:20px;">
          <div class="card" style="padding:0; overflow:hidden;">
             <div class="card-header" style="padding:24px;">
                <h3 style="font-family:'Outfit'; font-size:18px;">${t("Ombor holati")}</h3>
                <button class="btn btn-ghost btn-sm" onclick="navigateTo('products')">${t("Hammasini ko'rish")}</button>
             </div>
             <div id="dashboard-inventory-container" style="padding:0 24px 24px 24px;"></div>
          </div>
          <div class="card" style="padding:24px;">
             <div class="card-header">
                <h3 style="font-family:'Outfit'; font-size:18px;">${t("Top mahsulotlar")}</h3>
             </div>
             <div id="top-products-list" style="display:flex; flex-direction:column; gap:16px;"></div>
          </div>
        </div>

        <div class="card fade-in" style="padding:0; overflow:hidden; margin-top:20px;">
           <div class="card-header" style="padding:24px;">
              <h3 style="font-family:'Outfit'; font-size:18px;">${t("So'nggi buyurtmalar")}</h3>
              <button class="btn btn-primary btn-sm" onclick="window.openSaleModal()">${t("Yangi sotuv")}</button>
           </div>
           <div id="dashboard-transactions-container"></div>
        </div>
      `;
    }

    currentDashboardTransactions = transactionList;
    dashboardPage = 1;

    // Mini renderers
    renderInventoryPreview(productList.slice(0, 5));
    renderTopProductsList(productList.slice(0, 5));
    renderDashboardTransactions();

    dashboardTransactions = transactionList;
    dashboardProducts = productList;

    // Initialize Lucide icons
    setTimeout(() => {
      lucide.createIcons();
      renderDashboardCharts(dashboardTransactions, dashboardProducts);
    }, 100);

  } catch (err) {
    console.error(err);
    content.innerHTML = `<div class="empty-state"><h4>${t("Xatolik")}</h4><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function renderInventoryPreview(products) {
  const container = document.getElementById('dashboard-inventory-container');
  if (!container) return;

  // Group by category
  const groups = {};
  products.forEach(p => {
    const cat = p.categoryName || t("Boshqa");
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(p);
  });

  let rows = '';
  for (const cat in groups) {
    // Category header row
    rows += `
      <tr style="background:rgba(99, 102, 241, 0.05);">
        <td colspan="4" style="padding:10px 16px; font-weight:700; color:var(--accent); font-size:11px; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid var(--border);">
           <div style="display:flex; align-items:center; gap:8px;">
             <i data-lucide="layers" style="width:14px;"></i>
             ${escapeHtml(cat)}
           </div>
        </td>
      </tr>
    `;

    // Product rows
    rows += groups[cat].map(p => `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:12px; padding-left:8px;">
              <div style="width:32px; height:32px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--text-muted);">
                  <i data-lucide="${p.name?.toLowerCase().includes('soat') ? 'watch' : 'package'}" style="width:16px;"></i>
              </div>
              <div style="font-weight:600; color:var(--text-primary); font-size:13px;">${escapeHtml(p.name)}</div>
          </div>
        </td>
        <td style="color:var(--text-primary); text-align:center; font-weight:700;">${p.quantity}</td>
        <td>
          <div style="display:flex; align-items:center; gap:12px; justify-content:center;">
             <div style="width:80px; height:6px; background:rgba(255,255,255,0.05); border-radius:10px; overflow:hidden;">
                <div style="width:${Math.min(100, (p.quantity / 50) * 100)}%; height:100%; background:linear-gradient(to right, ${p.quantity < 10 ? 'var(--danger)' : 'var(--accent)'}, var(--accent-hover)); border-radius:10px;"></div>
             </div>
          </div>
        </td>
        <td>
          <div style="display:flex; justify-content:center;">
            <div style="width:8px; height:8px; border-radius:50%; background:${p.quantity > 0 ? 'var(--success)' : 'var(--danger)'}; box-shadow:0 0 10px ${p.quantity > 0 ? 'var(--success)' : 'var(--danger)'}"></div>
          </div>
        </td>
      </tr>
    `).join('');
  }

  container.innerHTML = `
      <table class="premium-table">
        <thead>
          <tr>
            <th style="text-align:center">${t("Nomi")}</th>
            <th style="text-align:center">${t("Qoldiq")}</th>
            <th style="text-align:center">${t("Prognoz")}</th>
            <th style="text-align:center">${t("Holat")}</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
}

function renderTopProductsList(products) {
  const container = document.getElementById('top-products-list');
  if (!container) return;

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  container.innerHTML = products.map((p, i) => `
        <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:44px; height:44px; border-radius:14px; background:rgba(255,255,255,0.03); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; color:${colors[i % 5]}; transition:all 0.3s;" class="product-icon-hover">
                <i data-lucide="${p.name?.toLowerCase().includes('soat') ? 'watch' : (p.name?.toLowerCase().includes('telefon') ? 'smartphone' : ['shopping-bag', 'package', 'truck'][i % 3])}" style="width:22px;"></i>
            </div>
            <div style="flex:1;">
                <div style="font-weight:700; color:var(--text-primary); font-size:14px;">${escapeHtml(p.name)}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${formatPrice(p.price || 0)} ${t("so'm")}</div>
            </div>
            <div style="text-align:right;">
                <div style="width:50px; height:20px;">
                    <canvas id="mini-sparkline-${i}" style="width:100%; height:100%;"></canvas>
                </div>
            </div>
        </div>
    `).join('');

  // Mock sparklines
  setTimeout(() => {
    products.forEach((p, i) => {
      const ctx = document.getElementById(`mini-sparkline-${i}`)?.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: [1, 2, 3, 4, 5],
            datasets: [{
              data: [10, 15, 12, 18, 14],
              borderColor: colors[i % 5],
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
              tension: 0.4
            }]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            maintainAspectRatio: false
          }
        });
      }
    });
  }, 100);
}

function renderDashboardCharts(transactions, products) {
  // 1. Sales Trend Chart
  const ctxTrend = document.getElementById('salesTrendChart')?.getContext('2d');
  if (ctxTrend) {
    const labels = [t('Dush'), t('Sesh'), t('Chor'), t('Pay'), t('Jum'), t('Shan'), t('Yak')];
    const data = [12, 19, 15, 25, 22, 30, 20]; // Mock data - can be improved with real grouping

    const gradient = ctxTrend.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

    if (currentTrendChart) currentTrendChart.destroy();
    currentTrendChart = new Chart(ctxTrend, {
      type: salesTrendChartType,
      data: {
        labels: labels,
        datasets: [{
          label: t('Savdo hajmi'),
          data: data,
          borderColor: '#10b981',
          borderWidth: 4,
          fill: true,
          backgroundColor: gradient,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
            ticks: { color: '#64748b', font: { size: 10, family: 'Plus Jakarta Sans' } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 10, family: 'Plus Jakarta Sans' } }
          }
        }
      }
    });
  }

  // 2. Sales Source Chart (Doughnut)
  const ctxSource = document.getElementById('salesSourceChart')?.getContext('2d');
  if (ctxSource) {
    const totalCash = transactions.reduce((s, t) => s + (t.cash || 0), 0);
    const totalCard = transactions.reduce((s, t) => s + (t.card || 0), 0);
    const totalDebt = transactions.reduce((s, t) => s + (t.debt || 0), 0);

    const sourceData = [totalCash, totalCard, totalDebt];
    const sourceLabels = [t('Naqd'), t('Karta'), t('Qarz')];
    const sourceColors = ['#10b981', '#3b82f6', '#ef4444'];

    new Chart(ctxSource, {
      type: 'doughnut',
      data: {
        labels: sourceLabels,
        datasets: [{
          data: sourceData,
          backgroundColor: sourceColors,
          borderWidth: 0,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: { legend: { display: false } }
      }
    });

    // Populate legend
    const legendContainer = document.getElementById('sales-sources-legend');
    if (legendContainer) {
      const total = sourceData.reduce((a, b) => a + b, 0) || 1;
      legendContainer.innerHTML = sourceLabels.map((l, i) => `
        <div style="display:flex; align-items:center; gap:8px;">
           <div style="width:8px; height:8px; border-radius:50%; background:${sourceColors[i]};"></div>
           <div style="flex:1; font-size:12px; color:var(--text-muted);">${l}</div>
           <div style="font-weight:700; font-size:12px; color:#fff;">${Math.round((sourceData[i] / total) * 100)}%</div>
        </div>
      `).join('');
    }
  }
}

window.dashboardPage = 1;
let currentDashboardTransactions = [];

function renderDashboardTransactions() {
  const container = document.getElementById('dashboard-transactions-container');
  if (!container) return;

  const limit = 10;
  const totalPages = Math.ceil(currentDashboardTransactions.length / limit);
  if (window.dashboardPage > totalPages) window.dashboardPage = totalPages || 1;
  const start = (window.dashboardPage - 1) * limit;
  const paginated = currentDashboardTransactions.slice(start, start + limit);

  container.innerHTML = `
    <div class="table-container" style="border:none; box-shadow:none;">
      <table class="premium-table">
        <thead>
          <tr style="background:rgba(79, 70, 229, 0.85);">
            <th style="text-align:center; padding:15px 10px;">№</th>
            <th style="text-align:center; padding:15px 10px;">${t("SUMMA")}</th>
            <th style="text-align:center; padding:15px 10px;">${t("TO'LOV TURI")}</th>
            <th style="text-align:center; padding:15px 10px;">${t("QARZ")}</th>
            <th style="text-align:center; padding:15px 10px;">${t("Mas'ul")}</th>
            <th style="text-align:center; padding:15px 10px;">${t("SANA")}</th>
          </tr>
        </thead>
        <tbody>
          ${currentDashboardTransactions.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--text-muted);">${t("Sotuvlar hali yo'q")}</td></tr>` :
      paginated.map((tItem, i) => `
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="color:var(--text-muted); text-align:center; padding:12px 10px;">${start + i + 1}</td>
                <td style="font-weight:700; color:#10b981; text-align:center; padding:12px 10px;">${formatPrice(tItem.total)} ${t("so'm")}</td>
                <td style="text-align:center; padding:12px 10px;">
                   <div style="display:flex; justify-content:center; gap:12px; font-size:13px; font-weight:500;">
                     ${tItem.cash > 0 ? `<span style="color:#10b981">💵 ${t("Naqd")}</span>` : ''}
                     ${tItem.card > 0 ? `<span style="color:#3b82f6">💳 ${t("Karta")}</span>` : ''}
                     ${tItem.click > 0 ? `<span style="color:#8b5cf6">📱 ${t("Click")}</span>` : ''}
                   </div>
                </td>
                <td style="text-align:center; padding:12px 10px;">
                  ${tItem.debt > 0 ? `<span style="color:#ef4444; font-weight:800; font-size:14px;">${formatPrice(tItem.debt)}</span>` : '<span style="color:var(--text-muted); opacity:0.5;">—</span>'}
                </td>
                <td style="text-align:center; padding:12px 10px; font-size:12px; font-weight:600; color:var(--text-primary); text-transform:uppercase;">
                   ${escapeHtml(tItem.createdByName || t("Tizim"))}
                </td>
                <td style="font-size:12px; color:var(--text-muted); text-align:center; padding:12px 10px;">${formatDateTime(tItem.createdAt)}</td>
              </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="padding: 10px 24px 24px 24px;">
       ${renderPageControls('dashboardPage', totalPages, 'renderDashboardTransactions()')}
    </div>
  `;
}


// ==================== AUTH & ROUTING ====================
function renderPageControls(pageVarName, totalPages, renderFnName) {
  // We now return an empty sentinel instead of pagination buttons
  // The observer will handle the rest.
  if (window[pageVarName] >= totalPages) return ''; // No more data
  
  const fnCall = renderFnName.includes('(') ? renderFnName : `${renderFnName}()`;
  
  return `<div id="${pageVarName}-sentinel" style="height:40px; margin:20px 0; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:13px; font-weight:500;">
    <div class="spinner-small" style="margin-right:10px;"></div> ${t("Yuklanmoqda...")}
  </div>
  <script>
    if (window.initInfiniteScroll) {
       window.initInfiniteScroll('${pageVarName}', ${totalPages}, ${renderFnName.split('(')[0]});
    }
  </script>`;
}

window.initInfiniteScroll = function(pageVarName, totalPages, renderFn) {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    const sentinel = document.getElementById(`${pageVarName}-sentinel`);
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && window[pageVarName] < totalPages) {
        window[pageVarName]++;
        renderFn(true); // Pass 'true' for appending
        observer.disconnect();
      }
    }, { threshold: 0.1, rootMargin: '100px' });

    observer.observe(sentinel);
  }, 50);
};

// ==================== MODAL UTILS ====================
let isCurrentModalMandatory = false;

function openModal(titleOrHtml, bodyHtml, sizeClass = '', isMandatory = false) {
  const modalBody = document.getElementById('modal-body');
  const overlay = document.getElementById('modal-overlay');

  isCurrentModalMandatory = isMandatory;

  // Reset classes and add new ones
  modalBody.className = 'modal ' + sizeClass;

  if (bodyHtml) {
    // Called with (title, body) format
    modalBody.innerHTML = `
            <div class="modal-header">
                <h3>${titleOrHtml}</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-content">${bodyHtml}</div>
        `;
  } else {
    // Called with just HTML
    modalBody.innerHTML = titleOrHtml;
  }
  overlay.classList.add('active');
}

function closeModal(force = false) {
  if (isCurrentModalMandatory && !force) {
    api.logout('org_required');
    return;
  }
  document.getElementById('modal-overlay').classList.remove('active');
  isCurrentModalMandatory = false;
}

function closeModalOnOverlay(e) {
  // Disabled: Modals should only close via X or Cancel buttons
}

// Global exports
window.api = api;
window.t = t;
window.currentLang = currentLang;

// ==================== PROFILE (Personal Cabinet) ====================
async function renderProfile() {
  const content = document.getElementById('page-content');
  const user = api.getUser();
  if (!user) return;

  // Har safar profil ochilganda backenddan oxirgi ma'lumotlarni olish
  try {
    const latestUser = await api.get(`/users/${user.id}`);
    api.setUser(latestUser);
  } catch (err) {
    console.error("User info refresh error:", err);
  }

  const u = api.getUser();

  content.innerHTML = `
    <div class="profile-container fade-in" style="min-height: 80vh; padding: 20px; position: relative; overflow: hidden; background: #f8fafc; border-radius: 20px;">
        <!-- Background Decorative Blobs -->
        <div style="position: absolute; top: -10%; left: -10%; width: 400px; height: 400px; background: rgba(var(--primary-rgb), 0.15); border-radius: 50%; filter: blur(80px); z-index: 0;"></div>
        <div style="position: absolute; bottom: -10%; right: -10%; width: 350px; height: 350px; background: rgba(99, 102, 241, 0.1); border-radius: 50%; filter: blur(80px); z-index: 0;"></div>

        <div class="card shadow-lg" style="max-width: 800px; margin: 0 auto; position: relative; z-index: 1; overflow: hidden; border: none; backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.85); border-radius: 24px;">
            <!-- Modern Header Banner (Sidebar Rangida) - Kengaytirilgan -->
            <div style="min-height: 220px; background: var(--sidebar-gradient); margin: 0; padding: 30px 40px; position: relative; display: flex; flex-direction: column; justify-content: flex-end;">
                <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.1;"></div>
                
                <!-- Profile Identity INSIDE Banner (Matnlar Oq rangda) -->
                <div style="display:flex; align-items: center; gap: 25px; position: relative; z-index: 2;">
                    <div class="user-avatar" id="profile-avatar-display" style="width:110px; height:110px; font-size:44px; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 10px 25px rgba(0,0,0,0.2); background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); color: white; border-radius: 30px; overflow: hidden;">
                        ${u.image ? `<img src="${u.image}" style="width:100%; height:100%; object-fit:cover;">` : (u.firstName || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 style="margin:0; font-size:30px; font-weight: 800; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${u.firstName} ${u.lastName}</h2>
                        <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                            <span style="background: rgba(255, 255, 255, 0.2); color: white; padding: 2px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1px solid rgba(255,255,255,0.3);">@${u.userName}</span>
                            <span style="font-size: 13px; color: rgba(255,255,255,0.8); font-weight: 500;">ID: #${u.id}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="padding: 40px;">
                <!-- Action Buttons -->
                <div style="display: flex; gap: 10px; margin-bottom: 30px;">
                    <button class="btn btn-outline" style="flex:1; border-radius: 12px; height: 45px; font-weight: 600; border-color: #e2e8f0;" onclick="showChangePasswordModal()">
                        <span class="icon">🔑</span> ${t("Parolni o'zgartirish")}
                    </button>
                    <button class="btn btn-primary" style="flex:1; border-radius: 12px; height: 45px; font-weight: 600;" onclick="showEditProfileModal()">
                        <span class="icon">✏️</span> ${t("Ma'lumotlarni tahrirlash")}
                    </button>
                </div>

                <!-- Info Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
                    <div class="info-card" style="padding: 15px 20px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
                        <label style="display:block; font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">${t("Ism")}</label>
                        <div style="font-size:17px; font-weight:600; color: #334155;">${u.firstName}</div>
                    </div>
                    <div class="info-card" style="padding: 15px 20px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
                        <label style="display:block; font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">${t("Familiya")}</label>
                        <div style="font-size:17px; font-weight:600; color: #334155;">${u.lastName}</div>
                    </div>
                    <div class="info-card" style="padding: 15px 20px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
                        <label style="display:block; font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">${t("Telefon raqami")}</label>
                        <div style="font-size:17px; font-weight:600; color: #334155;">${u.phoneNumber || '—'}</div>
                    </div>
                    <div class="info-card" style="padding: 15px 20px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
                        <label style="display:block; font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">${t("Obuna muddati")}</label>
                        <div style="font-size:15px; font-weight:600; color: var(--primary-color);">${formatDateTime(u.expirationDate) || '—'}</div>
                    </div>
                    <div class="info-card" style="padding: 15px 20px; background: white; border-radius: 16px; border: 2px solid rgba(var(--primary-rgb), 0.15); box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.08); grid-column: span 1;">
                        <label style="display:block; font-size:11px; color:var(--primary-color); text-transform:uppercase; font-weight: 800; margin-bottom: 8px; letter-spacing: 0.5px;">${t("Taklif kodi (Promo)")}</label>
                        <div style="display:flex; align-items:center; justify-content:space-between;">
                            <span style="font-size:20px; font-weight:800; color:var(--primary-color); letter-spacing:2px;">${u.offerCode || '—'}</span>
                            <button class="btn btn-sm btn-primary" 
                                    style="padding: 6px 14px; border-radius: 10px; font-size: 12px; box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.3);" 
                                    onclick="copyToClipboard('${u.offerCode || ''}')">
                                <span class="icon">📋</span> ${t("Nusxa")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tip Box -->
        <div style="max-width: 800px; margin: 30px auto 0; padding: 25px; background: linear-gradient(to right, #ffffff, #f8fafc); border-radius: 20px; border: 1px solid #e2e8f0; display: flex; gap: 20px; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: #fffbeb; color: #f59e0b; font-size: 24px; border-radius: 15px; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.1);">💡</div>
            <div style="flex: 1;">
                <h4 style="margin: 0 0 5px 0; font-size:16px; font-weight: 700; color: #1e293b;">${t("Taklif kodi nima?")}</h4>
                <p style="font-size:14px; line-height:1.6; margin:0; color: #64748b; font-weight: 500;">
                    ${t("Ushbu kodni do'stlaringizga yuboring. Ular ro'yxatdan o'tayotganlarida ushbu kodni kiritsalar, sizga va ularga qo'shimcha imtiyozlar berilishi mumkin.")}
                </p>
            </div>
        </div>
    </div>`;
}

function showEditProfileModal() {
  const user = api.getUser();
  openModal(`
        <div class="modal-header">
            <h3>${t("Profilni tahrirlash")}</h3>
            <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <form onsubmit="handleUpdateProfile(event)" style="min-width: 450px;">
            <div class="form-group" style="margin-bottom: 20px;">
                <label style="display:block; margin-bottom: 10px;">${t("Profil rasmi")}</label>
                <div style="display:flex; gap:20px; align-items: center;">
                    <div id="profile-image-preview" style="width:80px; height:80px; border-radius:20px; background:var(--bg-input); border:2px dashed var(--border); overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        ${user.image ? `<img src="${user.image}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size:24px; opacity:0.3;">🖼️</span>`}
                    </div>
                    <div style="flex:1">
                        <input type="file" class="form-control" accept="image/*" onchange="previewProfileImage(this)">
                        <input type="hidden" id="edit-image-url" value="${escapeHtml(user.image || '')}">
                        <p style="font-size:11px; color:var(--text-muted); margin-top:5px;">JPEG, PNG formatlar, maksimal 2MB.</p>
                    </div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${t("Ism")} </label>
                    <input type="text" class="form-control" id="edit-firstName" value="${escapeHtml(user.firstName)}" placeholder="${t("Ismni kiriting")}" required>
                </div>
                <div class="form-group">
                    <label>${t("Familiya")} </label>
                    <input type="text" class="form-control" id="edit-lastName" value="${escapeHtml(user.lastName)}" placeholder="${t("Familiyani kiriting")}" required>
                </div>
            </div>
            <div class="form-group">
                <label>${t("Telefon raqami")}</label>
                <input type="text" class="form-control" id="edit-phone" value="${escapeHtml(user.phoneNumber || '')}" placeholder="+998901234567">
            </div>

            ${user.role >= 1 ? `
            <div style="margin-top:20px; padding-top:20px; border-top:1px dashed var(--border);">
                <h4 style="margin-bottom:15px; color:var(--primary-color)">${t("Brend ma'lumotlari")}</h4>
                <div class="form-group">
                    <label>${t("Brend nomi")}</label>
                    <input type="text" class="form-control" id="edit-brandName" value="${escapeHtml(user.brandName || '')}" placeholder="Masalan: Safia">
                </div>
                <div class="form-group">
                    <label style="display:block; margin-bottom: 10px;">${t("Brend rasmi")} (Fon)</label>
                    <div style="display:flex; gap:20px; align-items: center;">
                        <div id="brand-image-preview" style="width:120px; height:70px; border-radius:12px; background:var(--bg-input); border:2px dashed var(--border); overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            ${user.brandImage ? `<img src="${user.brandImage}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size:24px; opacity:0.3;">🖼️</span>`}
                        </div>
                        <div style="flex:1">
                            <input type="file" class="form-control" accept="image/*" onchange="previewBrandImage(this)">
                            <input type="hidden" id="edit-brandImage-url" value="${escapeHtml(user.brandImage || '')}">
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div class="modal-footer" style="padding-top: 15px;">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
                <button type="submit" class="btn btn-primary" style="padding: 10px 40px;">${t("Saqlash")}</button>
            </div>
        </form>
    `);
}

async function previewProfileImage(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      showToast(t("Rasm yuklanmoqda..."), 'info');
      const result = await api.post('/upload', formData);
      if (result && result.url) {
        document.getElementById('edit-image-url').value = result.url;
        document.getElementById('profile-image-preview').innerHTML = `<img src="${result.url}" style="width:100%; height:100%; object-fit:cover;">`;
        showToast(t("Rasm yuklandi"));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}

async function previewBrandImage(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      showToast(t("Rasm yuklanmoqda..."), 'info');
      const result = await api.post('/upload', formData);
      if (result && result.url) {
        document.getElementById('edit-brandImage-url').value = result.url;
        document.getElementById('brand-image-preview').innerHTML = `<img src="${result.url}" style="width:100%; height:100%; object-fit:cover;">`;
        showToast(t("Brend rasmi yuklandi"));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const user = api.getUser();
  const req = {
    firstName: document.getElementById('edit-firstName').value,
    lastName: document.getElementById('edit-lastName').value,
    phoneNumber: document.getElementById('edit-phone').value,
    image: document.getElementById('edit-image-url').value
  };

  if (user.role >= 1) {
    req.brandName = document.getElementById('edit-brandName').value;
    req.brandImage = document.getElementById('edit-brandImage-url').value;
  }

  try {
    await api.put(`/users/${user.id}`, req);

    // Update local user object
    const updatedUser = { ...user, ...req };
    api.setUser(updatedUser);

    showToast(t("Profil yangilandi"));
    closeModal();
    loadUserInfo(); // Update topbar
    renderProfile(); // Update page
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function showChangePasswordModal() {
  openModal(`
        <div class="modal-header">
            <h3>${t("Parolni o'zgartirish")}</h3>
            <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <form onsubmit="handleChangePassword(event)" style="min-width: 350px;">
            <div class="form-group">
                <label>${t("Yangi parol")}</label>
                <input type="password" class="form-control" id="new-password" placeholder="••••••••" required>
            </div>
            <div class="form-group">
                <label>${t("Parolni tasdiqlang")}</label>
                <input type="password" class="form-control" id="confirm-password" placeholder="••••••••" required>
            </div>
            
            <div class="modal-footer" style="padding-top: 15px;">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
                <button type="submit" class="btn btn-primary" style="padding: 10px 40px;">${t("Yangilash")}</button>
            </div>
        </form>
    `);
}

async function handleChangePassword(e) {
  e.preventDefault();
  const user = api.getUser();
  const pass = document.getElementById('new-password').value;
  const confirm = document.getElementById('confirm-password').value;

  if (pass !== confirm) {
    return showToast(t("Parollar bir xil emas"), 'error');
  }

  try {
    await api.put(`/users/${user.id}`, { password: pass });
    showToast(t("Parol yangilandi"));
    closeModal();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function copyToClipboard(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast(t("Nusxa olindi"));
  }).catch(err => {
    showToast(t("Xatolik: ") + err, 'error');
  });
}

window.navigateTo = navigateTo;
window.onBusinessChange = onBusinessChange;
window.renderProfile = renderProfile;
window.showEditProfileModal = showEditProfileModal;
window.handleUpdateProfile = handleUpdateProfile;
window.previewProfileImage = previewProfileImage;
window.previewBrandImage = previewBrandImage;
window.showChangePasswordModal = showChangePasswordModal;
window.handleChangePassword = handleChangePassword;
window.copyToClipboard = copyToClipboard;
window.toggleTheme = toggleTheme;
window.updateThemeIcon = updateThemeIcon;
window.currentPage = currentPage;
window.dashboardPage = dashboardPage;
window.navigateTo = navigateTo;
window.renderPageControls = renderPageControls;
window.renderDashboard = renderDashboard;
window.openModal = openModal;
window.closeModal = closeModal;
window.onBusinessChange = onBusinessChange;
window.renderDashboardTransactions = renderDashboardTransactions;
window.closeModalOnOverlay = function (e) {
  // Disabled: Modals should only close via X or Cancel buttons
};

window.maximizeTrendChart = function () {
  const title = t("Oylik savdo ko'rsatkichi");
  const body = `
        <div style="height:600px; width:100%;">
            <canvas id="maxSalesChart"></canvas>
        </div>
    `;
  openModal(title, body, 'modal-xl');

  setTimeout(() => {
    const ctx = document.getElementById('maxSalesChart')?.getContext('2d');
    if (ctx) {
      const labels = [t('Dush'), t('Sesh'), t('Chor'), t('Pay'), t('Jum'), t('Shan'), t('Yak')];
      const data = [12, 19, 15, 25, 22, 30, 20];

      new Chart(ctx, {
        type: salesTrendChartType,
        data: {
          labels: labels,
          datasets: [{
            label: t('Savdo hajmi'),
            data: data,
            borderColor: '#10b981',
            borderWidth: 4,
            fill: true,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: '#10b981'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }, 200);
};

window.openTrendChartSettings = function () {
  const title = t("Grafik sozlamalari");
  const body = `
        <div style="padding:10px;">
            <div style="margin-bottom:20px;">
                <label style="display:block; margin-bottom:10px; color:var(--text-secondary);">${t("Grafik turi")}</label>
                <div style="display:flex; gap:10px;">
                    <button class="btn ${salesTrendChartType === 'line' ? 'btn-primary' : 'btn-secondary'}" style="flex:1;" onclick="setChartType('line')">
                        <i data-lucide="line-chart"></i> ${t("Chiziqli")}
                    </button>
                    <button class="btn ${salesTrendChartType === 'bar' ? 'btn-primary' : 'btn-secondary'}" style="flex:1;" onclick="setChartType('bar')">
                        <i data-lucide="bar-chart-2"></i> ${t("Ustunli")}
                    </button>
                </div>
            </div>
            <div style="text-align:right; margin-top:20px;">
                <button class="btn btn-secondary" onclick="closeModal()">${t("Yopish")}</button>
            </div>
        </div>
    `;
  openModal(title, body);
  setTimeout(() => lucide.createIcons(), 50);
};

window.setChartType = function (type) {
  salesTrendChartType = type;
  closeModal();
  renderDashboardCharts(dashboardTransactions, dashboardProducts);
  showToast(t("Grafik turi yangilandi"), 'success');
};

window.toggleSidebar = function () {
  const sidebar = document.querySelector('.sidebar');
  const dashboard = document.querySelector('.dashboard');
  const toggleBtnIcon = document.querySelector('.sidebar-logo .btn-icon .icon');

  if (sidebar && dashboard) {
    sidebar.classList.toggle('collapsed');
    dashboard.classList.toggle('sidebar-collapsed');

    if (sidebar.classList.contains('collapsed')) {
      if (toggleBtnIcon) toggleBtnIcon.textContent = '▶';
      localStorage.setItem('sidebarCollapsed', 'true');
    } else {
      if (toggleBtnIcon) toggleBtnIcon.textContent = '◀';
      localStorage.setItem('sidebarCollapsed', 'false');
    }
  }
};

// Check sidebar state on mount
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('sidebarCollapsed') === 'true') {
    const sidebar = document.querySelector('.sidebar');
    const dashboard = document.querySelector('.dashboard');
    const toggleBtnIcon = document.querySelector('.sidebar-logo .btn-icon .icon');
    if (sidebar && dashboard) {
      sidebar.classList.add('collapsed');
      dashboard.classList.add('sidebar-collapsed');
      if (toggleBtnIcon) toggleBtnIcon.textContent = '▶';
    }
  }
});

// ==================== GLOBAL TABLE SORTING ====================
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
        table th { cursor: pointer; user-select: none; position: relative; transition: background 0.2s; }
        table th:hover { background: rgba(0,0,0,0.05); }
        [data-theme='dark'] table th:hover { background: rgba(255,255,255,0.05); }
        table th.no-sort, table th:first-child, table th:last-child { cursor: default !important; background: transparent !important; }
        .sort-arrow { font-size: 0.9em; opacity: 0.8; margin-left: 4px; }
    `;
  document.head.appendChild(style);

  document.addEventListener('click', function (e) {
    let th = e.target.closest('th');
    if (!th) return;

    if (th.querySelector('input, select, button')) return;
    if (th.classList.contains('no-sort')) return;

    let heading = th.textContent.trim().toLowerCase();
    if (heading.includes('amallar') || heading.includes('actions') || heading === '#' || heading === '№' || heading === 'n') return;

    // Exclude first and last columns dynamically as a heuristic since they are usually IDs and Actions
    let rowCells = th.parentElement.cells;
    if (th === rowCells[0] || th === rowCells[rowCells.length - 1]) return;

    let table = th.closest('table');
    if (!table || table.classList.contains('no-sort')) return;

    let tbody = table.querySelector('tbody');
    if (!tbody) return;

    let rows = Array.from(tbody.querySelectorAll('tr'));
    if (rows.length <= 1) return;
    if (rows.length > 0 && rows[0].cells.length === 1) return; // Empty state row

    let currentDir = th.getAttribute('data-sort-dir') || 'none';
    let newDir = currentDir === 'asc' ? 'desc' : 'asc';

    table.querySelectorAll('th').forEach(header => {
      header.removeAttribute('data-sort-dir');
      let arrow = header.querySelector('.sort-arrow');
      if (arrow) arrow.remove();
    });

    th.setAttribute('data-sort-dir', newDir);
    th.insertAdjacentHTML('beforeend', `<span class="sort-arrow">${newDir === 'asc' ? '↑' : '↓'}</span>`);

    let cellIndex = th.cellIndex;

    rows.sort((a, b) => {
      let aCell = a.cells[cellIndex];
      let bCell = b.cells[cellIndex];

      if (!aCell || !bCell) return 0;

      let aVal = aCell.textContent.trim();
      let bVal = bCell.textContent.trim();

      let rawA = aVal.replace(/[\s,]/g, '');
      let rawB = bVal.replace(/[\s,]/g, '');
      let numA = parseFloat(rawA);
      let numB = parseFloat(rawB);

      // Specific check for dates (YYYY-MM-DD or DD.MM.YYYY)
      let dateA = Date.parse(aVal);
      let dateB = Date.parse(bVal);

      if (!isNaN(dateA) && !isNaN(dateB) && aVal.length >= 10 && (aVal.includes('-') || aVal.includes('.'))) {
        return newDir === 'asc' ? dateA - dateB : dateB - dateA;
      }

      let isNumA = !isNaN(numA) && /[0-9]/.test(rawA);
      let isNumB = !isNaN(numB) && /[0-9]/.test(rawB);

      if (isNumA && isNumB) {
        return newDir === 'asc' ? numA - numB : numB - numA;
      }

      return newDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
  });
});

window.openDateFilterModal = function() {
  const period = getDatePeriod();
  openModal(`
    <div class="modal-header">
      <h3>${t("Sana bo'yicha filter")}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body-wrapper" style="padding: 20px;">
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:20px;">
        <div class="form-group">
          <label>${t("Boshlang'ich sana")}</label>
          <input type="date" class="form-control" id="filter-start-date" value="${period.start}">
        </div>
        <div class="form-group">
          <label>${t("Oxirgi sana")}</label>
          <input type="date" class="form-control" id="filter-end-date" value="${period.end}">
        </div>
      </div>
      <div class="modal-footer" style="padding-top:15px; border-top:1px solid var(--border);">
        <button class="btn btn-ghost" onclick="closeModal()">${t("Bekor qilish")}</button>
        <button class="btn btn-primary" onclick="applyDateFilter()">${t("Qo'llash")}</button>
      </div>
    </div>
  `);
};

window.applyDateFilter = function() {
  const start = document.getElementById('filter-start-date').value;
  const end = document.getElementById('filter-end-date').value;
  if (!start || !end) {
    showToast(t("Sanalarni to'liq tanlang"), 'warning');
    return;
  }
  setDatePeriod(start, end);
  closeModal();
  navigateTo(window.currentPage);
};
