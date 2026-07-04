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

    # Replace import
    content = re.sub(r"import \* as XLSX from ['\"]xlsx['\"]", "import ExcelJS from 'exceljs'", content)
    
    # Extract the logic:
    # const worksheet = XLSX.utils.json_to_sheet(...)
    # const workbook = XLSX.utils.book_new()
    # XLSX.utils.book_append_sheet(workbook, worksheet, "...")
    # XLSX.writeFile(workbook, `...`)
    
    def replacer(match):
        data_var = match.group(1)
        sheet_name = match.group(2)
        filename = match.group(3)
        return f"""
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet({sheet_name});
        
        if ({data_var} && {data_var}.length > 0) {{
            worksheet.columns = Object.keys({data_var}[0]).map(key => ({{ header: key, key }}));
            worksheet.addRows({data_var});
        }}
        
        workbook.xlsx.writeBuffer().then((buffer) => {{
            const blob = new Blob([buffer], {{ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = {filename};
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }});
        """

    # We need a regex that captures data, sheetname, and filename.
    # Usually it looks like:
    # const ws = XLSX.utils.json_to_sheet(data)
    # const wb = XLSX.utils.book_new()
    # XLSX.utils.book_append_sheet(wb, ws, "SheetName")
    # XLSX.writeFile(wb, `Filename.xlsx`)
    
    pattern = re.compile(
        r"(?:const|let|var)\s+\w+\s*=\s*XLSX\.utils\.json_to_sheet\((.*?)\);?\s*"
        r"(?:const|let|var)\s+\w+\s*=\s*XLSX\.utils\.book_new\(\);?\s*"
        r"XLSX\.utils\.book_append_sheet\(\w+,\s*\w+,\s*([^)]+)\);?\s*"
        r"XLSX\.writeFile\(\w+,\s*([^)]+)\);?",
        re.DOTALL
    )
    
    content = pattern.sub(replacer, content)
    
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
        
print("Replacement script finished.")
