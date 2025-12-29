/**
 * Script to check donation data and validate 12-week rule
 */

import prisma from '../src/config/prisma';

async function checkDonations() {
  console.log('Kiểm tra dữ liệu phiếu hiến máu...\n');

  try {
    const allDonations = await prisma.phieuhienmau.findMany({
      orderBy: [
        { manguoihien: 'asc' },
        { ngayhien: 'asc' }
      ],
      include: {
        nguoihienmau: true,
        nhanvienyte: true
      }
    });

    // Group by donor
    const donorGroups = new Map<string, typeof allDonations>();
    
    for (const donation of allDonations) {
      if (!donorGroups.has(donation.manguoihien)) {
        donorGroups.set(donation.manguoihien, []);
      }
      donorGroups.get(donation.manguoihien)!.push(donation);
    }

    console.log(`Tổng số: ${allDonations.length} phiếu từ ${donorGroups.size} người hiến\n`);
    console.log('='.repeat(80));

    for (const [manguoihien, donations] of donorGroups.entries()) {
      if (donations.length === 0) continue;
      
      const donorName = donations[0]?.nguoihienmau?.hotennguoihien || manguoihien;
      console.log(`\n${donorName} (${manguoihien})`);
      console.log(`   Tổng: ${donations.length} lần hiến`);
      console.log('   ' + '-'.repeat(70));

      for (let i = 0; i < donations.length; i++) {
        const donation = donations[i];
        if (!donation) continue;

        const date = donation.ngayhien ? new Date(donation.ngayhien) : null;
        const dateStr = date ? date.toLocaleDateString('vi-VN') : 'Chưa có ngày';
        const staff = donation.nhanvienyte?.hotennvyt || donation.manvyt;

        console.log(`   ${i + 1}. ${donation.maphieuhien} | ${dateStr} | ${donation.luongmauhien}ml | ${donation.trangthai}`);
        console.log(`      Lần hiến: ${donation.hienlan} | Nhân viên: ${staff}`);

        // Check interval with previous donation
        if (i > 0) {
          const prevDonation = donations[i - 1];
          if (prevDonation && prevDonation.ngayhien && donation.ngayhien) {
            const prevDate = new Date(prevDonation.ngayhien);
            const currDate = new Date(donation.ngayhien);
            const diffMs = currDate.getTime() - prevDate.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffWeeks = Math.floor(diffDays / 7);

            const status = diffDays >= 84 ? '✅' : '❌';
            console.log(`      ${status} Khoảng cách: ${diffDays} ngày (${diffWeeks} tuần)`);
            
            if (diffDays < 84) {
              console.log(` VI PHẠM: Cần ít nhất 84 ngày (12 tuần), thiếu ${84 - diffDays} ngày`);
            }
          }
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Kiểm tra hoàn tất!');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkDonations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Script thất bại:', error);
    process.exit(1);
  });
