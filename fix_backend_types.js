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
    if (!filePath.endsWith('.js')) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Fix destructuring from req.query to enforce string types
    content = content.replace(/const\s+\{\s*([^}]+)\s*\}\s*=\s*req\.query;/g, (match, vars) => {
        const parsedVars = vars.split(',').map(v => v.trim()).filter(v => v);
        // Destructure normally, then cast strings
        let replacement = match + '\n';
        parsedVars.forEach(v => {
            const varName = v.split('=')[0].trim();
            // Don't override page/limit if they are numbers, but they are destructured as numbers maybe?
            // Actually, query parameters are always strings or arrays.
            if (varName === 'page' || varName === 'limit') return;
            replacement += `    if (${varName} !== undefined) ${varName} = Array.isArray(${varName}) ? ${varName}[0] : String(${varName});\n`;
        });
        // Snyk requires us to modify the variable itself. But since they are `const`, we can't reassign them!
        // So we rewrite the destructuring to `let { ... } = req.query;`
        return replacement.replace('const {', 'let {');
    });

    // Replace specific usages in the remaining routes (Arrays)
    content = content.replace(/if\s*\(\!leadIds\s*\|\|\s*\!leadIds\.length/g, 'if (!Array.isArray(leadIds) || !leadIds.length');
    content = content.replace(/instituteIds\s*&&\s*instituteIds\.length/g, 'Array.isArray(instituteIds) && instituteIds.length');
    content = content.replace(/studentIds\.map/g, '(Array.isArray(studentIds) ? studentIds : []).map');
    content = content.replace(/instituteIds\.map/g, '(Array.isArray(instituteIds) ? instituteIds : []).map');
    content = content.replace(/zones\.length/g, '(Array.isArray(zones) ? zones : []).length');
    content = content.replace(/selectedCompanies\s*&&\s*selectedCompanies\.length/g, 'Array.isArray(selectedCompanies) && selectedCompanies.length');
    content = content.replace(/installments\s*&&\s*installments\.length/g, 'Array.isArray(installments) && installments.length');
    
    // Replace string usages
    content = content.replace(/newPassword\.length/g, 'String(newPassword || "").length');
    content = content.replace(/otp\.toString/g, 'String(otp || "").toString');
    content = content.replace(/leadSource\.toUpperCase/g, 'String(leadSource || "").toUpperCase');
    content = content.replace(/userId\.substring/g, 'String(userId || "").substring');
    content = content.replace(/difficulty\.toUpperCase/g, 'String(difficulty || "").toUpperCase');
    content = content.replace(/title\?\.trim\(\)/g, '(typeof title === "string" ? title.trim() : "")');
    content = content.replace(/description\?\.trim\(\)/g, '(typeof description === "string" ? description.trim() : "")');
    content = content.replace(/location\?\.trim\(\)/g, '(typeof location === "string" ? location.trim() : "")');
    content = content.replace(/role\.includes/g, 'String(role || "").includes');
    content = content.replace(/excludeRole\.includes/g, 'String(excludeRole || "").includes');
    content = content.replace(/code\.toUpperCase/g, 'String(code || "").toUpperCase');
    content = content.replace(/content\.substring/g, 'String(content || "").substring');
    content = content.replace(/lessonContent\s*\?\s*lessonContent\.substring/g, 'typeof lessonContent === "string" ? lessonContent.substring');
    content = content.replace(/razorpayKeySecret\s*&&\s*\!razorpayKeySecret\.includes/g, 'typeof razorpayKeySecret === "string" && !razorpayKeySecret.includes');
    content = content.replace(/stripeSecretKey\s*&&\s*\!stripeSecretKey\.includes/g, 'typeof stripeSecretKey === "string" && !stripeSecretKey.includes');
    content = content.replace(/q\.length/g, 'String(q || "").length');
    content = content.replace(/url\s*\?\s*url\.replace/g, 'typeof url === "string" ? url.replace');
    content = content.replace(/message\.replace/g, 'String(message || "").replace');
    content = content.replace(/url\.split/g, 'String(url || "").split');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Cleaned ${filePath}`);
    }
}

const srcDir = path.join(__dirname, 'backend', 'src');
if (fs.existsSync(srcDir)) {
    walkDir(srcDir, processFile);
}
