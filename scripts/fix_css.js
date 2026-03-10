const fs = require('fs');
const path = 'index.css';
let content = fs.readFileSync(path);
let str = content.toString('utf8');

// Find the first null byte and truncate string there
let idx = str.indexOf('\x00');
if (idx !== -1) {
    console.log("Found null bytes at index " + idx + ", truncating...");
    // find the start of the bad append, let's just go back to the last closing brace and ensure it's clean
    let cleanStr = str.substring(0, idx);

    // Add the missing CSS styles properly
    cleanStr += `
.product-image-container.white-bg-image {
  background-color: #ffffff !important;
  padding: 20px;
  object-fit: contain;
}
.product-image-container.white-bg-image img {
  object-fit: contain !important;
}

.addons-showcase {
  display: flex !important;
  justify-content: center !important;
  gap: 30px;
  flex-wrap: wrap;
}
`;
    fs.writeFileSync(path, cleanStr, 'utf8');
    console.log("Successfully cleaned and updated index.css");
} else {
    console.log("No null bytes found.");
    // Also inject .addons-showcase if it does not exist
    if (!str.includes('.addons-showcase')) {
        str += `

.addons-showcase {
  display: flex !important;
  justify-content: center !important;
  gap: 30px;
  flex-wrap: wrap;
}
`;
        fs.writeFileSync(path, str, 'utf8');
    }
}
