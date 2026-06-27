require('dotenv').config({ path: __dirname + '/../../.env' });
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure backups directory exists
const backupDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Generate filename based on date
const date = new Date();
const dateString = date.toISOString().replace(/[:.]/g, '-');
const fileName = `techwell_db_backup_${dateString}.sql.gz`;
const filePath = path.join(backupDir, fileName);

// Extract DB credentials from DATABASE_URL
// Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl || !dbUrl.startsWith('postgres')) {
    console.error('Invalid or missing DATABASE_URL in environment.');
    process.exit(1);
}

// Execute pg_dump
// Note: pg_dump must be installed on the system
const dumpCommand = `pg_dump "${dbUrl}" | gzip > "${filePath}"`;

console.log(`Starting backup: ${fileName}...`);

exec(dumpCommand, (error, stdout, stderr) => {
    if (error) {
        console.error(`Backup failed: ${error.message}`);
        return;
    }
    if (stderr) {
        console.warn(`pg_dump stderr (often expected): ${stderr}`);
    }
    console.log(`Backup completed successfully! Saved to: ${filePath}`);

    // Optional: Keep only last 7 days of backups
    fs.readdir(backupDir, (err, files) => {
        if (err) return;
        
        const backupFiles = files
            .filter(f => f.endsWith('.sql.gz'))
            .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
            .sort((a, b) => b.time - a.time);

        // Remove files older than 7th backup
        if (backupFiles.length > 7) {
            for (let i = 7; i < backupFiles.length; i++) {
                fs.unlinkSync(path.join(backupDir, backupFiles[i].name));
                console.log(`Deleted old backup: ${backupFiles[i].name}`);
            }
        }
    });
});
