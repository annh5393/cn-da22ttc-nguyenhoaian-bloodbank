/**
 * Script to fix hienlan values in existing donation records
 * This script will:
 * 1. Group donations by donor
 * 2. Sort by donation date
 * 3. Update hienlan to reflect correct sequence
 */

import prisma from '../src/config/prisma';

async function fixHienlan() {
  console.log('🔧 Bắt đầu sửa lại giá trị hienlan...\n');

  try {
    // Get all donations grouped by donor
    const allDonations = await prisma.phieuhienmau.findMany({
      orderBy: [
        { manguoihien: 'asc' },
        { ngayhien: 'asc' }
      ],
      include: {
        nguoihienmau: true
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

    console.log(`📊 Tìm thấy ${donorGroups.size} người hiến máu\n`);

    let totalUpdated = 0;
    let validationErrors = 0;

    // Process each donor
    for (const [manguoihien, donations] of donorGroups.entries()) {
      if (donations.length === 0) continue;
      
      const donorName = donations[0]?.nguoihienmau?.hotennguoihien || manguoihien;
      console.log(`\nXử lý: ${donorName} (${manguoihien})`);
      console.log(`   Tổng số lần hiến: ${donations.length}`);

      // Sort by date (should already be sorted, but just to be sure)
      donations.sort((a, b) => {
        const dateA = a.ngayhien ? new Date(a.ngayhien).getTime() : 0;
        const dateB = b.ngayhien ? new Date(b.ngayhien).getTime() : 0;
        return dateA - dateB;
      });

      // Update hienlan for each donation
      for (let i = 0; i < donations.length; i++) {
        const donation = donations[i];
        if (!donation) continue;
        
        const correctHienlan = String(i + 1);
        const currentHienlan = donation.hienlan;

        // Check 12-week interval (except for first donation)
        if (i > 0) {
          const prevDonation = donations[i - 1];
          if (prevDonation && prevDonation.ngayhien && donation.ngayhien) {
            const prevDate = new Date(prevDonation.ngayhien);
            const currDate = new Date(donation.ngayhien);
            const diffMs = currDate.getTime() - prevDate.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffWeeks = Math.floor(diffDays / 7);

            if (diffDays < 84) {
              console.log(`   ⚠️  CẢNH BÁO: Lần ${i + 1} vi phạm quy tắc 12 tuần!`);
              console.log(`       Ngày trước: ${prevDate.toLocaleDateString('vi-VN')}`);
              console.log(`       Ngày này: ${currDate.toLocaleDateString('vi-VN')}`);
              console.log(`       Khoảng cách: ${diffDays} ngày (${diffWeeks} tuần) - Cần ít nhất 84 ngày (12 tuần)`);
              validationErrors++;
            }
          }
        }

        if (currentHienlan !== correctHienlan) {
          await prisma.phieuhienmau.update({
            where: { maphieuhien: donation.maphieuhien },
            data: { hienlan: correctHienlan }
          });
          
          console.log(`   ✅ Cập nhật ${donation.maphieuhien}: "${currentHienlan}" → "${correctHienlan}"`);
          totalUpdated++;
        } else {
          console.log(`   ✓  ${donation.maphieuhien}: đã đúng (${correctHienlan})`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Hoàn thành!`);
    console.log(`   Đã cập nhật: ${totalUpdated} phiếu`);
    console.log(`   Không cần sửa: ${allDonations.length - totalUpdated} phiếu`);
    
    if (validationErrors > 0) {
      console.log(`   ⚠️  Phát hiện: ${validationErrors} vi phạm quy tắc 12 tuần`);
      console.log(`   → Cần xem xét và sửa ngày hiến hoặc xóa các phiếu không hợp lệ`);
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixHienlan()
  .then(() => {
    console.log('\nScript hoàn thành thành công!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript thất bại:', error);
    process.exit(1);
  });
