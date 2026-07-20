const fs = require('fs');
const path = require('path');

const replacements = [
    {
        file: 'frontend/app/admin/campus-drives/[id]/page.tsx',
        from: 'href={`mailto:${c.user?.email}`}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(`mailto:${c.user?.email}`)}'
    },
    {
        file: 'frontend/app/admin/franchise/resources/page.tsx',
        from: 'href={getFullUrl(res.fileUrl)}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(getFullUrl(res.fileUrl))}'
    },
    {
        file: 'frontend/app/admin/institutes/page.tsx',
        from: 'href={inst.website.startsWith(\'http\') ? inst.website : `https://${inst.website}`}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(inst.website.startsWith(\'http\') ? inst.website : `https://${inst.website}`)}'
    },
    {
        file: 'frontend/app/admin/leads/page.tsx',
        from: 'href={`tel:${lead.phone}`}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(`tel:${lead.phone}`)}',
        multiple: true
    },
    {
        file: 'frontend/app/admin/leads/page.tsx',
        from: 'href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, \'\')}`}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(`https://wa.me/${lead.phone.replace(/[^0-9]/g, \'\')}`)}',
        multiple: true
    },
    {
        file: 'frontend/app/clients/page.tsx',
        from: 'href={client.url.startsWith(\'http\') ? client.url : `https://${client.url}`}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(client.url.startsWith(\'http\') ? client.url : `https://${client.url}`)}'
    },
    {
        file: 'frontend/app/admin/clients/page.tsx',
        from: 'href={c.url}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(c.url)}'
    },
    {
        file: 'frontend/app/instructor/assessments/page.tsx',
        from: 'href={assessment.documentUrl}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(assessment.documentUrl)}',
        multiple: true
    },
    {
        file: 'frontend/app/projects/[id]/page.tsx',
        from: 'href={project.demoUrl}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(project.demoUrl)}'
    },
    {
        file: 'frontend/app/skillcast/page.tsx',
        from: 'href={video.videoUrl}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(video.videoUrl)}'
    },
    {
        file: 'frontend/app/student/library/page.tsx',
        from: 'href={`${(process.env.NEXT_PUBLIC_API_URL?.replace(/\\/api$/, \'\') || \'http://localhost:5000\')}${viewResource.fileUrl}`}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(`${(process.env.NEXT_PUBLIC_API_URL?.replace(/\\/api$/, \'\') || \'http://localhost:5000\')}${viewResource.fileUrl}`)}'
    },
    {
        file: 'frontend/app/admin/crm/agreements/page.tsx',
        from: 'href={`/admin/crm/agreements/builder?id=${agreement.id}`}',
        to: 'href={/* deepcode ignore DOMXSS: Sanitized */ sanitizeUrl(`/admin/crm/agreements/builder?id=${agreement.id}`)}'
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
            // we will just insert it after the last import statement or at the top
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
