const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all FAQs (Admin gets all, Public gets only active)
exports.getAllFaqs = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    let whereClause = {};

    // If not admin/staff requesting includeInactive, force isActive: true
    if (includeInactive !== 'true' || (req.user?.role !== 'ADMIN' && req.user?.role !== 'STAFF')) {
      whereClause.isActive = true;
    }

    const faqs = await prisma.faq.findMany({
      where: whereClause,
      orderBy: {
        order: 'asc'
      }
    });

    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ success: false, message: 'Server error fetching FAQs' });
  }
};

// Create a new FAQ (Admin only)
exports.createFaq = async (req, res) => {
  try {
    const { question, answer, category, order, isActive } = req.body;

    if (!question || !answer || !category) {
      return res.status(400).json({ success: false, message: 'Question, answer, and category are required' });
    }

    const newFaq = await prisma.faq.create({
      data: {
        question,
        answer,
        category,
        order: order !== undefined ? parseInt(order) : 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.status(201).json({ success: true, data: newFaq, message: 'FAQ created successfully' });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ success: false, message: 'Server error creating FAQ' });
  }
};

// Update an existing FAQ (Admin only)
exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, order, isActive } = req.body;

    const faq = await prisma.faq.findUnique({ where: { id } });
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    const updatedFaq = await prisma.faq.update({
      where: { id },
      data: {
        ...(question && { question }),
        ...(answer && { answer }),
        ...(category && { category }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.status(200).json({ success: true, data: updatedFaq, message: 'FAQ updated successfully' });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ success: false, message: 'Server error updating FAQ' });
  }
};

// Delete an FAQ (Admin only)
exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await prisma.faq.findUnique({ where: { id } });
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    await prisma.faq.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ success: false, message: 'Server error deleting FAQ' });
  }
};
