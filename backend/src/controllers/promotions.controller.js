const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Campaign CRUD ────────────────────────────────────────────────────────────

exports.getDashboardStats = async (req, res) => {
  try {
    const [total, active, scheduled, draft, expired] = await Promise.all([
      prisma.contentPromotion.count(),
      prisma.contentPromotion.count({ where: { status: 'PUBLISHED' } }),
      prisma.contentPromotion.count({ where: { status: 'SCHEDULED' } }),
      prisma.contentPromotion.count({ where: { status: 'DRAFT' } }),
      prisma.contentPromotion.count({ where: { status: 'EXPIRED' } }),
    ]);

    const analytics = await prisma.contentPromotion.aggregate({
      _sum: { totalImpressions: true, totalClicks: true, totalConversions: true, totalRevenue: true }
    });

    const topCampaigns = await prisma.contentPromotion.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { totalImpressions: 'desc' },
      take: 5,
      select: { id: true, name: true, type: true, totalImpressions: true, totalClicks: true, totalConversions: true, status: true }
    });

    const impressionsByDay = await prisma.promotionAnalytics.groupBy({
      by: ['createdAt'],
      where: {
        action: 'IMPRESSION',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      _count: { action: true },
      orderBy: { createdAt: 'asc' }
    });

    const totalImpressions = analytics._sum.totalImpressions || 0;
    const totalClicks = analytics._sum.totalClicks || 0;
    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

    res.json({
      success: true,
      data: {
        campaigns: { total, active, scheduled, draft, expired },
        analytics: {
          totalImpressions,
          totalClicks,
          totalConversions: analytics._sum.totalConversions || 0,
          totalRevenue: analytics._sum.totalRevenue || 0,
          ctr: parseFloat(ctr),
        },
        topCampaigns,
        impressionsByDay,
      }
    });
  } catch (error) {
    console.error('[Promotions] getDashboardStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const status = req.query.status ? String(req.query.status) : undefined;
    const type = req.query.type ? String(req.query.type) : undefined;
    const zone = req.query.zone ? String(req.query.zone) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (zone) where.zones = { has: zone };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [promotions, total] = await Promise.all([
      prisma.contentPromotion.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
      }),
      prisma.contentPromotion.count({ where })
    ]);

    res.json({ success: true, data: promotions, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('[Promotions] getAll error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const promotion = await prisma.contentPromotion.findUnique({
      where: { id: req.params.id },
      include: {
        analytics: {
          take: 100,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!promotion) return res.status(404).json({ success: false, message: 'Promotion not found' });
    res.json({ success: true, data: promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      name, code, type, category, title, subtitle, description, ctaText, redirectUrl,
      imageUrl, videoUrl, mediaId, backgroundColor, theme, startDate, endDate, startTime, endTime,
      timezone, autoPublish, autoExpire, isRecurring, recurringPattern, priority,
      targetRoles, targetColleges, targetCourses, targetBatches, targetPlans, zones,
      displayFrequency, maxViews, maxClicks, hideAfterAction, aiPersonalized, triggerCourses,
      recommendCategory, tags
    } = req.body;

    if (!name || !title) {
      return res.status(400).json({ success: false, message: 'Name and Title are required.' });
    }

    // Auto-generate code if not provided
    const promoCode = code || `PROMO-${Date.now()}`;

    let initialStatus = 'DRAFT';
    if (autoPublish && startDate && new Date(startDate) <= new Date()) {
      initialStatus = 'PUBLISHED';
    } else if (startDate && new Date(startDate) > new Date()) {
      initialStatus = autoPublish ? 'SCHEDULED' : 'DRAFT';
    }

    const promotion = await prisma.contentPromotion.create({
      data: {
        name, code: promoCode, type: type || 'HERO_BANNER', category, title, subtitle, description,
        ctaText, redirectUrl, imageUrl, videoUrl, mediaId, backgroundColor, theme,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        startTime, endTime, timezone, autoPublish: !!autoPublish, autoExpire: autoExpire !== false,
        isRecurring: !!isRecurring, recurringPattern, priority: priority || 0,
        targetRoles: targetRoles || [], targetColleges: targetColleges || [],
        targetCourses: targetCourses || [], targetBatches: targetBatches || [],
        targetPlans: targetPlans || [], zones: zones || [],
        displayFrequency: displayFrequency || 'ALWAYS', maxViews, maxClicks, hideAfterAction,
        aiPersonalized: !!aiPersonalized, triggerCourses: triggerCourses || [],
        recommendCategory, tags: tags || [],
        status: initialStatus,
        createdById: req.user?.id,
        publishedAt: initialStatus === 'PUBLISHED' ? new Date() : null,
      }
    });
    res.status(201).json({ success: true, data: promotion });
  } catch (error) {
    console.error('[Promotions] create error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'A campaign with this code already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.contentPromotion.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Promotion not found' });

    const {
      name, code, type, category, title, subtitle, description, ctaText, redirectUrl,
      imageUrl, videoUrl, mediaId, backgroundColor, theme, startDate, endDate, startTime, endTime,
      timezone, autoPublish, autoExpire, isRecurring, recurringPattern, priority, status,
      targetRoles, targetColleges, targetCourses, targetBatches, targetPlans, zones,
      displayFrequency, maxViews, maxClicks, hideAfterAction, aiPersonalized, triggerCourses,
      recommendCategory, tags
    } = req.body;

    const promotion = await prisma.contentPromotion.update({
      where: { id },
      data: {
        name, code, type, category, title, subtitle, description, ctaText, redirectUrl,
        imageUrl, videoUrl, mediaId, backgroundColor, theme,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        startTime, endTime, timezone,
        autoPublish: autoPublish !== undefined ? !!autoPublish : existing.autoPublish,
        autoExpire: autoExpire !== undefined ? !!autoExpire : existing.autoExpire,
        isRecurring: isRecurring !== undefined ? !!isRecurring : existing.isRecurring,
        recurringPattern, priority,
        status: status || existing.status,
        targetRoles: targetRoles || existing.targetRoles,
        targetColleges: targetColleges || existing.targetColleges,
        targetCourses: targetCourses || existing.targetCourses,
        targetBatches: targetBatches || existing.targetBatches,
        targetPlans: targetPlans || existing.targetPlans,
        zones: zones || existing.zones,
        displayFrequency, maxViews, maxClicks, hideAfterAction,
        aiPersonalized: aiPersonalized !== undefined ? !!aiPersonalized : existing.aiPersonalized,
        triggerCourses: triggerCourses || existing.triggerCourses,
        recommendCategory,
        tags: tags || existing.tags,
        publishedAt: status === 'PUBLISHED' && !existing.publishedAt ? new Date() : existing.publishedAt,
        approvedById: status === 'PUBLISHED' ? req.user?.id : existing.approvedById,
        approvedAt: status === 'PUBLISHED' && !existing.approvedAt ? new Date() : existing.approvedAt,
      }
    });
    res.json({ success: true, data: promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await prisma.contentPromotion.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'SCHEDULED', 'EXPIRED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const promotion = await prisma.contentPromotion.update({
      where: { id: req.params.id },
      data: {
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
        expiredAt: status === 'EXPIRED' ? new Date() : undefined,
        approvedById: status === 'PUBLISHED' ? req.user?.id : undefined,
        approvedAt: status === 'PUBLISHED' ? new Date() : undefined,
      }
    });
    res.json({ success: true, data: promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delivery Engine ──────────────────────────────────────────────────────────

exports.deliver = async (req, res) => {
  try {
    const { zones, role = 'GUEST', plan = 'FREE', courseIds = [], sessionId } = req.body;
    const userId = req.user?.id;
    const now = new Date();

    if (!zones || !(Array.isArray(zones) ? zones : []).length) {
      return res.status(400).json({ success: false, message: 'zones[] is required' });
    }

    const promotions = await prisma.contentPromotion.findMany({
      where: {
        status: 'PUBLISHED',
        zones: { hasSome: zones },
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          },
          {
            OR: [
              { targetRoles: { isEmpty: true } },
              { targetRoles: { has: role } }
            ]
          },
          {
            OR: [
              { targetPlans: { isEmpty: true } },
              { targetPlans: { has: plan } }
            ]
          }
        ]
      },
      orderBy: { priority: 'desc' }
    });

    // AI Personalization: if triggerCourses match user's enrolled courses, boost it
    let ranked = promotions.map(p => {
      let score = p.priority;
      if (p.aiPersonalized && courseIds.length && p.triggerCourses.some(tc => courseIds.includes(tc))) {
        score += 100; // Boost AI-personalized relevant campaigns
      }
      return { ...p, _score: score };
    }).sort((a, b) => b._score - a._score);

    // Group by zone for efficient rendering
    const byZone = {};
    for (const zone of zones) {
      byZone[zone] = ranked.filter(p => p.zones.includes(zone)).slice(0, 5);
    }

    // Record impressions async (fire-and-forget)
    if (ranked.length > 0) {
      const impressionData = ranked.map(p => ({
        promotionId: p.id,
        userId: userId || null,
        sessionId: sessionId || null,
        action: 'IMPRESSION',
        zone: zones[0],
      }));
      // Non-blocking
      prisma.promotionAnalytics.createMany({ data: impressionData }).catch(e => console.error('Impression track error:', e));
      // Update aggregate counters
      prisma.contentPromotion.updateMany({
        where: { id: { in: ranked.map(p => p.id) } },
        data: { totalImpressions: { increment: 1 } }
      }).catch(e => console.error('Impression aggregate error:', e));
    }

    res.json({ success: true, data: byZone });
  } catch (error) {
    console.error('[Promotions] deliver error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Tracking ─────────────────────────────────────────────────────────────────

exports.track = async (req, res) => {
  try {
    const { promotionId, action, zone, device, browser, location, revenue, sessionId } = req.body;
    const userId = req.user?.id;

    if (!promotionId || !action) {
      return res.status(400).json({ success: false, message: 'promotionId and action required' });
    }

    const validActions = ['IMPRESSION', 'CLICK', 'CONVERSION', 'REGISTRATION', 'PURCHASE'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await prisma.promotionAnalytics.create({
      data: {
        promotionId,
        userId: userId || null,
        sessionId: sessionId || null,
        action,
        zone,
        device,
        browser,
        location,
        revenue: revenue || null
      }
    });

    // Update aggregate
    const updateData = {};
    if (action === 'CLICK') updateData.totalClicks = { increment: 1 };
    if (action === 'CONVERSION' || action === 'REGISTRATION') updateData.totalConversions = { increment: 1 };
    if (action === 'PURCHASE' && revenue) updateData.totalRevenue = { increment: revenue };

    if (Object.keys(updateData).length > 0) {
      await prisma.contentPromotion.update({ where: { id: promotionId }, data: updateData });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Media Library ────────────────────────────────────────────────────────────

exports.getMedia = async (req, res) => {
  try {
    let { type, category, search, page = 1, limit = 30 } = req.query;
    if (type !== undefined) type = Array.isArray(type) ? type[0] : String(type);
    if (category !== undefined) category = Array.isArray(category) ? category[0] : String(category);
    if (search !== undefined) search = Array.isArray(search) ? search[0] : String(search);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [media, total] = await Promise.all([
      prisma.marketingMedia.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.marketingMedia.count({ where })
    ]);
    res.json({ success: true, data: media, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMedia = async (req, res) => {
  try {
    const { name, url, type, mimeType, fileSize, width, height, duration, category, tags, alt } = req.body;
    if (!name || !url) return res.status(400).json({ success: false, message: 'Name and URL required' });
    const filename = String(url || "").split('/').pop();
    const media = await prisma.marketingMedia.create({
      data: {
        name,
        filename,
        url,
        type: type || 'IMAGE',
        mimeType,
        fileSize,
        width,
        height,
        duration,
        category,
        tags: tags || [],
        alt,
        uploadedById: req.user?.id
      }
    });
    res.status(201).json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    await prisma.marketingMedia.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    let { days = 30 } = req.query;
    if (days !== undefined) days = Array.isArray(days) ? days[0] : String(days);

    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const [byAction, byDevice, byDay] = await Promise.all([
      prisma.promotionAnalytics.groupBy({
        by: ['action'],
        where: { promotionId: id, createdAt: { gte: since } },
        _count: { action: true }
      }),
      prisma.promotionAnalytics.groupBy({
        by: ['device'],
        where: { promotionId: id, createdAt: { gte: since } },
        _count: { device: true }
      }),
      prisma.promotionAnalytics.findMany({
        where: { promotionId: id, createdAt: { gte: since } },
        select: { action: true, createdAt: true },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    res.json({ success: true, data: { byAction, byDevice, byDay } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
