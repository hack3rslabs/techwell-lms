const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// GET /api/crm/ai/customer/:id/summary
router.get('/customer/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        users: {
          include: { enrollments: { include: { course: true } } }
        },
        leads: true,
        callLogs: true
      }
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ success: false, message: 'AI summarizing service is currently unavailable.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this customer data and provide:
1. A concise summary of their engagement.
2. The Next Best Action.
3. Priority level (HIGH, MEDIUM, LOW).

Customer Data:
Name: ${customer.name}
Email: ${customer.email}
Phone: ${customer.phone || 'N/A'}
Enrollments: ${customer.users?.flatMap(u => u.enrollments).map(e => e.course?.title).join(', ') || 'None'}
Leads: ${customer.leads?.length || 0}
Call Logs: ${customer.callLogs?.length || 0}

Output in JSON format exactly like this:
{
  "summary": "...",
  "nextBestAction": "...",
  "priority": "HIGH"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '');
    let parsedData;
    try {
        parsedData = JSON.parse(responseText);
    } catch (e) {
        console.error('Failed to parse AI response:', responseText);
        return res.status(500).json({ success: false, message: 'Failed to generate AI summary' });
    }

    // Update the customer record with the generated AI insights
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        aiSummary: parsedData.summary,
        aiNextBestAction: parsedData.nextBestAction,
        aiPriority: parsedData.priority
      }
    });

    res.json({ success: true, data: updatedCustomer });
  } catch (error) {
    console.error('Error generating AI summary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
