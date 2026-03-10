/**
 * split_by_sections.js
 * Splits shared.css into page CSS files using section comment boundaries.
 * Uses TEXT MATCHING (not CSS parsing) — safe, no corruption.
 */

const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, '..', 'frontend', 'css');
const SHARED = path.join(CSS_DIR, 'shared.css');

const content = fs.readFileSync(SHARED, 'utf8');
const lines = content.split('\n');

// ─── Find the line index of a section by its name text ─────────────────────────
function findSection(name) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(name)) {
      // Walk back to find the opening /* line
      let start = i;
      while (start > 0 && !lines[start].includes('/*')) start--;
      return start;
    }
  }
  return -1;
}

// ─── Section boundary map ───────────────────────────────────────────────────────
// Each entry: { name, file } — sections in file-order
// 'shared' means keep in shared.css
const SECTIONS = [
  { name: 'HERO SECTION',                      file: 'home.css'          },
  { name: 'SECTION STYLES',                    file: 'shared'            },
  { name: 'SERVICES SECTION',                  file: 'home.css'          },
  { name: 'PORTFOLIO GALLERY',                 file: 'home.css'          },
  { name: 'PRESS PREVIEW THUMBNAIL GRID',      file: 'home.css'          },
  { name: 'GITHUB PROJECTS SECTION',           file: 'home.css'          },
  { name: 'ABOUT SECTION',                     file: 'home.css'          },
  { name: 'AI INTELLIGENCE HUB CARD',          file: 'home.css'          },
  { name: 'CLOUD ARCHITECTURE CARD',           file: 'home.css'          },
  { name: 'SECURITY CARD',                     file: 'home.css'          },
  { name: 'ORDER / CONTACT SECTION',           file: 'order.css'         },
  { name: 'TESTIMONIALS',                      file: 'home.css'          },
  { name: 'FOOTER',                            file: 'shared'            },
  { name: 'AUTH PAGES',                        file: 'login.css'         },
  { name: 'DASHBOARD',                         file: 'dashboard.css'     },
  { name: 'ORDER PREVIEW GALLERY',             file: 'order.css'         },
  { name: 'SCROLL REVEAL',                     file: 'shared'            },
  { name: 'RESPONSIVE',                        file: 'shared'            },
  { name: 'NOTIFICATION SYSTEM',               file: 'shared'            },
  { name: 'REQUIREMENTS FORM STYLES',          file: 'order.css'         },
  { name: 'SCROLL INDICATOR',                  file: 'shared'            },
  { name: 'INTRO SCENES BACKGROUND ORBS',      file: 'intro.css'         },
  { name: 'INTRO SCENES SECTION',              file: 'intro.css'         },
  { name: 'PAYMENT PAGE',                      file: 'payment.css'       },
  { name: 'CUSTOMER FORM STYLES',              file: 'order.css'         },
  { name: 'PHOTO UPLOAD STYLES',               file: 'order.css'         },
  { name: 'PREMIUM DASHBOARD UPGRADE',         file: 'dashboard.css'     },
  { name: 'SCALING SECTION',                   file: 'about.css'         },
  { name: 'CUSTOMER DASHBOARD',                file: 'dashboard.css'     },
  { name: 'TECHNOLOGIES WE USE',               file: 'home.css'          },
  { name: 'ABOUT PAYMENT PAGE',                file: 'about-payment.css' },
  { name: 'FIXED VIDEO BACKGROUNDS',           file: 'shared'            },
];

// ─── Locate all section start lines ────────────────────────────────────────────
const boundaries = [];
for (const sec of SECTIONS) {
  const idx = findSection(sec.name);
  if (idx === -1) {
    console.warn(`⚠️  Section not found: "${sec.name}"`);
    continue;
  }
  boundaries.push({ name: sec.name, file: sec.file, startLine: idx });
}

// Sort by line order (should already be in order but let's be safe)
boundaries.sort((a, b) => a.startLine - b.startLine);

// ─── Build output buckets ───────────────────────────────────────────────────────
const outputs = {}; // file → string[]

function appendLines(file, lineArr) {
  if (!outputs[file]) outputs[file] = [];
  outputs[file].push(...lineArr);
}

// Everything before the first section stays in shared
const firstBoundary = boundaries[0].startLine;
appendLines('shared', lines.slice(0, firstBoundary));

// Extract each section
for (let i = 0; i < boundaries.length; i++) {
  const sec = boundaries[i];
  const sectionLines = boundaries[i + 1]
    ? lines.slice(sec.startLine, boundaries[i + 1].startLine)
    : lines.slice(sec.startLine);

  if (sec.file === 'shared') {
    appendLines('shared', sectionLines);
  } else {
    appendLines(sec.file, sectionLines);
  }
}

// ─── Write output files ─────────────────────────────────────────────────────────
// Write shared.css
const sharedOut = outputs['shared'].join('\n');
fs.writeFileSync(SHARED, sharedOut, 'utf8');
console.log(`✅ shared.css → ${sharedOut.split('\n').length} lines`);

// Write page CSS files
const fileHeaders = {
  'home.css':          'Home Page (index.html)',
  'login.css':         'Auth Pages (login.html + register.html)',
  'register.css':      'Register Page (register.html)',
  'dashboard.css':     'Dashboard (dashboard.html)',
  'order.css':         'Order / Support (order.html)',
  'payment.css':       'Payment (payment.html)',
  'about.css':         'About Us (about.html)',
  'about-payment.css': 'About Payment (about_payment.html)',
  'intro.css':         'Intro / Splash (intro.html)',
  'products.css':      'Products (products.html)',
  'privacy.css':       'Privacy Policy (privacy.html)',
  'terms.css':         'Terms of Service (terms.html)',
};

for (const [file, lineArr] of Object.entries(outputs)) {
  if (file === 'shared') continue;
  const header = `/* ============================================
   WEBOCONTROL — ${fileHeaders[file] || file}
   ============================================ */\n\n`;
  const outPath = path.join(CSS_DIR, file);
  fs.writeFileSync(outPath, header + lineArr.join('\n'), 'utf8');
  console.log(`✅ ${file} → ${lineArr.length} lines`);
}

// Also copy auth styles to register.css since register uses them too
if (outputs['login.css']) {
  const regHeader = `/* ============================================
   WEBOCONTROL — Register Page (register.html)
   Auth styles are shared with login — see login.css
   ============================================ */\n\n/* Auth styles imported via login.css */\n`;
  fs.writeFileSync(path.join(CSS_DIR, 'register.css'), regHeader, 'utf8');
  console.log('✅ register.css → note (auth styles in login.css)');
}

console.log('\n🎉 CSS split complete by section!');
