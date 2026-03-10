const fs = require('fs').promises;
const path = require('path');

async function updateFooter(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');

    // Match the brand mini section
    const brandRegex = /<div class="footer-brand-mini"[\s\S]*?>[\s\S]*?<\/div>/;
    const newBrand = `<div class="footer-brand-mini" style="display: flex; align-items: center; justify-content: center;">
                    <span style="font-weight: 500; font-size: 1.1rem; color: #202124;">Webocontrol</span>
                </div>`;

    // Match the legal links section
    const legalRegex = /<div class="footer-legal"[\s\S]*?>[\s\S]*?<\/div>/;
    const newLegal = `<div class="footer-legal" style="justify-content: center; margin-top: 10px; display: flex; gap: 20px;">
                    <a href="/payment_model.html">Payment Model</a>
                    <a href="/products.html">Our Work</a>
                    <a href="/privacy.html">Privacy</a>
                    <a href="/terms.html">Terms</a>
                </div>`;

    content = content.replace(brandRegex, newBrand);
    content = content.replace(legalRegex, newLegal);

    await fs.writeFile(filePath, content, 'utf8');
    console.log(`Updated footer in: ${filePath}`);
  } catch (err) {
    console.error(`Error updating ${filePath}:`, err);
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
    'payment_model.html'
  ];

  for (const file of files) {
    const fullPath = path.join(__dirname, file);
    await updateFooter(fullPath);
  }
}

main();
