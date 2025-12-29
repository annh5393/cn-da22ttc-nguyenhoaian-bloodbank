'use client';

import { useEffect, useState } from 'react';
import { Users, Droplet, UserCheck, TrendingUp, AlertTriangle, Calendar, BarChart3, TrendingDown, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { reportApi } from '@/api/report.api';
import { phieuhienmauApi } from '@/api/phieuhienmau.api';
import { nguoihienmauApi } from '@/api/nguoihienmau.api';
import type { DashboardStats, BloodInventory, ExpiringBag } from '@/types/api.types';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [expiringBags, setExpiringBags] = useState<ExpiringBag[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroupDistribution, setBloodGroupDistribution] = useState<{ group: string; count: number; percentage: number }[]>([]);
  const [previousMonthStats, setPreviousMonthStats] = useState<{ donors: number; donations: number } | null>(null);
  
  // Donation trend chart states
  const [trendPeriod, setTrendPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [trendOffset, setTrendOffset] = useState(0); // 0 = current, -1 = previous, etc.
  const [trendData, setTrendData] = useState<{ label: string; count: number }[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadTrendData(trendPeriod);
  }, [trendPeriod, trendOffset]);

  const loadDashboardData = async () => {
    try {
      const [statsData, inventoryData, expiringResponse] = await Promise.all([
        reportApi.getDashboard(),
        reportApi.getInventory(),
        reportApi.getExpiringBlood(30),
      ]);
      setStats(statsData);
      setInventory(inventoryData);
      setExpiringBags(expiringResponse.bags);

      // Fetch donation trend data
      await loadTrendData('month');
      
      // Fetch blood group distribution
      await loadBloodGroupDistribution();

      // Fetch previous month stats for comparison
      await loadPreviousMonthStats();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendData = async (period: 'day' | 'week' | 'month' | 'year') => {
    try {
      const donations = await phieuhienmauApi.getAll();
      const now = new Date();
      let data: { label: string; count: number }[] = [];

      if (period === 'day') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() + trendOffset - i);
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
          const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

          const count = donations.filter(d => {
            const donationDate = new Date(d.ngaytaophieuhien);
            return donationDate >= dayStart && donationDate <= dayEnd;
          }).length;

          data.push({
            label: `${date.getDate()}/${date.getMonth() + 1}`,
            count
          });
        }
      } else if (period === 'week') {
        // Last 8 weeks
        for (let i = 7; i >= 0; i--) {
          const weekEnd = new Date(now);
          weekEnd.setDate(weekEnd.getDate() + (trendOffset * 7) - (i * 7));
          const weekStart = new Date(weekEnd);
          weekStart.setDate(weekStart.getDate() - 6);

          const count = donations.filter(d => {
            const donationDate = new Date(d.ngaytaophieuhien);
            return donationDate >= weekStart && donationDate <= weekEnd;
          }).length;

          data.push({
            label: `T${8 - i}`,
            count
          });
        }
      } else if (period === 'month') {
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() + trendOffset - i, 1);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

          const count = donations.filter(d => {
            const donationDate = new Date(d.ngaytaophieuhien);
            return donationDate >= monthStart && donationDate <= monthEnd;
          }).length;

          data.push({
            label: `T${date.getMonth() + 1}`,
            count
          });
        }
      } else if (period === 'year') {
        // Last 5 years
        for (let i = 4; i >= 0; i--) {
          const year = now.getFullYear() + trendOffset - i;
          const yearStart = new Date(year, 0, 1);
          const yearEnd = new Date(year, 11, 31, 23, 59, 59);

          const count = donations.filter(d => {
            const donationDate = new Date(d.ngaytaophieuhien);
            return donationDate >= yearStart && donationDate <= yearEnd;
          }).length;

          data.push({
            label: `${year}`,
            count
          });
        }
      }

      setTrendData(data);
    } catch (error) {
      console.error('Failed to load trend data:', error);
    }
  };

  const loadBloodGroupDistribution = async () => {
    try {
      const donorsResponse = await nguoihienmauApi.getAll({ pageSize: 1000 }); // Get all donors
      const donors = donorsResponse.data;
      const groupCounts: Record<string, number> = {};
      let unknownCount = 0;
      
      donors.forEach(donor => {
        // Skip donors without blood group info
        if (!donor.nhommau || !donor.rhesus) {
          unknownCount++;
          return;
        }
        
        const group = `${donor.nhommau}${donor.rhesus}`;
        groupCounts[group] = (groupCounts[group] || 0) + 1;
      });

      const total = donors.length - unknownCount; // Exclude unknown from total
      const distribution = Object.entries(groupCounts).map(([group, count]) => ({
        group,
        count,
        percentage: Math.round((count / total) * 100)
      })).sort((a, b) => b.count - a.count);

      // Add unknown group if exists
      if (unknownCount > 0) {
        distribution.push({
          group: 'Chưa xác định',
          count: unknownCount,
          percentage: 0 // Don't show percentage for unknown
        });
      }

      setBloodGroupDistribution(distribution);
    } catch (error) {
      console.error('Failed to load blood group distribution:', error);
    }
  };

  const loadPreviousMonthStats = async () => {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59);

      const [donations, donorsResponse] = await Promise.all([
        phieuhienmauApi.getAll(),
        nguoihienmauApi.getAll({ pageSize: 1000 })
      ]);

      const lastMonthDonations = donations.filter(d => {
        const date = new Date(d.ngaytaophieuhien);
        return date >= lastMonthStart && date <= lastMonthEnd;
      }).length;

      const lastMonthDonors = donorsResponse.data.filter(d => {
        if (!d.created_at) return false;
        const date = new Date(d.created_at);
        return date >= lastMonthStart && date <= lastMonthEnd;
      }).length;

      setPreviousMonthStats({
        donors: lastMonthDonors,
        donations: lastMonthDonations
      });
    } catch (error) {
      console.error('Failed to load previous month stats:', error);
    }
  };

  // Calculate trend indicators
  const calculateTrend = (current: number, previous: number) => {
    if (!previous) return { percentage: 0, direction: 'neutral' as const };
    const diff = current - previous;
    const percentage = Math.round((diff / previous) * 100);
    const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';
    return { percentage: Math.abs(percentage), direction };
  };

  const donorTrend = previousMonthStats ? calculateTrend(stats?.totalDonors || 0, previousMonthStats.donors) : { percentage: 0, direction: 'neutral' as const };
  const donationTrend = previousMonthStats ? calculateTrend(stats?.todayDonations || 0, previousMonthStats.donations) : { percentage: 0, direction: 'neutral' as const };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Stats Section - Glassmorphism Cards */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl -z-10"></div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 - Người hiến máu */}
          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                <Users className="w-7 h-7 text-white" />
              </div>
              {donorTrend.direction === 'up' ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : donorTrend.direction === 'down' ? (
                <TrendingDown className="w-5 h-5 text-red-500" />
              ) : (
                <Minus className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{stats?.totalDonors || 0}</h3>
            <p className="text-gray-600 font-medium text-sm uppercase tracking-wider mb-2">Người hiến máu</p>
            {donorTrend.percentage > 0 && (
              <p className={`text-xs font-bold ${donorTrend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {donorTrend.direction === 'up' ? '↑' : '↓'} {donorTrend.percentage}% so với tháng trước
              </p>
            )}
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
          </div>

          {/* Card 2 - Nhân viên */}
          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{stats?.totalStaff || 0}</h3>
            <p className="text-gray-600 font-medium text-sm uppercase tracking-wider mb-2">Nhân viên</p>
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-green-500 to-transparent rounded-full"></div>
          </div>

          {/* Card 3 - Túi máu khả dụng */}
          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <Droplet className="w-7 h-7 text-white fill-white" />
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{stats?.availableBags || 0}</h3>
            <p className="text-gray-600 font-medium text-sm uppercase tracking-wider mb-2">Túi máu khả dụng</p>
            <p className="text-xs font-bold text-gray-500">
              Sẵn sàng sử dụng
            </p>
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-red-500 to-transparent rounded-full"></div>
          </div>

          {/* Card 4 - Hiến máu tháng này */}
          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              {donationTrend.direction === 'up' ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : donationTrend.direction === 'down' ? (
                <TrendingDown className="w-5 h-5 text-red-500" />
              ) : (
                <Minus className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">
              {trendData.length > 0 ? trendData[trendData.length - 1].count : 0}
            </h3>
            <p className="text-gray-600 font-medium text-sm uppercase tracking-wider mb-2">Lượt hiến {
              trendPeriod === 'day' ? 'hôm nay' :
              trendPeriod === 'week' ? 'tuần này' :
              trendPeriod === 'month' ? 'tháng này' :
              'năm nay'
            }</p>
            {donationTrend.percentage > 0 && (
              <p className={`text-xs font-bold ${donationTrend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {donationTrend.direction === 'up' ? '↑' : '↓'} {donationTrend.percentage}% so với tháng trước
              </p>
            )}
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-orange-500 to-transparent rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Donation Trend with Period Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-600">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Xu hướng hiến máu</h2>
              <p className="text-xs text-gray-600">
                {trendPeriod === 'day' && '7 ngày gần nhất'}
                {trendPeriod === 'week' && '8 tuần gần nhất'}
                {trendPeriod === 'month' && '6 tháng gần nhất'}
                {trendPeriod === 'year' && '5 năm gần nhất'}
              </p>
            </div>
          </div>
          
          {/* Chart Period Filter */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTrendOffset(trendOffset - 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Kỳ trước"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-sm font-bold text-gray-700 min-w-[150px] text-center">
                {(() => {
                  const now = new Date();
                  if (trendPeriod === 'day') {
                    const date = new Date(now);
                    date.setDate(date.getDate() + trendOffset);
                    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  } else if (trendPeriod === 'week') {
                    const weekStart = new Date(now);
                    weekStart.setDate(weekStart.getDate() + (trendOffset * 7));
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    return `${weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
                  } else if (trendPeriod === 'month') {
                    const month = new Date(now.getFullYear(), now.getMonth() + trendOffset, 1);
                    return `Tháng ${month.getMonth() + 1}/${month.getFullYear()}`;
                  } else {
                    const year = now.getFullYear() + trendOffset;
                    return `Năm ${year}`;
                  }
                })()}
              </span>
              <button
                onClick={() => setTrendOffset(trendOffset + 1)}
                disabled={trendOffset >= 0}
                className={`p-2 rounded-lg transition-colors ${
                  trendOffset >= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
                }`}
                title="Kỳ sau"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTrendPeriod('day');
                  setTrendOffset(0);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  trendPeriod === 'day'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Ngày
              </button>
              <button
                onClick={() => {
                  setTrendPeriod('week');
                  setTrendOffset(0);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  trendPeriod === 'week'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tuần
              </button>
              <button
                onClick={() => {
                  setTrendPeriod('month');
                  setTrendOffset(0);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  trendPeriod === 'month'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tháng
              </button>
              <button
                onClick={() => {
                  setTrendPeriod('year');
                  setTrendOffset(0);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  trendPeriod === 'year'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Năm
              </button>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2">
            {trendData.length === 0 ? (
              <div className="w-full flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>
              </div>
            ) : (
              trendData.map((item, index) => {
                const maxCount = Math.max(...trendData.map(d => d.count), 1);
                // Calculate height percentage
                let heightPercent = 0;
                if (item.count > 0) {
                  if (item.count === maxCount) {
                    heightPercent = 100;
                  } else {
                    // Minimum 10% for any non-zero value, scale up to 95%
                    heightPercent = 10 + ((item.count / maxCount) * 85);
                  }
                }
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                    {/* Count label */}
                    <div className={`text-sm font-bold ${item.count === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                      {item.count}
                    </div>
                    
                    {/* Bar or placeholder */}
                    <div className="w-full flex items-end" style={{ height: '200px' }}>
                      {item.count > 0 ? (
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer shadow-md"
                          style={{ height: `${heightPercent}%` }}
                          title={`${item.label}: ${item.count} lượt hiến`}
                        ></div>
                      ) : (
                        <div className="w-full h-2 bg-gray-200 rounded self-end"></div>
                      )}
                    </div>
                    
                    {/* Label */}
                    <div className="text-xs text-gray-600 font-medium truncate w-full text-center">
                      {item.label}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pie Chart - Blood Group Distribution */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-purple-600">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Droplet className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Phân bổ nhóm máu</h2>
              <p className="text-xs text-gray-600">Người hiến máu theo nhóm</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Donut Chart */}
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">
                {(() => {
                  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];
                  let currentAngle = 0;
                  // Filter out "Chưa xác định" from pie chart
                  const knownGroups = bloodGroupDistribution.filter(item => item.group !== 'Chưa xác định');
                  
                  return knownGroups.map((item, index) => {
                    const percentage = item.percentage;
                    const angle = (percentage / 100) * 360;
                    const startAngle = currentAngle;
                    currentAngle += angle;
                    
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (currentAngle * Math.PI) / 180;
                    
                    const x1 = 50 + 35 * Math.cos(startRad);
                    const y1 = 50 + 35 * Math.sin(startRad);
                    const x2 = 50 + 35 * Math.cos(endRad);
                    const y2 = 50 + 35 * Math.sin(endRad);
                    
                    const largeArc = angle > 180 ? 1 : 0;
                    
                    return (
                      <path
                        key={index}
                        d={`M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={colors[index % colors.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    );
                  });
                })()}
                <circle cx="50" cy="50" r="20" fill="white" />
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-col justify-center space-y-2">
              {bloodGroupDistribution.slice(0, 8).map((item, index) => {
                const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];
                const isUnknown = item.group === 'Chưa xác định';
                const color = isUnknown ? '#9ca3af' : colors[index % colors.length];
                
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className={`text-xs font-bold ${isUnknown ? 'text-gray-500 italic' : 'text-gray-700'}`}>
                      {item.group}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {isUnknown ? `${item.count} người` : `${item.percentage}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Blood Inventory (2/3 width) - COMPACT */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-purple-600">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tồn kho khả dụng</h2>
                <p className="text-xs text-gray-500">Túi máu sẵn sàng sử dụng</p>
              </div>
              <Link 
                href="/dashboard/kho-mau" 
                className="text-sm font-semibold text-purple-600 hover:text-purple-700"
              >
                Xem tất cả →
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {inventory.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Droplet className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>
                </div>
              ) : (
                inventory.slice(0, 8).map((item, index) => {
                  const isLow = item.count < 5;
                  return (
                    <div 
                      key={index} 
                      className={`bg-gradient-to-br ${isLow ? 'from-red-50 to-orange-50 border-red-300' : 'from-purple-50 to-pink-50 border-purple-200'} rounded-xl p-4 border-2 hover:shadow-lg transition-all`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Droplet className={`w-5 h-5 ${isLow ? 'text-red-600 fill-red-600' : 'text-purple-600 fill-purple-600'}`} />
                        {isLow && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      </div>
                      <p className="text-2xl font-black text-gray-900 mb-1">
                        {item.nhommau}{item.rhesus}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <p className={`text-3xl font-black ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                          {item.count}
                        </p>
                        <p className="text-xs text-gray-600">túi</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.totalVolume.toLocaleString()} ml
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Alerts - COMPACT */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-orange-500">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Cảnh báo</h2>
                <p className="text-xs text-gray-500">Cần xử lý</p>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {/* Low Stock Alert */}
              {inventory.filter(i => i.count < 5).length > 0 && (
                <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-500">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-red-900 text-sm">
                        {inventory.filter(i => i.count < 5).length} nhóm máu tồn kho thấp
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        {inventory.filter(i => i.count < 5).map(i => `${i.nhommau}${i.rhesus}`).join(', ')}
                      </p>
                      <Link href="/dashboard/kho-mau" className="text-xs font-bold text-red-600 hover:underline mt-1 inline-block">
                        Xem chi tiết →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Expiring Bags Alert */}
              {expiringBags.length > 0 ? (
                <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-500">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-orange-900 text-sm">
                        {expiringBags.length} túi máu sắp hết hạn
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        Trong 30 ngày tới
                      </p>
                      <div className="mt-2 space-y-1">
                        {expiringBags.slice(0, 3).map((bag) => (
                          <div key={bag.matuimau} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-700">{bag.matuimau}</span>
                            <span className="font-bold text-orange-600">{bag.daysUntilExpiry}d</span>
                          </div>
                        ))}
                        {expiringBags.length > 3 && (
                          <p className="text-xs text-gray-500 italic">+{expiringBags.length - 3} túi khác</p>
                        )}
                      </div>
                      <Link href="/dashboard/kho-mau" className="text-xs font-bold text-orange-600 hover:underline mt-2 inline-block">
                        Xem tất cả →
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500 text-center">
                  <AlertTriangle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-bold text-green-900 text-sm">Tất cả an toàn!</p>
                  <p className="text-xs text-green-700 mt-1">Không có cảnh báo</p>
                </div>
              )}

              {/* Low Staff Alert */}
              {(stats?.totalStaff || 0) < 10 && (
                <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-500">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-yellow-900 text-sm">Thiếu nhân viên</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Chỉ có {stats?.totalStaff} nhân viên
                      </p>
                      <Link href="/dashboard/nhan-vien" className="text-xs font-bold text-yellow-600 hover:underline mt-1 inline-block">
                        Quản lý →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Elegant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          href="/dashboard/nhan-vien" 
          className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-t-4 border-blue-600"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Quản lý người dùng</h3>
            <p className="text-sm text-gray-600 font-medium mb-4">Thêm, sửa, xóa tài khoản hệ thống</p>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <span>Quản lý ngay</span>
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
            <p className="text-sm text-gray-600 font-medium mb-4">Xem và quản lý tồn kho túi máu</p>
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <span>Xem kho máu</span>
              <TrendingUp className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </div>
        </Link>

        <Link 
          href="/dashboard/thong-ke" 
          className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-t-4 border-green-600"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Báo cáo & Thống kê</h3>
            <p className="text-sm text-gray-600 font-medium mb-4">Xem phân tích và báo cáo chi tiết</p>
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
              <span>Xem thống kê</span>
              <TrendingUp className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </div>
        </Link>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f97316, #dc2626);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ea580c, #b91c1c);
        }
      `}</style>
    </div>
  );
}
