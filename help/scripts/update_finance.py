import re

with open(r"e:\FinalProjects\techwell-lms\backend\src\routes\finance.routes.js", "r", encoding="utf-8") as f:
    content = f.read()

upcoming_fees_code = """
/**
 * @route   GET /api/finance/upcoming-fees
 * @desc    Get upcoming installments / EMIs
 * @access  Private (Admin/Finance)
 */
router.get('/upcoming-fees', authenticate, checkPermission('FINANCE'), async (req, res, next) => {
    try {
        const upcoming = await prisma.installment.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                enrollment: {
                    include: {
                        user: { select: { name: true, email: true, phone: true } },
                        course: { select: { title: true } }
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            },
            take: 20
        });

        res.json({
            success: true,
            data: upcoming
        });
    } catch (error) {
        next(error);
    }
});
"""

if "router.get('/upcoming-fees'" not in content:
    content += "\n" + upcoming_fees_code

with open(r"e:\FinalProjects\techwell-lms\backend\src\routes\finance.routes.js", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated finance routes.")
