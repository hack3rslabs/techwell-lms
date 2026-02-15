
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all gallery images
exports.getGalleryImages = async (req, res) => {
    try {
        const images = await prisma.galleryImage.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        res.json(images);
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        res.status(500).json({ error: 'Failed to fetch gallery images' });
    }
};

// Add new gallery image
exports.addGalleryImage = async (req, res) => {
    try {
        const { url, caption, order } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        const image = await prisma.galleryImage.create({
            data: {
                url,
                caption,
                order: order || 0
            }
        });
        res.status(201).json(image);
    } catch (error) {
        console.error('Error adding gallery image:', error);
        res.status(500).json({ error: 'Failed to add gallery image' });
    }
};

// Delete gallery image
exports.deleteGalleryImage = async (req, res) => {
    try {
        const { id } = req.query; // Following front-end pattern: /api/admin/gallery?id=${id}
        if (!id) return res.status(400).json({ error: 'ID is required' });

        await prisma.galleryImage.delete({
            where: { id }
        });
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        res.status(500).json({ error: 'Failed to delete gallery image' });
    }
};
