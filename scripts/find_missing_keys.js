
const fs = require('fs');
const path = require('path');

const i18nPath = 'c:\\Users\\hamza\\OneDrive\\Desktop\\TOP IMPORTANT FOLDER\\my company\\js\\i18n.js';
const frontendDir = 'c:\\Users\\hamza\\OneDrive\\Desktop\\TOP IMPORTANT FOLDER\\my company\\frontend';

const i18nContent = fs.readFileSync(i18nPath, 'utf8');

// Extract keys from en section
const enMatch = i18nContent.match(/en: \{([\s\S]*?)\},/);
const arMatch = i18nContent.match(/ar: \{([\s\S]*?)\}/);

function extractKeys(content) {
    const keys = new Set();
    const lines = content.split('\n');
    lines.forEach(line => {
        const keyMatch = line.match(/^\s*([\w']+):/);
        if (keyMatch) {
            keys.add(keyMatch[1].replace(/'/g, ''));
        }
    });
    return keys;
}

const enKeys = extractKeys(enMatch[1]);
const arKeys = extractKeys(arMatch[1]);

const htmlFiles = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));

const foundKeys = new Set();
htmlFiles.forEach(file => {
    const content = fs.readFileSync(path.join(frontendDir, file), 'utf8');
    const matches = content.matchAll(/data-i18n="([^"]*)"/g);
    for (const match of matches) {
        foundKeys.add(match[1]);
    }
});

console.log("Keys found in HTML but missing in i18n.js (en):");
const missingInEn = Array.from(foundKeys).filter(key => !enKeys.has(key));
console.log(missingInEn);

console.log("\nKeys present in en but missing in ar:");
const missingInAr = Array.from(enKeys).filter(key => !arKeys.has(key));
console.log(missingInAr);
