const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Remove {/* snyk-ignore */} and variants
    content = content.replace(/\{\/\*\s*snyk-ignore\s*\*\/\}/g, '');
    content = content.replace(/\/\*\s*snyk-ignore\s*\*\//g, '');
    content = content.replace(/\/\/\s*snyk-ignore.*/g, '');
    
    // Remove /* deepcode ignore DOMXSS: Sanitized */ inside href={...}
    content = content.replace(/\/\*\s*deepcode ignore DOMXSS: Sanitized\s*\*\//g, '');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Cleaned ${filePath}`);
    }
}

const srcDir = path.join(__dirname, 'frontend', 'app');
if (fs.existsSync(srcDir)) {
    walkDir(srcDir, processFile);
}
