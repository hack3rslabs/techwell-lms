const fs = require('fs');

const data = fs.readFileSync('C:/Users/uttam/.gemini/antigravity/brain/f664913a-c454-4f3b-8555-6a6c6ddda88c/.system_generated/steps/543/output.txt', 'utf-8');
const jsonStr = data.split('\n').find(line => line.startsWith('1: {'))?.slice(3) || data;

try {
    const result = JSON.parse(jsonStr);
    console.log(`Total issues remaining: ${result.issueCount}`);
    
    const countById = {};
    result.issues.forEach(i => {
        countById[i.id] = (countById[i.id] || 0) + 1;
    });
    
    console.log(countById);
} catch (e) {
    console.error("Error parsing", e.message);
}
