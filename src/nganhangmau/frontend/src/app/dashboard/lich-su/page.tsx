'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { phieuhienmauApi } from '@/api/phieuhienmau.api';
import { PhieuHienMauWithRelations } from '@/types/api.types';
import { Calendar, Droplet, FileText, CheckCircle, Clock, XCircle, Heart, Award, User } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { getDonationCount } from '@/utils/donationDisplay';


export default function LichSuHienMauPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<PhieuHienMauWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is Admin (can see all donations)
  const isAdmin = user?.vaitro === 'Admin';

  useEffect(() => {
    loadDonationHistory();
  }, []);

  const loadDonationHistory = async () => {
    try {
      setLoading(true);
      const data = await phieuhienmauApi.getAll();
      // Backend đã filter theo role
      setDonations(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể tải lịch sử hiến máu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    const iconClass = "w-6 h-6 text-white";
    switch (status?.toLowerCase()) {
      case 'hoàn thành':
      case 'đã hoàn thành':
        return <CheckCircle className={iconClass} />;
      case 'đang xử lý':
      case 'chờ xử lý':
        return <Clock className={iconClass} />;
      case 'hủy':
      case 'từ chối':
        return <XCircle className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'hoàn thành':
      case 'đã hoàn thành':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'đang xử lý':
      case 'chờ xử lý':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hủy':
      case 'từ chối':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-500/30 border-t-red-600 rounded-full animate-spin"></div>
          <Heart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-red-600 animate-pulse fill-red-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">

      <div className="relative z-10 pl-10 pr-10 mx-auto">
        {/* HERO - Match dashboard glass cards */}
        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-lg border border-white before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-red-500 before:to-pink-600 before:rounded-t-3xl">
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/40">
                <Calendar className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-arial font-bold text-gray-900 tracking-tight mb-1">
                  {isAdmin ? 'Quản lý lịch sử hiến máu' : 'Lịch sử hiến máu'}
                </h1>
                <p className="text-gray-600 text-base tracking-wider font-medium flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
                  {isAdmin 
                    ? 'Xem tất cả lịch sử hiến máu của người hiến'
                    : 'Xem lại hành trình hiến máu cao đẹp của bạn'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      <br></br>
        {error && (
          <div className="mb-8 backdrop-blur-lg bg-gradient-to-r from-red-400/30 to-pink-400/30 border-2 border-red-300 rounded-2xl p-5 text-red-900 font-medium shadow-lg">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6" />
              {error}
            </div>
          </div>
        )}

        {/* GLASSMORPHISM STATISTICS CARDS */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          <div className="group relative overflow-hidden backdrop-blur-lg bg-white/70 rounded-2xl shadow-xl p-6 border border-white hover:-translate-y-2 transition-all duration-300 before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-red-500 before:to-pink-600 before:rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Award className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-red-600 font-bold tracking-wider uppercase bg-red-100/70 px-2 py-1 rounded-lg">
                Tổng số
              </span>
            </div>
            <h3 className="text-4xl font-arial font-bold text-gray-900 mb-1 tracking-tight">
              {donations.length}
            </h3>
            <p className="text-sm text-gray-700 tracking-wider font-medium">Lần hiến máu</p>
          </div>

          <div className="group relative overflow-hidden backdrop-blur-lg bg-white/70 rounded-2xl shadow-xl p-6 border border-white hover:-translate-y-2 transition-all duration-300 before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-purple-500 before:to-pink-600 before:rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Droplet className="w-7 h-7 text-white fill-white" />
              </div>
              <span className="text-xs text-pink-600 font-bold tracking-wider uppercase bg-pink-100/70 px-2 py-1 rounded-lg">
                Tổng lượng
              </span>
            </div>
            <h3 className="text-4xl font-arial font-bold text-gray-900 mb-1 tracking-tight">
              {donations.reduce((sum, d) => sum + (Number(d.luongmauhien) || 0), 0)}
            </h3>
            <p className="text-sm text-gray-700 tracking-wider font-medium">Milliliter (ml)</p>
          </div>

          <div className="group relative overflow-hidden backdrop-blur-lg bg-white/70 rounded-2xl shadow-xl p-6 border border-white hover:-translate-y-2 transition-all duration-300 before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-green-500 before:to-emerald-600 before:rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 animate-pulse">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-green-600 font-bold tracking-wider uppercase bg-green-100/70 px-2 py-1 rounded-lg">
                Thành công
              </span>
            </div>
            <h3 className="text-4xl font-arial font-bold text-gray-900 mb-1 tracking-tight">
              {donations.filter(d => d.trangthai?.toLowerCase().includes('hoàn thành')).length}
            </h3>
            <p className="text-sm text-gray-700 tracking-wider font-medium">Hoàn thành</p>
          </div>

        </div> */}

        {/* GLASSMORPHISM TIMELINE */}
        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-lg border border-white before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-red-500 before:to-pink-600 before:rounded-t-3xl">
          <div className="p-6">
            <h2 className="text-2xl font-arial font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <FileText className="w-6 h-6 text-gray-700" />
              Chi tiết lịch sử
            </h2>
          </div>
          
          {donations.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
                <Droplet className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-xl font-bold mb-3">Chưa có lịch sử hiến máu</p>
              <p className="text-gray-400 text-sm">
                Các lần hiến máu của bạn sẽ được hiển thị tại đây
              </p>
            </div>
          ) : (
            <div className="pl-8 pr-8 pb-8">
              <div className="space-y-6">
                {donations.map((donation, index) => (
                  <div
                    key={donation.maphieuhien}
                    className="relative group"
                  >
                    {/* Timeline connector */}
                    {index !== donations.length - 1 && (
                      <div className="absolute left-[2.3rem] top-[4.5rem] bottom-[-1.5rem] w-1 bg-gradient-to-b from-red-400 via-pink-400 to-rose-400 rounded-full opacity-50"></div>
                    )}

                    <div className="backdrop-blur-lg bg-white/80 rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                      <div className="flex gap-5">
                        {/* Status Icon with Gradient */}
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-400 to-pink-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                          {getStatusIcon(donation.trangthai)}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-arial font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <Award className="w-5 h-5 text-red-600" />
                                Lần hiến thứ {getDonationCount(donation, index)}
                              </h3>
                              {isAdmin && donation.nguoihienmau && (
                                <p className="text-sm text-gray-700 flex items-center gap-2 mt-1 font-semibold">
                                  <User className="w-4 h-4 text-blue-600" />
                                  {donation.nguoihienmau.hotennguoihien}
                                </p>
                              )}
                              <p className="text-sm text-gray-600 flex items-center gap-2 mt-2 font-medium">
                                <Calendar className="w-4 h-4" />
                                {donation.ngaytaophieuhien ? formatDate(donation.ngaytaophieuhien) : 'Chưa có ngày'}
                              </p>
                            </div>
                            <span
                              className={`px-4 py-2 rounded-xl text-xs font-arial font-bold border-2 ${getStatusColor(
                                donation.trangthai
                              )} tracking-wider uppercase shadow-sm`}
                            >
                              {donation.trangthai || 'Chưa xác định'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-gradient-to-br from-gray-50/80 to-gray-100/80 rounded-xl">
                              <p className="text-xs text-gray-500 font-bold tracking-wider uppercase mb-1">Mã phiếu</p>
                              <p className="font-arial font-bold text-gray-900 text-sm">{donation.maphieuhien}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-red-50/80 to-pink-50/80 rounded-xl">
                              <p className="text-xs text-gray-500 font-bold tracking-wider uppercase mb-1">Lượng máu</p>
                              <p className="font-arial font-bold text-red-600 text-sm">
                                {donation.luongmauhien ? `${donation.luongmauhien} ml` : 'N/A'}
                              </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-blue-50/80 to-blue-100/80 rounded-xl">
                              <p className="text-xs text-gray-500 font-bold tracking-wider uppercase mb-1">Nhân viên</p>
                              <p className="font-bold text-gray-900 text-sm truncate">
                                {donation.nhanvienyte?.hotennvyt || donation.manvyt}
                              </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-purple-50/80 to-purple-100/80 rounded-xl">
                              <p className="text-xs text-gray-500 font-bold tracking-wider uppercase mb-1">Người hiến</p>
                              <p className="font-bold text-gray-900 text-sm truncate flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {donation.nguoihienmau?.hotennguoihien || donation.manguoihien}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
