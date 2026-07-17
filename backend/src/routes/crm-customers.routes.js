const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, checkPermission } = require('../middleware/auth');

/**
 * @route   GET /api/crm/customers/dashboard/stats
 * @desc    Get central CRM dashboard statistics
 * @access  Private
 */
router.get('/dashboard/stats', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
    try {
        const totalCustomers = await prisma.customer.count();
        const activeDeals = await prisma.pipelineDeal.count({ where: { status: 'OPEN' } });
        
        // Approximate revenue (sum of deal value where status is won or open)
        const deals = await prisma.pipelineDeal.findMany({
            where: { status: { in: ['OPEN', 'WON'] } },
            select: { value: true }
        });
        const revenuePipeline = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
        
        const followUpsToday = await prisma.task.count({
            where: { 
                dueDate: {
                    gte: new Date(new Date().setHours(0,0,0,0)),
                    lt: new Date(new Date().setHours(23,59,59,999))
                }
            }
        });

        res.json({
            success: true,
            data: {
                totalCustomers,
                activeDeals,
                revenuePipeline,
                followUpsToday
            }
        });
    } catch (error) {
        console.error('Error fetching CRM stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
    }
});

/**
 * @route   GET /api/crm/customers
 * @desc    Get all customers
 * @access  Private
 */
router.get('/', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

/**
 * @route   POST /api/crm/customers
 * @desc    Create a new customer
 * @access  Private
 */
router.post('/', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
    try {
        const { name, companyName, email, phone } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const lastCustomer = await prisma.customer.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { customerNo: true }
        });
        
        let nextNo = 1000;
        if (lastCustomer && lastCustomer.customerNo && lastCustomer.customerNo.startsWith('CUST-')) {
            const num = parseInt(lastCustomer.customerNo.split('-')[1]);
            if (!isNaN(num)) nextNo = num + 1;
        }

        const finalName = companyName ? `${name} (${companyName})` : name;

        const customer = await prisma.customer.create({
            data: {
                customerNo: `CUST-${nextNo}`,
                name: finalName,
                email: email || undefined,
                phone: phone || undefined
            }
        });
        res.json(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
});

/**
 * @route   GET /api/crm/customers/:id/360-view
 * @desc    Get aggregated 360-degree view of a customer
 * @access  Private (Admin/Staff)
 */
router.get('/:id/360-view', authenticate, checkPermission('CENTRAL_CRM'), async (req, res) => {
    try {
        const { id } = req.params;

        // Try to find by customerNo first, otherwise fallback to cuid
        const isShortId = id.startsWith('CUST-') || id.length < 25;
        
        const customer = await prisma.customer.findFirst({
            where: {
                OR: [
                    { customerNo: id },
                    { id: id }
                ]
            },
            include: {
                // Fetch associated users (Academic profile, Support tickets)
                users: {
                    include: {
                        enrollments: {
                            include: {
                                course: {
                                    select: { title: true, slug: true }
                                }
                            }
                        },
                        certificates: true,
                    }
                },
                // Fetch leads/enquiries
                leads: {
                    orderBy: { createdAt: 'desc' }
                },
                // Fetch pipelines/deals
                pipelines: {
                    include: {
                        pipeline: true,
                        stage: true
                    },
                    orderBy: { updatedAt: 'desc' }
                },
                // Fetch candidate profiles (Career)
                candidateProfiles: true,
                // Fetch agreements
                agreements: {
                    orderBy: { createdAt: 'desc' }
                },
                // Fetch tasks and communication
                followUpTasks: {
                    orderBy: { dueDate: 'asc' }
                },
                communicationLogs: {
                    orderBy: { timestamp: 'desc' }
                },
                callLogs: {
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        if (!customer) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }

        // Build a unified timeline
        const timeline = [];

        customer.leads.forEach(lead => {
            timeline.push({
                type: 'LEAD_CREATED',
                title: 'Lead Captured',
                description: `Source: ${lead.source || 'Unknown'} - Status: ${lead.status}`,
                timestamp: lead.createdAt,
                metadata: lead
            });
        });

        customer.followUpTasks.forEach(task => {
            timeline.push({
                type: 'TASK',
                title: `Task: ${task.title}`,
                description: task.description,
                timestamp: task.createdAt, // Or due date depending on preference
                metadata: task
            });
        });

        customer.communicationLogs.forEach(log => {
            timeline.push({
                type: 'COMMUNICATION',
                title: `${log.type} Logged`,
                description: log.summary,
                timestamp: log.timestamp,
                metadata: log
            });
        });

        // Add user enrollments to timeline
        customer.users.forEach(u => {
            u.enrollments.forEach(enroll => {
                timeline.push({
                    type: 'ENROLLMENT',
                    title: 'Course Enrolled',
                    description: `Enrolled in ${enroll.course?.title || 'a course'}`,
                    timestamp: enroll.createdAt,
                    metadata: enroll
                });
            });
        });

        // Sort timeline descending
        timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            data: {
                customer,
                timeline,
                summary: {
                    totalLeads: customer.leads.length,
                    totalEnrollments: customer.users.reduce((acc, u) => acc + u.enrollments.length, 0),
                    activePipelines: customer.pipelines.filter(p => p.status === 'OPEN').length
                }
            }
        });
    } catch (error) {
        console.error('Error fetching 360 view:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch 360 view' });
    }
});

module.exports = router;
