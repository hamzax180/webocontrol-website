// --- Payment Page Logic ---

const API_URL = 'http://localhost:3001/api';

function getToken() {
    return localStorage.getItem('webocontrol_token');
}

function getCartData() {
    const raw = localStorage.getItem('webocontrol_payment_data');
    if (raw) {
        try { return JSON.parse(raw); } catch (e) { }
    }
    // Fallback: try cart items
    const cartRaw = localStorage.getItem('webocontrol_cart');
    if (cartRaw) {
        try { return JSON.parse(cartRaw); } catch (e) { }
    }
    return null;
}

// Render order summary items
function renderOrderSummary(data) {
    const container = document.getElementById('paymentItems');
    const totalEl = document.getElementById('paymentTotal');
    const payBtn = document.getElementById('payBtn');

    if (!data || !data.items || !data.items.length) {
        container.innerHTML = `
            <div class="payment-empty">
                <p>${window.i18n.t('pay_empty')}</p>
                <a href="/products.html" class="btn btn-ghost">${window.i18n.t('pay_browse')}</a>
            </div>
        `;
        return;
    }

    let total = 0;
    container.innerHTML = data.items.map(item => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        total += itemTotal;
        return `
            <div class="payment-item">
                <div class="payment-item-info">
                    <span class="payment-item-name">${item.name}</span>
                    ${item.description ? `<span class="payment-item-desc">${item.description}</span>` : ''}
                </div>
                <div class="payment-item-price">
                    ${item.quantity > 1 ? `<span class="payment-item-qty">${item.quantity}×</span>` : ''}
                    $${itemTotal.toLocaleString()}
                </div>
            </div>
        `;
    }).join('');

    totalEl.textContent = `$${total.toLocaleString()}`;
    payBtn.disabled = false;
}

// Handle Stripe checkout
async function handlePayment() {
    const payBtn = document.getElementById('payBtn');
    const btnText = payBtn.querySelector('.payment-btn-text');
    const btnLoading = payBtn.querySelector('.payment-btn-loading');

    const token = getToken();
    if (!token) {
        window.showNotification?.(window.i18n.t('pay_login_req'), 'error');
        setTimeout(() => { window.location.href = '/login.html'; }, 1500);
        return;
    }

    const data = getCartData();
    if (!data || !data.items?.length) {
        window.showNotification?.(window.i18n.t('pay_no_items'), 'error');
        return;
    }

    // Show loading state
    payBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    try {
        // Get selected payment method
        const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
        const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'card';

        const response = await fetch(`${API_URL}/payments/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                items: data.items,
                orderId: data.orderId || null,
                paymentMethod: paymentMethod // Send the selected method
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Payment failed');
        }

        // Redirect to Stripe Checkout
        if (result.url) {
            window.location.href = result.url;
        } else {
            throw new Error('No checkout URL returned');
        }
    } catch (err) {
        console.error('Payment error:', err);
        window.showNotification?.(err.message || window.i18n.t('pay_failed'), 'error');

        // Reset button
        payBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

// Handle success return
async function handleSuccessReturn(sessionId) {
    document.getElementById('paymentCheckout').style.display = 'none';
    document.getElementById('paymentSuccess').style.display = 'block';

    const detailsEl = document.getElementById('successDetails');

    const token = getToken();
    if (!token || !sessionId) {
        detailsEl.innerHTML = `<p>${window.i18n.t('pay_confirmed')}</p>`;
        return;
    }

    try {
        const res = await fetch(`${API_URL}/payments/session/${sessionId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const session = await res.json();

        if (session.status === 'paid') {
            const amount = (session.amountTotal / 100).toLocaleString();
            detailsEl.innerHTML = `
                <div class="payment-receipt">
                    <div class="payment-receipt-row">
                        <span>${window.i18n.t('pay_receipt_amount')}</span>
                        <span class="gradient-text price-font" style="font-size: 1.5rem;">$${amount}</span>
                    </div>
                    ${session.customerEmail ? `
                    <div class="payment-receipt-row">
                        <span>${window.i18n.t('pay_receipt_conf')}</span>
                        <span>${session.customerEmail}</span>
                    </div>` : ''}
                </div>
            `;
        }
    } catch (err) {
        console.error('Error fetching session:', err);
    }

    // Clear payment data from localStorage
    localStorage.removeItem('webocontrol_payment_data');
}

// Handle cancel return
function handleCancelReturn() {
    document.getElementById('paymentCheckout').style.display = 'none';
    document.getElementById('paymentCancelled').style.display = 'block';
}

// Update visibility based on product type
function updateVisibility(type) {
    const websiteElements = document.querySelectorAll('.website-only');
    const securityElements = document.querySelectorAll('.security-only');
    const devopsElements = document.querySelectorAll('.devops-only');

    const isWebsite = type === 'portfolio' || type === 'company' || type === 'ecommerce' || !type;

    websiteElements.forEach(el => el.style.display = isWebsite ? 'block' : 'none');
    securityElements.forEach(el => el.style.display = type === 'security' ? 'block' : 'none');
    devopsElements.forEach(el => el.style.display = type === 'devops' ? 'block' : 'none');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const sessionId = params.get('session_id');

    if (status === 'success' && sessionId) {
        handleSuccessReturn(sessionId);
    } else if (status === 'cancelled') {
        handleCancelReturn();
    } else {
        // Default: show checkout
        const data = getCartData();
        renderOrderSummary(data);

        // Update requirements visibility based on the first item
        if (data && data.items && data.items.length > 0) {
            updateVisibility(data.items[0].type);
        } else {
            updateVisibility('company'); // Default to company if no data
        }

        const payBtn = document.getElementById('payBtn');
        payBtn?.addEventListener('click', handlePayment);

        // Handle requirement form submission
        const proceedBtn = document.getElementById('proceedToPaymentBtn');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const form = document.getElementById('customerForm');

                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                if (!document.getElementById('termsAccept').checked) {
                    window.showNotification?.('Please accept the Terms & Conditions.', 'warning');
                    return;
                }

                // Determine type for data collection
                const data = getCartData();
                const type = data?.items?.[0]?.type || 'company';

                const formData = {
                    fullName: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    company: document.getElementById('company').value,
                    specialRequirements: document.getElementById('specialRequirements').value,
                    submittedAt: new Date().toISOString()
                };

                // Add website specific data
                if (type === 'portfolio' || type === 'company' || type === 'ecommerce') {
                    formData.projectDescription = document.getElementById('projectDescription').value;
                    formData.timeline = document.getElementById('timeline').value;
                    formData.industry = document.getElementById('industry').value;
                    formData.features = Array.from(document.querySelectorAll('input[name="features"]:checked')).map(cb => cb.value);
                    formData.brandColors = document.getElementById('brandColors').value;
                    formData.designStyle = document.getElementById('designStyle').value;
                }

                // Add security specific data
                if (type === 'security') {
                    formData.security_type = document.getElementById('reqSecurityType').value;
                    formData.target_url = document.getElementById('reqTargetUrl').value;
                    formData.auth_details = document.getElementById('reqAuthDetails').value;
                    formData.security_goals = document.getElementById('reqSecurityGoals').value;
                }

                // Add devops specific data
                if (type === 'devops') {
                    formData.cloud_provider = document.getElementById('reqCloudProvider').value;
                    formData.k8s_status = document.getElementById('reqK8sStatus').value;
                    formData.cicd_pipeline = document.getElementById('reqCicdPipeline').value;
                    formData.compliance_goals = document.getElementById('reqFintechCompliance').value;
                }

                localStorage.setItem('customerRequirements', JSON.stringify(formData));
                document.getElementById('customerDetailsForm').style.display = 'none';
                document.getElementById('paymentCheckout').style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }
});
