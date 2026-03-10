/**
 * setup_page_css.js
 * Creates individual CSS files for each HTML page under frontend/css/
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');
const CSS_DIR = path.join(FRONTEND, 'css');

// Create css/ directory
if (!fs.existsSync(CSS_DIR)) {
  fs.mkdirSync(CSS_DIR, { recursive: true });
  console.log('✅ Created: frontend/css/');
}

// Move index.css → css/shared.css
const sharedSrc = path.join(FRONTEND, 'index.css');
const sharedDest = path.join(CSS_DIR, 'shared.css');
if (fs.existsSync(sharedSrc)) {
  fs.renameSync(sharedSrc, sharedDest);
  console.log('✅ Moved: frontend/index.css → frontend/css/shared.css');
}

// Page → CSS file name mapping
const pages = [
  { html: 'index.html',         css: 'home.css',           comment: 'Home / Landing Page' },
  { html: 'login.html',         css: 'login.css',          comment: 'Login Page' },
  { html: 'register.html',      css: 'register.css',       comment: 'Register Page' },
  { html: 'dashboard.html',     css: 'dashboard.css',      comment: 'Dashboard Page' },
  { html: 'order.html',         css: 'order.css',          comment: 'Order / Support Page' },
  { html: 'payment.html',       css: 'payment.css',        comment: 'Payment Page' },
  { html: 'about.html',         css: 'about.css',          comment: 'About Us Page' },
  { html: 'about_payment.html', css: 'about-payment.css',  comment: 'About Payment Page' },
  { html: 'products.html',      css: 'products.css',       comment: 'Products Page' },
  { html: 'privacy.html',       css: 'privacy.css',        comment: 'Privacy Policy Page' },
  { html: 'terms.html',         css: 'terms.css',          comment: 'Terms of Service Page' },
  { html: 'intro.html',         css: 'intro.css',          comment: 'Intro / Splash Page' },
];

// Create individual CSS files
for (const { css, comment, html } of pages) {
  const cssPath = path.join(CSS_DIR, css);
  if (!fs.existsSync(cssPath)) {
    const content = `/* ============================================
   WEBOCONTROL — ${comment}
   Page-specific styles for ${html}
   Shared/base styles are in: css/shared.css
   ============================================ */\n`;
    fs.writeFileSync(cssPath, content, 'utf8');
    console.log(`✅ Created: frontend/css/${css}`);
  }
}

// Update each HTML file: replace /frontend/index.css with shared.css + page CSS
for (const { html, css } of pages) {
  const htmlPath = path.join(FRONTEND, html);
  if (!fs.existsSync(htmlPath)) continue;

  let content = fs.readFileSync(htmlPath, 'utf8');
  let changed = false;

  // Replace the old shared link and insert page link after it
  const sharedLinkNew = `<link rel="stylesheet" href="/frontend/css/shared.css">`;
  const pageLinkTag = `\n    <link rel="stylesheet" href="/frontend/css/${css}">`;

  if (content.includes('href="/frontend/index.css"')) {
    content = content.replace(
      `<link rel="stylesheet" href="/frontend/index.css">`,
      sharedLinkNew + pageLinkTag
    );
    changed = true;
  } else if (content.includes('href="/frontend/css/shared.css"') && !content.includes(`href="/frontend/css/${css}"`)) {
    content = content.replace(
      sharedLinkNew,
      sharedLinkNew + pageLinkTag
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(htmlPath, content, 'utf8');
    console.log(`✅ Updated ${html} → shared.css + ${css}`);
  }
}

console.log('\n🎉 Done! CSS structure:');
console.log('  frontend/css/shared.css        ← all shared/base styles');
pages.forEach(p => console.log(`  frontend/css/${p.css.padEnd(22)} ← ${p.html}`));
