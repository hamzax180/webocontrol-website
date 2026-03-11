/* ============================================
   WEBOCONTROL — Auth Module (Login / Register)
   ============================================ */

// --- Enhanced Auth Entrance Animations ---
// --- Tech-Themed "Digital Reveal" Entrance ---

/**
 * Helper to scramble text for a digital reveal effect
 * @param {HTMLElement} el The element to animate
 * @param {string} finalState The final text content
 * @param {number} duration Duration in seconds
 */
function scrambleText(el, finalState, duration = 1.2) {
    if (!el) return;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@0123456789";
    const originalText = finalState;
    let iteration = 0;

    // Apply digital reveal effect
    el.classList.add('is-revealing');

    const interval = setInterval(() => {
        el.innerText = originalText
            .split("")
            .map((letter, index) => {
                if (index < iteration) {
                    return originalText[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

        if (iteration >= originalText.length) {
            clearInterval(interval);
            el.innerText = originalText;
            el.classList.remove('is-revealing');
        }

        iteration += originalText.length / (duration * 60); // Approx 60fps
    }, 1000 / 60);
}

function initAuthAnimations() {
    if (typeof gsap === 'undefined') return;

    const card = document.querySelector('.auth-card');
    const scanLine = document.querySelector('.scan-line');
    // Consolidate all inner components for a unified staggered reveal
    const innerElements = document.querySelectorAll('.auth-form-wrapper > h2, .auth-form-wrapper > .auth-subtitle, .auth-form-wrapper form > .form-group, .auth-form-wrapper form > .btn-large, .auth-form-wrapper > .auth-footer');

    if (!card) return;

    // Create a master timeline starting after 3 seconds
    const tl = gsap.timeline({ delay: 3 });

    // 1. Digital Power-Up (Flicker)
    tl.to(card, {
        visibility: 'visible',
        onStart: () => card.classList.add('is-initializing')
    });

    tl.to(card, {
        opacity: 0.4,
        duration: 0.6,
        ease: "none"
    });

    // 2. High-Tech Expand Reveal
    tl.to(card, {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        duration: 1.2,
        ease: 'expo.out',
        onStart: () => card.classList.remove('is-initializing'),
        // Expand clip-path from center for a digital "iris" effect
        clipPath: 'inset(0% 0% 0% 0%)',
        startAt: { clipPath: 'inset(50% 0% 50% 0%)', scale: 0.9, opacity: 0 }
    }, "-=0.2");

    // 3. Scan Line Sweep
    if (scanLine) {
        tl.fromTo(scanLine,
            { opacity: 0, top: '0%' },
            { opacity: 1, top: '100%', duration: 1.5, ease: 'power2.inOut' },
            "-=1.2"
        );
        tl.to(scanLine, { opacity: 0, duration: 0.3 });
    }

    // 4. Staggered "Data Load" for elements (Tech Reveal)
    tl.fromTo(innerElements,
        {
            opacity: 0,
            filter: 'blur(8px)',
        },
        {
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.6,
            stagger: {
                each: 0.1,
                onStart: function () {
                    const target = this.targets()[0];
                    // Find all text-bearing elements within this target (or the target itself)
                    const textNodes = target.matches('h2, .auth-subtitle, label, .btn-primary, span, a')
                        ? [target]
                        : target.querySelectorAll('h2, .auth-subtitle, label, .btn-primary, span, a');

                    textNodes.forEach(node => {
                        const finalTxt = node.getAttribute('data-i18n')
                            ? (window.i18n ? window.i18n.t(node.getAttribute('data-i18n')) : node.innerText)
                            : node.innerText;
                        scrambleText(node, finalTxt, 0.8);
                    });
                }
            },
            ease: 'power2.out'
        },
        "-=1.1"
    );

    // Optimized Glow Animations
    gsap.fromTo('.hero-glow-1',
        { opacity: 0, scale: 0.8 },
        { opacity: 0.6, scale: 1, duration: 2, ease: 'power2.out', delay: 1 }
    );
    gsap.to('.hero-glow-1', {
        y: "random(-30, 30)", x: "random(-30, 30)", duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut'
    });

    gsap.fromTo('.hero-glow-2',
        { opacity: 0, scale: 0.8 },
        { opacity: 0.6, scale: 1, duration: 2, ease: 'power2.out', delay: 1.2 }
    );
    gsap.to('.hero-glow-2', {
        y: "random(-30, 30)", x: "random(-30, 30)", duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5
    });
}

// --- Already logged in? Redirect ---
function checkExistingAuth() {
    const token = localStorage.getItem('webocontrol_token');
    if (token) {
        window.location.href = '/frontend/dashboard.html';
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

            let data;
            const text = await res.text();
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Non-JSON response received:", text);
                throw new Error("Failed to parse JSON response");
            }

            if (res.ok) {
                localStorage.setItem('webocontrol_token', data.token);
                localStorage.setItem('webocontrol_user', JSON.stringify(data.user));
                showMessage('loginMessage', window.i18n.t('auth_login_success'), 'success');
                setTimeout(() => { window.location.href = '/frontend/dashboard.html'; }, 800);
            } else {
                showMessage('loginMessage', data.error || window.i18n.t('auth_invalid_credentials'), 'error');
            }
        } catch (err) {
            console.error('Login failed in try-catch block:', err);
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
                setTimeout(() => { window.location.href = '/frontend/dashboard.html'; }, 800);
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
