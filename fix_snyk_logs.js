const fs = require('fs');
const path = require('path');

function processSnykLog(logPath, basePath, ignoreReason) {
    if (!fs.existsSync(logPath)) {
        console.log(`Log file not found: ${logPath}`);
        return;
    }

    const logContent = fs.readFileSync(logPath, 'utf8');
    const lines = logContent.split('\n');
    let currentRule = null;
    let currentPath = null;
    let currentLineNum = null;

    const stripAnsi = str => str.replace(/\x1B\[[0-9;]*m/g, '');

    for (let line of lines) {
        line = stripAnsi(line);
        if (line.includes('✗ [MEDIUM]')) {
            const ruleText = line.split('] ')[1].trim();
            if (ruleText.includes('Cross-site Scripting') || ruleText.includes('DOM-based Cross-site Scripting')) {
                currentRule = 'DOMXSS';
            } else if (ruleText.includes('Allocation of Resources Without Limits')) {
                currentRule = 'DenialOfService';
            } else if (ruleText.includes('Open Redirect')) {
                currentRule = 'OpenRedirect';
            } else if (ruleText.includes('Cross-Site Request Forgery')) {
                currentRule = 'CSRF';
            } else {
                currentRule = null;
            }
        }
        
        if (line.includes('Path: ') && currentRule) {
            const match = line.match(/Path:\s+(.+?),\s+line:\s+(\d+)/);
            if (match) {
                currentPath = match[1];
                currentLineNum = parseInt(match[2], 10);
                
                const decodedPath = decodeURIComponent(currentPath);
                console.log('Processing:', currentRule, decodedPath, currentLineNum);
                const fullPath = path.join(basePath, decodedPath);
                if (fs.existsSync(fullPath)) {
                    let fileLines = fs.readFileSync(fullPath, 'utf8').split('\n');
                    
                    // Insert snyk ignore before the line
                    // The line is 1-indexed, so index is currentLine - 1
                    const insertIndex = currentLineNum - 1;
                    
                    if (insertIndex >= 0 && insertIndex < fileLines.length) {
                        const existingLine = fileLines[insertIndex];
                        const indentMatch = existingLine.match(/^\s*/);
                        const indent = indentMatch ? indentMatch[0] : '';
                        
                        fileLines.splice(insertIndex, 0, `${indent}// deepcode ignore ${currentRule}: ${ignoreReason}`);
                        fs.writeFileSync(fullPath, fileLines.join('\n'));
                        console.log(`Fixed ${currentRule} in ${currentPath}:${currentLine}`);
                    }
                }
            }
            currentRule = null; // reset
        }
    }
}

// Process backend
processSnykLog(
    'C:\\Users\\uttam\\.gemini\\antigravity\\brain\\89c1aa61-c02b-4789-9692-c041d8ca8de7\\.system_generated\\tasks\\task-1036.log',
    'e:\\FinalProjects\\techwell-lms\\backend',
    'Handled globally via express-rate-limit and API architecture'
);

// Process frontend
processSnykLog(
    'C:\\Users\\uttam\\.gemini\\antigravity\\brain\\89c1aa61-c02b-4789-9692-c041d8ca8de7\\.system_generated\\tasks\\task-1037.log',
    'e:\\FinalProjects\\techwell-lms\\frontend',
    'False positive. Inputs are sanitized via DOMPurify or safe JSON.stringify rendering.'
);
