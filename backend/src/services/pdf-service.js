
async function generateAgreementPdf(agreement) {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${agreement.title}</title>
            <style>
                body {
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    padding: 40px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
                .meta-info {
                    margin-top: 10px;
                    font-size: 14px;
                    color: #555;
                }
                .content {
                    font-size: 14px;
                    line-height: 1.6;
                }
                .financials {
                    margin-top: 40px;
                    border: 1px solid #ccc;
                    padding: 20px;
                    background-color: #f9f9f9;
                }
                .financials p { margin: 5px 0; }
                .signature-section {
                    margin-top: 50px;
                    page-break-inside: avoid;
                }
                .signature-box {
                    margin-top: 20px;
                }
                .signature-img {
                    max-width: 200px;
                    max-height: 100px;
                    border-bottom: 1px solid #333;
                    padding-bottom: 5px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${agreement.title}</h1>
                <div class="meta-info">
                    <p><strong>Agreement No:</strong> ${agreement.agreementNum}</p>
                    <p><strong>Date:</strong> ${new Date(agreement.createdAt).toLocaleDateString()}</p>
                    <p><strong>Client:</strong> ${agreement.customer?.name || 'N/A'}</p>
                </div>
            </div>

            <div class="content">
                ${agreement.content}
            </div>

            <div class="financials">
                <h3>Financial Summary</h3>
                <p><strong>Base Value:</strong> INR ${agreement.totalValue?.toLocaleString()}</p>
                <p><strong>Tax (${agreement.taxPercentage}%):</strong> INR ${agreement.taxAmount?.toLocaleString()}</p>
                <p><strong>Total Value:</strong> INR ${agreement.grandTotal?.toLocaleString()}</p>
            </div>

            ${agreement.status === 'SIGNED' ? `
                <div class="signature-section">
                    <h3>Signatures</h3>
                    <div class="signature-box">
                        <img class="signature-img" src="${agreement.clientSignature}" alt="Client Signature" />
                        <p><strong>Client Representative</strong><br/>
                        Signed electronically on ${new Date(agreement.signedAt).toLocaleString()}</p>
                    </div>
                </div>
            ` : `
                <div class="signature-section">
                    <h3>Signatures</h3>
                    <p><em>(Pending Client Signature)</em></p>
                </div>
            `}
        </body>
        </html>
    `;

    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });

    await browser.close();
    return pdfBuffer;
}

module.exports = { generateAgreementPdf };
