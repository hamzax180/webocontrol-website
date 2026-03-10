const fs = require('fs').promises;

const oldContent = `          <div style="display: flex; align-items: center; letter-spacing: -0.5px;">
            <span style="font-weight: 500; font-size: 1.25rem;">Google</span>
            <span style="font-weight: 300; font-size: 1.25rem; margin-left: 6px;">Webocontrol</span>
          </div>
        </div>
        <div class="logo-subtitle">Software Company</div>`;

const newContent = `        </div>`;

const oldContent2 = `          <div style="display: flex; align-items: center; letter-spacing: -0.5px;">
                        <span style="font-weight: 500; font-size: 1.25rem;">Google</span>
                        <span style="font-weight: 300; font-size: 1.25rem; margin-left: 6px;">Webocontrol</span>
                    </div>
                </div>
                <div class="logo-subtitle">Software Company</div>`;

const newContent2 = `                </div>`;

async function processFile(filePath) {
    try {
        let data = await fs.readFile(filePath, 'utf8');
        let initialData = data;

        data = data.replaceAll(oldContent, newContent);
        data = data.replaceAll(oldContent2, newContent2);

        if (data !== initialData) {
            await fs.writeFile(filePath, data, 'utf8');
            console.log(`Replaced in ${filePath}`);
        }
    } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
    }
}

async function main() {
    const files = ['products.html', 'order.html', 'dashboard.html', 'login.html', 'register.html', 'payment.html', 'privacy.html', 'terms.html'];
    for (const file of files) {
        await processFile(file);
    }
}

main();
