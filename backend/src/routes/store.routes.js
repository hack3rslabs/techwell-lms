const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public Store Routes (Product Catalog)
router.get('/settings/status', storeController.getStoreStatus);
router.get('/products', storeController.getProducts);
router.get('/products/:slug', storeController.getProductBySlug);
router.get('/categories', storeController.getCategories);
router.get('/banners', storeController.getBanners);

// Protected User Routes (Cart, Wishlist, Orders)
router.use('/cart', authenticate);
router.get('/cart', storeController.getCart);
router.post('/cart', storeController.addToCart);
router.put('/cart/:itemId', storeController.updateCartItem);
router.delete('/cart/:itemId', storeController.removeFromCart);

router.use('/wishlist', authenticate);
router.get('/wishlist', storeController.getWishlist);
router.post('/wishlist', storeController.toggleWishlist);

router.use('/orders', authenticate);
router.post('/orders', storeController.createOrder);
router.get('/orders', storeController.getMyOrders);
router.get('/orders/:id', storeController.getOrderById);

router.use('/addresses', authenticate);
router.get('/addresses', storeController.getAddresses);
router.post('/addresses', storeController.addAddress);

// Admin Only Routes
router.use('/admin', authenticate, authorize('SUPER_ADMIN', 'ADMIN'));
router.post('/admin/products', storeController.createProduct);
router.put('/admin/products/:id', storeController.updateProduct);
router.delete('/admin/products/:id', storeController.deleteProduct);

router.post('/admin/categories', storeController.createCategory);
router.put('/admin/categories/:id', storeController.updateCategory);

router.get('/admin/orders', storeController.getAllOrders);
router.put('/admin/orders/:id/status', storeController.updateOrderStatus);

router.get('/admin/settings', storeController.getStoreSettings);
router.put('/admin/settings', storeController.updateStoreSettings);

router.get('/admin/banners', storeController.getBanners);
router.post('/admin/banners', storeController.createBanner);
router.put('/admin/banners/:id', storeController.updateBanner);
router.delete('/admin/banners/:id', storeController.deleteBanner);

module.exports = router;
