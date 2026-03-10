const fs = require('fs').promises;
const path = require('path');

async function cleanupNavbar(filePath) {
    try {
        let content = await fs.readFile(filePath, 'utf8');
        let initialContent = content;

        // Regex to target the "Google Webocontrol" text block and the "Software Company" subtitle
        // This targets the specific structure found in the nav-logo link.
        const logoTextRegex = /<div style="display: flex; align-items: center; letter-spacing: -0.5px;">\s*<span style="font-weight: 500; font-size: 1.25rem;">Google<\/span>\s*<span style="font-weight: 300; font-size: 1.25rem; margin-left: 6px;">Webocontrol<\/span>\s*<\/div>\s*<\/div>\s*<div class="logo-subtitle">Software Company<\/div>/g;

        // Alternative version for "Codeforge" in case any were missed
        const legacyTextRegex = /<div style="display: flex; align-items: center; letter-spacing: -0.5px;">\s*<span style="font-weight: 500; font-size: 1.25rem;">Google<\/span>\s*<span style="font-weight: 300; font-size: 1.25rem; margin-left: 6px;">Codeforge<\/span>\s*<\/div>\s*<\/div>\s*<div class="logo-subtitle">Software Company<\/div>/g;

        content = content.replace(logoTextRegex, '</div>');
        content = content.replace(legacyTextRegex, '</div>');

        if (content !== initialContent) {
            await fs.writeFile(filePath, content, 'utf8');
            console.log(`Cleaned navbar in: ${filePath}`);
        }
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

async function main() {
    const files = [
        'about.html',
        'products.html',
        'order.html',
        'terms.html',
        'privacy.html',
        'payment.html',
        'login.html',
        'register.html',
        'dashboard.html'
    ];

    for (const file of files) {
        const fullPath = path.join(__dirname, file);
        await cleanupNavbar(fullPath);
    }
}

main();
