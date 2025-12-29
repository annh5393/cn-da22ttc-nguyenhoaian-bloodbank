'use client';

import { useEffect, useState } from 'react';
import { Users, FileCheck, Droplet, Calendar, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { reportApi } from '@/api/report.api';
import { phieuhienmauApi } from '@/api/phieuhienmau.api';
import { phieukhamApi } from '@/api/phieukham.api';
import { tuimauApi } from '@/api/tuimau.api';
import { nguoihienmauApi } from '@/api/nguoihienmau.api';
import type { DashboardStats } from '@/types/api.types';
import Link from 'next/link';

export default function StaffDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Staff-specific stats
  const [totalDonors, setTotalDonors] = useState(0);
  const [screeningStats, setScreeningStats] = useState({ total: 0, passed: 0, failed: 0, pending: 0 });
  const [bagStats, setBagStats] = useState({ valid: 0, expiring: 0, expired: 0 });
  const [recentDonations, setRecentDonations] = useState(0);

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      const [dashboardData, donations, screenings, bags, donors] = await Promise.all([
        reportApi.getDashboard(),
        phieuhienmauApi.getAll(),
        phieukhamApi.getAll(),
        tuimauApi.getAll(),
        nguoihienmauApi.getAll({ pageSize: 1000 }),
      ]);

      setStats(dashboardData);
      setTotalDonors(donors.data.length);

      // Calculate screening stats
      const passedScreenings = screenings.filter((s: any) => {
        const result = s.ketquasangloc?.trim().toLowerCase();
        return result === 'đạt' || result === 'dat';
      }).length;

      const failedScreenings = screenings.filter((s: any) => {
        const result = s.ketquasangloc?.trim().toLowerCase();
        return result === 'không đạt' || result === 'khong dat';
      }).length;

      const pendingScreenings = screenings.filter((s: any) => {
        const result = s.ketquasangloc?.trim().toLowerCase();
        return result === 'chờ xử lý' || result === 'cho xu ly' || !result;
      }).length;

      setScreeningStats({
        total: screenings.length,
        passed: passedScreenings,
        failed: failedScreenings,
        pending: pendingScreenings
      });

      // Calculate bag stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

      let validBags = 0;
      let expiringBags = 0;
      let expiredBags = 0;

      bags.forEach((bag: any) => {
        if (!bag.hansudung) return;
        
        const expiryDate = new Date(bag.hansudung);
        expiryDate.setHours(0, 0, 0, 0);

        if (expiryDate < today) {
          expiredBags++;
        } else if (expiryDate <= thirtyDaysLater) {
          expiringBags++;
        } else {
          validBags++;
        }
      });

      setBagStats({ valid: validBags, expiring: expiringBags, expired: expiredBags });

      // Recent donations (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentCount = donations.filter((d: any) => {
        const donationDate = new Date(d.ngaytaophieuhien);
        return donationDate >= sevenDaysAgo;
      }).length;

      setRecentDonations(recentCount);

    } catch (error) {
      console.error('Failed to load staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pr-8 pl-8">
      {/* Hero Stats Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl -z-10"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 - Tổng người hiến */}
          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{totalDonors}</h3>
            <p className="text-gray-600 font-medium text-sm uppercase tracking-wider mb-2">Người hiến máu</p>
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
          </div>

          {/* Card 2 - Phiếu khám đạt */}
          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <FileCheck className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{screeningStats.passed}</h3>
            <p className="text-gray-600 font-medium text-sm uppercase tracking-wider mb-2">Phiếu khám đạt</p>
            <p className="text-xs text-gray-500">
              {screeningStats.failed} không đạt • {screeningStats.pending} chờ xử lý
            </p>
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-green-500 to-transparent rounded-full"></div>
          </div>

          {/* Card 3 - Túi máu còn hạn */}
          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <Droplet className="w-7 h-7 text-white fill-white" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{bagStats.valid}</h3>
            <p className="text-gray-600 font-medium text-sm uppercase tracking-wider mb-2">Túi máu còn hạn</p>
            <p className="text-xs text-orange-600 font-bold">
              ⚠️ {bagStats.expiring} sắp hết • {bagStats.expired} đã hết
            </p>
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-red-500 to-transparent rounded-full"></div>
          </div>

          {/* Card 4 - Lượt hiến gần đây */}
          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{recentDonations}</h3>
            <p className="text-gray-600 font-medium text-sm uppercase tracking-wider mb-2">Lượt hiến 7 ngày</p>
            <p className="text-xs text-gray-500">Hoạt động gần đây</p>
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-orange-500 to-transparent rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Screening Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-green-600">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Tình trạng sàng lọc</h2>
              <p className="text-xs text-gray-600">Tổng {screeningStats.total} phiếu khám</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Đạt</span>
                <span className="text-lg font-bold text-green-600">{screeningStats.passed}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(screeningStats.passed / screeningStats.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Không đạt</span>
                <span className="text-lg font-bold text-red-600">{screeningStats.failed}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(screeningStats.failed / screeningStats.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Chờ xử lý</span>
                <span className="text-lg font-bold text-yellow-600">{screeningStats.pending}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(screeningStats.pending / screeningStats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Blood Bag Status */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-red-600">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Droplet className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Trạng thái túi máu</h2>
              <p className="text-xs text-gray-600">Tổng {bagStats.valid + bagStats.expiring + bagStats.expired} túi</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Còn hạn</p>
                  <p className="text-xs text-gray-500">Sử dụng bình thường</p>
                </div>
                <p className="text-3xl font-black text-green-600">{bagStats.valid}</p>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Sắp hết hạn</p>
                  <p className="text-xs text-gray-500">Trong 30 ngày tới</p>
                </div>
                <p className="text-3xl font-black text-orange-600">{bagStats.expiring}</p>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Đã hết hạn</p>
                  <p className="text-xs text-gray-500">Cần xử lý</p>
                </div>
                <p className="text-3xl font-black text-red-600">{bagStats.expired}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          href="/dashboard/nguoi-hien-mau" 
          className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-t-4 border-blue-600"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Quản lý người hiến</h3>
            <p className="text-sm text-gray-600 font-medium mb-4">Thêm, sửa thông tin người hiến máu</p>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <span>Xem danh sách</span>
              <TrendingUp className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </div>
        </Link>

        <Link 
          href="/dashboard/kho-mau" 
          className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-t-4 border-red-600"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Droplet className="w-8 h-8 text-white fill-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Quản lý kho máu</h3>
            <p className="text-sm text-gray-600 font-medium mb-4">Nhập, xuất và kiểm tra tồn kho</p>
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <span>Xem kho máu</span>
              <TrendingUp className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </div>
        </Link>

        <Link 
          href="/dashboard/thong-ke" 
          className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-t-4 border-purple-600"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Báo cáo & Thống kê</h3>
            <p className="text-sm text-gray-600 font-medium mb-4">Xem phân tích và báo cáo chi tiết</p>
            <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
              <span>Xem thống kê</span>
              <TrendingUp className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
