const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// GET /api/crm/ai/customer/:id/summary
router.get('/customer/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;

    // Placeholder for AI generation logic
    // This would typically involve calling an LLM (e.g., OpenAI or Gemini) 
    // passing the customer's aggregated 360 data and asking for a summary.

    const aiSummary = "This customer has shown strong interest in Cyber Security courses. They have enrolled in 2 courses, submitted 1 job application, and raised 3 support tickets related to course access. Next Best Action: Upsell Advanced Cyber Security Cert.";
    const nextBestAction = "Call customer to discuss Advanced Cyber Security certification.";
    const priority = "HIGH";

    // Update the customer record with the generated AI insights
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        aiSummary,
        aiNextBestAction: nextBestAction,
        aiPriority: priority
      }
    });

    res.json({ success: true, data: updatedCustomer });
  } catch (error) {
    console.error('Error generating AI summary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
