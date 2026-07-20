const fs = require('fs');
const path = require('path');

const files = [
    'frontend/app/admin/campus-drives/[id]/page.tsx',
    'frontend/app/admin/franchise/resources/page.tsx',
    'frontend/app/admin/institutes/page.tsx',
    'frontend/app/admin/leads/page.tsx',
    'frontend/app/clients/page.tsx',
    'frontend/app/admin/clients/page.tsx',
    'frontend/app/admin/crm/agreements/page.tsx',
    'frontend/app/instructor/assessments/page.tsx',
    'frontend/app/projects/[id]/page.tsx',
    'frontend/app/skillcast/page.tsx',
    'frontend/app/student/library/page.tsx'
];

for (const file of files) {
    const p = path.join(__dirname, file);
    if (!fs.existsSync(p)) continue;
    let content = fs.readFileSync(p, 'utf-8');
    
    if (content.includes('sanitizeUrl') && !content.includes('import { sanitizeUrl }')) {
        const match = content.match(/import .* from '.*';?/g) || content.match(/import .* from ".*";?/g);
        if (match) {
            const lastImport = match[match.length - 1];
            content = content.replace(lastImport, `${lastImport}\nimport { sanitizeUrl } from '@/lib/sanitizeUrl';`);
        } else {
            content = `import { sanitizeUrl } from '@/lib/sanitizeUrl';\n${content}`;
        }
        fs.writeFileSync(p, content, 'utf-8');
        console.log(`Added import to ${file}`);
    }
}
