import re

with open(r"e:\FinalProjects\techwell-lms\backend\src\routes\leads.routes.js", "r", encoding="utf-8") as f:
    content = f.read()

new_counts_logic = """
/**
 * @route   GET /api/leads/counts
 * @desc    Get lead counts for sidebar badges and tabs
 * @access  Private/Admin
 */
router.get('/counts', authenticate, checkPermission('LEADS'), async (req, res, next) => {
    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { leadLastSeenAt: true }
        });

        const unreadWhere = currentUser?.leadLastSeenAt
            ? { createdAt: { gt: currentUser.leadLastSeenAt } }
            : {};

        // Fetch counts grouped by status
        const groupedCounts = await prisma.lead.groupBy({
            by: ['status'],
            _count: {
                id: true,
            },
        });

        const statusCounts = {};
        groupedCounts.forEach(item => {
            statusCounts[item.status] = item._count.id;
        });

        const [totalCount, unreadCount] = await Promise.all([
            prisma.lead.count(),
            prisma.lead.count({ where: unreadWhere })
        ]);

        res.json({
            totalCount,
            unreadCount,
            hasUnread: unreadCount > 0,
            lastSeenAt: currentUser?.leadLastSeenAt || null,
            statusCounts
        });
    } catch (error) {
        next(error);
    }
});
"""

# Replace the old router.get('/counts', ...) block
pattern = re.compile(r"/\*\*\n \* @route   GET /api/leads/counts[\s\S]*?router\.get\('/counts',[\s\S]*?\}\);\n\}\);\n")
content = pattern.sub(new_counts_logic + "\n", content)

with open(r"e:\FinalProjects\techwell-lms\backend\src\routes\leads.routes.js", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated leads counts API.")
