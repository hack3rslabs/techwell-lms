const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Shop DB...");

    // 1. Create a Category
    const category = await prisma.storeCategory.upsert({
        where: { slug: 'laptops' },
        update: {},
        create: {
            name: 'Laptops & PCs',
            slug: 'laptops',
            description: 'Premium business laptops and gaming PCs',
            isActive: true
        }
    });
    console.log(`Category created: ${category.name}`);

    // 2. Create a Banner
    const banner = await prisma.storeBanner.create({
        data: {
            title: 'Premium Refurbished ThinkPads',
            description: 'Get up to 50% off on premium business laptops with verified student ID. 6 Months Warranty included.',
            imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop',
            targetUrl: '/shop/search?category=laptops',
            ctaText: 'Shop Laptops',
            isActive: true,
            displayOrder: 1
        }
    });
    console.log(`Banner created: ${banner.title}`);

    // 3. Create a Product
    const product = await prisma.storeProduct.upsert({
        where: { slug: 'lenovo-thinkpad-t480-refurbished' },
        update: {},
        create: {
            name: 'Lenovo ThinkPad T480 (Refurbished)',
            slug: 'lenovo-thinkpad-t480-refurbished',
            sku: 'LPT-LNV-T480-01',
            brand: 'Lenovo',
            description: 'Intel Core i5 8th Gen, 16GB RAM, 512GB SSD. Excellent condition. Perfect for programming and business use.\n\nKey Features:\n- 14" FHD IPS Display\n- Backlit Keyboard\n- Dual Battery System\n- Windows 11 Pro\n\nCondition: Refurbished (Grade A) - Minimal signs of wear.',
            price: 35000,
            discountPrice: 22500,
            categoryId: category.id,
            stock: 15,
            condition: 'REFURBISHED',
            images: [
                'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=2000&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=2000&auto=format&fit=crop'
            ],
            isActive: true,
            isFeatured: true,
            studentDiscount: 1500,
            studentDiscountType: 'FIXED'
        }
    });
    console.log(`Product created: ${product.name}`);

    // 4. Create an Affiliate Product
    const affiliate = await prisma.storeProduct.upsert({
        where: { slug: 'logitech-mx-master-3s' },
        update: {},
        create: {
            name: 'Logitech MX Master 3S Wireless Mouse',
            slug: 'logitech-mx-master-3s',
            brand: 'Logitech',
            description: 'Advanced wireless mouse with 8K DPI tracking and quiet clicks.',
            price: 10995,
            discountPrice: 8999,
            categoryId: category.id,
            stock: 0,
            isAffiliate: true,
            affiliateUrl: 'https://amazon.in',
            affiliateSource: 'Amazon',
            images: [
                'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=2000&auto=format&fit=crop'
            ],
            isActive: true,
            isFeatured: false
        }
    });
    console.log(`Affiliate Product created: ${affiliate.name}`);
    
    console.log("Seeding complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
