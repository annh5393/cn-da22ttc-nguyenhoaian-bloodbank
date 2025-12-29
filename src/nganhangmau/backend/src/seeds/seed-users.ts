import prisma from '../config/prisma';

async function main() {
  console.log(' Starting seed...\n');

  // ============================================
  // ADMIN ACCOUNT
  // ============================================
  const admin = await prisma.nhanvienyte.upsert({
    where: { manvyt: 'AD001' },
    update: {},
    create: {
      manvyt: 'AD001',
      hotennvyt: 'Admin A',
      vaitro: 'Admin',
      ngaysinh: new Date('2001-01-01'),
      gioitinh: 'Nam',
      sodienthoai: '0901234567',
      emailnv: 'admin@example.com',
      diachi: 'Việt Nam',
      trangthai: 'Hoạt động',
    },
  });
  console.log('Created Admin:', admin.manvyt);

  // ============================================
  // STAFF ACCOUNT (Nhân viên y tế)
  // ============================================
  const staff = await prisma.nhanvienyte.upsert({
    where: { manvyt: 'NV001' },
    update: {},
    create: {
      manvyt: 'NV001',
      hotennvyt: 'Nhân viên y tế A',
      vaitro: 'Nhân viên y tế',
      ngaysinh: new Date('2002-02-22'),
      gioitinh: 'Nam',
      sodienthoai: '0912345678',
      emailnv: 'staff@example.com',
      diachi: 'TP.HCM, Việt Nam',
      trangthai: 'Hoạt động',
    },
  });
  console.log('Created Staff:', staff.manvyt);

  // ============================================
  // DONOR ACCOUNT (Người hiến máu)
  // ============================================
  const donor = await prisma.nguoihienmau.upsert({
    where: { manguoihien: 'NH001' },
    update: {},
    create: {
      manguoihien: 'NH001',
      hotennguoihien: 'Trần Thị D',
      ngaysinh: new Date('1998-08-20'),
      gioitinh: 'Nữ',
      sodienthoai: '0923456789',
      email: 'donor@example.com',
      diachi: 'Đà Nẵng, Việt Nam',
      // Nhóm máu và Rh phải UNKNOWN khi tạo tài khoản
      nhommau: null,
      rhesus: null,
      trangthai: 'Hoạt động',
    },
  });
  console.log('Created Donor:', donor.manguoihien);

  console.log('\n Seed completed successfully!\n');
  console.log('Test accounts:');
  console.log('   Admin manvyt: AD001');
  console.log('   Staff manvyt: NV001');
  console.log('   Donor manguoihien: NH001');
}

main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
