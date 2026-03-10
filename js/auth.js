/* ============================================
   WEBOCONTROL — Auth Module (Login / Register)
   ============================================ */

// --- Enhanced Auth Entrance Animations ---
function initAuthAnimations() {
    if (typeof gsap === 'undefined') return;

    // Premium entrance for the auth card
    gsap.fromTo('.auth-card',
        { opacity: 0, y: 40, scale: 0.95, filter: 'blur(15px)' },
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', delay: 3.0 }
    );

    // Staggered entrance for inner elements
    const innerElements = document.querySelectorAll('.auth-card > a, .auth-card > h2, .auth-card > p, .auth-card form > div, .auth-card form > button, .auth-footer');
    gsap.fromTo(innerElements,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 3.2 }
    );

    // Floating hero glows
    gsap.fromTo('.hero-glow-1',
        { opacity: 0, scale: 0.8 },
        { opacity: 0.6, scale: 1, duration: 2, ease: 'power2.out' }
    );
    gsap.to('.hero-glow-1', {
        y: "random(-30, 30)", x: "random(-30, 30)", duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut'
    });

    gsap.fromTo('.hero-glow-2',
        { opacity: 0, scale: 0.8 },
        { opacity: 0.6, scale: 1, duration: 2, ease: 'power2.out', delay: 0.2 }
    );
    gsap.to('.hero-glow-2', {
        y: "random(-30, 30)", x: "random(-30, 30)", duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5
    });
}

// --- Already logged in? Redirect ---
function checkExistingAuth() {
    const token = localStorage.getItem('webocontrol_token');
    if (token) {
        window.location.href = '/dashboard.html';
    }
}

// --- Show message ---
function showMessage(elementId, text, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = text;
    el.className = `form-message ${type}`;
}

// --- Login Form ---
function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('webocontrol_token', data.token);
                localStorage.setItem('webocontrol_user', JSON.stringify(data.user));
                showMessage('loginMessage', window.i18n.t('auth_login_success'), 'success');
                setTimeout(() => { window.location.href = '/dashboard.html'; }, 800);
            } else {
                showMessage('loginMessage', data.error || window.i18n.t('auth_invalid_credentials'), 'error');
            }
        } catch (err) {
            showMessage('loginMessage', window.i18n.t('auth_network_error'), 'error');
        }
    });
}

// --- Register Form ---
function initRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showMessage('registerMessage', window.i18n.t('auth_pass_mismatch'), 'error');
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('webocontrol_token', data.token);
                localStorage.setItem('webocontrol_user', JSON.stringify(data.user));
                showMessage('registerMessage', window.i18n.t('auth_account_created'), 'success');
                setTimeout(() => { window.location.href = '/dashboard.html'; }, 800);
            } else {
                showMessage('registerMessage', data.error || window.i18n.t('auth_reg_failed'), 'error');
            }
        } catch (err) {
            showMessage('registerMessage', window.i18n.t('auth_network_error'), 'error');
        }
    });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    initAuthAnimations();
    checkExistingAuth();
    initLoginForm();
    initRegisterForm();
});
