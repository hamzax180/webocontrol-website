const fs = require('fs');
let html = fs.readFileSync('frontend/home.html', 'utf8');

function extractAndMove(html, idToDrop, containerClass) {
    const startStr = `<div class="tech-logos-section" id="${idToDrop}"`;
    const startIdx = html.indexOf(startStr);
    if (startIdx === -1) return html;

    // Find the end of this div
    let openDivs = 0;
    let endIdx = -1;
    let i = startIdx;
    while (i < html.length) {
        if (html.substring(i, i+4) === '<div') openDivs++;
        if (html.substring(i, i+5) === '</div') openDivs--;
        if (html.substring(i, i+6) === '</div>') {
            if (openDivs === 0) {
                endIdx = i + 6;
                break;
            }
        }
        i++;
    }

    if (endIdx === -1) return html;

    const extracted = html.substring(startIdx, endIdx);
    
    // Remove from original
    html = html.substring(0, startIdx) + html.substring(endIdx);

    // Find the end of the container div that it was inside of
    // Since we just removed it, the next </div> closes the showcase-grid
    const gridEndIdx = html.indexOf('</div>', startIdx);
    if (gridEndIdx !== -1) {
        html = html.substring(0, gridEndIdx + 6) + '\n' + extracted + '\n' + html.substring(gridEndIdx + 6);
    }

    return html;
}

html = extractAndMove(html, 'aiTechLogos', 'showcase-grid');
html = extractAndMove(html, 'infraTechLogos', 'addons-showcase');

fs.writeFileSync('frontend/home.html', html);
console.log('Fixed overlapping logos by moving them outside the grid containers.');
