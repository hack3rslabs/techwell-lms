const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'backend', 'src', 'routes');
const files = fs.readdirSync(routesDir);

const moduleMap = {
    'course.routes.js': 'COURSES',
    'jobs.routes.js': 'JOBS',
    'certificate.routes.js': 'CERTIFICATES',
    'interview.routes.js': 'INTERVIEWS',
    'leads.routes.js': 'LEADS',
    'live-classes.routes.js': 'MEETINGS',
    'admin.routes.js': 'SYSTEM_LOGS',
    'library.routes.js': 'LIBRARY',
    'blog.routes.js': 'BLOGS',
    'reviews.routes.js': 'REVIEWS',
    'users.routes.js': 'USERS',
    'tasks.routes.js': 'TASKS',
    'reports.routes.js': 'REPORTS',
    'settings.routes.js': 'SETTINGS'
};

files.forEach(file => {
    if (moduleMap[file]) {
        const filePath = path.join(routesDir, file);
        let content = fs.readFileSync(filePath, 'utf-8');
        
        const moduleName = moduleMap[file];
        
        // Ensure checkPermission is imported
        if (!content.includes('checkPermission')) {
            content = content.replace(/const { authenticate, authorize } = require\('\.\.\/middleware\/auth'\);/g, 
                "const { authenticate, authorize, checkPermission } = require('../middleware/auth');");
        }

        // Replace authorize('SUPER_ADMIN', 'ADMIN') with checkPermission
        // GET routes become VIEW_X, others become MANAGE_X
        
        // Find GET routes and replace
        content = content.replace(/router\.get\((['"`].+?['"`]),\s*authenticate,\s*authorize\(['"`]SUPER_ADMIN['"`],\s*['"`]ADMIN['"`]\)/g, 
            `router.get($1, authenticate, checkPermission('VIEW_${moduleName}')`);
            
        // Find POST, PUT, DELETE, PATCH
        content = content.replace(/router\.(post|put|delete|patch)\((['"`].+?['"`]),\s*authenticate,\s*authorize\(['"`]SUPER_ADMIN['"`],\s*['"`]ADMIN['"`]\)/g, 
            `router.$1($2, authenticate, checkPermission('MANAGE_${moduleName}')`);

        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${file} with Matrix RBAC constants.`);
    }
});
