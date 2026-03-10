const fs = require('fs');
const path = require('path');

const targetDirs = [
    __dirname,
    path.join(__dirname, 'js'),
    path.join(__dirname, 'server')
];

const extensions = ['.html', '.js', '.json', '.css'];

const replacements = [
    { old: 'Codeforge', new: 'Webocontrol' },
    { old: 'CODEFORGE', new: 'WEBOCONTROL' },
    { old: 'codeforge', new: 'webocontrol' }
];

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isFile()) {
            const ext = path.extname(fullPath).toLowerCase();
            if (extensions.includes(ext) && !file.includes('rename.js')) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let initialContent = content;

                for (const rep of replacements) {
                    content = content.replaceAll(rep.old, rep.new);
                }

                if (content !== initialContent) {
                    fs.writeFileSync(fullPath, content, 'utf8');
                    console.log(`Updated: ${fullPath}`);
                }
            }
        }
    }
}

for (const dir of targetDirs) {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
}
