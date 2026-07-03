import os
import glob
import re

files = [
    "frontend/app/admin/batches/page.tsx",
    "frontend/app/admin/courses/page.tsx",
    "frontend/app/admin/enrolls/page.tsx",
    "frontend/app/admin/finance/page.tsx",
    "frontend/app/admin/global-data/page.tsx",
    "frontend/app/admin/leads/page.tsx",
    "frontend/app/admin/reports/page.tsx",
    "frontend/app/admin/tasks/page.tsx",
    "frontend/app/admin/users/page.tsx"
]

for file_path in files:
    full_path = f"e:/FinalProjects/techwell-lms/{file_path}"
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()

    # The broken pattern is:
    # a.download = `..._${new Date(;
    #             document.body.appendChild(a);
    #             a.click();
    #             document.body.removeChild(a);
    #             URL.revokeObjectURL(url);
    #         });
    #         .toISOString().split('T')[0]}.xlsx`)
    # We want to restore it to the correct a.download syntax.
    
    # We can use regex to find a.download = `(.*?)_${new Date(; ... .toISOString\(\).split\('T'\)\[0\]}\.xlsx`\)
    
    pattern = re.compile(
        r"a\.download\s*=\s*`([^`]+)_\$\{new Date\(\;\s*"
        r"document\.body\.appendChild\(a\);\s*"
        r"a\.click\(\);\s*"
        r"document\.body\.removeChild\(a\);\s*"
        r"URL\.revokeObjectURL\(url\);\s*"
        r"\}\);\s*"
        r"\.toISOString\(\)\.split\('T'\)\[0\]}\.xlsx`\)",
        re.DOTALL
    )
    
    def replacer(match):
        prefix = match.group(1)
        return f"""a.download = `{prefix}_${{new Date().toISOString().split('T')[0]}}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }});"""
        
    content = pattern.sub(replacer, content)
    
    # Let's also fix the ones with `format(new Date(), 'yyyy-MM-dd')`
    # E.g., a.download = `GlobalData_Export_${format(new Date(, 'yyyy-MM-dd')}.xlsx`)
    pattern2 = re.compile(
        r"a\.download\s*=\s*`([^`]+)_\$\{format\(new Date\(\,\s*'yyyy-MM-dd'\)\}\.xlsx`\);\s*"
        r"document\.body\.appendChild\(a\);\s*"
        r"a\.click\(\);\s*"
        r"document\.body\.removeChild\(a\);\s*"
        r"URL\.revokeObjectURL\(url\);\s*"
        r"\}\);\s*"
        r", 'yyyy-MM-dd'\)}\.xlsx`\)",
        re.DOTALL
    )
    
    # Actually simpler:
    pattern2 = re.compile(
        r"a\.download\s*=\s*`([^`]+)_\$\{format\(new Date\(\;\s*"
        r"document\.body\.appendChild\(a\);\s*"
        r"a\.click\(\);\s*"
        r"document\.body\.removeChild\(a\);\s*"
        r"URL\.revokeObjectURL\(url\);\s*"
        r"\}\);\s*"
        r", 'yyyy-MM-dd'\)}\.xlsx`\)",
        re.DOTALL
    )
    
    def replacer2(match):
        prefix = match.group(1)
        return f"""a.download = `{prefix}_${{format(new Date(), 'yyyy-MM-dd')}}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }});"""
        
    content = pattern2.sub(replacer2, content)
    
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
        
print("Fix script finished.")
