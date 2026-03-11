/* ============================================
   WEBOCONTROL — Dashboard Module
   Protected page, order management, product sidebar
   ============================================ */

// --- Particle System ---
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const colors = ['#00f0ff', '#b829ff', '#ff2d75'];

    for (let i = 0; i < 35; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 1.5 + 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.3 + 0.1,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }
    draw();
}

// --- Auth Check ---
function checkAuth() {
    const token = localStorage.getItem('webocontrol_token');
    if (!token) {
        window.location.href = '/login.html';
        return null;
    }
    return token;
}

// --- Display User ---
function displayUser() {
    try {
        const user = JSON.parse(localStorage.getItem('webocontrol_user'));
        const nameEl = document.getElementById('userName');
        const dashPage = document.querySelector('.dashboard-page');

        if (user && nameEl) {
            nameEl.textContent = user.name || 'User';

            if (user.role === 'admin') {
                if (dashPage) dashPage.classList.add('admin-mode');

                const headerH1 = document.querySelector('.dashboard-header h1');
                if (headerH1) {
                    headerH1.innerHTML = `<span class="gradient-text">${window.i18n.t('dash_admin_title')}</span>`;
                }

                const ordersTitle = document.querySelector('.dash-section-header h2[data-i18n="dash_your_orders"]');
                if (ordersTitle) {
                    ordersTitle.setAttribute('data-i18n', 'dash_all_orders');
                    ordersTitle.textContent = window.i18n.t('dash_all_orders');
                }

                // Hide sidebar for admin
                const sidebar = document.querySelector('.dash-product-sidebar');
                if (sidebar) sidebar.style.display = 'none';

                // Full-width orders
                const grid = document.querySelector('.dash-content-grid');
                if (grid) grid.style.gridTemplateColumns = '1fr';
            }
        }
    } catch { /* ignore */ }
}

// --- Update Stats ---
function updateStats(orders) {
    const totalEl = document.getElementById('statTotal');
    const pendingEl = document.getElementById('statPending');
    const completedEl = document.getElementById('statCompleted');

    if (!totalEl) return;

    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const completed = orders.filter(o => o.status === 'completed').length;

    // Animate count-up
    animateCount(totalEl, total);
    animateCount(pendingEl, pending);
    animateCount(completedEl, completed);
}

function animateCount(el, target) {
    if (!el) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
        } else {
            el.textContent = current;
        }
    }, 30);
}

// --- Product Hero Slider ---
function renderProductSidebar() {
    const track = document.getElementById('sliderTrack');
    const dotsContainer = document.getElementById('sliderDots');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    if (!track) return;

    const products = [
        {
            name: window.i18n.t('type_portfolio'),
            price: '$300',
            desc: window.i18n.t('service_portfolio_desc'),
            image: '/portfolio-preview/pic1p.png',
            tag: window.i18n.t('tag_popular')
        },
        {
            name: window.i18n.t('type_company'),
            price: '$500',
            desc: window.i18n.t('service_company_desc'),
            image: '/company-preview/company_ceo.png',
            tag: window.i18n.t('tag_best_value')
        },
        {
            name: window.i18n.t('type_ecommerce'),
            price: '$500',
            desc: window.i18n.t('service_ecommerce_desc'),
            image: '/ecommerce-preview/screen5.png',
            tag: window.i18n.t('tag_top_seller')
        }
    ];

    // Render all slides
    track.innerHTML = products.map((p, i) => `
        <a href="/products.html" class="slider-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
            <img src="${p.image}" alt="${p.name}" class="slide-img" loading="lazy">
            <div class="slide-info">
                <div class="slide-name">${p.name}</div>
                <div class="slide-price">${window.i18n.t('starting_at').replace('<br>', ' ')} ${p.price}</div>
                <div class="slide-desc">${p.desc}</div>
            </div>
        </a>
    `).join('');

    // Render dots
    if (dotsContainer) {
        dotsContainer.innerHTML = products.map((_, i) =>
            `<button class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`
        ).join('');
    }

    let current = 0;
    let autoplayTimer;

    function goTo(index) {
        const slides = track.querySelectorAll('.slider-slide');
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

        // Hide current
        slides[current].classList.remove('active');
        slides[current].classList.add('exit');
        if (dots[current]) dots[current].classList.remove('active');

        // Remove exit class after animation
        setTimeout(() => {
            slides[current].classList.remove('exit');
            current = index;

            // Show new
            slides[current].classList.add('active');
            if (dots[current]) dots[current].classList.add('active');
        }, 400);
    }

    function next() {
        goTo((current + 1) % products.length);
    }

    function prev() {
        goTo((current - 1 + products.length) % products.length);
    }

    function startAutoplay() {
        autoplayTimer = setInterval(next, 4000);
    }

    function stopAutoplay() {
        clearInterval(autoplayTimer);
    }

    // Controls
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); next(); startAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); prev(); startAutoplay(); });

    // Dot clicks
    if (dotsContainer) {
        dotsContainer.addEventListener('click', (e) => {
            const dot = e.target.closest('.dot');
            if (!dot) return;
            const idx = parseInt(dot.dataset.index);
            if (idx !== current) {
                stopAutoplay();
                goTo(idx);
                startAutoplay();
            }
        });
    }

    // Pause on hover
    const slider = document.getElementById('heroSlider');
    if (slider) {
        slider.addEventListener('mouseenter', stopAutoplay);
        slider.addEventListener('mouseleave', startAutoplay);
    }

    startAutoplay();
}

// --- Load Orders ---
async function loadOrders(token) {
    const orderList = document.getElementById('orderList');
    if (!orderList) return;

    try {
        const res = await fetch('/api/orders', {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (res.status === 401) {
            localStorage.removeItem('webocontrol_token');
            localStorage.removeItem('webocontrol_user');
            window.location.href = '/login.html';
            return;
        }

        const orders = await res.json();
        const user = JSON.parse(localStorage.getItem('webocontrol_user'));
        const isAdmin = user && user.role === 'admin';

        // Update stat cards
        updateStats(orders);

        if (!orders || !orders.length) {
            orderList.innerHTML = `
                <div class="no-orders-dash">
                    <span class="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            <line x1="12" y1="11" x2="12" y2="17"></line>
                            <line x1="9" y1="14" x2="15" y2="14"></line>
                        </svg>
                    </span>
                    <p>${window.i18n.t('dash_no_orders')}</p>
                    <a href="/order.html" class="btn btn-primary" style="margin-top: 16px;">${window.i18n.t('dash_place_first')}</a>
                </div>
            `;
            return;
        }

        // Status & type name maps
        const statusMap = {
            'pending': { label: window.i18n.t('status_pending'), icon: '⏳' },
            'in-progress': { label: window.i18n.t('status_in_progress'), icon: '⚙️' },
            'completed': { label: window.i18n.t('status_completed'), icon: '✅' }
        };

        const typeMap = {
            'portfolio': window.i18n.t('type_portfolio'),
            'company': window.i18n.t('type_company'),
            'ecommerce': window.i18n.t('type_ecommerce'),
            'startup': window.i18n.t('type_startup'),
            'brand': window.i18n.t('type_brand'),
            'webapp': window.i18n.t('type_webapp'),
            'saas': window.i18n.t('type_saas'),
            'security': window.i18n.t('type_security'),
            'devops': window.i18n.t('type_devops'),
            'blog': window.i18n.t('type_blog')
        };

        function getTypeName(type) {
            return typeMap[type] || type.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }

        orderList.innerHTML = orders.map((order, idx) => {
            const statusClass = order.status === 'pending' ? 'pending'
                : order.status === 'in-progress' ? 'in-progress'
                    : 'completed';

            const status = statusMap[order.status] || statusMap['pending'];

            const date = new Date(order.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });

            const typeName = getTypeName(order.website_type || 'portfolio');

            if (isAdmin) {
                return `
                <div class="admin-order-card">
                    <div class="admin-order-header">
                        <div class="admin-order-client">
                            <span class="admin-detail-label">${window.i18n.t('dash_client')}</span>
                            <span class="admin-client-name">${order.user_name}</span>
                            <span class="admin-client-email">${order.user_email}</span>
                        </div>
                        <span class="order-status ${statusClass}">${status.icon} ${status.label}</span>
                    </div>
                    <div class="admin-order-body">
                        <div class="admin-detail-item">
                            <span class="admin-detail-label">${window.i18n.t('dash_order')}</span>
                            <strong class="order-id-badge">${window.i18n.t('dash_order').toUpperCase()} ID: #CF-${order.id}</strong>
                        </div>
                        <div class="admin-detail-item">
                            <span class="admin-detail-label">${window.i18n.t('dash_service')}</span>
                            <strong>${typeName}</strong>
                        </div>
                        <div class="admin-detail-item">
                            <span class="admin-detail-label">${window.i18n.t('dash_budget')}</span>
                            <strong>$${order.budget || '??'}</strong>
                        </div>
                    </div>
                    ${order.description ? `<div class="admin-brief">"${order.description}"</div>` : ''}
                    <div class="admin-order-footer">
                        <div style="font-size: 0.75rem; color: #9ca3af;">${window.i18n.t('dash_created')}: ${date}</div>
                        <select onchange="updateOrderStatus('${order.id}', this.value)" class="admin-status-select">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>⏳ ${window.i18n.t('status_pending')}</option>
                            <option value="in-progress" ${order.status === 'in-progress' ? 'selected' : ''}>⚙️ ${window.i18n.t('status_in_progress')}</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>✅ ${window.i18n.t('status_completed')}</option>
                        </select>
                    </div>
                </div>
                `;
            }

            // Customer premium card
            const progressPercent = order.status === 'completed' ? 100
                : order.status === 'in-progress' ? 60 : 20;

            return `
            <div class="dash-order-card ${statusClass}" style="animation: cardSlideIn 0.4s ease ${idx * 0.08}s both;">
                <div class="order-card-top">
                    <span class="order-id-badge">ORDER #CF-${order.id}</span>
                    <span class="order-card-status ${statusClass}">${status.icon} ${status.label}</span>
                </div>

                <div class="order-card-body">
                    <div class="order-card-field">
                        <span class="field-label">${window.i18n.t('dash_service')}</span>
                        <span class="field-value">${typeName}</span>
                    </div>
                    <div class="order-card-field">
                        <span class="field-label">${window.i18n.t('dash_budget')}</span>
                        <span class="field-value" style="color: #4285f4; font-weight: 800;">$${order.budget || '—'}</span>
                    </div>
                    ${order.domain ? `
                    <div class="order-card-field">
                        <span class="field-label">${window.i18n.t('dash_domain')}</span>
                        <span class="field-value">${order.domain}</span>
                    </div>` : ''}
                    ${order.company_name ? `
                    <div class="order-card-field">
                        <span class="field-label">${window.i18n.t('dash_company')}</span>
                        <span class="field-value">${order.company_name}</span>
                    </div>` : ''}
                </div>

                ${order.description ? `<div class="order-card-desc">"${order.description}"</div>` : ''}

                <div class="order-card-progress">
                    <div class="progress-bar">
                        <div class="progress-fill ${statusClass}" style="width: ${progressPercent}%;"></div>
                    </div>
                </div>

                <div class="order-card-footer">
                    <span class="order-card-date">📅 ${date}</span>
                    <span class="order-card-progress-text">${progressPercent}% ${window.i18n.t('dash_percent_complete')}</span>
                </div>
            </div>
            `;
        }).join('');
    } catch (err) {
        orderList.innerHTML = `<div class="no-orders-dash"><span class="empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></span><p>${window.i18n.t('dash_load_error')}</p></div>`;
        console.error('Load orders error:', err);
    }
}

async function updateOrderStatus(orderId, newStatus) {
    const token = localStorage.getItem('webocontrol_token');
    try {
        const res = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            window.showNotification(window.i18n.t('dash_status_success'), 'success');
            loadOrders(token);
        } else {
            const err = await res.json();
            window.showNotification(err.message || window.i18n.t('dash_status_error'), 'error');
        }
    } catch (err) {
        window.showNotification(window.i18n.t('dash_network_error'), 'error');
    }
}

window.updateOrderStatus = updateOrderStatus;

// --- Logout ---
function initLogout() {
    const btn = document.getElementById('logoutBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        localStorage.removeItem('webocontrol_token');
        localStorage.removeItem('webocontrol_user');
        window.location.href = '/';
    });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    const token = checkAuth();
    if (!token) return;

    displayUser();
    loadOrders(token);
    renderProductSidebar();
    initLogout();
});
