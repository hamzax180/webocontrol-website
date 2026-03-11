
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('c:\\Users\\hamza\\OneDrive\\Desktop\\TOP IMPORTANT FOLDER\\my company\\js\\i18n.js', 'utf8');

// Use regex to extract the translations object. This is a bit hacky but should work for this file.
const enMatch = content.match(/en: \{([\s\S]*?)\},/);
const arMatch = content.match(/ar: \{([\s\S]*?)\}/);

if (!enMatch || !arMatch) {
    console.log("Could not find en or ar translations");
    process.exit(1);
}

function extractKeys(match) {
    const keys = [];
    const lines = match[1].split('\n');
    lines.forEach(line => {
        const keyMatch = line.match(/^\s*([\w']+):/);
        if (keyMatch) {
            keys.push(keyMatch[1].replace(/'/g, ''));
        }
    });
    return keys;
}

const enKeys = extractKeys(enMatch);
const arKeys = extractKeys(arMatch);

const missingInAr = enKeys.filter(key => !arKeys.includes(key));
const missingInEn = arKeys.filter(key => !enKeys.includes(key));

console.log("Missing in AR:", missingInAr);
// console.log("Missing in EN:", missingInEn);
