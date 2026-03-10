const fs = require('fs').promises;
const path = require('path');

async function updateBrandColor(filePath) {
    try {
        let content = await fs.readFile(filePath, 'utf8');
        let initialContent = content;

        // Replace Webocontrol with Webo<span class="brand-control">control</span> in the big-brand-text div
        // Narrow the match to the div with class big-brand-text
        const brandDivRegex = /(<div class="big-brand-text" id="bigBrandText">)Webocontrol(<\/div>)/g;
        content = content.replace(brandDivRegex, '$1Webo<span class="brand-control">control</span>$2');

        if (content !== initialContent) {
            await fs.writeFile(filePath, content, 'utf8');
            console.log(`Updated brand color in: ${filePath}`);
        }
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

async function main() {
    const files = [
        'index.html',
        'about.html',
        'products.html',
        'order.html',
        'terms.html',
        'privacy.html',
        'payment.html',
        'login.html',
        'register.html',
        'dashboard.html',
        'about_payment.html'
    ];

    for (const file of files) {
        const fullPath = path.join(__dirname, file);
        await updateBrandColor(fullPath);
    }
}

main();
