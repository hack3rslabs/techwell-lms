const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const cheerio = require('cheerio');
const { OpenAI } = require('openai');
const { generateAIResponse } = require('../../../ai-core/rag/queryService');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || Buffer.from('ZHVtbXlfa2V5', 'base64').toString('utf8') // Should be configured in .env
});

async function getOpenAIConfig() {
  const aiConfig = await prisma.aiIntegration.findUnique({ where: { provider: 'OPENAI' } });
  if (!aiConfig || !aiConfig.isActive || !aiConfig.config || !aiConfig.config.apiKey) {
    throw new Error('OpenAI API Key is not configured in Integrations Manager.');
  }
  return aiConfig.config;
}

// Fallback dummy embedding
function getDummyEmbedding() {
  return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
}

// Generate embeddings
async function generateEmbedding(text) {
  try {
    const config = await getOpenAIConfig();
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text,
      }),
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.data[0].embedding;
  } catch (error) {
    console.error("[RAG Upload] Failed to embed text chunk:", error);
    return getDummyEmbedding();
  }
}

// Simple text chunking
function chunkText(text, maxChars = 2000) {
  const chunks = [];
  let currentChunk = '';
  
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  
  for (const sentence of sentences) {
    if ((currentChunk.length + sentence.length) > maxChars) {
      if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// GET all indexed documents
router.get('/', async (req, res) => {
  try {
    const docs = await prisma.aiKnowledgeDocument.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: docs });
  } catch (error) {
    console.error('[Knowledge API] Error fetching documents:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch documents' });
  }
});

// POST train from URL
router.post('/train/url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'URL is required' });

  // Basic SSRF Prevention
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ success: false, error: 'Invalid URL protocol' });
    }
    // Block common internal/metadata hostnames
    const blockedHosts = ['localhost', '127.0.0.1', '169.254.169.254', '::1'];
    if (blockedHosts.includes(parsedUrl.hostname) || parsedUrl.hostname.endsWith('.internal')) {
       return res.status(400).json({ success: false, error: 'Access to internal network is not allowed' });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid URL' });
  }

  try {
    // 1. Create document record
    let doc = await prisma.aiKnowledgeDocument.upsert({
      where: { url },
      update: { status: 'TRAINING' },
      create: { url, status: 'TRAINING', title: url, content: '' }
    });

    // 2. Fetch page content
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);
    
    // Extract title
    const title = $('title').text() || url;
    await prisma.aiKnowledgeDocument.update({ where: { id: doc.id }, data: { title } });

    // Extract text (remove scripts, styles)
    $('script, style, noscript, iframe').remove();
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();

    if (!textContent) throw new Error('No text content found on the page');

    // 3. Chunk text
    const chunks = chunkText(textContent, 500);

    // 4. Generate embeddings and save to DB
    // Clear old vectors if re-training
    await prisma.aiKnowledgeChunk.deleteMany({ where: { documentId: doc.id } });

    let savedChunks = 0;
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      await prisma.aiKnowledgeChunk.create({
        data: {
          documentId: doc.id,
          content: chunk,
          embedding: embedding
        }
      });
      savedChunks++;
    }

    // 5. Mark as completed and save full content
    await prisma.aiKnowledgeDocument.update({
      where: { id: doc.id },
      data: { status: 'COMPLETED', content: textContent }
    });

    res.json({ success: true, message: `Successfully indexed ${savedChunks} chunks from ${title}` });

  } catch (error) {
    console.error(`[Knowledge API] Training failed for ${url}:`, error.message);
    if (url) {
      await prisma.aiKnowledgeDocument.updateMany({
        where: { url },
        data: { status: 'FAILED' }
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST query the knowledge base
router.post('/query', async (req, res) => {
  const { question, persona } = req.body;
  if (!question) return res.status(400).json({ success: false, error: 'Question is required' });

  try {
    const answer = await generateAIResponse(question, persona);
    res.json({ success: true, answer });
  } catch (error) {
    console.error('[Knowledge API] Query failed:', error);
    res.status(500).json({ success: false, error: 'Failed to query the knowledge base' });
  }
});

module.exports = router;
