/**
 * split_css.js
 * Splits the massive shared.css into page-specific CSS files.
 * 
 * Strategy:
 *  - Parse the CSS into blocks (rule groups separated by blank lines)
 *  - Classify each block by selector keywords → assign to a page CSS file
 *  - Truly shared code (reset, navbar, footer, buttons) stays in shared.css
 *  - Page-specific code goes into the page CSS file
 */

const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, '..', 'frontend', 'css');
const SHARED_CSS = path.join(CSS_DIR, 'shared.css');

const original = fs.readFileSync(SHARED_CSS, 'utf8');

// ─── Page keyword mappings ─────────────────────────────────────────────────────
// Each entry: { file, keywords[] } — if ANY keyword matches a block's selectors,
// that block goes to the page CSS file
const pageRules = [
  {
    file: 'home.css',
    keywords: [
      'hero', '.home-page', 'moon-', 'moon-1','moon-2','moon-3','moon-4','moon-5',
      'orbFloat', 'particles-canvas', 'bg-aurora', 'bg-grid', 'bg-noise',
      'coin-vid', 'hero-background', 'hero-content', 'hero-badge', 'hero-title',
      'hero-subtitle', 'hero-cta', 'hero-glass', 'hero-stat', 'hero-scroll',
      'scroll-indicator', 'services-section', 'service-card', 'service-icon',
      'showcase-section', 'showcase-grid', 'showcase-item', 'showcase-tag',
      'tech-section', 'tech-grid', 'tech-card', 'tech-logo-row',
      'pricing-section', 'pricing-grid', 'pricing-card', 'pricing-badge',
      'pricing-price', 'pricing-features', 'pricing-cta',
      'testimonials-section', 'testimonial-card', 'testimonial-avatar',
      'cta-section', 'cta-content', 'cta-title', 'cta-subtitle', 'cta-buttons',
      'portfolio-section', 'portfolio-grid', 'portfolio-card', 'portfolio-overlay',
      'stats-section', 'stat-item', 'stat-number', 'stat-label',
      'features-section', 'feature-card', 'feature-icon',
      'partner-logos', 'client-logos', 'logo-row', 'logo-item',
      'floating-', 'float-card', 'device-mockup', 'browser-mockup',
      'section-header', 'section-title', 'section-subtitle', 'section-tag',
      'rotateWords', 'rotateWordsVercel', 'rotateWordsVercelFooter',
      'word-rotate', 'highlight-text', 'gradient-title',
      'preview-', 'addons-', 'ecommerce-', 'company-', 'portfolio-preview',
      'home-hero', '.moon '
    ]
  },
  {
    file: 'login.css',
    keywords: [
      'auth-body', 'login-body', 'auth-page', 'auth-card', 'auth-form',
      'auth-side', 'auth-right', 'auth-subtitle', 'auth-footer', 'auth-divider',
      'scan-line', 'login-bg', 'video-background', 'form-group', 'form-control',
      'form-message', 'hero-glow', 'word-stack', 'has-video-bg'
    ]
  },
  {
    file: 'register.css',
    keywords: [
      'register-body', 'register-page', 'register-card', 'register-form',
      'register-', 'step-indicator', 'step-', 'plan-card', 'plan-selector',
      'plan-features', 'plan-price', 'plan-badge', 'form-step',
      'password-strength', 'password-meter', 'password-requirements'
    ]
  },
  {
    file: 'dashboard.css',
    keywords: [
      'dashboard', 'sidebar', 'main-content', 'panel', 'widget',
      'order-card', 'order-status', 'order-timeline', 'status-badge',
      'progress-bar', 'metrics', 'activity-feed', 'notification',
      'user-profile', 'user-avatar', 'user-menu', 'data-table', 'data-grid',
      'chat-', 'support-chat', 'ticket-', 'chart-', 'analytics-'
    ]
  },
  {
    file: 'order.css',
    keywords: [
      'order-page', 'track-', 'tracking-', 'support-section', 'faq-',
      'accordion-', 'contact-form', 'order-form', 'order-steps',
      'track-result', 'track-input', 'order-detail', 'step-tracker',
      'contact-section', 'contact-grid', 'contact-info', 'contact-card',
      'contact-icon', 'map-embed', 'submit-btn'
    ]
  },
  {
    file: 'payment.css',
    keywords: [
      'payment-', 'checkout-', 'stripe-', 'card-element', 'card-number',
      'payment-form', 'payment-card', 'payment-summary', 'payment-method',
      'billing-', 'invoice-', 'price-breakdown', 'coupon-', 'promo-',
      'success-page', 'payment-success', 'payment-error'
    ]
  },
  {
    file: 'products.css',
    keywords: [
      'products-', 'product-', 'products-page', 'product-grid', 'product-card',
      'product-badge', 'product-price', 'product-features', 'product-cta',
      'filter-', 'sort-', 'category-', 'tag-filter', 'product-hero',
      'addon-', 'package-', 'plan-comparison', 'feature-comparison',
      'tech-stack', 'tech-pill', 'preview-tabs', 'preview-frame'
    ]
  },
  {
    file: 'about.css',
    keywords: [
      'about-', 'about-page', 'about-hero', 'team-', 'member-card',
      'mission-', 'vision-', 'values-', 'company-story', 'timeline-',
      'milestone-', 'culture-', 'office-', 'founder-', 'ceo-'
    ]
  },
  {
    file: 'about-payment.css',
    keywords: [
      'about-payment', 'payment-info', 'payment-methods', 'payment-icons',
      'payment-trust', 'security-badges', 'refund-policy', 'guarantee-'
    ]
  },
  {
    file: 'privacy.css',
    keywords: [
      'privacy-', 'privacy-page', 'policy-', 'legal-', 'legal-page',
      'legal-content', 'policy-section', 'policy-content'
    ]
  },
  {
    file: 'terms.css',
    keywords: [
      'terms-', 'terms-page', 'tos-', 'terms-section', 'terms-content',
      'agreement-'
    ]
  },
  {
    file: 'intro.css',
    keywords: [
      'intro-', 'splash-', 'loading-', 'preloader-', 'scene',
      '.scene ', '.scene.', 'glow-orb', 'big-text', 'sub-text',
      'stat-row', 'tech-pills', 'tech-pill', 'line-accent', 'wordReveal',
      'rainbowShift', 'gradient-text', 'logo-text', 'stat-num', 'stat-label',
      'cyan-text', 'purple-text', 'pink-text', 'orange-text', 'float1', 'float2',
      'intro', 'big-brand'
    ]
  }
];

// ─── CSS block parser ──────────────────────────────────────────────────────────
// Split CSS into logical blocks: @keyframes, @media, regular rules
function parseBlocks(css) {
  const blocks = [];
  let i = 0;
  let currentBlock = '';
  let depth = 0;

  while (i < css.length) {
    const char = css[i];

    if (char === '{') {
      depth++;
      currentBlock += char;
    } else if (char === '}') {
      depth--;
      currentBlock += char;
      if (depth === 0) {
        // End of a top-level block
        const trimmed = currentBlock.trim();
        if (trimmed) blocks.push(trimmed);
        currentBlock = '';
      }
    } else {
      currentBlock += char;
      // Collect comments + whitespace between blocks
      if (depth === 0 && char === '\n') {
        const trimmed = currentBlock.trim();
        // If we have accumulated just whitespace/comments (no open block yet)
        if (trimmed && !trimmed.includes('{')) {
          // Could be a comment block — keep collecting
        }
      }
    }
    i++;
  }

  // Remaining content (comments, imports etc.)
  if (currentBlock.trim()) {
    blocks.push(currentBlock.trim());
  }

  return blocks;
}

// Better approach: split by double-newline sections and brace-aware blocks
function splitIntoChunks(css) {
  // We'll collect top-level blocks by tracking brace depth
  const chunks = [];
  let chunk = '';
  let depth = 0;
  let inComment = false;
  let inString = false;

  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    const next = css[i + 1] || '';

    // Track comments
    if (!inString && ch === '/' && next === '*') {
      inComment = true;
    }
    if (inComment && ch === '*' && next === '/') {
      inComment = false;
      chunk += ch + next;
      i++;
      continue;
    }

    if (!inComment) {
      if (ch === '{') depth++;
      if (ch === '}') {
        depth--;
        chunk += ch;
        if (depth === 0) {
          const trimmed = chunk.trim();
          if (trimmed) chunks.push(trimmed);
          chunk = '';
          continue;
        }
        continue;
      }
    }

    chunk += ch;

    // Collect top-level content (depth=0) that has no braces = @import, comments
    if (depth === 0 && !inComment) {
      // Check if we're at a semicolon ending an @import or similar
      if (ch === ';') {
        const trimmed = chunk.trim();
        if (trimmed) chunks.push(trimmed);
        chunk = '';
      }
    }
  }

  if (chunk.trim()) chunks.push(chunk.trim());
  return chunks;
}

// ─── Classify a chunk ──────────────────────────────────────────────────────────
function classifyChunk(chunk) {
  const lower = chunk.toLowerCase();

  for (const page of pageRules) {
    for (const keyword of page.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return page.file;
      }
    }
  }

  return 'shared.css'; // Default: stays in shared
}

// ─── Main ──────────────────────────────────────────────────────────────────────
console.log('📖 Parsing CSS...');
const chunks = splitIntoChunks(original);
console.log(`   Found ${chunks.length} CSS chunks`);

// Separate results
const results = {
  'shared.css': [],
};

for (const r of pageRules) {
  results[r.file] = [];
}

// Always-shared preamble (imports, :root, reset)
let preambleDone = false;
const alwaysShared = [
  '@import', ':root', '*, *::before', '::-webkit-scrollbar', 'html {', 'html{',
  'body.home-page', 'body:not(.home-page)', 'body.lang-ar', 'a {', 'a{',
  'img {', 'img{', '.container {', '.container{', 'contact-icon-box',
  'navbar', 'nav-', '.btn', '.btn-', 'mobile-toggle', '.footer',
  'footer-', 'lang-btn', 'lang-switcher', 'cart-btn', 'gradientShift',
  'anim-forever-logo', 'logo-main', 'logo-subtitle', 'nav-logo'
];

for (const chunk of chunks) {
  const lower = chunk.toLowerCase();
  let destination = null;

  // Check if it should always stay shared
  for (const keyword of alwaysShared) {
    if (lower.includes(keyword.toLowerCase())) {
      destination = 'shared.css';
      break;
    }
  }

  if (!destination) {
    destination = classifyChunk(chunk);
  }

  results[destination].push(chunk);
}

// ─── Write output files ────────────────────────────────────────────────────────
let totalMoved = 0;

for (const [filename, chunks_] of Object.entries(results)) {
  if (filename === 'shared.css') continue; // We'll write shared last
  if (chunks_.length === 0) continue;

  const content = chunks_.join('\n\n');
  const filePath = path.join(CSS_DIR, filename);

  // Prepend header to page CSS files
  const header = `/* ============================================
   WEBOCONTROL — ${filename.replace('.css', '').replace('-', ' ').toUpperCase()} Page Styles
   Shared/base styles: css/shared.css
   ============================================ */\n\n`;

  // If file already has our placeholder comment, replace it; otherwise prepend
  const existingContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  fs.writeFileSync(filePath, header + content + '\n', 'utf8');
  console.log(`✅ Written ${chunks_.length} blocks → ${filename}`);
  totalMoved += chunks_.length;
}

// Write the new (smaller) shared.css
const sharedContent = results['shared.css'].join('\n\n');
const sharedHeader = `/* ============================================
   WEBOCONTROL — Shared / Base Design System
   Includes: variables, reset, scrollbar, navbar, buttons, footer
   Page-specific styles are in their own CSS files.
   ============================================ */\n\n`;
fs.writeFileSync(SHARED_CSS, sharedHeader + sharedContent + '\n', 'utf8');

const newSharedLines = (sharedHeader + sharedContent).split('\n').length;
const originalLines = original.split('\n').length;
console.log(`\n✅ Rewrote shared.css: ${originalLines} → ${newSharedLines} lines`);
console.log(`✅ Distributed ${totalMoved} blocks across page CSS files`);
console.log('\n🎉 CSS split complete!');
