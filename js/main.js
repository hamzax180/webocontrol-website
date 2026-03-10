/* ============================================
   WEBOCONTROL — Main JavaScript Module
   Particles, scroll, nav, GitHub, counters
   ============================================ */

// --- Notification System ---
class NotificationManager {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };

        const titles = {
            info: window.i18n ? window.i18n.t('notify_info') : 'Notice',
            success: window.i18n ? window.i18n.t('notify_success') : 'Success',
            error: window.i18n ? window.i18n.t('notify_error') : 'Error',
            warning: window.i18n ? window.i18n.t('notify_warning') : 'Warning'
        };

        notification.innerHTML = `
            <div class="notification-icon">${icons[type] || icons.info}</div>
            <div class="notification-content">
                <div class="notification-title">${titles[type] || titles.info}</div>
                <div class="notification-message">${message}</div>
            </div>
            <div class="notification-close">&times;</div>
        `;

        this.container.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto remove
        const timer = setTimeout(() => this.remove(notification), duration);

        // Close button
        notification.querySelector('.notification-close').onclick = () => {
            clearTimeout(timer);
            this.remove(notification);
        };
    }

    remove(notification) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 400).then(() => {
            if (this.container.children.length === 0) {
                // Keep container but maybe handle cleanup if needed
            }
        }).catch(() => { }); // ignore if already removed
    }
}

// Global accessor
window.notifications = new NotificationManager();
window.showNotification = (msg, type, dur) => window.notifications.show(msg, type, dur);

// --- Premium Liquid Background (Aurora) ---
function initAuroraBackground() {
    const canvas = document.getElementById('bg-aurora');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let time = 0;
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
        time += 0.005;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Premium liquid mesh logic
        for (let i = 0; i < 3; i++) {
            const shiftX = Math.sin(time + i) * 100;
            const shiftY = Math.cos(time * 0.8 + i) * 100;
            const grad = ctx.createRadialGradient(
                canvas.width / 2 + shiftX, canvas.height / 2 + shiftY, 0,
                canvas.width / 2 + shiftX, canvas.height / 2 + shiftY, canvas.width * 0.8
            );

            const colors = [
                'rgba(0, 240, 255, 0.1)',
                'rgba(184, 41, 255, 0.1)',
                'rgba(255, 45, 117, 0.05)'
            ];

            grad.addColorStop(0, colors[i % colors.length]);
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        requestAnimationFrame(draw);
    }
    draw();
}

// --- Confetti Particle System (Antigravity-style) ---
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

    let mouseX = -1000, mouseY = -1000;
    const MOUSE_RADIUS = 120;
    const MOUSE_FORCE = 3;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    const PARTICLE_COUNT = 70;
    const colors = [
        '#4285f4', '#5e35b1', '#7c4dff',
        '#e53935', '#ff6d00', '#ffab00',
        '#00bcd4', '#43a047', '#ec407a',
    ];

    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const type = Math.random();
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            baseVx: (Math.random() - 0.5) * 0.5,
            baseVy: (Math.random() - 0.5) * 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.7 + 0.3,
            size: Math.random() * 4 + 2,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.03,
            shape: type < 0.33 ? 'dot' : type < 0.66 ? 'dash' : 'square',
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            // Mouse repulsion
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_RADIUS && dist > 0) {
                const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
                p.vx += (dx / dist) * force;
                p.vy += (dy / dist) * force;
            }

            // Damping — slowly return to base speed
            p.vx += (p.baseVx - p.vx) * 0.02;
            p.vy += (p.baseVy - p.vy) * 0.02;

            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotSpeed;

            // Wrap around
            if (p.x < -20) p.x = canvas.width + 20;
            if (p.x > canvas.width + 20) p.x = -20;
            if (p.y < -20) p.y = canvas.height + 20;
            if (p.y > canvas.height + 20) p.y = -20;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;

            if (p.shape === 'dot') {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.shape === 'dash') {
                ctx.fillRect(-p.size * 1.5, -p.size / 4, p.size * 3, p.size / 2);
            } else {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }

            ctx.restore();
        });

        requestAnimationFrame(draw);
    }

    draw();
}

// --- Navbar Scroll ---
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const updateStickyHeaderFade = () => {
        // Sticky headers in products.html should stay visible and flush with navbar
    };

    let lastScrollY = window.scrollY;

    const checkScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            navbar.classList.add('scrolled');
        }
        updateStickyHeaderFade();
    };
    checkScroll();

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Use a very small delta so we don't miss rapid scrolls to top
        const delta = 2;
        if (Math.abs(currentScrollY - lastScrollY) <= delta) {
            updateStickyHeaderFade();
            return;
        }

        // Show/Hide logic for fixed navbar (Fiverr style, smooth)
        if (currentScrollY > 100) {
            if (currentScrollY > lastScrollY) {
                navbar.classList.add('navbar-hidden');
            } else {
                navbar.classList.remove('navbar-hidden');
            }
        } else {
            navbar.classList.remove('navbar-hidden');
        }

        if (currentScrollY <= 50) {
            navbar.classList.remove('scrolled');
        } else {
            navbar.classList.add('scrolled');
        }

        lastScrollY = currentScrollY;
        updateStickyHeaderFade();

        // Fade out moon graphics when scrolling down
        const moonGraphics = document.querySelector('.moon-graphics');
        if (moonGraphics) {
            const scrollPercent = Math.min(window.scrollY / 500, 1);
        }

        // Fade out hero content when scrolling down
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            // Fade out smoothly based on scroll. Start fading near 50px, completely fade by 400px.
            const scrollPercentHero = Math.min(window.scrollY / 400, 1);

            heroContent.style.opacity = Math.max(1 - scrollPercentHero, 0);

            // To prevent interfering with our fixed centering, we translate down 50% first
            // and then shift UP slightly via scroll physics
            const yShift = scrollPercentHero * 60; // moves up 60px over the scroll
            heroContent.style.transform = `translate(-50%, calc(-50% - ${yShift}px))`;
        }
    });
}

// --- Mobile Menu ---
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    const navAuth = document.getElementById('navAuth');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('mobile-open');
        if (navAuth) navAuth.classList.toggle('mobile-open');
    });

    // Close on link click
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                navLinks.classList.remove('mobile-open');
                if (navAuth) navAuth.classList.remove('mobile-open');
            });
        });
    }
}

// --- Scroll Reveal ---
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .intro-scene');
    if (!reveals.length) return;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        reveals.forEach(el => {
            el.style.transition = 'none';

            // Specialized stagger animations for grid-like lists
            const childStaggerClass = el.classList.contains('features-list') ? '.feature-item' :
                el.classList.contains('products-grid') ? '.product-card' :
                    el.classList.contains('reviews-grid') ? '.review-card' : null;

            if (childStaggerClass) {
                const children = el.querySelectorAll(childStaggerClass);
                if (children.length > 0) {
                    children.forEach(child => child.style.transition = 'none');

                    if (el.classList.contains('features-list')) {
                        // "Whole New Animation": High-end Stagger with Spin
                        gsap.fromTo(children,
                            {
                                opacity: 0,
                                y: 50,
                                rotationX: -15,
                                scale: 0.8,
                                filter: 'blur(20px)'
                            },
                            {
                                opacity: 1,
                                y: 0,
                                rotationX: 0,
                                scale: 1,
                                filter: 'blur(0px)',
                                stagger: 0.2,
                                duration: 1.6,
                                ease: "elastic.out(1, 0.75)",
                                scrollTrigger: {
                                    trigger: el,
                                    start: "top 85%",
                                    toggleActions: "play none none reverse"
                                }
                            }
                        );

                        // Exclusive Circular Icon Animation: Orbital Spiral
                        const icons = el.querySelectorAll('.feature-icon');
                        gsap.fromTo(icons,
                            { rotation: -90, scale: 0 },
                            { rotation: 0, scale: 1, duration: 1.2, ease: "back.out(2)", stagger: 0.2, scrollTrigger: { trigger: el, start: "top 85%" } }
                        );

                        // BETER TECH: SVG Drawing effect for icons
                        children.forEach(item => {
                            const paths = item.querySelectorAll('path, circle:not(.grid-node)');
                            paths.forEach(p => {
                                const length = p.getTotalLength ? p.getTotalLength() : 100;
                                gsap.set(p, { strokeDasharray: length, strokeDashoffset: length });
                                gsap.to(p, {
                                    strokeDashoffset: 0,
                                    duration: 3,
                                    ease: "power3.inOut",
                                    scrollTrigger: {
                                        trigger: item,
                                        start: "top 90%"
                                    }
                                });
                            });
                        });
                    } else {
                        // General stagger for products/reviews: 3D Layered entrance
                        gsap.fromTo(children,
                            {
                                opacity: 0,
                                z: -100,
                                y: 80,
                                rotationX: 45,
                                filter: 'blur(10px)'
                            },
                            {
                                opacity: 1,
                                z: 0,
                                y: 0,
                                rotationX: 0,
                                filter: 'blur(0px)',
                                stagger: 0.12,
                                duration: 1.4,
                                ease: "expo.out",
                                scrollTrigger: {
                                    trigger: el,
                                    start: "top 82%",
                                    toggleActions: "play none none reverse"
                                }
                            }
                        );
                    }
                }
            } else {
                // Whole new Entrance for single blocks: Zoom + Smooth reveal
                gsap.fromTo(el,
                    {
                        opacity: 0,
                        y: 120,
                        scale: 0.85,
                        rotationX: 20,
                        transformPerspective: 1000,
                        filter: 'blur(15px)'
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotationX: 0,
                        filter: 'blur(0px)',
                        duration: 1.8,
                        ease: "expo.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 95%",
                            toggleActions: "play none none reverse",
                            onEnter: () => el.classList.add('revealed', 'active'),
                            onLeaveBack: () => el.classList.remove('revealed', 'active')
                        }
                    }
                );

                // Specialty animation for Engineering Visual nodes
                if (el.classList.contains('engineering-visual')) {
                    const nodes = el.querySelectorAll('.node-item');
                    gsap.fromTo(nodes,
                        { opacity: 0, x: -30 },
                        { opacity: 1, x: 0, stagger: 0.2, duration: 1, ease: "back.out(1.7)", scrollTrigger: { trigger: el, start: "top 80%" } }
                    );

                    // Floating drift effect
                    nodes.forEach((node, i) => {
                        gsap.to(node, {
                            y: "random(-10, 10)",
                            x: "random(-5, 5)",
                            duration: "random(2, 4)",
                            repeat: -1,
                            yoyo: true,
                            ease: "sine.inOut",
                            delay: i * 0.2
                        });
                    });
                }
            }
        });
        // Force refresh for any layout shifts
        setTimeout(() => ScrollTrigger.refresh(), 500);
    } else {
        window.revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed', 'active');
                } else {
                    entry.target.classList.remove('revealed', 'active');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(el => window.revealObserver.observe(el));
    }
}

// --- Counter Animation ---
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-count'));
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
}

function animateCounter(el, target) {
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            el.textContent = target + '+';
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(current) + '+';
        }
    }, 25);
}

// --- Product Card Slider ---
function initProductSliders() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const images = card.querySelectorAll('.product-image-container img');
        const dots = card.querySelectorAll('.nav-dot');
        if (images.length <= 1) return;

        let currentIndex = 0;
        let interval;

        function showImage(index) {
            images.forEach(img => img.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

            images[index].classList.add('active');
            dots[index].classList.add('active');
            currentIndex = index;
        }

        function nextImage() {
            let next = (currentIndex + 1) % images.length;
            showImage(next);
        }

        // Auto play on hover
        card.addEventListener('mouseenter', () => {
            interval = setInterval(nextImage, 1200);
        });

        card.addEventListener('mouseleave', () => {
            clearInterval(interval);
        });

        // Click to zoom directly
        const container = card.querySelector('.product-image-container');
        if (container) {
            container.addEventListener('click', (e) => {
                const activeImg = container.querySelector('img.active') || container.querySelector('img');
                if (activeImg) {
                    window.showFullImage(activeImg.src);
                }
            });
        }

        // Click on dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                showImage(index);
                clearInterval(interval);
            });
        });
    });
}

// --- Smooth Scroll ---
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                const navHeight = 80;
                const extraOffset = 120; // more room for the section title
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - (navHeight + extraOffset);

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// --- Auth UI States ---
function updateAuthUI() {
    const token = localStorage.getItem('webocontrol_token');
    const user = JSON.parse(localStorage.getItem('webocontrol_user') || '{}');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');

    if (token) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) {
            logoutBtn.style.display = 'flex';
            logoutBtn.textContent = `${window.i18n.t('logout_btn')} (${user.name || 'User'})`;
        }
        if (dashboardBtn) dashboardBtn.style.display = 'flex';
    } else {
        if (loginBtn) loginBtn.style.display = 'flex';
        if (registerBtn) registerBtn.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (dashboardBtn) dashboardBtn.style.display = 'none';
    }

    if (logoutBtn) {
        logoutBtn.removeEventListener('click', handleLogout);
        logoutBtn.addEventListener('click', handleLogout);
    }
}

function handleLogout() {
    localStorage.removeItem('webocontrol_token');
    localStorage.removeItem('webocontrol_user');
    window.location.href = '/login.html';
}

// --- Image Zoom Modal ---
window.showFullImage = function (src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    if (modal && modalImg) {
        modalImg.src = src;
        modal.classList.add('open');
    }
}

// --- Order Form Logic ---
// --- Support Hub Logic ---
function initSupportHub() {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const trackBtn = document.getElementById('trackBtn');
    const trackIdInput = document.getElementById('trackIdInput');
    const trackResult = document.getElementById('trackResult');
    const historyList = document.getElementById('orderHistoryList');

    if (!chatForm && !trackBtn) return;

    // AI Chat Logic
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = chatInput.value.trim();
            if (!msg) return;

            // Add user message
            const userMsg = document.createElement('div');
            userMsg.className = 'message user';
            userMsg.textContent = msg;
            chatMessages.appendChild(userMsg);
            chatInput.value = '';

            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // AI Response (Mock)
            setTimeout(() => {
                const aiMsg = document.createElement('div');
                aiMsg.className = 'message ai';
                aiMsg.textContent = "Processing... I'm currently in 'read-only' mode for the hub preview, but I can see you're asking about: " + msg;
                chatMessages.appendChild(aiMsg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        });
    }

    // Tracking Logic
    if (trackBtn) {
        trackBtn.addEventListener('click', async () => {
            const idInput = trackIdInput.value.trim();
            if (!idInput) return;

            trackBtn.disabled = true;
            trackBtn.textContent = '...';

            try {
                const response = await fetch(`/api/orders/track/${encodeURIComponent(idInput)}`);
                const data = await response.json();

                trackResult.style.display = 'block';

                if (response.ok) {
                    const statusClass = data.status.toLowerCase() === 'pending' ? 'pending'
                        : data.status.toLowerCase() === 'in-progress' ? 'in-progress'
                            : 'completed';

                    trackResult.innerHTML = `
                        <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; border: 1px solid var(--border-color);">
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 5px;">${window.i18n.t('order_track_id')}</div>
                            <div class="order-id-badge" style="margin-bottom: 15px;">ORDER ID: #CF-${data.id}</div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span>${window.i18n.t('order_status_label') || 'Status:'}</span>
                                <span class="status-badge ${statusClass}">${window.i18n.t('status_' + statusClass.replace('-', '_'))}</span>
                            </div>
                        </div>
                    `;
                } else {
                    trackResult.innerHTML = `
                        <div style="padding: 15px; background: rgba(255,0,0,0.05); border-radius: 10px; border: 1px solid rgba(255,0,0,0.2); color: #ff4d4d; font-size: 0.9rem; text-align: center;">
                            ${data.error || 'Order not found.'}
                        </div>
                    `;
                }
            } catch (err) {
                console.error('Tracking fetch error:', err);
                trackResult.style.display = 'block';
                trackResult.innerHTML = `<div style="color: #ff4d4d; text-align: center;">Network error.</div>`;
            } finally {
                trackBtn.disabled = false;
                trackBtn.textContent = window.i18n.t('order_track_btn');
            }
        });
    }

    // History Logic
    async function renderOrderHistory() {
        if (!historyList) return;

        const token = localStorage.getItem('webocontrol_token');
        if (!token) {
            historyList.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">${window.i18n.t('order_auth_login')}</div>`;
            return;
        }

        try {
            // First show what's in localStorage (for speed)
            const cachedOrders = JSON.parse(localStorage.getItem('webocontrol_orders') || '[]');
            if (cachedOrders.length > 0) {
                displayOrders(cachedOrders);
            }

            // Then fetch from server
            const res = await fetch('/api/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const orders = await res.json();
                localStorage.setItem('webocontrol_orders', JSON.stringify(orders));
                displayOrders(orders);
            } else if (res.status === 401) {
                historyList.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">${window.i18n.t('order_auth_login')}</div>`;
            }
        } catch (err) {
            console.error('Fetch orders error:', err);
            // Fallback is already handled by showing cached orders initially
        }
    }

    function displayOrders(orders) {
        if (!historyList) return;
        if (orders.length === 0) {
            historyList.innerHTML = `
                <div class="history-empty-state reveal">
                    <span class="empty-icon">📂</span>
                    <p data-i18n="dash_no_orders">${window.i18n.t('dash_no_orders')}</p>
                </div>
            `;
            // Trigger reveal for empty state
            setTimeout(() => {
                const empty = historyList.querySelector('.history-empty-state');
                if (empty) empty.classList.add('revealed', 'active');
            }, 100);
        } else {
            historyList.innerHTML = orders.map(o => {
                const statusClass = (o.status || 'pending').toLowerCase().replace(' ', '-');
                const orderId = o.id || Math.floor(1000 + Math.random() * 9000);
                const orderDate = o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Recent';

                return `
                    <div class="order-history-card reveal">
                        <div class="order-header">
                            <div class="order-info">
                                <div class="order-id-badge">ORDER ID: #CF-${orderId}</div>
                                <div class="order-type-val">${o.website_type || 'Custom Project'}</div>
                                <div class="order-meta">
                                    <div class="order-meta-item">
                                        <span>📅</span> ${orderDate}
                                    </div>
                                    <div class="order-meta-item">
                                        <span>💰</span> ${o.budget || 'Custom'}
                                    </div>
                                </div>
                            </div>
                            <span class="status-badge ${statusClass}">${window.i18n.t('status_' + (statusClass.replace('-', '_'))) || statusClass}</span>
                        </div>
                        <div class="order-actions">
                            <a href="#" class="view-details-link">
                                ${window.i18n.t('btn_track') || 'View Details'} →
                            </a>
                        </div>
                    </div>
                `;
            }).join('');

            // Fix: Manually reveal dynamically added cards with a slight stagger
            const cards = historyList.querySelectorAll('.order-history-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('revealed', 'active');
                }, 100 * index);
            });

            // Re-trigger scroll reveal if active
            if (window.ScrollTrigger) ScrollTrigger.refresh();
        }
    }

    renderOrderHistory();
}

function initOrderForm() {
    initSupportHub();

    const reqSection = document.getElementById('requirementsSection');
    const reqForm = document.getElementById('requirementsForm');
    const supportSection = document.getElementById('support');
    const typeSelect = document.getElementById('reqWebsiteType');
    const otherCheck = document.getElementById('reqOtherCheck');
    const otherText = document.getElementById('reqOtherText');
    const prodPhotosYes = document.getElementById('prodPhotosYes');
    const photoUploadSection = document.getElementById('photoUploadSection');
    const productPhotosInput = document.getElementById('productPhotos');
    const photoPreview = document.getElementById('photoPreview');

    if (reqSection && reqForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');
        const budget = urlParams.get('budget');

        // Initial setup from URL
        if (type || budget) {
            reqSection.style.display = 'block';
            if (supportSection) supportSection.style.marginTop = '40px';
            if (type && typeSelect) typeSelect.value = type;
            if (budget) document.getElementById('reqBudget').value = budget;
            updateVisibility(type);

            setTimeout(() => {
                reqSection.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }

        // Toggle visibility based on type
        typeSelect.addEventListener('change', (e) => updateVisibility(e.target.value));

        // Toggle "Other" page text input
        if (otherCheck) {
            otherCheck.addEventListener('change', (e) => {
                otherText.style.display = e.target.checked ? 'block' : 'none';
                if (e.target.checked) otherText.focus();
            });
        }

        // Toggle product photos upload section
        if (prodPhotosYes) {
            const prodPhotosRadios = document.querySelectorAll('input[name="reqProdPhotos"]');
            prodPhotosRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (photoUploadSection) {
                        photoUploadSection.style.display = e.target.value === 'yes' ? 'block' : 'none';
                    }
                });
            });
        }

        // Handle photo upload
        if (productPhotosInput) {
            productPhotosInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (!files.length) return;

                photoPreview.innerHTML = '';
                photoPreview.style.display = 'grid';

                Array.from(files).forEach((file, index) => {
                    if (!file.type.startsWith('image/')) return;

                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const item = document.createElement('div');
                        item.className = 'photo-preview-item';
                        item.innerHTML = `
                            <img src="${event.target.result}" alt="Preview">
                            <button type="button" class="photo-preview-remove" onclick="this.parentElement.remove()">&times;</button>
                        `;
                        photoPreview.appendChild(item);
                    };
                    reader.readAsDataURL(file);
                });
            });
        }

        function updateVisibility(type) {
            const ecoElements = document.querySelectorAll('.ecommerce-only');
            const compElements = document.querySelectorAll('.company-only');
            const websiteElements = document.querySelectorAll('.website-only');
            const securityElements = document.querySelectorAll('.security-only');
            const devopsElements = document.querySelectorAll('.devops-only');

            const isWebsite = type === 'portfolio' || type === 'company' || type === 'ecommerce';

            websiteElements.forEach(el => el.style.display = isWebsite ? 'block' : 'none');
            securityElements.forEach(el => el.style.display = type === 'security' ? 'block' : 'none');
            devopsElements.forEach(el => el.style.display = type === 'devops' ? 'block' : 'none');

            // Do not override flex/grid by blindly using 'block', empty string returns it to original css
            ecoElements.forEach(el => el.style.display = (type === 'ecommerce' ? '' : 'none'));
            compElements.forEach(el => el.style.display = (isWebsite ? '' : 'none'));

            // Re-apply reveal animations for visible elements
            if (window.revealObserver) {
                document.querySelectorAll('.req-card').forEach(card => {
                    if (card.style.display !== 'none') window.revealObserver.observe(card);
                });
            }
        }

        reqForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = reqForm.querySelector('button[type="submit"]');
            const token = localStorage.getItem('webocontrol_token');

            if (!token) {
                window.showNotification(window.i18n.t('order_login_required'), 'warning');
                setTimeout(() => { window.location.href = '/login.html'; }, 1500);
                return;
            }

            btn.disabled = true;
            btn.textContent = window.i18n.t('order_launching') || 'Launching project...';

            // Gather multi-select pages
            const pages = Array.from(document.querySelectorAll('input[name="reqPages"]:checked')).map(cb => {
                if (cb.value === 'other') return `Other: ${otherText.value}`;
                return cb.value;
            });

            const data = {
                website_type: typeSelect.value,
                budget: document.getElementById('reqBudget').value,
                company_name: document.getElementById('reqCompanyName').value,
                est_year: document.getElementById('reqEstYear').value,
                location: document.getElementById('reqLocation').value,
                phone: document.getElementById('reqPhone').value,
                email: document.getElementById('reqEmail').value,
                social_links: document.getElementById('reqSocial').value,
                brand_colors: document.getElementById('reqColors').value,
                design_style: document.getElementById('reqStyle').value,
                inspiration: document.getElementById('reqInspiration').value,
                languages: document.getElementById('reqLanguages').value,
                ai_chat: document.querySelector('input[name="reqAIChat"]:checked')?.value || 'no',
                pages: pages.join(', '),
                company_description: document.getElementById('reqCompanyDesc').value,
                company_vision: document.getElementById('reqCompanyVision').value,
                product_photos: document.querySelector('input[name="reqProdPhotos"]:checked')?.value || 'no',
                product_catalog: document.querySelector('input[name="reqCatalog"]:checked')?.value || 'no',
                contact_form: document.querySelector('input[name="reqContactForm"]:checked')?.value || 'no',
                quote_form: document.querySelector('input[name="reqQuoteForm"]:checked')?.value || 'no',
                google_maps: document.querySelector('input[name="reqMaps"]:checked')?.value || 'no',
                domain: document.getElementById('reqDomain').value,
                hosting: document.getElementById('reqHosting').value,
                // Addon specific fields
                security_type: document.getElementById('reqSecurityType')?.value,
                target_url: document.getElementById('reqTargetUrl')?.value,
                auth_details: document.getElementById('reqAuthDetails')?.value,
                security_goals: document.getElementById('reqSecurityGoals')?.value,
                cloud_provider: document.getElementById('reqCloudProvider')?.value,
                k8s_status: document.getElementById('reqK8sStatus')?.value,
                cicd_pipeline: document.getElementById('reqCicdPipeline')?.value,
                compliance_goals: document.getElementById('reqFintechCompliance')?.value,
                // Ensure a general description is available for the backend
                description: document.getElementById('reqCompanyDesc').value || `Enhanced order for ${typeSelect.value}`
            };

            try {
                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    window.showNotification(window.i18n.t('order_success') || 'Order placed!', 'success');
                    reqForm.reset();
                    setTimeout(() => { window.location.href = '/dashboard.html'; }, 2000);
                } else {
                    const result = await res.json();
                    window.showNotification(result.error || window.i18n.t('order_error'), 'error');
                    btn.disabled = false;
                    btn.textContent = window.i18n.t('form_submit_btn');
                }
            } catch (err) {
                console.error('Submit order error:', err);
                window.showNotification(window.i18n.t('dash_network_error'), 'error');
                btn.disabled = false;
                btn.textContent = window.i18n.t('form_submit_btn');
            }
        });
    }
}

// --- Cart System ---
class CartManager {
    constructor() {
        this.userId = this.getUserId();
        this.items = this.load();
        this.updateBadge();
        this.initEventListeners();
    }
    didnt
    getUserId() {
        try {
            const user = JSON.parse(localStorage.getItem('webocontrol_user'));
            return user ? user.id : 'guest';
        } catch { return 'guest'; }
    }

    getStorageKey() {
        return `webocontrol_cart_${this.userId}`;
    }

    load() {
        return JSON.parse(localStorage.getItem(this.getStorageKey()) || '[]');
    }

    add(item) {
        // For services, we might only allow one of each type or replace if same type
        const existing = this.items.find(i => i.type === item.type);
        if (!existing) {
            this.items.push(item);
            this.save();
            this.render();
            this.updateBadge();
            this.open();
        } else {
            window.showNotification(window.i18n.t('cart_already_exists'), 'warning');
        }
    }

    remove(type) {
        this.items = this.items.filter(i => i.type !== type);
        this.save();
        this.render();
        this.updateBadge();
    }

    save() {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(this.items));
    }

    confirmSelection() {
        if (this.items.length === 0) return;
        // Save payment data for the payment page
        const paymentData = {
            items: this.items.map(item => ({
                type: item.type,
                name: item.name || item.type,
                description: (window.i18n.t('prod_' + item.type + '_title') || item.type) + window.i18n.t('pkg_suffix'),
                price: parseInt(item.price),
                quantity: 1,
            })),
        };
        localStorage.setItem('webocontrol_payment_data', JSON.stringify(paymentData));
        window.location.href = '/payment.html';
    }

    updateBadge() {
        const badge = document.getElementById('cartBadge');
        if (badge) badge.textContent = this.items.length;
    }

    render() {
        const list = document.getElementById('cartItems');
        const totalEl = document.getElementById('cartTotal');
        if (!list) return;

        if (this.items.length === 0) {
            list.innerHTML = `<li style="text-align:center; margin-top:40px; color:var(--text-muted);">${window.i18n.t('cart_empty')}</li>`;
            if (totalEl) totalEl.textContent = '$0';
            return;
        }

        let total = 0;
        list.innerHTML = this.items.map(item => {
            total += parseInt(item.price);
            return `
                <li class="cart-item">
                    <img src="${item.image}" class="cart-item-img">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${window.i18n.t('prod_' + item.type + '_title') || item.name}</div>
                        <div class="cart-item-price">$${item.price}</div>
                    </div>
                    <button class="remove-item" onclick="window.cart.remove('${item.type}')" title="${window.i18n.t('cart_remove')}">&times;</button>
                </li>
            `;
        }).join('');

        if (totalEl) totalEl.textContent = `$${total}`;

        // Update Proceed button URL if on the page where it exists
        const proceedBtn = document.querySelector('.cart-footer a');
        if (proceedBtn && this.items.length > 0) {
            const first = this.items[0];
            proceedBtn.href = `/order.html?type=${first.type}&budget=${first.price}`;
        }
    }

    open() {
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar) sidebar.classList.add('open');
        document.body.classList.add('cart-open');
    }

    close() {
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar) sidebar.classList.remove('open');
        document.body.classList.remove('cart-open');
    }

    initEventListeners() {
        const btn = document.getElementById('cartBtn');
        const closeBtn = document.getElementById('closeCart');
        if (btn) btn.addEventListener('click', () => {
            this.render();
            this.open();
        });
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());

        // Close on escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    }
}

// Global accessor
window.cart = new CartManager();

// --- Real Reviews ---
async function fetchReviews() {
    const list = document.getElementById('reviewsList');
    if (!list) return;

    try {
        const userJson = localStorage.getItem('webocontrol_user');
        const user = userJson ? JSON.parse(userJson) : null;
        const isAdmin = user && user.role === 'admin';
        const token = localStorage.getItem('webocontrol_token');

        const response = await fetch('/api/reviews');
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const reviews = await response.json();

        // Inject Mohammed's review
        reviews.unshift({
            id: 'mohammed-review',
            rating: 5,
            content: 'Incredible work by the team, the website looks stunning and the performance is top-notch. Truly futuristic design!<br><br><a href="https://onemotextile.com" target="_blank" class="gradient-text" style="display: inline-block; margin-top: 8px; font-weight: 600; font-size: 0.95rem; text-decoration: underline;">Visit onemotextile.com ↗</a>',
            user_name: 'Mohammed',
            created_at: new Date(Date.now() - 86400000).toISOString()
        });

        // Inject Dress Me by OJ's review
        reviews.unshift({
            id: 'dress-me-by-oj-review',
            rating: 5,
            content: 'Working with WEBOCONTROL was a game changer for our fashion brand! The e-commerce integration is seamless and the design feels incredibly premium. Highly recommend!<br><br><a href="https://dress-me-by-oj.vercel.app/" target="_blank" class="gradient-text" style="display: inline-block; margin-top: 8px; font-weight: 600; font-size: 0.95rem; text-decoration: underline;">Visit Dress Me by OJ ↗</a>',
            user_name: 'Dress Me by OJ',
            created_at: new Date().toISOString()
        });

        if (reviews.length === 0) {
            list.innerHTML = '<p class="no-reviews" style="text-align:center; grid-column: 1/-1; padding: 40px; color: var(--text-muted);">No reviews yet. Be the first to share your experience!</p>';
            return;
        }

        list.innerHTML = reviews.map(r => `
            <div class="review-card">
                <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                <p class="review-content">"${r.content}"</p>
                <div class="review-author" style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="author-info" style="display: flex; align-items: center; gap: 12px;">
                        <div class="author-name">${r.user_name}</div>
                        <div class="review-date">${new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    ${isAdmin ? `<button class="btn btn-ghost admin-delete-review-btn" data-id="${r.id}" style="color: #ff4757; padding: 4px 8px; font-size: 0.8rem; border-color: rgba(255, 71, 87, 0.2);">Delete</button>` : ''}
                </div>
            </div>
        `).join('');

        // Admin delete event listeners
        if (isAdmin) {
            list.querySelectorAll('.admin-delete-review-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const btnEl = e.target.closest('button');
                    const reviewId = btnEl.dataset.id;
                    if (!confirm('Are you sure you want to delete this review?')) return;

                    try {
                        // Retrieve the token from localStorage safely
                        const authToken = localStorage.getItem('webocontrol_token') || localStorage.getItem('token');
                        const deleteRes = await fetch(`/api/reviews/${reviewId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${authToken}`
                            }
                        });

                        if (deleteRes.ok) {
                            fetchReviews(); // Refresh the list
                        } else {
                            const err = await deleteRes.json();
                            alert(err.error || 'Failed to delete review');
                        }
                    } catch (error) {
                        console.error('Error deleting review:', error);
                        alert('Network error occurred.');
                    }
                });
            });
        }

        // Observe new elements
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            const children = list.querySelectorAll('.reveal');
            children.forEach(child => child.style.transition = 'none');
            gsap.fromTo(children,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.15,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: list,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        } else if (window.revealObserver) {
            list.querySelectorAll('.reveal').forEach(el => window.revealObserver.observe(el));
        }
    } catch (err) {
        console.error('Fetch reviews error:', err);
        list.innerHTML = '<p class="error">Failed to load reviews.</p>';
    }
}

async function initReviews() {
    const form = document.getElementById('reviewForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = document.getElementById('reviewContent').value;
            const rating = document.getElementById('reviewRating').value;
            const btn = document.getElementById('submitReviewBtn');

            btn.disabled = true;
            btn.textContent = 'Posting...';

            try {
                const token = localStorage.getItem('webocontrol_token');
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ content, rating: parseInt(rating) })
                });

                if (response.ok) {
                    form.reset();
                    fetchReviews();
                    window.showNotification('Review posted successfully!', 'success');
                } else {
                    const data = await response.json();
                    window.showNotification(data.error || 'Failed to post review', 'error');
                }
            } catch (err) {
                console.error('Submit review error:', err);
                window.showNotification('An error occurred. Please try again.', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = window.i18n.t('reviews_btn_submit');
            }
        });
    }

    const updateReviewsUI = () => {
        const addSection = document.getElementById('addReviewSection');
        const loginPrompt = document.getElementById('loginToReview');
        const token = localStorage.getItem('webocontrol_token');

        if (addSection && loginPrompt) {
            if (token) {
                addSection.style.display = 'block';
                loginPrompt.style.display = 'none';
            } else {
                addSection.style.display = 'none';
                loginPrompt.style.display = 'block';
            }
        }
    };

    updateReviewsUI();
    // Listen for auth changes
    window.addEventListener('authChange', updateReviewsUI);
    fetchReviews();
}

// --- Advanced Glitch Typewriter ---
class HeroTypewriter {
    constructor() {
        this.el = document.getElementById('heroTypingTarget');
        if (!this.el) return;

        this.phrases = [
            window.i18n.t('hero_title'),
            window.i18n.t('hero_title_1'),
            window.i18n.t('hero_title_2'),
            window.i18n.t('hero_title_3'),
            window.i18n.t('hero_title_4')
        ];

        this.index = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.typeSpeed = 100;

        window.addEventListener('languageChanged', () => {
            this.phrases = [
                window.i18n.t('hero_title'),
                window.i18n.t('hero_title_1'),
                window.i18n.t('hero_title_2'),
                window.i18n.t('hero_title_3'),
                window.i18n.t('hero_title_4')
            ];
        });

        this.type();
    }

    type() {
        const currentPhrase = this.phrases[this.index];

        if (this.isDeleting) {
            this.el.textContent = currentPhrase.substring(0, this.charIndex - 1);
            this.charIndex--;
            this.typeSpeed = 50;
        } else {
            this.el.textContent = currentPhrase.substring(0, this.charIndex + 1);
            this.charIndex++;
            this.typeSpeed = 100;
        }

        if (!this.isDeleting && this.charIndex === currentPhrase.length) {
            this.isDeleting = true;
            this.typeSpeed = 3000; // Wait at end
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.index = (this.index + 1) % this.phrases.length;
            this.typeSpeed = 500;
        }

        setTimeout(() => this.type(), this.typeSpeed);
    }
}

// --- Init All ---
document.addEventListener('DOMContentLoaded', () => {
    initAuroraBackground();
    initParticles();
    initNavbar();
    initMobileMenu();
    initScrollReveal();
    initCounters();
    initSmoothScroll();
    initProductSliders();
    updateAuthUI();
    initOrderForm();
    initReviews();
    initSupportHub();
    new HeroTypewriter();
    window.cart.render(); // Ensure initial render
});
