const { execSync } = require('child_process');

console.log("Starting Techwell Backend...");

let success = false;
let retries = 5;

while (retries > 0 && !success) {
    try {
        console.log(`Pushing database schema... (Retries left: ${retries})`);
        execSync("npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss", { stdio: 'inherit' });
        success = true;
    } catch (error) {
        console.error("Prisma DB Push failed. The database might not be ready yet.");
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
