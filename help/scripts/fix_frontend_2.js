const fs = require('fs');
const path = require('path');

const replacements = [
    {
        file: 'frontend/app/instructor/assessments/page.tsx',
        from: 'href={submission.fileUrl}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(submission.fileUrl)}',
        multiple: true
    },
    {
        file: 'frontend/app/instructor/assessments/page.tsx',
        from: 'href={selectedSubmission.fileUrl}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(selectedSubmission.fileUrl)}',
        multiple: true
    },
    {
        file: 'frontend/app/projects/[id]/page.tsx',
        from: 'href={project.demoLink}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(project.demoLink)}',
        multiple: true
    },
    {
        file: 'frontend/app/skillcast/page.tsx',
        from: 'href={item.linkedinUrl}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(item.linkedinUrl)}',
        multiple: true
    },
    {
        file: 'frontend/app/student/library/page.tsx',
        from: 'href={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\\/api$/, \'\') || \'http://localhost:5000\'}${viewResource.fileUrl}`}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\\/api$/, \'\') || \'http://localhost:5000\'}${viewResource.fileUrl}`)}',
        multiple: true
    }
];

for (const { file, from, to, multiple } of replacements) {
    const p = path.join(__dirname, file);
    if (!fs.existsSync(p)) continue;
    let content = fs.readFileSync(p, 'utf-8');
    
    if (multiple) {
        content = content.split(from).join(to);
    } else {
        content = content.replace(from, to);
    }

    if (content !== fs.readFileSync(p, 'utf-8')) {
        // Find safe place to add import
        if (!content.includes('sanitizeUrl')) {
            const match = content.match(/import .* from '.*';?/g);
            if (match) {
                const lastImport = match[match.length - 1];
                content = content.replace(lastImport, `${lastImport}\nimport { sanitizeUrl } from '@/lib/sanitizeUrl';`);
            } else {
                content = `import { sanitizeUrl } from '@/lib/sanitizeUrl';\n${content}`;
            }
        }
        fs.writeFileSync(p, content, 'utf-8');
        console.log(`Fixed ${file}`);
    }
}
