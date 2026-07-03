const { CheerioCrawler } = require('crawlee');
const { generateEmbedding } = require('./embedder');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function crawlAndTrainUrl(targetUrl, documentId) {
  try {
    let extractedText = '';
    let pageTitle = '';

    const crawler = new CheerioCrawler({
      maxRequestsPerCrawl: 1, // Only crawl the specific URL requested
      async requestHandler({ request, $, log }) {
        log.info(`Processing ${request.url}...`);
        
        pageTitle = $('title').text();
        
        // Remove scripts, styles, navs, headers, footers for cleaner content
        $('script, style, nav, header, footer, iframe, noscript').remove();
        
        // Extract main body text
        extractedText = $('body').text().replace(/\s+/g, ' ').trim();
      },
      failedRequestHandler({ request, log }) {
        log.error(`Request ${request.url} failed completely.`);
      },
    });

    await crawler.run([targetUrl]);

    if (!extractedText) {
      throw new Error("No readable text found on the page.");
    }

    console.log(`[Crawler] Extracted ${extractedText.length} characters from ${targetUrl}`);

    // Generate embedding
    console.log(`[Crawler] Generating embedding for ${targetUrl}...`);
    // Note: In a production app, you would chunk the text. For simplicity here, we embed the whole text if it's small enough,
    // or truncate it. The Gemini embedding limit is usually large enough for a standard article.
    const textToEmbed = extractedText.substring(0, 10000); 
    const embedding = await generateEmbedding(textToEmbed);

    // Update the document record in DB
    await prisma.aiKnowledgeDocument.update({
      where: { id: documentId },
      data: {
        title: pageTitle,
        content: textToEmbed,
        embedding: embedding,
        status: 'COMPLETED'
      }
    });
    
    console.log(`[Crawler] Training complete for ${targetUrl}`);
    return { success: true };

  } catch (error) {
    console.error(`[Crawler Error for ${targetUrl}]:`, error);
    await prisma.aiKnowledgeDocument.update({
      where: { id: documentId },
      data: { status: 'FAILED' }
    });
    return { success: false, error: error.message };
  }
}

module.exports = {
  crawlAndTrainUrl
};
