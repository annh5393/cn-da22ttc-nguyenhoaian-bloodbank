'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { reportApi } from '@/api/report.api';
import { phieuhienmauApi } from '@/api/phieuhienmau.api';
import { phieukhamApi } from '@/api/phieukham.api';
import { tuimauApi } from '@/api/tuimau.api';
import { nguoihienmauApi } from '@/api/nguoihienmau.api';
import { DashboardStats, BloodInventory, ExpiringBag } from '@/types/api.types';
import { 
  BarChart3, 
  Calendar,
  Filter,
  AlertTriangle,
  Droplet,
  Activity,
  Target,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

type DateRange = 'today' | 'last7' | 'last30' | 'custom';
type BloodGroup = 'all' | 'A' | 'B' | 'AB' | 'O';

// Staff Reports Component
function StaffReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [expiringBags, setExpiringBags] = useState<ExpiringBag[]>([]);
  const [loading, setLoading] = useState(true);

  // Real analytics data
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [screeningStats, setScreeningStats] = useState({ total: 0, rejected: 0, pending: 0 });
  const [expiredCount, setExpiredCount] = useState(0);

  // Filters
  const [dateRange, setDateRange] = useState<DateRange>('last30');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('all');
  
  // Chart period filter
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [chartOffset, setChartOffset] = useState(0); // 0 = current, -1 = previous, etc.

  useEffect(() => {
    fetchAllStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]); // Only reload when dateRange changes, not bloodGroup or inventoryType

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const [dashboardData, inventoryData, expiringData, donations, screenings, allBags] = await Promise.all([
        reportApi.getDashboard(),
        reportApi.getInventory(),
        reportApi.getExpiringBlood(30),
        phieuhienmauApi.getAll(),
        phieukhamApi.getAll(),
        tuimauApi.getAll(),
      ]);

      setStats(dashboardData);
      setInventory(inventoryData);
      setExpiringBags(expiringData.bags);

      // Calculate total donations in selected period
      const now = new Date();
      let startDate = new Date();
      
      if (dateRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'last7') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === 'last30') {
        startDate.setDate(now.getDate() - 30);
      }

      const filteredDonations = donations.filter(d => {
        const donationDate = new Date(d.ngaytaophieuhien);
        return donationDate >= startDate && donationDate <= now;
      });

      setTotalDonations(filteredDonations.length);

      // Calculate total volume from filtered donations
      const volume = filteredDonations.reduce((sum, d) => {
        return sum + (Number(d.luongmauhien) || 0);
      }, 0);
      setTotalVolume(volume);

      // Calculate screening statistics
      const filteredScreenings = screenings.filter((s: any) => {
        const screeningDate = new Date(s.ngaykham || s.ngaytaophieukham);
        return screeningDate >= startDate && screeningDate <= now;
      });

      const rejectedScreenings = filteredScreenings.filter((s: any) => {
        const result = s.ketquasangloc?.trim().toLowerCase();
        return result === 'không đạt' || result === 'khong dat';
      }).length;

      const pendingScreenings = filteredScreenings.filter((s: any) => {
        const result = s.ketquasangloc?.trim().toLowerCase();
        return result === 'chờ xử lý' || result === 'cho xu ly';
      }).length;

      setScreeningStats({
        total: filteredScreenings.length,
        rejected: rejectedScreenings,
        pending: pendingScreenings
      });

      // Count expired bags
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expired = allBags.filter((bag: any) => {
        if (!bag.hansudung) return false;
        const expiryDate = new Date(bag.hansudung);
        expiryDate.setHours(0, 0, 0, 0);
        return expiryDate < today;
      }).length;
      setExpiredCount(expired);

    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate chart data based on period and offset
  const getChartData = async () => {
    try {
      const [donations, allBags] = await Promise.all([
        phieuhienmauApi.getAll(),
        tuimauApi.getAll(),
      ]);

      const now = new Date();
      let data: { label: string; donations: number; bags: number }[] = [];

      if (chartPeriod === 'day') {
        // Show 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() + chartOffset - i);
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
          const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

          const donationCount = donations.filter(d => {
            const donationDate = new Date(d.ngaytaophieuhien);
            return donationDate >= dayStart && donationDate <= dayEnd;
          }).length;

          const bagCount = allBags.filter((b: any) => {
            if (!b.ngaynhapkho) return false;
            const bagDate = new Date(b.ngaynhapkho);
            return bagDate >= dayStart && bagDate <= dayEnd;
          }).length;

          data.push({
            label: `${date.getDate()}/${date.getMonth() + 1}`,
            donations: donationCount,
            bags: bagCount
          });
        }
      } else if (chartPeriod === 'week') {
        // Show 8 weeks
        for (let i = 7; i >= 0; i--) {
          const weekEnd = new Date(now);
          weekEnd.setDate(weekEnd.getDate() + (chartOffset * 7) - (i * 7));
          const weekStart = new Date(weekEnd);
          weekStart.setDate(weekStart.getDate() - 6);
          weekStart.setHours(0, 0, 0, 0);
          weekEnd.setHours(23, 59, 59, 999);

          const donationCount = donations.filter(d => {
            const donationDate = new Date(d.ngaytaophieuhien);
            return donationDate >= weekStart && donationDate <= weekEnd;
          }).length;

          const bagCount = allBags.filter((b: any) => {
            if (!b.ngaynhapkho) return false;
            const bagDate = new Date(b.ngaynhapkho);
            return bagDate >= weekStart && bagDate <= weekEnd;
          }).length;

          data.push({
            label: `T${8 - i}`,
            donations: donationCount,
            bags: bagCount
          });
        }
      } else if (chartPeriod === 'month') {
        // Show 6 months
        for (let i = 5; i >= 0; i--) {
          const month = new Date(now.getFullYear(), now.getMonth() + chartOffset - i, 1);
          const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
          const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

          const donationCount = donations.filter(d => {
            const donationDate = new Date(d.ngaytaophieuhien);
            return donationDate >= monthStart && donationDate <= monthEnd;
          }).length;

          const bagCount = allBags.filter((b: any) => {
            if (!b.ngaynhapkho) return false;
            const bagDate = new Date(b.ngaynhapkho);
            return bagDate >= monthStart && bagDate <= monthEnd;
          }).length;

          data.push({
            label: `T${month.getMonth() + 1}`,
            donations: donationCount,
            bags: bagCount
          });
        }
      } else if (chartPeriod === 'year') {
        // Show 5 years
        for (let i = 4; i >= 0; i--) {
          const year = now.getFullYear() + chartOffset - i;
          const yearStart = new Date(year, 0, 1);
          const yearEnd = new Date(year, 11, 31, 23, 59, 59);

          const donationCount = donations.filter(d => {
            const donationDate = new Date(d.ngaytaophieuhien);
            return donationDate >= yearStart && donationDate <= yearEnd;
          }).length;

          const bagCount = allBags.filter((b: any) => {
            if (!b.ngaynhapkho) return false;
            const bagDate = new Date(b.ngaynhapkho);
            return bagDate >= yearStart && bagDate <= yearEnd;
          }).length;

          data.push({
            label: `${year}`,
            donations: donationCount,
            bags: bagCount
          });
        }
      }

      return data;
    } catch (error) {
      console.error('Error calculating chart data:', error);
      return [];
    }
  };

  const [chartData, setChartData] = useState<{ label: string; donations: number; bags: number }[]>([]);

  useEffect(() => {
    const loadChartData = async () => {
      const data = await getChartData();
      setChartData(data);
    };
    loadChartData();
  }, [chartPeriod, chartOffset]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Calculate metrics
  const totalBags = (stats?.availableBags || 0) + expiringBags.length + expiredCount;
  const expiringPercentage = totalBags > 0 ? ((expiringBags.length / totalBags) * 100).toFixed(1) : '0.0';
  const rejectionRate = screeningStats.total > 0 ? ((screeningStats.rejected / screeningStats.total) * 100).toFixed(1) : '0.0';

  // Filter inventory by blood group
  const filteredInventory = inventory.filter(item => {
    if (bloodGroup === 'all') return true;
    return item.nhommau === bloodGroup;
  });

  // Filter bag status data by blood group
  const filteredBagStatusData = [
    { status: 'Khả dụng', count: stats?.availableBags || 0, color: 'bg-green-500' },
    { status: 'Sắp hết hạn', count: expiringBags.length, color: 'bg-orange-500' },
    { status: 'Đã hết hạn', count: expiredCount, color: 'bg-red-500' },
  ];

  // Critical blood groups (< 10 bags) - filtered
  const criticalGroups = filteredInventory.filter(item => item.count < 10);

  // Chart Period Filter Component
  const ChartPeriodFilter = () => {
    const getPeriodLabel = () => {
      const now = new Date();
      if (chartPeriod === 'day') {
        const date = new Date(now);
        date.setDate(date.getDate() + chartOffset);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } else if (chartPeriod === 'week') {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() + (chartOffset * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
      } else if (chartPeriod === 'month') {
        const month = new Date(now.getFullYear(), now.getMonth() + chartOffset, 1);
        return `Tháng ${month.getMonth() + 1}/${month.getFullYear()}`;
      } else {
        const year = now.getFullYear() + chartOffset;
        return `Năm ${year}`;
      }
    };

    return (
      <div className="flex items-center justify-between mb-4 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartOffset(chartOffset - 1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Kỳ trước"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-bold text-gray-700 min-w-[150px] text-center">
            {getPeriodLabel()}
          </span>
          <button
            onClick={() => setChartOffset(chartOffset + 1)}
            disabled={chartOffset >= 0}
            className={`p-2 rounded-lg transition-colors ${
              chartOffset >= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
            }`}
            title="Kỳ sau"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setChartPeriod('day');
              setChartOffset(0);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              chartPeriod === 'day'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Ngày
          </button>
          <button
            onClick={() => {
              setChartPeriod('week');
              setChartOffset(0);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              chartPeriod === 'week'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tuần
          </button>
          <button
            onClick={() => {
              setChartPeriod('month');
              setChartOffset(0);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              chartPeriod === 'month'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tháng
          </button>
          <button
            onClick={() => {
              setChartPeriod('year');
              setChartOffset(0);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              chartPeriod === 'year'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Năm
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pr-8 pl-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r rounded-2xl p-4 text-black shadow-xl border-t-4 border-red-500">
        <div className="flex items-center gap-4 mb-4 mt-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1 text-black">Báo cáo và Thống kê</h1>
            <p className="text-gray-500">Phân tích xu hướng</p>
          </div>
        </div>
      </div>

      {/* Section 1: Report Filters */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-900">Bộ lọc báo cáo</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng thời gian</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="w-full px-4 py-2 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option className='text-gray-600' value="today">Hôm nay</option>
              <option className='text-gray-600' value="last7">7 ngày qua</option>
              <option className='text-gray-600' value="last30">30 ngày qua</option>
              <option className='text-gray-600' value="custom">Tùy chỉnh</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nhóm máu</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
              className="w-full px-4 py-2 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="A">Nhóm A</option>
              <option value="B">Nhóm B</option>
              <option value="AB">Nhóm AB</option>
              <option value="O">Nhóm O</option>
            </select>
          </div>

        </div>
      </div>

      {/* Section 2: Analytical KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Donations */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{totalDonations}</h3>
          <p className="text-sm text-gray-600">Lượt hiến máu</p>
          <p className="text-xs text-gray-500 mt-2">
            {dateRange === 'today' && 'Hôm nay'}
            {dateRange === 'last7' && '7 ngày qua'}
            {dateRange === 'last30' && '30 ngày qua'}
          </p>
        </div>

        {/* Total Volume */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Droplet className="w-6 h-6 text-red-600 fill-red-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{totalVolume.toLocaleString()}</h3>
          <p className="text-sm text-gray-600">ml máu thu được</p>
          <p className="text-xs text-gray-500 mt-2">
            Trung bình: {totalDonations > 0 ? Math.round(totalVolume / totalDonations) : 0} ml/lượt
          </p>
        </div>

        {/* Expiring Bags */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{expiringPercentage}%</h3>
          <p className="text-sm text-gray-600">Túi máu sắp hết hạn</p>
          <p className="text-xs text-gray-500 mt-2">
            {expiringBags.length} / {totalBags} túi (30 ngày)
          </p>
        </div>

        {/* Screening Rejection Rate */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{rejectionRate}%</h3>
          <p className="text-sm text-gray-600">Tỷ lệ không đạt sàng lọc</p>
          <p className="text-xs text-gray-500 mt-2">
            {screeningStats.rejected} / {screeningStats.total} phiếu
          </p>
        </div>
      </div>

      {/* Section 3: Pie Chart & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Group Distribution from Inventory */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
            Phân bố nhóm máu trong kho
          </h2>
          {filteredInventory.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Chưa có dữ liệu tồn kho
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center h-64">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {(() => {
                      const total = filteredInventory.reduce((sum, item) => sum + item.count, 0);
                      let currentAngle = 0;
                      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];
                      
                      return filteredInventory.map((item, index) => {
                        const percentage = (item.count / total) * 100;
                        const angle = (percentage / 100) * 360;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;
                        currentAngle = endAngle;
                        
                        const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                        const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                        const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                        const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                        
                        const largeArc = angle > 180 ? 1 : 0;
                        
                        return (
                          <path
                            key={index}
                            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={colors[index % colors.length]}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        );
                      });
                    })()}
                    <circle cx="50" cy="50" r="20" fill="white" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {filteredInventory.map((item, index) => {
                  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'];
                  const bloodType = `${item.nhommau}${item.rhesus}`;
                  const total = filteredInventory.reduce((sum, i) => sum + i.count, 0);
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  
                  return (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 ${colors[index % colors.length]} rounded`}></div>
                        <span className="text-gray-700 font-medium">{bloodType}</span>
                      </div>
                      <span className="font-bold text-gray-900">{item.count} ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Horizontal Bar Chart - Blood Bag Status */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Trạng thái túi máu
          </h2>
          <div className="space-y-6 py-4">
            {filteredBagStatusData.map((item, index) => {
              const maxCount = Math.max(...filteredBagStatusData.map(d => d.count));
              const width = (item.count / maxCount) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.status}</span>
                    <span className="text-lg font-bold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div 
                      className={`${item.color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-white text-xs font-bold">
                        {totalBags > 0 ? ((item.count / totalBags) * 100).toFixed(1) : '0.0'}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 4: Risk & Recommendation Table */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-t-4 border-red-600">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          Cảnh báo rủi ro & Khuyến nghị
        </h2>

        {criticalGroups.length === 0 ? (
          <div className="text-center py-12 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-800 font-bold text-lg mb-1">Tất cả nhóm máu đều an toàn!</p>
            <p className="text-green-600 text-sm">Không có nhóm máu nào ở mức tồn kho nguy hiểm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Mức độ</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Nhóm máu</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Số lượng</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Thể tích</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Khuyến nghị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {criticalGroups.map((item, index) => {
                  const bloodType = `${item.nhommau}${item.rhesus}`;
                  let severity: string, severityColor: string, recommendation: string;
                  
                  if (item.count === 0) {
                    severity = 'KHẨN CẤP';
                    severityColor = 'bg-red-600 text-white';
                    recommendation = '🚨 Cần nhập máu khẩn cấp ngay lập tức';
                  } else if (item.count <= 3) {
                    severity = 'RẤT THẤP';
                    severityColor = 'bg-red-500 text-white';
                    recommendation = '⚠️ Tổ chức chiến dịch hiến máu trong 3 ngày';
                  } else if (item.count <= 5) {
                    severity = 'THẤP';
                    severityColor = 'bg-orange-500 text-white';
                    recommendation = '📢 Kêu gọi hiến máu trong tuần này';
                  } else {
                    severity = 'CẦN BỔ SUNG';
                    severityColor = 'bg-yellow-500 text-white';
                    recommendation = '📋 Lên kế hoạch tổ chức hiến máu';
                  }
                  
                  return (
                    <tr key={index} className="hover:bg-red-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${severityColor}`}>
                          {severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
                          <span className="text-lg font-bold text-gray-900">{bloodType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-2xl font-bold text-red-600">{item.count}</span>
                        <span className="text-sm text-gray-600 ml-1">túi</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-700">
                          {item.totalVolume?.toLocaleString() || 0} ml
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{recommendation}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 5: Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Trend Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Xu hướng hiến máu
          </h2>
          
          <ChartPeriodFilter />
          
          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.length === 0 ? (
              <div className="w-full flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
              </div>
            ) : (
              chartData.map((item, index) => {
                const maxCount = Math.max(...chartData.map(d => d.donations), 1);
                let heightPercent = 0;
                if (item.donations > 0) {
                  if (item.donations === maxCount) {
                    heightPercent = 100;
                  } else {
                    heightPercent = 10 + ((item.donations / maxCount) * 85);
                  }
                }
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                    <div className={`text-sm font-bold ${item.donations === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                      {item.donations}
                    </div>
                    
                    <div className="w-full flex items-end" style={{ height: '200px' }}>
                      {item.donations > 0 ? (
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer shadow-md"
                          style={{ height: `${heightPercent}%` }}
                          title={`${item.label}: ${item.donations} lượt hiến`}
                        ></div>
                      ) : (
                        <div className="w-full h-2 bg-gray-200 rounded self-end"></div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-600 font-medium truncate w-full text-center">
                      {item.label}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Blood Bag Entry Trend Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
            Xu hướng nhập kho túi máu
          </h2>
          
          <ChartPeriodFilter />
          
          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.length === 0 ? (
              <div className="w-full flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
              </div>
            ) : (
              chartData.map((item, index) => {
                const maxCount = Math.max(...chartData.map(d => d.bags), 1);
                let heightPercent = 0;
                if (item.bags > 0) {
                  if (item.bags === maxCount) {
                    heightPercent = 100;
                  } else {
                    heightPercent = 10 + ((item.bags / maxCount) * 85);
                  }
                }
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                    <div className={`text-sm font-bold ${item.bags === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                      {item.bags}
                    </div>
                    
                    <div className="w-full flex items-end" style={{ height: '200px' }}>
                      {item.bags > 0 ? (
                        <div 
                          className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg transition-all hover:from-red-700 hover:to-red-500 cursor-pointer shadow-md"
                          style={{ height: `${heightPercent}%` }}
                          title={`${item.label}: ${item.bags} túi máu`}
                        ></div>
                      ) : (
                        <div className="w-full h-2 bg-gray-200 rounded self-end"></div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-600 font-medium truncate w-full text-center">
                      {item.label}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
// =============================================================

// Admin Reports Component - Different from Staff
function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  
  // Chart states
  const [chartPeriod, setChartPeriod] = useState<1 | 3 | 6 | 9 | 12 | 15>(6);
  const [chartOffset, setChartOffset] = useState(0);
  
  // Analytics data
  const [totalDonors, setTotalDonors] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [donationTrend, setDonationTrend] = useState<{ label: string; count: number; volume: number }[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<{ name: string; donations: number }[]>([]);
  const [bloodGroupTrend, setBloodGroupTrend] = useState<{ group: string; trend: number }[]>([]);

  useEffect(() => {
    loadAdminStats();
  }, []);

  useEffect(() => {
    loadChartData();
  }, [chartPeriod, chartOffset]);

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      const [dashboardData, inventoryData, donations, donors] = await Promise.all([
        reportApi.getDashboard(),
        reportApi.getInventory(),
        phieuhienmauApi.getAll(),
        nguoihienmauApi.getAll({ pageSize: 1000 }),
      ]);

      setStats(dashboardData);
      setInventory(inventoryData);
      setTotalDonors(donors.data.length);
      setTotalStaff(dashboardData.totalStaff);

      // Calculate staff performance (top 5)
      const staffMap: Record<string, number> = {};
      donations.forEach((d: any) => {
        if (d.manhanvien) {
          staffMap[d.manhanvien] = (staffMap[d.manhanvien] || 0) + 1;
        }
      });
      
      const topStaff = Object.entries(staffMap)
        .map(([name, count]) => ({ name, donations: count }))
        .sort((a, b) => b.donations - a.donations)
        .slice(0, 5);
      
      setStaffPerformance(topStaff);

      // Calculate blood group trends (growth rate)
      const groupTrends = inventoryData.map(item => ({
        group: `${item.nhommau}${item.rhesus}`,
        trend: Math.floor(Math.random() * 20) - 10 // TODO: Calculate real trend
      }));
      setBloodGroupTrend(groupTrends);

    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      const donations = await phieuhienmauApi.getAll();
      const now = new Date();
      let data: { label: string; count: number; volume: number }[] = [];

      // chartPeriod is number of months to show
      const monthsToShow = chartPeriod;
      
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() + chartOffset - i, 1);
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

        const filtered = donations.filter(d => {
          const date = new Date(d.ngaytaophieuhien);
          return date >= monthStart && date <= monthEnd;
        });

        data.push({
          label: `T${month.getMonth() + 1}/${month.getFullYear().toString().slice(-2)}`,
          count: filtered.length,
          volume: filtered.reduce((sum, d) => sum + (Number(d.luongmauhien) || 0), 0)
        });
      }

      setDonationTrend(data);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  };

  const ChartPeriodFilter = () => {
    const getPeriodLabel = () => {
      const now = new Date();
      const startMonth = new Date(now.getFullYear(), now.getMonth() + chartOffset - (chartPeriod - 1), 1);
      const endMonth = new Date(now.getFullYear(), now.getMonth() + chartOffset, 1);
      
      return `${startMonth.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })} - ${endMonth.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}`;
    };

    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartOffset(chartOffset - 1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-bold text-gray-700 min-w-[180px] text-center">
            {getPeriodLabel()}
          </span>
          <button
            onClick={() => setChartOffset(chartOffset + 1)}
            disabled={chartOffset >= 0}
            className={`p-2 rounded-lg transition-colors ${
              chartOffset >= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
            }`}
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setChartPeriod(1);
              setChartOffset(0);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              chartPeriod === 1
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            1 Tháng
          </button>
          <button
            onClick={() => {
              setChartPeriod(3);
              setChartOffset(0);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              chartPeriod === 3
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            3 Tháng
          </button>
          <button
            onClick={() => {
              setChartPeriod(6);
              setChartOffset(0);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              chartPeriod === 6
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            6 Tháng
          </button>
          <button
            onClick={() => {
              setChartPeriod(9);
              setChartOffset(0);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              chartPeriod === 9
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            9 Tháng
          </button>
          <button
            onClick={() => {
              setChartPeriod(12);
              setChartOffset(0);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              chartPeriod === 12
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            12 Tháng
          </button>
          <button
            onClick={() => {
              setChartPeriod(15);
              setChartOffset(0);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              chartPeriod === 15
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            15 Tháng
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pr-8 pl-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r rounded-2xl p-6 text-white shadow-xl border-t-4 border-red-300">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white backdrop-blur-sm rounded-xl flex items-center justify-center border border-red-200">
            <BarChart3 className="w-8 h-8 text-black " />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1 text-black">Báo cáo Quản trị Hệ thống</h1>
            <p className="text-gray-600">Phân tích tổng quan và hiệu suất hoạt động</p>
          </div>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalDonors || 0}</h3>
          <p className="text-sm text-gray-600">Tổng người hiến máu</p>
          <p className="text-xs text-green-600 font-bold mt-2">↑ Tăng trưởng ổn định</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Droplet className="w-6 h-6 text-red-600 fill-red-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.availableBags || 0}</h3>
          <p className="text-sm text-gray-600">Túi máu khả dụng</p>
          <p className="text-xs text-gray-500 mt-2">Đủ cho 30 ngày</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalStaff || 0}</h3>
          <p className="text-sm text-gray-600">Nhân viên hoạt động</p>
          <p className="text-xs text-gray-500 mt-2">Đầy đủ nhân lực</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {donationTrend.length > 0 ? donationTrend[donationTrend.length - 1].count : 0}
          </h3>
          <p className="text-sm text-gray-600">Lượt hiến tháng này</p>
          <p className="text-xs text-blue-600 font-bold mt-2">Theo dõi xu hướng</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donation Trend - 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg border-t-4 border-red-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Xu hướng hiến máu dài hạn</h2>
              <p className="text-xs text-gray-600">Phân tích theo {chartPeriod} tháng gần nhất</p>
            </div>
          </div>

          <ChartPeriodFilter />

          <div className="h-85 flex items-end justify-between gap-2 ">
            {donationTrend.length === 0 ? (
              <div className="w-full flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>
              </div>
            ) : (
              donationTrend.map((item, index) => {
                const maxCount = Math.max(...donationTrend.map(d => d.count), 1);
                let heightPercent = 0;
                if (item.count > 0) {
                  heightPercent = item.count === maxCount ? 100 : 10 + ((item.count / maxCount) * 85);
                }
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                    <div className={`text-sm font-bold ${item.count === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                      {item.count} lượt hiến
                    </div>
                    
                    <div className="w-full flex items-end" style={{ height: '280px' }}>
                      {item.count > 0 ? (
                        <div 
                          className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg transition-all hover:from-red-700 hover:to-red-500 cursor-pointer shadow-md"
                          style={{ height: `${heightPercent}%` }}
                          title={`${item.label}: ${item.count} lượt - ${item.volume.toLocaleString()} ml`}
                        ></div>
                      ) : (
                        <div className="w-full h-2 bg-gray-200 rounded self-end"></div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-600 font-medium truncate w-full text-center">
                      {item.label}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Staff Performance - 1 column */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-t-4 border-green-600">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Top nhân viên</h2>
              <p className="text-xs text-gray-600">Hiệu suất cao nhất</p>
            </div>
          </div>

          <div className="space-y-4">
            {staffPerformance.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Chưa có dữ liệu</p>
            ) : (
              staffPerformance.map((staff, index) => {
                const maxDonations = staffPerformance[0].donations;
                const percentage = (staff.donations / maxDonations) * 100;
                const medals = ['🥇', '🥈', '🥉'];
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{medals[index] || '🏅'}</span>
                        <span className="text-sm font-bold text-gray-700">{staff.name}</span>
                      </div>
                      <span className="text-lg font-black text-gray-900">{staff.donations}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Blood Group Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Status */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-t-4 border-purple-600">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-purple-600 fill-purple-600" />
            Tình trạng tồn kho theo nhóm máu
          </h2>

          <div className="space-y-3">
            {inventory.map((item, index) => {
              const bloodType = `${item.nhommau}${item.rhesus}`;
              const isLow = item.count < 10;
              const isCritical = item.count < 5;
              
              return (
                <div key={index} className={`p-4 rounded-lg border-2 ${
                  isCritical ? 'bg-red-50 border-red-300' : 
                  isLow ? 'bg-orange-50 border-orange-300' : 
                  'bg-green-50 border-green-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg ${
                        isCritical ? 'bg-red-600 text-white' :
                        isLow ? 'bg-orange-600 text-white' :
                        'bg-green-600 text-white'
                      }`}>
                        {bloodType}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.count} túi</p>
                        <p className="text-xs text-gray-600">{item.totalVolume.toLocaleString()} ml</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {isCritical && <span className="text-xs font-bold text-red-600">🚨 KHẨN CẤP</span>}
                      {isLow && !isCritical && <span className="text-xs font-bold text-orange-600">⚠️ THẤP</span>}
                      {!isLow && <span className="text-xs font-bold text-green-600">✓ ỔN ĐỊNH</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-t-4 border-orange-600">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Cảnh báo hệ thống
          </h2>

          <div className="space-y-4">
            {inventory.filter(i => i.count < 10).length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-900 mb-1">Tồn kho thấp</p>
                    <p className="text-sm text-red-700">
                      {inventory.filter(i => i.count < 10).length} nhóm máu cần bổ sung khẩn cấp
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      {inventory.filter(i => i.count < 10).map(i => `${i.nhommau}${i.rhesus}`).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900 mb-1">Hoạt động bình thường</p>
                  <p className="text-sm text-blue-700">
                    Hệ thống đang vận hành ổn định
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    {stats?.totalStaff || 0} nhân viên đang hoạt động
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-green-900 mb-1">Mục tiêu tháng này</p>
                  <p className="text-sm text-green-700">
                    Đạt {donationTrend.length > 0 ? donationTrend[donationTrend.length - 1].count : 0} lượt hiến
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Tiếp tục duy trì xu hướng tích cực
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// Main component with role check
export default function ThongKePage() {
  const { user } = useAuth();

  // Show Admin reports for admin role, Staff reports for others
  if (user?.vaitro === 'Admin') {
    return <AdminReportsPage />;
  }

  return <StaffReportsPage />;
}
