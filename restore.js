const fs = require('fs');
const path = require('path');

const recoverDir = 'e:/FinalProjects/techwell-lms/.recovered_files';
const srcDirs = ['e:/FinalProjects/techwell-lms/frontend', 'e:/FinalProjects/techwell-lms/backend'];

function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('dist')) {
                getAllFiles(fullPath, fileList);
            }
        } else {
            if (/\.(js|jsx|ts|tsx|prisma|json|md)$/.test(file) || file === 'Dockerfile' || file === 'docker-compose.yml') {
                fileList.push(fullPath);
            }
        }
    }
    return fileList;
}

const allSrcFiles = [];
for (const dir of srcDirs) {
    getAllFiles(dir, allSrcFiles);
}

const recoveredFiles = fs.readdirSync(recoverDir).filter(f => f.endsWith('.txt'));

console.log(`Total recovered: ${recoveredFiles.length}`);
console.log(`Total src files: ${allSrcFiles.length}`);

let matchedCount = 0;
for (const rf of recoveredFiles) {
    const rfPath = path.join(recoverDir, rf);
    const rfContent = fs.readFileSync(rfPath, 'utf8');
    const rfLines = rfContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    if (rfLines.length < 3) continue;
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const sf of allSrcFiles) {
        const sfContent = fs.readFileSync(sf, 'utf8');
        if (rfContent === sfContent) {
            bestMatch = sf;
            bestScore = 100;
            break; // Exact match, skip
        }
        
        const sfLines = sfContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (sfLines.length === 0) continue;
        
        let match = 0;
        const maxCheck = Math.min(5, rfLines.length, sfLines.length);
        for (let i = 0; i < maxCheck; i++) {
            if (rfLines[i] === sfLines[i]) match++;
        }
        
        if (match > bestScore) {
            bestScore = match;
            bestMatch = sf;
        }
    }
    
    if (bestScore >= 3 && bestScore !== 100) {
        const relPath = path.relative('e:/FinalProjects/techwell-lms', bestMatch);
        console.log(`MATCH: ${rf} -> ${relPath} (Score: ${bestScore}/5)`);
        
        // ACTUALLY OVERWRITE THE FILE to restore the newer version
        fs.writeFileSync(bestMatch, rfContent);
        console.log(`[RESTORED] Overwrote ${relPath} with recovered content.`);
        matchedCount++;
    }
}

console.log(`Total restored: ${matchedCount}`);
