// CommonJS-compatible seed script aligned with current Prisma schema
// eslint-disable-next-line @typescript-eslint/no-var-requires
const prisma = require('../config/prisma').default || require('../config/prisma');

export const POSITIONS = [
  { mavitri: 'VT_A_DUONG', tenvitri: 'Vị trí A+' },
  { mavitri: 'VT_A_AM', tenvitri: 'Vị trí A-' },
  { mavitri: 'VT_B_DUONG', tenvitri: 'Vị trí B+' },
  { mavitri: 'VT_B_AM', tenvitri: 'Vị trí B-' },
  { mavitri: 'VT_O_DUONG', tenvitri: 'Vị trí O+' },
  { mavitri: 'VT_O_AM', tenvitri: 'Vị trí O-' },
  { mavitri: 'VT_AB_DUONG', tenvitri: 'Vị trí AB+' },
  { mavitri: 'VT_AB_AM', tenvitri: 'Vị trí AB-' },
];

export async function seedPositions() {
  // Ensure main warehouse exists (schema has no status field on khomau)
  await prisma.khomau.upsert({
    where: { makho: 'KHO_MAIN' },
    update: { tenvitri: 'Kho chính', nhietdobaoquan: '2-6°C' },
    create: { makho: 'KHO_MAIN', tenvitri: 'Kho chính', nhietdobaoquan: '2-6°C' },
  });

  // No vitrikho table in current schema; positions are computed virtually by blood type
  console.log('Seeded warehouse KHO_MAIN. Positions are virtual and used by APIs:', POSITIONS.map(p => p.mavitri).join(', '));
}

// Allow running directly
if (typeof require !== 'undefined' && require.main === module) {
  seedPositions()
    .then(() => { console.log('Done.'); process.exit(0); })
    .catch((e) => { console.error(e); process.exit(1); });
}