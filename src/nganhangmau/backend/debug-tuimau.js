const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTuiMau() {
  console.log('Kiểm tra túi máu trong database:\n');

  const tuimau = await prisma.tuimau.findMany({
    include: {
      nguoihienmau: {
        select: {
          manguoihien: true,
          hotennguoihien: true,
          nhommau: true,
          rhesus: true,
        }
      }
    },
    orderBy: {
      matuimau: 'desc'
    }
  });

  console.log(`Tổng số túi máu: ${tuimau.length}\n`);

  tuimau.forEach((tui, index) => {
    console.log(`${index + 1}. ${tui.matuimau}`);
    console.log(`   Người hiến: ${tui.nguoihienmau?.hotennguoihien || 'N/A'} (${tui.manguoihien})`);
    console.log(`   Nhóm máu: ${tui.nguoihienmau?.nhommau || 'N/A'}${tui.nguoihienmau?.rhesus || ''}`);
    console.log(`   Thể tích: ${tui.thetich} ml`);
    console.log(`   Trạng thái: ${tui.trangthai}`);
    console.log(`   Hạn sử dụng: ${tui.hansudung ? new Date(tui.hansudung).toLocaleDateString('vi-VN') : 'N/A'}`);
    console.log('');
  });

  // Thống kê theo nhóm máu
  console.log('\nThống kê theo nhóm máu:');
  const stats = {};
  tuimau.forEach(tui => {
    const bloodType = `${tui.nguoihienmau?.nhommau || 'Unknown'}${tui.nguoihienmau?.rhesus || ''}`;
    if (!stats[bloodType]) {
      stats[bloodType] = { total: 0, available: 0, expired: 0, expiringSoon: 0 };
    }
    stats[bloodType].total++;
    
    const today = new Date();
    const expiry = tui.hansudung ? new Date(tui.hansudung) : null;
    
    if (expiry) {
      if (expiry < today) {
        stats[bloodType].expired++;
      } else if (tui.trangthai === 'CON_HAN' || tui.trangthai === 'SAP_HET_HAN') {
        stats[bloodType].available++;
        
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 7) {
          stats[bloodType].expiringSoon++;
        }
      }
    }
  });

  Object.entries(stats).forEach(([bloodType, data]) => {
    console.log(`\n${bloodType}:`);
    console.log(`   Tổng: ${data.total} túi`);
    console.log(`   Khả dụng: ${data.available} túi`);
    console.log(`   Sắp hết hạn (7 ngày): ${data.expiringSoon} túi`);
    console.log(`   Hết hạn: ${data.expired} túi`);
  });

  await prisma.$disconnect();
}

checkTuiMau().catch(console.error);
