const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const catchAsync = fn => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// ==========================================
// PUBLIC STORE ROUTES
// ==========================================

exports.getProducts = catchAsync(async (req, res) => {
    const { category, subcategory, search, condition, minPrice, maxPrice, brand, hasStudentOffer, sort } = req.query;
    let filter = { isActive: true };

    if (category) filter.category = { slug: category };
    if (subcategory) filter.subcategory = { slug: subcategory };
    if (condition) filter.condition = condition;
    if (brand) filter.brand = { equals: brand, mode: 'insensitive' };
    if (hasStudentOffer === 'true') filter.studentDiscount = { not: null };
    
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.gte = parseFloat(minPrice);
        if (maxPrice) filter.price.lte = parseFloat(maxPrice);
    }

    if (search) {
        filter.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } }
        ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };
    
    const products = await prisma.storeProduct.findMany({
        where: filter,
        include: { category: true, subcategory: true, reviews: true },
        orderBy
    });

    res.status(200).json({ status: 'success', data: { products } });
});

exports.getProductBySlug = catchAsync(async (req, res, next) => {
    const product = await prisma.storeProduct.findUnique({
        where: { slug: req.params.slug },
        include: { category: true }
    });

    if (!product) return next(new AppError('Product not found', 404));
    res.status(200).json({ status: 'success', data: { product } });
});

exports.getCategories = catchAsync(async (req, res) => {
    const categories = await prisma.storeCategory.findMany({
        where: { isActive: true }
    });
    res.status(200).json({ status: 'success', data: { categories } });
});

// ==========================================
// USER CART & WISHLIST
// ==========================================

exports.getCart = catchAsync(async (req, res) => {
    const cart = await prisma.cart.findUnique({
        where: { userId: req.user.id },
        include: { items: { include: { product: true } } }
    });

    res.status(200).json({ status: 'success', data: { cart: cart || { items: [] } } });
});

exports.addToCart = catchAsync(async (req, res) => {
    const { productId, quantity } = req.body;
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });

    if (!cart) {
        cart = await prisma.cart.create({ data: { userId: req.user.id } });
    }

    // Check if item exists
    const existingItem = await prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } }
    });

    if (existingItem) {
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + (quantity || 1) }
        });
    } else {
        await prisma.cartItem.create({
            data: { cartId: cart.id, productId, quantity: quantity || 1 }
        });
    }

    res.status(200).json({ status: 'success', message: 'Added to cart' });
});

exports.updateCartItem = catchAsync(async (req, res) => {
    const { quantity } = req.body;
    await prisma.cartItem.update({
        where: { id: req.params.itemId },
        data: { quantity }
    });
    res.status(200).json({ status: 'success' });
});

exports.removeFromCart = catchAsync(async (req, res) => {
    await prisma.cartItem.delete({
        where: { id: req.params.itemId }
    });
    res.status(204).json({ status: 'success', data: null });
});

exports.getWishlist = catchAsync(async (req, res) => {
    const wishlist = await prisma.wishlist.findUnique({
        where: { userId: req.user.id },
        include: { items: { include: { product: true } } }
    });
    res.status(200).json({ status: 'success', data: { wishlist: wishlist || { items: [] } } });
});

exports.toggleWishlist = catchAsync(async (req, res) => {
    const { productId } = req.body;
    let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.id } });

    if (!wishlist) {
        wishlist = await prisma.wishlist.create({ data: { userId: req.user.id } });
    }

    const existing = await prisma.wishlistItem.findUnique({
        where: { wishlistId_productId: { wishlistId: wishlist.id, productId } }
    });

    if (existing) {
        await prisma.wishlistItem.delete({ where: { id: existing.id } });
        return res.status(200).json({ status: 'success', message: 'Removed from wishlist' });
    } else {
        await prisma.wishlistItem.create({
            data: { wishlistId: wishlist.id, productId }
        });
        return res.status(200).json({ status: 'success', message: 'Added to wishlist' });
    }
});

// ==========================================
// ORDERS & ADDRESSES
// ==========================================

exports.createOrder = catchAsync(async (req, res) => {
    const { addressId, paymentMethod, applyStudentDiscount, specificItems } = req.body;
    const cart = await prisma.cart.findUnique({
        where: { userId: req.user.id },
        include: { items: { include: { product: true } } }
    });

    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ status: 'fail', message: 'Cart is empty' });
    }

    let itemsToProcess = cart.items;
    if (specificItems && specificItems.length > 0) {
        itemsToProcess = cart.items.filter(item => specificItems.includes(item.id));
    }
    
    if (itemsToProcess.length === 0) {
        return res.status(400).json({ status: 'fail', message: 'No items selected for checkout' });
    }

    let totalAmount = 0;
    
    // Check student eligibility
    let isStudentEligible = false;
    if (applyStudentDiscount) {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        // Simplified check: role STUDENT and has an institute
        if (user && user.role === 'STUDENT' && user.instituteId) {
            isStudentEligible = true;
        } else if (user && user.role === 'STUDENT' && !user.instituteId) {
            // Can add more complex verification checks if needed
            isStudentEligible = true;
        }
    }

    const orderItemsData = itemsToProcess.map(item => {
        let price = item.product.discountPrice || item.product.price;
        
        // Apply student discount if applicable
        if (isStudentEligible && item.product.studentDiscount) {
            if (item.product.studentDiscountType === 'FIXED') {
                price = Math.max(0, price - item.product.studentDiscount);
            } else if (item.product.studentDiscountType === 'PERCENTAGE') {
                price = price - (price * (item.product.studentDiscount / 100));
            }
        }
        
        totalAmount += price * item.quantity;
        return {
            productId: item.productId,
            quantity: item.quantity,
            price: price
        };
    });

    // Create Order
    const order = await prisma.storeOrder.create({
        data: {
            orderId: `ORD-${Date.now()}`,
            userId: req.user.id,
            addressId,
            totalAmount,
            paymentMethod,
            items: {
                create: orderItemsData
            }
        }
    });

    // Empty processed items from Cart
    const processedItemIds = itemsToProcess.map(i => i.id);
    await prisma.cartItem.deleteMany({ where: { id: { in: processedItemIds } } });

    res.status(201).json({ status: 'success', data: { order } });
});

exports.getMyOrders = catchAsync(async (req, res) => {
    const orders = await prisma.storeOrder.findMany({
        where: { userId: req.user.id },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ status: 'success', data: { orders } });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
    const order = await prisma.storeOrder.findUnique({
        where: { id: req.params.id },
        include: { items: { include: { product: true } }, address: true }
    });
    if (!order) return next(new AppError('Order not found', 404));
    res.status(200).json({ status: 'success', data: { order } });
});

exports.getAddresses = catchAsync(async (req, res) => {
    const addresses = await prisma.address.findMany({
        where: { userId: req.user.id }
    });
    res.status(200).json({ status: 'success', data: { addresses } });
});

exports.addAddress = catchAsync(async (req, res) => {
    const address = await prisma.address.create({
        data: { ...req.body, userId: req.user.id }
    });
    res.status(201).json({ status: 'success', data: { address } });
});

// ==========================================
// ADMIN ROUTES
// ==========================================

exports.createProduct = catchAsync(async (req, res) => {
    const product = await prisma.storeProduct.create({ data: req.body });
    res.status(201).json({ status: 'success', data: { product } });
});

exports.updateProduct = catchAsync(async (req, res) => {
    const product = await prisma.storeProduct.update({
        where: { id: req.params.id },
        data: req.body
    });
    res.status(200).json({ status: 'success', data: { product } });
});

exports.deleteProduct = catchAsync(async (req, res) => {
    await prisma.storeProduct.delete({ where: { id: req.params.id } });
    res.status(204).json({ status: 'success', data: null });
});

exports.createCategory = catchAsync(async (req, res) => {
    const category = await prisma.storeCategory.create({ data: req.body });
    res.status(201).json({ status: 'success', data: { category } });
});

exports.updateCategory = catchAsync(async (req, res) => {
    const category = await prisma.storeCategory.update({
        where: { id: req.params.id },
        data: req.body
    });
    res.status(200).json({ status: 'success', data: { category } });
});

exports.getAllOrders = catchAsync(async (req, res) => {
    const orders = await prisma.storeOrder.findMany({
        include: { user: true, items: true },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ status: 'success', data: { orders } });
});

exports.updateOrderStatus = catchAsync(async (req, res) => {
    const { status } = req.body;
    const order = await prisma.storeOrder.update({
        where: { id: req.params.id },
        data: { status }
    });
    res.status(200).json({ status: 'success', data: { order } });
});

exports.getStoreStatus = catchAsync(async (req, res) => {
    let settings = await prisma.storeSettings.findFirst();
    res.status(200).json({ status: 'success', data: { isStoreEnabled: settings?.isStoreEnabled || false } });
});

exports.getStoreSettings = catchAsync(async (req, res) => {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
        settings = await prisma.storeSettings.create({ data: { isStoreEnabled: false } });
    }
    res.status(200).json({ status: 'success', data: { settings } });
});

exports.updateStoreSettings = catchAsync(async (req, res) => {
    let settings = await prisma.storeSettings.findFirst();
    settings = await prisma.storeSettings.update({
        where: { id: settings.id },
        data: { isStoreEnabled: req.body.isStoreEnabled }
    });
    res.status(200).json({ status: 'success', data: { settings } });
});

// ==========================================
// BANNERS
// ==========================================
exports.getBanners = catchAsync(async (req, res) => {
    const banners = await prisma.storeBanner.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' }
    });
    res.status(200).json({ status: 'success', data: { banners } });
});

exports.createBanner = catchAsync(async (req, res) => {
    const banner = await prisma.storeBanner.create({ data: req.body });
    res.status(201).json({ status: 'success', data: { banner } });
});

exports.updateBanner = catchAsync(async (req, res) => {
    const banner = await prisma.storeBanner.update({
        where: { id: req.params.id },
        data: req.body
    });
    res.status(200).json({ status: 'success', data: { banner } });
});

exports.deleteBanner = catchAsync(async (req, res) => {
    await prisma.storeBanner.delete({ where: { id: req.params.id } });
    res.status(204).json({ status: 'success', data: null });
});

// ==========================================
// REVIEWS
// ==========================================
exports.addReview = catchAsync(async (req, res) => {
    const { productId, rating, reviewText, mediaUrls } = req.body;
    
    // Check if user has a verified purchase
    const order = await prisma.storeOrder.findFirst({
        where: {
            userId: req.user.id,
            status: { in: ['SHIPPED', 'DELIVERED'] }, // Assumption
            items: { some: { productId } }
        }
    });

    const isVerifiedPurchase = !!order;

    const review = await prisma.storeReview.create({
        data: {
            userId: req.user.id,
            productId,
            rating,
            reviewText,
            mediaUrls: mediaUrls || [],
            isVerifiedPurchase,
            isApproved: true // Can be false for moderation queue
        }
    });

    res.status(201).json({ status: 'success', data: { review } });
});

exports.getReviews = catchAsync(async (req, res) => {
    const reviews = await prisma.storeReview.findMany({
        where: { productId: req.params.productId, isApproved: true },
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ status: 'success', data: { reviews } });
});
