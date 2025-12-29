// Script debug để kiểm tra người hiến trong database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Kiểm tra tất cả người hiến trong database:\n');
  
  const allNguoiHien = await prisma.nguoihienmau.findMany({
    select: {
      manguoihien: true,
      hotennguoihien: true,
      email: true,
      trangthai: true,
      nhommau: true,
      rhesus: true
    }
  });

  console.log(`Tổng số người hiến: ${allNguoiHien.length}\n`);
  
  allNguoiHien.forEach((nh, index) => {
    console.log(`${index + 1}. ${nh.manguoihien} - ${nh.hotennguoihien}`);
    console.log(`   Email: ${nh.email}`);
    console.log(`   Trạng thái: "${nh.trangthai}"`);
    console.log(`   Nhóm máu: ${nh.nhommau}${nh.rhesus}`);
    console.log('');
  });

  // Thống kê trạng thái
  const stats = {};
  allNguoiHien.forEach(nh => {
    const key = nh.trangthai || 'NULL';
    stats[key] = (stats[key] || 0) + 1;
  });

  console.log('\n📊 Thống kê trạng thái:');
  Object.entries(stats).forEach(([key, count]) => {
    console.log(`   "${key}": ${count} người`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
