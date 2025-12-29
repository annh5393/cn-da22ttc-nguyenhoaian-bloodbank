import prisma from '../src/config/prisma';
import bcrypt from 'bcryptjs';

async function updateStaffPasswords() {
  try {
    console.log('Updating staff passwords...');
    
    // Get all staff without password
    const staffWithoutPassword = await prisma.nhanvienyte.findMany({
      where: {
        OR: [
          { passwordNV: null },
          { passwordNV: '' }
        ]
      }
    });

    console.log(`Found ${staffWithoutPassword.length} staff without password`);

    for (const staff of staffWithoutPassword) {
      // Generate temp password: {manvyt}@2024
      const tempPassword = `${staff.manvyt}@2024`;
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await prisma.nhanvienyte.update({
        where: { manvyt: staff.manvyt },
        data: { passwordNV: hashedPassword }
      });

      console.log(`✓ Updated password for ${staff.manvyt} (${staff.hotennvyt})`);
      console.log(`  Temp password: ${tempPassword}`);
    }

    console.log('\n✅ All staff passwords updated!');
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateStaffPasswords();
