import re

with open(r"e:\FinalProjects\techwell-lms\backend\src\routes\admin.routes.js", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the Promise.all array and destructuring
content = content.replace("prisma.lead.count(),", "prisma.lead.count(),\n            prisma.installment.count({ where: { status: 'PENDING' } }),")

content = content.replace(
    "const [users, courses, enrollments, interviews, leads, campusDrives, revenueResult, activeTasks, activeTickets, activeProjects] = await Promise.all([",
    "const [users, courses, enrollments, interviews, leads, upcomingFeesCount, campusDrives, revenueResult, activeTasks, activeTickets, activeProjects] = await Promise.all(["
)

# And in the res.json({ ... }) block
content = content.replace(
    "leads,",
    "leads,\n            upcomingFeesCount,"
)

with open(r"e:\FinalProjects\techwell-lms\backend\src\routes\admin.routes.js", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated admin stats.")
