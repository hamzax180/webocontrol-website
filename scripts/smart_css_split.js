const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, '..', 'frontend', 'css');
const SHARED = path.join(CSS_DIR, 'shared.css');

const content = fs.readFileSync(SHARED, 'utf8');
const lines = content.split('\n');

function findSection(searchStr) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchStr)) {
      let start = i;
      while (start > 0 && !lines[start].includes('/*')) start--;
      return start;
    }
  }
  return -1;
}

// Map exactly where specific sections start
// These string literals MUST match the CSS comments exactly
const markers = [
  { str: 'HERO SECTION', file: 'home.css' },
  { str: 'SERVICES SECTION', file: 'home.css' },
  { str: 'PORTFOLIO GALLERY', file: 'shared' }, // used by products
  { str: 'GITHUB PROJECTS SECTION', file: 'shared' }, // product-card used by products
  { str: 'ABOUT SECTION', file: 'about.css' },
  { str: 'ORDER / CONTACT SECTION', file: 'order.css' },
  { str: 'TESTIMONIALS', file: 'home.css' },
  { str: 'FOOTER', file: 'shared' },
  { str: 'AUTH PAGES (Premium Light Glass)', file: 'login.css' },
  { str: 'DASHBOARD', file: 'dashboard.css' }, // 4733
  { str: 'SCROLL REVEAL', file: 'shared' }, // 5266
  { str: 'INTRO SCENES BACKGROUND ORBS', file: 'intro.css' },
  { str: 'PAYMENT PAGE', file: 'payment.css' },
  { str: 'CUSTOMER FORM STYLES', file: 'order.css' }, // order + payment
  { str: 'PHOTO UPLOAD STYLES', file: 'order.css' },
  { str: 'PREMIUM DASHBOARD UPGRADE', file: 'dashboard.css' },
  { str: 'SCALING SECTION', file: 'home.css' }, // Addons
  { str: 'CUSTOMER DASHBOARD', file: 'dashboard.css' },
  { str: 'TECHNOLOGIES WE USE', file: 'shared' }, // products + home
  { str: 'ABOUT PAYMENT PAGE', file: 'about-payment.css' },
  { str: 'FIXED VIDEO BACKGROUNDS', file: 'shared' },
  { str: 'AUTH PAGES — Login & Register', file: 'login.css' },
  { str: 'Side Marketing Text for Auth Pages', file: 'login.css' }
];

let boundaries = markers.map(m => ({
  name: m.str,
  file: m.file,
  line: findSection(m.str)
})).filter(m => m.line !== -1);

boundaries.sort((a, b) => a.line - b.line);

// Also we must preserve `.hero-glow` in shared.css because login uses it
// Let's find hero-glow
const heroGlowIdx = lines.findIndex(l => l.includes('.hero-glow {'));

let outputs = { shared: [] };
boundaries.forEach(b => { if(!outputs[b.file]) outputs[b.file] = []; });

// Preamble goes to shared
outputs.shared.push(...lines.slice(0, boundaries[0].line));

for (let i = 0; i < boundaries.length; i++) {
  const b = boundaries[i];
  const nextLine = i < boundaries.length - 1 ? boundaries[i+1].line : lines.length;
  const chunk = lines.slice(b.line, nextLine);
  
  if (b.name === 'HERO SECTION') {
    // extract hero-glow blocks which are in middle of HERO SECTION to shared
    const localLines = [...chunk];
    const extractedHeroGlow = [];
    const nonHeroGlow = [];
    let inHeroGlow = false;
    for (let j = 0; j < localLines.length; j++) {
      if (localLines[j].includes('hero-glow')) inHeroGlow = true;
      if (inHeroGlow) {
        extractedHeroGlow.push(localLines[j]);
        if (localLines[j] === '}') {
          if(!localLines[j+1] || !localLines[j+1].includes('hero-glow')) {
             inHeroGlow = false; // end of a hero glow block
          }
        }
      } else {
        nonHeroGlow.push(localLines[j]);
      }
    }
    // We will just push BOTH to shared if it's too risky. 
    // Actually, let's just push HERO SECTION to home.css and hero-glow will go with it?
    // No, login needs hero-glow! We'll just append extractedHeroGlow to shared.
    outputs.shared.push(...extractedHeroGlow);
    outputs[b.file].push(...nonHeroGlow);
  } else {
    outputs[b.file].push(...chunk);
  }
}

// Write shared
fs.writeFileSync(SHARED, outputs.shared.join('\n'), 'utf8');
console.log(`✅ shared.css -> ${outputs.shared.length} lines`);

// Write others
const fileHeaders = {
  'home.css': 'Home Page',
  'login.css': 'Auth Pages',
  'dashboard.css': 'Dashboard',
  'order.css': 'Order / Support',
  'payment.css': 'Payment',
  'about.css': 'About Us',
  'about-payment.css': 'About Payment',
  'intro.css': 'Intro',
  'products.css': 'Products',
};

for (const [file, lns] of Object.entries(outputs)) {
  if (file === 'shared' || lns.length === 0) continue;
  const outPath = path.join(CSS_DIR, file);
  const header = `/* ============================================
   WEBOCONTROL — ${fileHeaders[file] || file}
   ============================================ */\n\n`;
  fs.writeFileSync(outPath, header + lns.join('\n'), 'utf8');
  console.log(`✅ ${file} -> ${lns.length} lines`);
}
