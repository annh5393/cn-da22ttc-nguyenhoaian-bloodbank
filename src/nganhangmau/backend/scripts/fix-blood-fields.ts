import prisma from '../src/config/prisma';

/**
 * Fix donors who have nhommau/rhesus set but do NOT yet have a confirmed donation.
 * Confirmed donation statuses: COLLECTED, STORED.
 * This script will set nhommau/rhesus to NULL for those donors.
 */
async function main() {
  console.log('🔧 Checking donors for invalid blood fields...');

  const donors = await prisma.nguoihienmau.findMany({
    include: { phieuhienmau: true },
  });

  let fixed = 0;
  for (const d of donors) {
    const hasConfirmedDonation = d.phieuhienmau?.some((p) => ['COLLECTED', 'STORED'].includes(p.trangthai || ''));
    const hasBlood = Boolean(d.nhommau || d.rhesus);

    if (hasBlood && !hasConfirmedDonation) {
      await prisma.nguoihienmau.update({
        where: { manguoihien: d.manguoihien },
        data: { nhommau: null, rhesus: null },
      });
      fixed++;
      console.log(` - Cleared blood fields for donor ${d.manguoihien}`);
    }
  }

  console.log(`✅ Completed. Donors fixed: ${fixed}`);
}

main()
  .catch((e) => {
    console.error('❌ Fix script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
