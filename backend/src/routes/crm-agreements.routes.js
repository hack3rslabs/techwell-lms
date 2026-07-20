const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, checkPermission } = require('../middleware/auth');
const { generateAgreementPdf } = require('../services/pdf-service');

// 1. Get all Agreements
router.get('/', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
    try {
        let { status, customerId } = req.query;
    if (status !== undefined) status = Array.isArray(status) ? status[0] : String(status);
    if (customerId !== undefined) customerId = Array.isArray(customerId) ? customerId[0] : String(customerId);

        let where = {};
        if (status) where.status = status;
        if (customerId) where.customerId = customerId;

        const agreements = await prisma.clientAgreement.findMany({
            where,
            include: {
                customer: { select: { id: true, name: true, email: true, phone: true } },
                template: { select: { id: true, title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(agreements);
    } catch (error) {
        console.error("Error fetching agreements:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 2. Get specific Agreement
router.get('/:id', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
    try {
        const agreement = await prisma.clientAgreement.findUnique({
            where: { id: req.params.id },
            include: {
                customer: true,
                template: true,
                milestones: true,
                versions: { orderBy: { versionNum: 'desc' } }
            }
        });

        if (!agreement) return res.status(404).json({ error: "Agreement not found" });

        res.json(agreement);
    } catch (error) {
        console.error("Error fetching agreement:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 3. Create new Agreement
router.post('/', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
    try {
        const { customerId, templateId, vertical, title, content, totalValue, taxPercentage, validFrom, validUntil } = req.body;

        // Auto-generate agreement number (e.g. TW-AGR-2024-XXXX)
        const year = new Date().getFullYear();
        const count = await prisma.clientAgreement.count();
        const agreementNum = `TW-AGR-${year}-${String(count + 1).padStart(4, '0')}`;
        
        const taxAmount = (totalValue * taxPercentage) / 100;
        const grandTotal = totalValue + taxAmount;

        const agreement = await prisma.clientAgreement.create({
            data: {
                agreementNum,
                customerId,
                templateId,
                vertical,
                title,
                content,
                totalValue,
                taxPercentage,
                taxAmount,
                grandTotal,
                validFrom: validFrom ? new Date(validFrom) : null,
                validUntil: validUntil ? new Date(validUntil) : null,
                status: 'DRAFT'
            }
        });

        // Also track version 1
        await prisma.agreementVersion.create({
            data: {
                agreementId: agreement.id,
                versionNum: 1,
                content: content,
                changes: "Initial Draft"
            }
        });

        res.status(201).json(agreement);
    } catch (error) {
        console.error("Error creating agreement:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 4. Update Agreement (Edit Draft)
router.put('/:id', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
    try {
        const { title, content, totalValue, taxPercentage, status, changes } = req.body;
        
        const existing = await prisma.clientAgreement.findUnique({
            where: { id: req.params.id },
            include: { versions: { orderBy: { versionNum: 'desc' }, take: 1 } }
        });

        if (!existing) return res.status(404).json({ error: "Agreement not found" });
        if (existing.status === 'SIGNED' || existing.status === 'ACTIVE') {
            return res.status(400).json({ error: "Cannot edit an active or signed agreement. Create an amendment." });
        }

        const taxAmount = totalValue ? (totalValue * (taxPercentage ?? existing.taxPercentage)) / 100 : existing.taxAmount;
        const grandTotal = totalValue ? totalValue + taxAmount : existing.grandTotal;

        const updated = await prisma.clientAgreement.update({
            where: { id: req.params.id },
            data: {
                title,
                content,
                totalValue,
                taxPercentage,
                taxAmount,
                grandTotal,
                status
            }
        });

        // Track new version if content changed
        if (content && content !== existing.content) {
            const nextVersion = (existing.versions[0]?.versionNum || 1) + 1;
            await prisma.agreementVersion.create({
                data: {
                    agreementId: updated.id,
                    versionNum: nextVersion,
                    content,
                    changes: changes || "Admin Edits"
                }
            });
        }

        res.json(updated);
    } catch (error) {
        console.error("Error updating agreement:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 5. Templates CRUD (Simple Mockup)
router.get('/config/templates', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
    try {
        const templates = await prisma.agreementTemplate.findMany();
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post('/config/templates', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
    try {
        const template = await prisma.agreementTemplate.create({ data: req.body });
        res.status(201).json(template);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 6. Clauses CRUD (Simple Mockup)
router.get('/config/clauses', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
    try {
        const clauses = await prisma.legalClause.findMany();
        res.json(clauses);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post('/config/clauses', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
    try {
        const clause = await prisma.legalClause.create({ data: req.body });
        res.status(201).json(clause);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 7. Send Agreement (Change status to SENT)
router.post('/:id/send', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
    try {
        const updated = await prisma.clientAgreement.update({
            where: { id: req.params.id },
            data: { status: 'SENT' }
        });
        // Here we would typically trigger an email to the client using a mailing service
        res.json(updated);
    } catch (error) {
        console.error("Error sending agreement:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ================= PUBLIC CLIENT ROUTES ================= //

// 8. Public: Get specific Agreement for Client View
router.get('/public/:id', async (req, res) => {
    try {
        const agreement = await prisma.clientAgreement.findUnique({
            where: { id: req.params.id },
            include: { customer: true }
        });

        if (!agreement) return res.status(404).json({ error: "Agreement not found" });
        if (agreement.status === 'DRAFT') return res.status(403).json({ error: "Agreement is not ready yet." });

        res.json(agreement);
    } catch (error) {
        console.error("Error fetching agreement public:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 9. Public: Sign Agreement
router.post('/public/:id/sign', async (req, res) => {
    try {
        const { signature, photo } = req.body; // base64 images
        if (!signature) return res.status(400).json({ error: "Signature is required" });
        if (!photo) return res.status(400).json({ error: "Identity photo is required" });

        const updated = await prisma.clientAgreement.update({
            where: { id: req.params.id },
            data: {
                status: 'SIGNED',
                clientSignature: signature,
                clientSignedAt: new Date(),
                clientPhotoUrl: photo,
                clientPhotoAt: new Date(),
                clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error signing agreement:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 10. Public: Download PDF
router.get('/public/:id/pdf', async (req, res) => {
    try {
        const agreement = await prisma.clientAgreement.findUnique({
            where: { id: req.params.id },
            include: { customer: true }
        });

        if (!agreement) return res.status(404).json({ error: "Agreement not found" });

        const pdfBuffer = await generateAgreementPdf(agreement);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${agreement.agreementNum}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 11. Admin: Download PDF (Duplicate for admin convenience)
router.get('/:id/pdf', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
    try {
        const agreement = await prisma.clientAgreement.findUnique({
            where: { id: req.params.id },
            include: { customer: true }
        });

        if (!agreement) return res.status(404).json({ error: "Agreement not found" });

        const pdfBuffer = await generateAgreementPdf(agreement);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${agreement.agreementNum}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
