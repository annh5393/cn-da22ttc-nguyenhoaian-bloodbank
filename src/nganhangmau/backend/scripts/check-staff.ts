import prisma from '../src/config/prisma';

async function checkStaff() {
  try {
    const staff = await prisma.nhanvienyte.findMany({
      select: {
        manvyt: true,
        hotennvyt: true,
        emailnv: true,
        vaitro: true,
        trangthai: true,
      }
    });

    console.log('\n📋 Danh sách nhân viên:\n');
    staff.forEach(s => {
      console.log(`👤 ${s.manvyt} - ${s.hotennvyt}`);
      console.log(`   Email: ${s.emailnv || '(chưa có)'}`);
      console.log(`   Vai trò: ${s.vaitro}`);
      console.log(`   Trạng thái: ${s.trangthai}`);
      console.log(`   Password: ${s.manvyt}@2024`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStaff();
