/**
 * migrate_structure.js
 * Professional folder reorganization for WEBOCONTROL website
 * 
 * Structure:
 *   frontend/   ← HTML + CSS
 *   backend/    ← server/ code (Express API)
 *   js/         ← Frontend JavaScript (unchanged)
 *   public/     ← Images + MP4s (from images/)
 *   scripts/    ← Utility scripts
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ─── STEP 1: Create new directories ───────────────────────────────────────────
function mkdirSafe(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created: ${path.relative(ROOT, dir)}`);
  }
}

mkdirSafe(path.join(ROOT, 'frontend'));
mkdirSafe(path.join(ROOT, 'public'));
// backend/ will be created by moving server/

// ─── STEP 2: Move HTML files → frontend/ ──────────────────────────────────────
const htmlFiles = [
  'index.html', 'login.html', 'register.html', 'dashboard.html',
  'order.html', 'payment.html', 'about.html', 'about_payment.html',
  'products.html', 'privacy.html', 'terms.html', 'intro.html'
];

for (const file of htmlFiles) {
  const src = path.join(ROOT, file);
  const dest = path.join(ROOT, 'frontend', file);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`✅ Moved: ${file} → frontend/${file}`);
  }
}

// ─── STEP 3: Move index.css → frontend/ ───────────────────────────────────────
const cssSrc = path.join(ROOT, 'index.css');
const cssDest = path.join(ROOT, 'frontend', 'index.css');
if (fs.existsSync(cssSrc)) {
  fs.renameSync(cssSrc, cssDest);
  console.log('✅ Moved: index.css → frontend/index.css');
}

// ─── STEP 4: Move images/ → public/ (including all subfolders) ────────────────
function moveDir(src, dest) {
  if (!fs.existsSync(src)) return;
  mkdirSafe(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      moveDir(srcPath, destPath);
    } else {
      fs.renameSync(srcPath, destPath);
      console.log(`✅ Moved: images/${entry.name} → public/${entry.name}`);
    }
  }
  fs.rmdirSync(src);
}

moveDir(path.join(ROOT, 'images'), path.join(ROOT, 'public'));

// ─── STEP 5: Move server/ → backend/ ──────────────────────────────────────────
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  mkdirSafe(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.renameSync(srcPath, destPath);
    }
  }
  try { fs.rmdirSync(src); } catch(e) {}
}

copyDir(path.join(ROOT, 'server'), path.join(ROOT, 'backend'));
console.log('✅ Moved: server/ → backend/');

// ─── STEP 6: Move utility scripts to scripts/ ─────────────────────────────────
const utilScripts = [
  'cleanup_navbar.js', 'fix_css.js', 'fix_db.js', 'fix_header.js',
  'prev_revert.js', 'rename.js', 'replace.js', 'update_brand_color.js',
  'update_footer.js', 'user_check.js'
];

mkdirSafe(path.join(ROOT, 'scripts'));
for (const file of utilScripts) {
  const src = path.join(ROOT, file);
  const dest = path.join(ROOT, 'scripts', file);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`✅ Moved: ${file} → scripts/${file}`);
  }
}

// ─── STEP 7: Update path references in all HTML files ─────────────────────────
// Pages that exist (for nav link updates)
const pages = [
  'index.html', 'login.html', 'register.html', 'dashboard.html',
  'order.html', 'payment.html', 'about.html', 'about_payment.html',
  'products.html', 'privacy.html', 'terms.html', 'intro.html'
];

function updateHtmlPaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. CSS reference
  content = content.replace(/href="\/index\.css"/g, 'href="/frontend/index.css"');

  // 2. Images → public
  content = content.replace(/\/images\//g, '/public/');

  // 3. Page nav links: href="/xxx.html" → href="/frontend/xxx.html"
  //    But NOT external URLs, NOT #anchors, NOT already /frontend/ prefixed
  content = content.replace(
    /href="\/(?!frontend\/)(?!api\/)(?!#)([\w-]+\.html(?:#[\w-]*)?)"/g,
    (match, page) => `href="/frontend/${page}"`
  );

  // 4. href="/" → href="/frontend/"
  content = content.replace(/href="\/"/g, 'href="/frontend/"');

  // 5. source src="/images/..." → "/public/..."  (video sources)
  content = content.replace(/src="\/images\//g, 'src="/public/');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated paths in: frontend/${path.basename(filePath)}`);
  }
}

const frontendDir = path.join(ROOT, 'frontend');
for (const file of fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'))) {
  updateHtmlPaths(path.join(frontendDir, file));
}

// ─── STEP 8: Update vite.config.js ────────────────────────────────────────────
const viteConfig = `import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'frontend/index.html'),
        login: resolve(__dirname, 'frontend/login.html'),
        register: resolve(__dirname, 'frontend/register.html'),
        dashboard: resolve(__dirname, 'frontend/dashboard.html'),
        about: resolve(__dirname, 'frontend/about.html'),
        order: resolve(__dirname, 'frontend/order.html'),
        products: resolve(__dirname, 'frontend/products.html'),
        payment: resolve(__dirname, 'frontend/payment.html'),
        privacy: resolve(__dirname, 'frontend/privacy.html'),
        terms: resolve(__dirname, 'frontend/terms.html'),
        intro: resolve(__dirname, 'frontend/intro.html'),
        about_payment: resolve(__dirname, 'frontend/about_payment.html'),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});
`;
fs.writeFileSync(path.join(ROOT, 'vite.config.js'), viteConfig, 'utf8');
console.log('✅ Updated: vite.config.js');

// ─── STEP 9: Update package.json (server → backend) ──────────────────────────
const pkgPath = path.join(ROOT, 'package.json');
let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.main = 'backend/index.js';
pkg.scripts.server = 'node backend/index.js';
pkg.scripts.start = 'node backend/index.js';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('✅ Updated: package.json');

// ─── Done ──────────────────────────────────────────────────────────────────────
console.log('\n🎉 Migration complete! New structure:');
console.log('  frontend/  ← HTML + CSS');
console.log('  backend/   ← Express API (was server/)');
console.log('  js/        ← Frontend JavaScript');
console.log('  public/    ← Images + MP4s (was images/)');
console.log('  scripts/   ← Utility scripts');
