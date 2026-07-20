const fs = require('fs');
const path = require('path');
function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('{/* snyk-ignore  */}')) {
                const lines = content.split('\n').filter(line => !line.includes('{/* snyk-ignore  */}'));
                fs.writeFileSync(fullPath, lines.join('\n'));
                console.log('Fixed:', fullPath);
            }
        }
    }
}
processDir(path.join(__dirname, 'frontend', 'app'));
