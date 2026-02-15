/**
 * Utility functions for exporting data to various formats
 */

interface ExportOptions {
    filename: string;
    headers?: string[];
}

/**
 * Export data to CSV and trigger download
 */
export function exportToCSV<T extends Record<string, unknown>>(
    data: T[],
    options: ExportOptions
): void {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = options.headers || Object.keys(data[0]);

    // Create CSV content
    const csvRows: string[] = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const item of data) {
        const values = headers.map(header => {
            const value = item[header];
            // Handle values that contain commas or quotes
            if (value === null || value === undefined) {
                return '';
            }
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        });
        csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${options.filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export data to JSON and trigger download
 */
export function exportToJSON<T>(data: T[], filename: string): void {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generate and download a PDF (placeholder - would need a library like jsPDF)
 */
export function downloadPDF(_elementId: string, _filename: string): void {
    // For now, use print functionality
    window.print();
    // In production, use a library like jsPDF or html2pdf
}

/**
 * Open content in a new window for viewing/printing
 */
export function openInNewWindow(content: string, title: string): void {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    @media print { button { display: none; } }
                </style>
            </head>
            <body>
                ${content}
                <br/><button onclick="window.print()">Print</button>
            </body>
            </html>
        `);
        newWindow.document.close();
    }
}
