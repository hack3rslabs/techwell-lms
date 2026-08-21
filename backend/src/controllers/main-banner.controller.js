const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllBanners = async (req, res) => {
    try {
        const banners = await prisma.mainBanner.findMany({
            orderBy: { displayOrder: 'asc' }
        });
        res.status(200).json({ status: 'success', data: { banners } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch banners' });
    }
};

exports.getActiveBanners = async (req, res) => {
    try {
        const banners = await prisma.mainBanner.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' }
        });
        res.status(200).json({ status: 'success', data: { banners } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch banners' });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const banner = await prisma.mainBanner.create({
            data: req.body
        });
        res.status(201).json({ status: 'success', data: { banner } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to create banner' });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const banner = await prisma.mainBanner.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.status(200).json({ status: 'success', data: { banner } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to update banner' });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        await prisma.mainBanner.delete({
            where: { id: req.params.id }
        });
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Failed to delete banner' });
    }
};
