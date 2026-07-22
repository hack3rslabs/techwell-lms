import os
import re

FRONTEND_DIR = r"e:\FinalProjects\techwell-lms\frontend"
BACKEND_DIR = r"e:\FinalProjects\techwell-lms\backend"

# Fix frontend XSS
def fix_frontend_xss():
    count = 0
    for root, _, files in os.walk(FRONTEND_DIR):
        if "node_modules" in root or ".next" in root:
            continue
        for file in files:
            if not (file.endswith(".tsx") or file.endswith(".jsx")):
                continue
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            if "dangerouslySetInnerHTML" not in content:
                continue

            # Check if we need to modify
            new_content = content
            
            # Simple regex to find dangerouslySetInnerHTML={{ __html: SOMETHING }}
            # We want to replace SOMETHING with DOMPurify.sanitize(SOMETHING) if not already sanitized
            
            # This is a bit tricky to parse with regex if SOMETHING is complex, but we can look for specific patterns
            # Or we can just use a generic regex that looks for __html: and then a balanced expression.
            # Alternatively, we can just replace specific known patterns.
            
            lines = new_content.split('\n')
            modified = False
            for i, line in enumerate(lines):
                if "dangerouslySetInnerHTML" in line and "__html:" in line and "DOMPurify.sanitize" not in line and "JSON.stringify" not in line:
                    # Found an unsanitized dangerouslySetInnerHTML
                    # E.g.: dangerouslySetInnerHTML={{ __html: page.headerCode }}
                    # E.g.: dangerouslySetInnerHTML={{ __html: `...` }}
                    # Let's replace __html: X with __html: DOMPurify.sanitize(X)
                    
                    # It's safer to just inject DOMPurify.sanitize
                    # We can use regex: __html:\s*(.*?)\s*}}
                    
                    def replacer(match):
                        val = match.group(1)
                        if "DOMPurify" in val or "JSON.stringify" in val:
                            return match.group(0) # Do nothing
                        return f"__html: DOMPurify.sanitize({val}) }}"
                    
                    new_line = re.sub(r'__html:\s*(.*?)\s*}}', replacer, line)
                    if new_line != line:
                        lines[i] = new_line
                        modified = True

            if modified:
                new_content = '\n'.join(lines)
                # Add import if missing
                if "DOMPurify" not in new_content and "import DOMPurify" not in new_content:
                    # Find last import
                    last_import_idx = -1
                    lines = new_content.split('\n')
                    for i, line in enumerate(lines):
                        if line.startswith("import "):
                            last_import_idx = i
                    
                    if last_import_idx != -1:
                        lines.insert(last_import_idx + 1, "import DOMPurify from 'isomorphic-dompurify';")
                    else:
                        lines.insert(0, "import DOMPurify from 'isomorphic-dompurify';")
                    new_content = '\n'.join(lines)

                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                count += 1
                print(f"Fixed XSS in: {path}")

    print(f"Total frontend files fixed: {count}")

# Fix Backend Rate Limits for Multer
def fix_backend_rate_limits():
    count = 0
    routes_dir = os.path.join(BACKEND_DIR, "src", "routes")
    for file in os.listdir(routes_dir):
        if not file.endswith(".routes.js"):
            continue
        path = os.path.join(routes_dir, file)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        if "upload.single" not in content and "upload.array" not in content:
            continue
            
        if "uploadLimiter" in content:
            continue
            
        # Add rate limiter
        new_content = content
        import_stmt = "const rateLimit = require('express-rate-limit');\nconst uploadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many uploads' } });\n"
        
        # Insert after router declaration
        new_content = re.sub(r'(const router = express\.Router\(\);)', r'\1\n' + import_stmt, new_content)
        
        # Replace upload.single and upload.array
        new_content = new_content.replace("upload.single", "uploadLimiter, upload.single")
        new_content = new_content.replace("upload.array", "uploadLimiter, upload.array")
        
        if new_content != content:
            with open(path, "w", encoding="utf-8") as f:
                f.write(new_content)
            count += 1
            print(f"Fixed Rate Limit in: {path}")
            
    print(f"Total backend files fixed: {count}")

if __name__ == "__main__":
    fix_frontend_xss()
    fix_backend_rate_limits()
