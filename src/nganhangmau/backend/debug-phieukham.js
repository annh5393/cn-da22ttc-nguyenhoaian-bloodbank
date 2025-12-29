// Script debug để kiểm tra giá trị ketquasangloc trong database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Kiểm tra tất cả phiếu khám trong database:\n');
  
  const allPhieuKham = await prisma.phieukham.findMany({
    select: {
      maphieukham: true,
      manguoihien: true,
      ketquasangloc: true,
      ngaykham: true,
      nguoihienmau: {
        select: {
          hotennguoihien: true
        }
      }
    },
    orderBy: { ngaykham: 'desc' }
  });

  console.log(`Tổng số phiếu khám: ${allPhieuKham.length}\n`);
  
  allPhieuKham.forEach((pk, index) => {
    console.log(`${index + 1}. Phiếu: ${pk.maphieukham}`);
    console.log(`   Người hiến: ${pk.nguoihienmau?.hotennguoihien} (${pk.manguoihien})`);
    console.log(`   Kết quả: "${pk.ketquasangloc}"`);
    console.log(`   Kết quả (hex): ${Buffer.from(pk.ketquasangloc || '', 'utf8').toString('hex')}`);
    console.log(`   Ngày khám: ${pk.ngaykham}`);
    
    // Normalize để test
    const normalized = (pk.ketquasangloc || '')
      .toString()
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/Đ/g, 'D')
      .replace(/đ/g, 'D');
    console.log(`   Normalized: "${normalized}"`);
    console.log(`   Is DAT?: ${normalized === 'DAT'}`);
    console.log('');
  });

  // Thống kê
  const stats = {};
  allPhieuKham.forEach(pk => {
    const key = pk.ketquasangloc || 'NULL';
    stats[key] = (stats[key] || 0) + 1;
  });

  console.log('\n📊 Thống kê kết quả sàng lọc:');
  Object.entries(stats).forEach(([key, count]) => {
    console.log(`   "${key}": ${count} phiếu`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
