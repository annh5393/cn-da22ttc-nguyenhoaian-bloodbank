// Seed only the main warehouse used by virtual positions
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedWarehouse() {
  await prisma.khomau.upsert({
    where: { makho: 'KHO_MAIN' },
    update: { tenvitri: 'Kho chính', nhietdobaoquan: '2-6°C' },
    create: { makho: 'KHO_MAIN', tenvitri: 'Kho chính', nhietdobaoquan: '2-6°C' },
  });
  const positions = [
    'VT_A_DUONG','VT_A_AM','VT_B_DUONG','VT_B_AM','VT_AB_DUONG','VT_AB_AM','VT_O_DUONG','VT_O_AM'
  ];
  console.log('Seeded KHO_MAIN. Virtual positions available:', positions.join(', '));
}

seedWarehouse()
  .then(() => console.log('Done.'))
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
