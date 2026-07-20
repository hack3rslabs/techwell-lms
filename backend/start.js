const { execSync } = require('child_process');

console.log("Starting Techwell Backend...");

let success = false;
let retries = 5;

while (retries > 0 && !success) {
    try {
        console.log(`Running database migrations... (Retries left: ${retries})`);
        execSync("npx prisma migrate deploy", { stdio: 'inherit' });
        success = true;
    } catch (error) {
        console.error("Prisma Migrate failed. The database might not be ready yet.");
        retries -= 1;
        if (retries > 0) {
            console.log("Waiting 3 seconds before retrying...");
            execSync("sleep 3");
        }
    }
}

if (!success) {
    console.error("Warning: Could not push schema after multiple attempts. Continuing to start Node.js server anyway...");
}

console.log("Starting Node.js server...");
require('./src/index.js');
