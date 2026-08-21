const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        // Find a user
        const user = await prisma.user.findFirst();
        console.log("User:", user.email);

        // Find a product
        const product = await prisma.storeProduct.findFirst();
        console.log("Product:", product.name);

        // Generate a token for this user
        const jwt = require('jsonwebtoken');
        // I need to use the actual JWT_SECRET from backend/.env. Let's assume it works or we fetch it.
        const path = require('path');
        require('dotenv').config({ path: path.join(__dirname, '../../../../../../../E:/Projects/Techwell-LMS/techwell-lms-Beta/backend/.env') });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your-secret-key-that-should-be-at-least-32-chars', {
            expiresIn: '90d'
        });

        // Add to cart
        const res = await fetch('http://localhost:5000/api/store/cart', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: product.id,
                quantity: 1
            })
        });

        const resData = await res.json();
        console.log("Add to Cart Response:", resData);

        // Now test checkout
        console.log("Creating order...");
        const address = await prisma.address.findFirst({ where: { userId: user.id } }) || await prisma.address.create({
            data: {
                userId: user.id,
                fullName: "Test User",
                phone: "1234567890",
                street: "123 Main St",
                city: "Test City",
                state: "Test State",
                zipCode: "12345",
                country: "India"
            }
        });

        const orderRes = await fetch('http://localhost:5000/api/store/orders', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                addressId: address.id,
                paymentMethod: 'COD'
            })
        });

        const orderResData = await orderRes.json();
        console.log("Order Response:", orderResData);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
