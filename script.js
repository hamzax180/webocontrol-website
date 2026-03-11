const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\hamza\\OneDrive\\Desktop\\TOP IMPORTANT FOLDER\\my company\\frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let updated = 0;
files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // We want to match:
    // (About Us line)
    // (Tech line)
    // and swap them
    // Note: The Tech line could be technology.html or technology_fiverr.html
    
    const regex = /([\t ]*<li><a href="\/frontend\/about\.html"[^>]*>.*?<\/a><\/li>\r?\n)([\t ]*<li><a href="\/frontend\/technology(?:_fiverr)?\.html"[^>]*>.*?<\/a><\/li>\r?\n?)/g;
    
    const originalContent = content;
    content = content.replace(regex, '$2$1');
    
    if (originalContent !== content) {
        fs.writeFileSync(path.join(dir, file), content);
        console.log(`Updated ${file}`);
        updated++;
    }
});
console.log(`Total files updated: ${updated}`);
