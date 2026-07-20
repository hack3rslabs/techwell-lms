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

    // 1. Fix status.toLowerCase()
    // e.g. `Request ${status.toLowerCase()} successfully` -> `Request ${String(status || '').toLowerCase()} successfully`
    content = content.replace(/\$\{status\.toLowerCase\(\)\}/g, '${String(status || \'\').toLowerCase()}');
    content = content.replace(/\$\{status\.toUpperCase\(\)\}/g, '${String(status || \'\').toUpperCase()}');

    // 2. Fix req.query.search issues
    // Many places do: const search = req.query.search; or const { search } = req.query;
    // We can just find `.search` being used if destructured, or replace `req.query.search` with `String(req.query.search || '')`
    // Actually, if it's destructured, it's harder. Let's just do a global replace for `search:` or `search = `
    
    // 3. Fix length checks on body arrays
    // e.g. req.body.items.length -> (req.body.items || []).length
    // We'll replace `.length` for variables that are arrays from req.body.
    content = content.replace(/(\w+)\.length/g, (match, p1) => {
        // We shouldn't globally replace all .length, that breaks strings/arrays that are definitely arrays.
        // If p1 is things like 'leads', 'items', 'users', 'students'
        if (['leads', 'items', 'users', 'students', 'candidates', 'emails', 'phones', 'ids'].includes(p1)) {
            return `Array.isArray(${p1}) ? ${p1}.length : 0`;
        }
        return match;
    });

    // 4. Fix .map() calls
    content = content.replace(/(\w+)\.map\(/g, (match, p1) => {
        if (['leads', 'items', 'users', 'students', 'candidates', 'emails', 'phones', 'ids', 'roles', 'permissions'].includes(p1)) {
            return `(Array.isArray(${p1}) ? ${p1} : []).map(`;
        }
        return match;
    });

    // 5. Fix .toLowerCase(), .trim(), .split()
    content = content.replace(/(\w+)\.toLowerCase\(\)/g, (match, p1) => {
        return `String(${p1} || '').toLowerCase()`;
    });
    content = content.replace(/(\w+)\.trim\(\)/g, (match, p1) => {
        return `String(${p1} || '').trim()`;
    });
    content = content.replace(/(\w+)\.split\(/g, (match, p1) => {
        // don't break string literals
        if (p1 === "''" || p1 === '""' || p1 === '`') return match;
        // don't touch if it looks safe
        if (['url', 'path', '__dirname'].includes(p1)) return match;
        return `String(${p1} || '').split(`;
    });

    if (content !== original) {
        // Fix some double String(String(...)) if happened
        content = content.replace(/String\(String\(([^]+?)\)\)/g, 'String($1)');
        
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Modified ${filePath}`);
    }
}

const srcDir = path.join(__dirname, 'backend', 'src');
if (fs.existsSync(srcDir)) {
    walkDir(srcDir, processFile);
}
