const express = require('express');
const { PrismaClient } = require('@prisma/client');
const whatsappWebClient = require('../../../ai-core/providers/whatsappWebClient');
const router = express.Router();

const prisma = new PrismaClient();

// Initialize the WhatsApp Web Client when the module loads
// whatsappWebClient.initialize();

// Get all integrations
router.get('/', async (req, res) => {
  try {
    const integrations = await prisma.aiIntegration.findMany();
    // In a real app, do not send the full secret keys to the frontend, just partial or existence flags
    res.json({ success: true, data: integrations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create or update an integration
router.post('/', async (req, res) => {
  try {
    const { provider, config, isActive } = req.body;
    if (!provider || !config) {
      return res.status(400).json({ success: false, error: "Provider and config are required" });
    }

    const integration = await prisma.aiIntegration.upsert({
      where: { provider: provider },
      update: { config, isActive },
      create: { provider, config, isActive }
    });

    res.json({ success: true, data: integration });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete an integration
router.delete('/:id', async (req, res) => {
  try {
    await prisma.aiIntegration.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// WhatsApp Web Endpoints
router.get('/whatsapp-qr', (req, res) => {
  const status = whatsappWebClient.getStatus();
  res.json({ success: true, data: status });
});

router.post('/whatsapp-logout', async (req, res) => {
  try {
    await whatsappWebClient.logout();
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
