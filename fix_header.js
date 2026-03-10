const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const oldLogoRegex = /<a href=\"\/\" class=\"nav-logo\">\s*<div class=\"logo-icon\">⚡<\/div>\s*WEBOCONTROL\s*<\/a>/g;

const newLogo = `<a href="/" class="nav-logo" style="gap: 8px; align-items: center; text-decoration: none;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 20H7.5L12 11L16.5 20H21L12 2Z" fill="url(#antigravity-grad)"/>
                    <defs>
                        <linearGradient id="antigravity-grad" x1="3" y1="20" x2="21" y2="2" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stop-color="#4285F4"/>
                            <stop offset="50%" stop-color="#EA4335"/>
                            <stop offset="100%" stop-color="#FBBC05"/>
                        </linearGradient>
                    </defs>
                </svg>
                <div style="display: flex; align-items: center; letter-spacing: -0.5px;">
                    <span style="font-weight: 500; font-size: 1.1rem; color: #202124;">Webocontrol</span>
                </div>
            </a>`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.match(oldLogoRegex)) {
        content = content.replace(oldLogoRegex, newLogo);
        changed = true;
    }

    const supportRegex = /<li><a href="\/order\.html"([^>]*)data-i18n="order_title">Support<\/a><\/li>/g;
    if (content.match(supportRegex)) {
        content = content.replace(supportRegex, '<li><a href="/order.html#support"$1data-i18n="nav_support">Support</a></li>');
        changed = true;
    }

    // Replace in footer as well
    const footerBrandRegex = /<a href=\"\/\" class=\"nav-logo\">\s*<div class=\"logo-icon\">⚡<\/div>\s*WEBOCONTROL\s*<\/a>/g;
    if (content.match(footerBrandRegex)) {
        content = content.replace(footerBrandRegex, newLogo);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
});
