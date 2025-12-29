/**
 * Test Scenarios for Route Protection
 * Run these manual tests to verify the route protection system
 */

export const TEST_SCENARIOS = [
  {
    id: 1,
    title: 'Người hiến máu truy cập trang được phép',
    role: 'Người hiến máu',
    steps: [
      '1. Login với tài khoản Người hiến máu',
      '2. Vào http://localhost:2004/dashboard',
      '3. Click vào "Thông tin cá nhân"',
      '4. Vào http://localhost:2004/dashboard/lich-su',
    ],
    expected: 'Tất cả các trang đều hiển thị bình thường ✅',
  },
  {
    id: 2,
    title: 'Người hiến máu truy cập trang Kho máu (không được phép)',
    role: 'Người hiến máu',
    steps: [
      '1. Login với tài khoản Người hiến máu',
      '2. Vào http://localhost:2004/dashboard/kho-mau (paste vào address bar)',
    ],
    expected: 'Tự động redirect về /dashboard ✅',
    shouldSee: 'Console warning: "Truy cập bị từ chối: Người hiến máu không có quyền truy cập /dashboard/kho-mau"',
  },
  {
    id: 3,
    title: 'Người hiến máu truy cập trang Quản lý tài khoản (không được phép)',
    role: 'Người hiến máu',
    steps: [
      '1. Login với tài khoản Người hiến máu',
      '2. Vào http://localhost:2004/dashboard/nhan-vien (paste vào address bar)',
    ],
    expected: 'Tự động redirect về /dashboard ✅',
  },
  {
    id: 4,
    title: 'Staff truy cập trang được phép',
    role: 'Nhân viên y tế',
    steps: [
      '1. Login với tài khoản Nhân viên y tế',
      '2. Vào các trang: Kho máu, Túi máu, Phiếu khám, Người hiến máu',
    ],
    expected: 'Tất cả các trang đều hiển thị bình thường ✅',
  },
  {
    id: 5,
    title: 'Staff truy cập trang Quản lý tài khoản (không được phép)',
    role: 'Nhân viên y tế',
    steps: [
      '1. Login với tài khoản Nhân viên y tế',
      '2. Vào http://localhost:2004/dashboard/nhan-vien (paste vào address bar)',
    ],
    expected: 'Tự động redirect về /dashboard ✅',
  },
  {
    id: 6,
    title: 'Admin truy cập tất cả các trang',
    role: 'Admin',
    steps: [
      '1. Login với tài khoản Admin',
      '2. Vào bất kỳ trang dashboard nào',
    ],
    expected: 'Có thể truy cập tất cả các trang ✅',
  },
  {
    id: 7,
    title: 'Chưa đăng nhập truy cập dashboard',
    role: 'Chưa đăng nhập',
    steps: [
      '1. Đảm bảo đã logout',
      '2. Vào http://localhost:2004/dashboard',
    ],
    expected: 'Tự động redirect về /auth/login ✅',
  },
  {
    id: 8,
    title: 'Sidebar chỉ hiển thị menu theo role',
    role: 'Người hiến máu',
    steps: [
      '1. Login với tài khoản Người hiến máu',
      '2. Kiểm tra sidebar',
    ],
    expected: 'Chỉ hiển thị: Tổng quan, Thông tin cá nhân, Lịch sử hiến máu ✅',
    shouldNotSee: 'Kho máu, Túi máu, Phiếu khám, Quản lý tài khoản',
  },
  {
    id: 9,
    title: 'Logout từ trang dashboard',
    role: 'Bất kỳ',
    steps: [
      '1. Login với bất kỳ tài khoản nào',
      '2. Click "Đăng xuất"',
    ],
    expected: 'Redirect về trang chủ (/) và không còn token ✅',
  },
  {
    id: 10,
    title: 'Refresh trang bị chặn',
    role: 'Người hiến máu',
    steps: [
      '1. Login với tài khoản Người hiến máu',
      '2. Paste URL http://localhost:2004/dashboard/kho-mau vào address bar',
      '3. Sau khi bị redirect, refresh trang',
    ],
    expected: 'Vẫn ở trang /dashboard, không bypass được ✅',
  },
];

// Helper function to print test scenarios
export function printTestScenarios() {
  console.log('='.repeat(80));
  console.log('TEST SCENARIOS - ROUTE PROTECTION');
  console.log('='.repeat(80));
  
  TEST_SCENARIOS.forEach(scenario => {
    console.log(`\n📋 Test ${scenario.id}: ${scenario.title}`);
    console.log(`👤 Role: ${scenario.role}`);
    console.log('\nSteps:');
    scenario.steps.forEach(step => console.log(`   ${step}`));
    console.log(`\n✅ Expected: ${scenario.expected}`);
    if (scenario.shouldSee) {
      console.log(`👀 Should see: ${scenario.shouldSee}`);
    }
    if (scenario.shouldNotSee) {
      console.log(`🚫 Should NOT see: ${scenario.shouldNotSee}`);
    }
    console.log('-'.repeat(80));
  });
}

// Run this in browser console to see all test scenarios
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.printRouteProtectionTests = printTestScenarios;
  console.log('💡 Run window.printRouteProtectionTests() to see all test scenarios');
}
