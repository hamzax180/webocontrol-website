
const fs = require('fs');

const i18nPath = 'c:\\Users\\hamza\\OneDrive\\Desktop\\TOP IMPORTANT FOLDER\\my company\\js\\i18n.js';
const content = fs.readFileSync(i18nPath, 'utf8');

const enMatch = content.match(/en: \{([\s\S]*?)\},/);
const arMatch = content.match(/ar: \{([\s\S]*?)\}/);

function extractTranslations(section) {
    const trans = {};
    const lines = section.split('\n');
    lines.forEach(line => {
        const match = line.match(/^\s*([\w']+):\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'),?/);
        if (match) {
            const key = match[1].replace(/'/g, '');
            let val = match[2];
            val = val.substring(1, val.length - 1).replace(/\\"/g, '"').replace(/\\'/g, "'");
            trans[key] = val;
        }
    });
    return trans;
}

const enTrans = extractTranslations(enMatch[1]);
const arTrans = extractTranslations(arMatch[1]);

const missingInAr = {};
for (const key in enTrans) {
    if (!arTrans.hasOwnProperty(key)) {
        missingInAr[key] = enTrans[key];
    }
}

console.log(JSON.stringify(missingInAr, null, 2));
