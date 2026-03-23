const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'venukoyyana908@gmail.com' },
      select: {
        id: true,
        email: true,
        password: true
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n📋 User Record:');
    console.log('Email:', user.email);
    console.log('Password Hash:', user.password);
    console.log('Hash Starts with $2:', user.password.startsWith('$2'));
    
    // Test password verification
    const plainPassword = 'Venu@95020';
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    
    console.log('\n🔐 Password Verification:');
    console.log(`Testing password: "${plainPassword}"`);
    console.log(`Password matches hash: ${isMatch}`);
    
    if (isMatch) {
      console.log('✅ Password verification PASSED!');
    } else {
      console.log('❌ Password verification FAILED!');
      console.log('The password in the database does not match the expected password.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPassword();
