import { api, showToast, toggleTheme } from './api.js';
import { t } from './i18n.js';

// ==================== AUTH MODULE ====================

// Check if already logged in
(function checkAuth() {
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/desktop/') || window.location.pathname.endsWith('/desktop') || window.location.pathname === '/' || window.location.pathname === '') {
        if (api.getToken()) {
            window.location.href = 'dashboard.html';
        }
    }
})();

function switchTab(mode) {
    localStorage.setItem('activeAuthTab', mode);
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const authCard = document.getElementById('auth-card');

    if (!loginForm || !registerForm) return;

    if (mode === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        if (tabLogin) tabLogin.classList.add('active');
        if (tabRegister) tabRegister.classList.remove('active');
        if (authCard) authCard.style.maxWidth = '480px';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        if (tabLogin) tabLogin.classList.remove('active');
        if (tabRegister) tabRegister.classList.add('active');
        if (authCard) authCard.style.maxWidth = '600px'; // Wider for registration
    }
    
    if (typeof window.translateDOM === 'function') window.translateDOM();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTab = localStorage.getItem('activeAuthTab') || 'login';
    switchTab(savedTab);

    // Icon sync on load
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    if (typeof updateThemeIcon === 'function') {
        updateThemeIcon(currentTheme);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    if (!btn) return;
    
    const btnText = btn.querySelector('span');
    const originalText = btnText ? btnText.innerText : btn.innerText;
    
    btn.disabled = true;
    if (btnText) btnText.innerText = t('Yuklanmoqda...');
    else btn.innerText = t('Yuklanmoqda...');

    try {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        const data = await api.post('/auth/login', {
            userName: username,
            password: password
        });

        if (data && data.token) {
            api.setToken(data.token);
            api.setUser(data.user);
            showToast(t("Muvaffaqiyatli kirdingiz!"));
            setTimeout(() => window.location.href = 'dashboard.html', 500);
        } else {
            showToast(t("Login yoki parol noto'g'ri"), 'error');
        }
    } catch (err) {
        console.error('Login xatoligi:', err);
        showToast(t(err.message), 'error');
    } finally {
        btn.disabled = false;
        if (btnText) btnText.innerText = originalText;
        else btn.innerText = originalText;
    }
}

window.uploadBrandImage = async function(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const formData = new FormData();
        formData.append('file', file);
        try {
            showToast(t("Rasm yuklanmoqda..."), 'info');
            // Upload public endpoint is required
            const response = await fetch(`/api/v1/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error(t("Rasm yuklashda xatolik"));
            const result = await response.json();
            
            if (result && result.url) {
                document.getElementById('reg-brandimage').value = result.url;
                showToast(t("Rasm yuklandi"));
            }
        } catch (err) {
            showToast(err.message, 'error');
        }
    }
};

async function handleRegister(e) {
    e.preventDefault();
    const btn = document.getElementById('register-btn');
    if (!btn) return;



    const btnText = btn.querySelector('span');
    const originalText = btnText ? btnText.innerText : btn.innerText;

    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-password-confirm').value;

    if (password !== confirmPassword) {
        showToast(t("Parollar mos kelmadi"), 'error');
        return;
    }

    btn.disabled = true;
    if (btnText) btnText.innerText = t('Yuklanmoqda...');
    else btn.innerText = t('Yuklanmoqda...');

    try {
        const payload = {
            firstName: document.getElementById('reg-firstname').value.trim(),
            lastName: document.getElementById('reg-lastname').value.trim(),
            phoneNumber: document.getElementById('reg-phone').value.trim(),
            userName: document.getElementById('reg-username').value.trim(),
            password: password,
            brandName: document.getElementById('reg-brandname').value.trim(),
            brandImage: document.getElementById('reg-brandimage') ? document.getElementById('reg-brandimage').value : "",
            offerCode: document.getElementById('reg-offercode') ? document.getElementById('reg-offercode').value.trim() : ""
        };

        await api.post('/auth/register', payload);

        showToast(t("Ro'yxatdan o'tdingiz! Endi kiring."));
        switchTab('login');
    } catch (err) {
        showToast(t(err.message), 'error');
    } finally {
        btn.disabled = false;
        if (btnText) btnText.innerText = originalText;
        else btn.innerText = originalText;
    }
}

// Global exports
window.switchTab = switchTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
