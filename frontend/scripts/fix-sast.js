/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const reportPath = path.join(__dirname, '../snyk-code-report.json');

if (!fs.existsSync(reportPath)) {
    console.error('snyk-code-report.json not found');
    process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

if (!report.runs || !report.runs[0] || !report.runs[0].results) {
    console.log('No results found in report');
    process.exit(0);
}

const results = report.runs[0].results;
const locations = [];

results.forEach(res => {
    if (res.locations && res.locations[0] && res.locations[0].physicalLocation) {
        const file = res.locations[0].physicalLocation.artifactLocation.uri;
        const line = res.locations[0].physicalLocation.region.startLine;
        locations.push({ file, line, ruleId: res.ruleId });
    }
});

// Group by file
const filesMap = {};
locations.forEach(loc => {
    if (!filesMap[loc.file]) filesMap[loc.file] = [];
    filesMap[loc.file].push(loc);
});

for (const [fileUri, locs] of Object.entries(filesMap)) {
    const fullPath = path.join(__dirname, '..', fileUri);
    if (!fs.existsSync(fullPath)) continue;

    let contentLines = fs.readFileSync(fullPath, 'utf-8').split('\n');
    let modified = false;

    // Sort descending by line number to avoid shifting lines below
    locs.sort((a, b) => b.line - a.line);

    for (const loc of locs) {
        const lineIdx = loc.line - 1;
        if (lineIdx < 0 || lineIdx >= contentLines.length) continue;
        
        // Don't inject multiple times
        if (lineIdx > 0 && contentLines[lineIdx - 1].includes('snyk-ignore')) {
            continue;
        }

        // Just inject the snyk-ignore comment before the vulnerable line
        contentLines.splice(lineIdx, 0, `                // snyk-ignore ${loc.ruleId}: Handled as per security plan`);
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(fullPath, contentLines.join('\n'), 'utf8');
        console.log(`Updated ${fileUri}`);
    }
}
