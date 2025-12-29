// Test logic "Sắp hết hạn" với ngưỡng 7 ngày

function computeTuiMauStatus(hansudung, now = new Date()) {
  if (!hansudung) return null;
  const warn = new Date(hansudung);
  warn.setDate(warn.getDate() - 7); // Sắp hết hạn khi còn 7 ngày
  if (now >= hansudung) return 'HET_HAN';
  if (now >= warn) return 'SAP_HET_HAN';
  return 'CON_HAN';
}

console.log('🧪 Test logic "Sắp hết hạn" với ngưỡng 7 ngày\n');

const today = new Date('2024-12-20'); // Giả sử hôm nay là 20/12/2024

const testCases = [
  { hansudung: new Date('2024-12-27'), expected: 'SAP_HET_HAN', note: 'Còn 7 ngày' },
  { hansudung: new Date('2024-12-26'), expected: 'SAP_HET_HAN', note: 'Còn 6 ngày' },
  { hansudung: new Date('2024-12-21'), expected: 'SAP_HET_HAN', note: 'Còn 1 ngày' },
  { hansudung: new Date('2024-12-20'), expected: 'HET_HAN', note: 'Hôm nay hết hạn' },
  { hansudung: new Date('2024-12-19'), expected: 'HET_HAN', note: 'Đã hết hạn 1 ngày' },
  { hansudung: new Date('2024-12-28'), expected: 'CON_HAN', note: 'Còn 8 ngày' },
  { hansudung: new Date('2025-01-02'), expected: 'CON_HAN', note: 'Còn 13 ngày (túi B- thực tế)' },
  { hansudung: new Date('2025-01-24'), expected: 'CON_HAN', note: 'Còn 35 ngày (túi O- thực tế)' },
];

testCases.forEach((test, index) => {
  const result = computeTuiMauStatus(test.hansudung, today);
  const pass = result === test.expected;
  const icon = pass ? '✅' : '❌';
  
  console.log(`${icon} Test ${index + 1}: ${test.note}`);
  console.log(`   Hạn sử dụng: ${test.hansudung.toLocaleDateString('vi-VN')}`);
  console.log(`   Kỳ vọng: ${test.expected}`);
  console.log(`   Kết quả: ${result}`);
  console.log('');
});

console.log('\n📊 Kết luận:');
console.log('   - Túi máu còn > 7 ngày: CON_HAN');
console.log('   - Túi máu còn ≤ 7 ngày: SAP_HET_HAN');
console.log('   - Túi máu đã hết hạn: HET_HAN');
