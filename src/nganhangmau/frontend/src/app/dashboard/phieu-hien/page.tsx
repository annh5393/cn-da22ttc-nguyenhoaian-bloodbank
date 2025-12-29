'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { phieuhienmauApi } from '@/api/phieuhienmau.api';
import { PhieuHienMauWithRelations } from '@/types/api.types';
import { FileHeart, Calendar, User, Droplet, MapPin, Package, Heart, TrendingUp, Clock, Plus, Search, Filter, Eraser } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import Link from 'next/link';
import { DatePicker } from '@/components/ui/date-picker';

export default function PhieuHienPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<PhieuHienMauWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodType, setFilterBloodType] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  const clearFilters = () => {
    setSearchTerm('');
    setFilterBloodType('all');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const data = await phieuhienmauApi.getAll();
      setDonations(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể tải danh sách phiếu hiến máu');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalDonations = donations.length;
  const totalVolume = donations.reduce((sum, d) => sum + (Number(d.luongmauhien) || 0), 0);
  const uniqueDonors = new Set(donations.map(d => d.manguoihien)).size;
  const recentDonations = donations.filter(d => {
    const donationDate = new Date(d.ngaytaophieuhien as Date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return donationDate >= thirtyDaysAgo;
  }).length;

  // Get blood type distribution
  const bloodTypeStats = donations.reduce((acc, donation) => {
    const bloodType = `${donation.nguoihienmau?.nhommau || 'N/A'}${donation.nguoihienmau?.rhesus || ''}`;
    acc[bloodType] = (acc[bloodType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bloodTypes = Object.entries(bloodTypeStats)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Filter donations
  const filteredDonations = donations.filter(donation => {
    const matchesSearch = searchTerm === '' || 
      donation.maphieuhien.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.nguoihienmau?.hotennguoihien.toLowerCase().includes(searchTerm.toLowerCase());
    
    const bloodType = `${donation.nguoihienmau?.nhommau || 'N/A'}${donation.nguoihienmau?.rhesus || ''}`;
    const matchesBloodType = filterBloodType === 'all' || bloodType === filterBloodType;
    
    // Date filter
    let matchDate = true;
    if (donation.ngaytaophieuhien) {
      const donationDate = new Date(donation.ngaytaophieuhien);
      donationDate.setHours(0, 0, 0, 0);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchDate = matchDate && donationDate >= start;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchDate = matchDate && donationDate <= end;
      }
    } else if (startDate || endDate) {
      matchDate = false;
    }
    
    return matchesSearch && matchesBloodType && matchDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-500/30 border-t-red-600 rounded-full animate-spin"></div>
          <Heart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-red-600 animate-pulse fill-red-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pr-10 pl-10">
      {/* GLASSMORPHISM HERO HEADER */}
      <div className="relative backdrop-blur-lg bg-white/80 rounded-3xl p-8 shadow-2xl overflow-hidden border-2 border-red-100">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl flex items-center justify-center border-2 border-red-200 shadow-lg">
                <FileHeart className="w-9 h-9 text-red-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1 flex items-center gap-3">
                  Phiếu hiến máu
                  <Droplet className="w-8 h-8 text-red-600 fill-red-600 animate-pulse" />
                </h1>
                <p className="text-gray-700 text-base tracking-wider flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-red-500 fill-red-500" />
                  Quản lý và theo dõi các lần hiến máu
                </p>
              </div>
            </div>
            
            {user?.vaitro !== 'Người hiến máu' && (
              <Link
                href="/dashboard/phieu-hien/them"
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Tạo phiếu mới</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-lg bg-red-50/80 border-2 border-red-300 rounded-2xl p-5 text-red-900 shadow-lg">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6" />
            {error}
          </div>
        </div>
      )}

      {/* GLASSMORPHISM STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative group backdrop-blur-lg bg-white/70 rounded-2xl shadow-xl p-6 border border-white/50 hover:-translate-y-2 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-600"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <FileHeart className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs text-red-600 font-bold tracking-wider bg-red-100/70 px-2 py-1 rounded-lg">
              Tổng số
            </span>
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">{totalDonations}</h3>
          <p className="text-sm text-gray-700 tracking-wider">Lần hiến máu</p>
        </div>

        <div className="relative group backdrop-blur-lg bg-white/70 rounded-2xl shadow-xl p-6 border border-white/50 hover:-translate-y-2 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <User className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs text-blue-600 font-bold tracking-wider bg-blue-100/70 px-2 py-1 rounded-lg">
              Người hiến
            </span>
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">{uniqueDonors}</h3>
          <p className="text-sm text-gray-700 tracking-wider">Tình nguyện viên</p>
        </div>

        <div className="relative group backdrop-blur-lg bg-white/70 rounded-2xl shadow-xl p-6 border border-white/50 hover:-translate-y-2 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 animate-pulse">
              <Droplet className="w-7 h-7 text-white fill-white" />
            </div>
            <span className="text-xs text-purple-600 font-bold tracking-wider bg-purple-100/70 px-2 py-1 rounded-lg">
              Tổng lượng
            </span>
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">{totalVolume.toLocaleString()}</h3>
          <p className="text-sm text-gray-700 tracking-wider">ml máu</p>
        </div>

        <div className="relative group backdrop-blur-lg bg-white/70 rounded-2xl shadow-xl p-6 border border-white/50 hover:-translate-y-2 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs text-green-600 font-bold tracking-wider bg-green-100/70 px-2 py-1 rounded-lg">
              30 ngày
            </span>
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">{recentDonations}</h3>
          <p className="text-sm text-gray-700 tracking-wider">Gần đây</p>
        </div>
      </div>

      {/* SEARCH AND FILTER SECTION */}
      <div className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-xl p-6 border border-white/50">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã phiếu hoặc tên người hiến..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-gray-700 pl-12 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Blood Type Filter */}
          <div className="w-full lg:w-auto">
            <select
              value={filterBloodType}
              onChange={(e) => setFilterBloodType(e.target.value)}
              className="w-full h-12 px-4 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-700"
            >
              <option value="all">Tất cả nhóm máu</option>
              {bloodTypes.map(({ type }) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Date Filters */}
          <div className="w-full lg:w-auto">
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Từ ngày..."
            />
          </div>

          <div className="w-full lg:w-auto">
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="Đến ngày..."
            />
          </div>

          {/* Clear Filters Button */}
          <div className="w-full lg:w-auto">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full inline-flex items-center justify-center gap-2 h-12 px-4 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
              title="Xóa tất cả bộ lọc"
            >
              <Eraser className="w-4 h-4" />
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* DONATION RECORDS LIST */}
      {filteredDonations.length === 0 ? (
        <div className="backdrop-blur-lg bg-white/70 rounded-3xl shadow-xl p-16 text-center border-2 border-dashed border-gray-300">
          <FileHeart className="w-20 h-20 text-gray-300 mx-auto mb-6 opacity-50" />
          <p className="text-gray-500 text-xl font-bold mb-3">Không có phiếu hiến máu nào</p>
          <p className="text-gray-400 text-sm">
            {searchTerm || filterBloodType !== 'all' || startDate || endDate
              ? 'Không tìm thấy phiếu hiến máu phù hợp với bộ lọc'
              : 'Các phiếu hiến máu sẽ được hiển thị tại đây'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredDonations.map((donation) => {
            const bloodType = `${donation.nguoihienmau?.nhommau || 'N/A'}${donation.nguoihienmau?.rhesus || ''}`;

            const statusClass = (s?: string) => {
              switch (s) {
                case 'CREATED':
                  return 'bg-yellow-100 text-yellow-800 border-yellow-300';
                case 'COLLECTED':
                  return 'bg-blue-100 text-blue-800 border-blue-300';
                case 'STORED':
                  return 'bg-green-100 text-green-800 border-green-300';
                case 'CANCELED':
                  return 'bg-red-100 text-red-800 border-red-300';
                default:
                  return 'bg-gray-100 text-gray-800 border-gray-300';
              }
            };

            return (
              <div
                key={donation.maphieuhien}
                className="group backdrop-blur-lg bg-white/80 rounded-2xl p-6 border border-gray-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileHeart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-800">MÃ PHIẾU</p>
                      <h3 className="font-bold text-xl text-gray-900">{donation.maphieuhien}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200" title={bloodType === 'N/A' ? 'Chưa xác định nhóm máu' : 'Nhóm máu người hiến'}>
                    <Droplet className="w-4 h-4 text-red-600 fill-red-600" />
                    <span className="text-lg font-bold text-red-700">Nhóm máu: {bloodType}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-gray-700">Người hiến:</span>
                    <span className="ml-auto font-semibold text-blue-900">{donation.nguoihienmau?.hotennguoihien || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Droplet className="w-5 h-5 text-red-600" />
                    <span className="font-bold text-gray-700">Lượng máu:</span>
                    <span className="ml-auto text-red-600 font-bold">{Number(donation.luongmauhien) || 0} ml</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-gray-700">Ngày hiến:</span>
                    <span className="ml-auto text-purple-900 font-semibold">{formatDate(donation.ngaytaophieuhien as Date)}</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-gray-700">Địa điểm:</span>
                    <span className="ml-auto text-green-900 font-semibold">{(donation as any).diadiem || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Package className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-gray-700">Nhân viên khám:</span>
                    <span className="ml-auto font-semibold text-indigo-900">{donation.nhanvienyte?.hotennvyt || donation.manvyt}</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span className="font-bold text-gray-700">Trạng thái:</span>
                    <span title={`Trạng thái: ${donation.trangthai || 'Chưa xác định'}`} className={`ml-auto text-xs font-bold px-3 py-1 rounded-full border ${statusClass(donation.trangthai)}`}>{donation.trangthai || 'Chưa xác định'}</span>
                  </div>
                </div>

                {/* Actions */}
                {user?.vaitro !== 'Người hiến máu' && (
                  <div className="mt-4 flex justify-end">
                    <Link href={`/dashboard/phieu-hien/${donation.maphieuhien}/sua`} className="px-3 py-2 border rounded text-blue-700 hover:bg-blue-50">Sửa</Link>
                  </div>
                )}

                {Boolean((donation as any).ghichu) && (
                  <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-gray-600 mb-1">Ghi chú</p>
                    <p className="text-sm text-gray-700">{(donation as any).ghichu}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
