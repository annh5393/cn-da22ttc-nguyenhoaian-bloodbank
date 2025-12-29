'use client';

import { useEffect, useState } from 'react';
import { Droplet, Calendar, Award, TrendingUp, Check, TriangleAlert, User } from 'lucide-react';
import { NguoiHienMau } from '@/types/api.types';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { phieuhienmauApi } from '@/api/phieuhienmau.api';
import { nguoihienmauApi } from '@/api/nguoihienmau.api';
import { formatStatus } from '@/utils/formatters';

interface DonationHistory {
  maphieuhien: string;
  ngayhien?: Date;
  ngaytaophieuhien?: Date;
  luongmauhien: number;
  trangthai: string;
}

export default function DonorDashboard() {
  const { user } = useAuth();
  const [donorProfile, setDonorProfile] = useState<NguoiHienMau | null>(null);
  const [donationHistory, setDonationHistory] = useState<DonationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug: Log user data
  useEffect(() => {
    console.log('🔍 Debug DonorDashboard:');
    console.log('  user:', user);
    console.log('  donorProfile:', donorProfile);
    console.log('  nhommau:', donorProfile?.nhommau);
    console.log('  rhesus:', donorProfile?.rhesus);
  }, [user, donorProfile]);

  const formatBloodGroup = () => {
    if (!donorProfile) return 'Chưa xác định';
    const abo = (donorProfile?.nhommau || '').toUpperCase().trim();
    const rhRaw = (donorProfile?.rhesus || '').toString().trim();
    const rhNorm = rhRaw
      ? (/^\+|duong|dương|positive|pos$/i.test(rhRaw)
          ? '+'
          : (/^-|am|âm|negative|neg$/i.test(rhRaw) ? '-' : ''))
      : '';
    return abo ? `${abo}${rhNorm}` : 'Chưa xác định';
  };

  useEffect(() => {
    loadDonorData();
  }, []);

  const loadDonorData = async () => {
    try {
      // Load thông tin người hiến từ API để lấy nhommau và rhesus
      if (user?.manguoihien) {
        const donorData = await nguoihienmauApi.getById(user.manguoihien);
        console.log('📋 Donor data from API:', donorData);
        setDonorProfile(donorData);
      } else if (user) {
        // Fallback: cast user to NguoiHienMau
        setDonorProfile(user as unknown as NguoiHienMau);
      }
      
      // Gọi API lấy lịch sử hiến máu; backend sẽ tự lọc theo vai trò người hiến
      const all = await phieuhienmauApi.getAll();
      const mapped = (all || []).map((d: any) => ({
        maphieuhien: d.maphieuhien,
        ngayhien: d.ngayhien,
        ngaytaophieuhien: d.ngaytaophieuhien,
        luongmauhien: Number(d.luongmauhien || 0),
        // Không mặc định "Hoàn thành" để tránh hiển thị sai khi PK còn chờ
        // Ưu tiên trạng thái từ backend; nếu thiếu, hiển thị "Chờ kết quả"
        trangthai: d.trangthai ?? 'Chờ kết quả',
      }));
      setDonationHistory(mapped);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu người hiến máu:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const totalDonations = donationHistory.length;
  const totalBloodVolume = donationHistory.reduce((sum, d) => sum + (d.luongmauhien || 0), 0);

  return (
    <div className="space-y-8 pl-10 pr-10"> 
      {/* Hero Welcome Section - Glassmorphism with Gradient */}
      <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white shadow-lg before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-red-500 before:to-pink-600 before:rounded-t-3xl">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-red/60"></div>
        {/* { <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
         } */}
        <div className="relative p-8 text-white">
          <div className="flex items-center gap-6 mb-6 ">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border-2 border-red-600 shadow-2xl rounded-full">
              <Droplet className="w-12 h-12 fill-red-600 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl text-black font-arial font-bold mb-2">Xin chào, {user?.hotennguoihien}!</h1>
              <p className="text-black text-xl font-medium">Cảm ơn bạn đã là người hùng hiến máu tình nguyện</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
              before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-red-500 before:to-red-600 before:rounded-t-2xl">
              <div className="flex items-center gap-3 mb-2">
                <Droplet className="w-6 h-6 fill-white text-red-500" />
                <p className="text-black text-sm font-semibold uppercase tracking-wider">Nhóm máu của bạn</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-2xl text-black font-arial font-bold">{formatBloodGroup()}</p>
                {donorProfile && !(donorProfile?.nhommau && donorProfile?.rhesus) && (
                  <span title="Nhóm máu sẽ được cập nhật sau khi hoàn tất hiến máu" className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 font-semibold">Chưa hiến máu</span>
                )}
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
              before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-yellow-500 before:to-yellow-600 before:rounded-t-2xl">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-yellow-500" />
                <p className="text-black text-sm font-semibold uppercase tracking-wider">Số lần hiến</p>
              </div>
              <p className="text-2xl text-black font-arial font-bold">{totalDonations}</p>
            </div>
            
            <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
              before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-green-500 before:to-green-600 before:rounded-t-2xl">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <p className="text-black text-sm font-semibold uppercase tracking-wider">Tổng lượng máu</p>
              </div>
              <p className="text-2xl text-black font-arial font-bold">{totalBloodVolume} <span className="text-2xl">ml</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Glassmorphism */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 rounded-3xl -z-10"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
            before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-red-500 before:to-pink-600 before:rounded-t-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <Droplet className="w-7 h-7 text-white fill-white" />
              </div>
              <Award className="w-8 h-8 text-red-500 transform group-hover:rotate-12 transition-transform duration-500" />
            </div>
            <h3 className="text-2xl font-arial font-bold text-gray-900 mb-1 tracking-tight">{totalDonations}</h3>
            <p className="text-gray-600 font-medium text-sm uppercase tracking-wider">Lần hiến máu</p>
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-red-500 to-transparent rounded-full"></div>
          </div>

          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
            before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-purple-500 before:to-pink-600 before:rounded-t-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <Droplet className="w-7 h-7 text-white fill-white" />
              </div>
              <Droplet className="w-8 h-8 text-red-500 transform group-hover:rotate-12 transition-transform duration-500 fill-red-500" />
            </div>
            <h3 className="text-2xl font-arial font-bold text-gray-900 mb-1 tracking-tight">{formatBloodGroup()}</h3>
            <p className="text-gray-600 font-medium text-sm uppercase tracking-wider">Nhóm máu của bạn</p>
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-purple-500 to-transparent rounded-full"></div>
          </div>

          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
            before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-green-500 before:to-emerald-600 before:rounded-t-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Total</span>
            </div>
            <h3 className="text-2xl font-arial font-bold text-gray-900 mb-1 tracking-tight">{totalBloodVolume}</h3>
            <p className="text-gray-600 font-medium text-sm uppercase tracking-wider">Lượng máu (ml)</p>
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-green-500 to-transparent rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Recent Donation History - Full Width */}
      <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
        before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-gray-500 before:to-gray-600 before:rounded-t-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Lịch sử hiến máu gần đây</h2>
          <Link href="/dashboard/lich-su" className="text-sm text-red-600 hover:underline font-medium flex items-center gap-1">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {donationHistory.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Chưa có lịch sử hiến máu</p>
              <p className="text-sm text-gray-400">Hãy tham gia hiến máu tình nguyện</p>
            </div>
          ) : (
            donationHistory.slice(0, 6).map((donation) => (
              <div
                key={donation.maphieuhien}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {donation.ngaytaophieuhien 
                        ? new Date(donation.ngaytaophieuhien).toLocaleDateString('vi-VN')
                        : (donation.ngayhien 
                            ? new Date(donation.ngayhien).toLocaleDateString('vi-VN')
                            : 'Chưa xác định')}
                    </p>
                    <p className="text-sm text-gray-500">{donation.luongmauhien} ml</p>
                  </div>
                </div>
                {(() => {
                  const label = formatStatus(donation.trangthai);
                  return (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    label === 'Hoàn thành'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {label}
                </span>
                  );
                })()}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/profile/donor"
          className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
            before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-blue-500 before:to-blue-600 before:rounded-t-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Xem hồ sơ</h3>
              <p className="text-sm text-gray-600">Thông tin cá nhân và nhóm máu</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/lich-su"
          className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
            before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-purple-500 before:to-pink-600 before:rounded-t-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Lịch sử hiến máu</h3>
              <p className="text-sm text-gray-600">Xem tất cả lần hiến</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Motivational Section */}
      <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
        before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-red-500 before:to-red-600 before:rounded-t-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Droplet className="w-6 h-6 text-red-600 fill-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Cảm ơn bạn đã là người hùng thầm lặng!
            </h3>
            <p className="text-gray-600 mb-4">
              Mỗi giọt máu của bạn có thể cứu sống 1 mạng người. Hãy tiếp tục hành trình cao đẹp này và
              truyền cảm hứng cho những người xung quanh.
            </p>
            <div className="flex gap-3">
              <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Đăng ký hiến máu
              </button>
              <button className="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                Chia sẻ câu chuyện
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
          before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-orange-500 before:to-orange-600 before:rounded-t-2xl">
          <h3 className="font-bold text-gray-900 mb-4">Lưu ý khi hiến máu</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-orange-600"><TriangleAlert /></span>
              <span>Khoảng cách giữa 2 lần hiến máu ít nhất 12 tuần</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600"><TriangleAlert /></span>
              <span>Cần nghỉ ngơi đầy đủ trước khi hiến máu</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600"><TriangleAlert /></span>
              <span>Ăn uống đầy đủ và uống nhiều nước</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600"><TriangleAlert /></span>
              <span>Mang theo CMND/CCCD khi đến hiến máu</span>
            </li>
          </ul>
        </div>

        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
          before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-green-500 before:to-green-600 before:rounded-t-2xl">
          <h3 className="font-bold text-gray-900 mb-4">Quyền lợi người hiến máu</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600 text-black"><Check/></span>
              <span>Được khám sàng lọc sức khỏe miễn phí</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 text-black"><Check/></span>
              <span>Nhận giấy chứng nhận hiến máu tình nguyện</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 text-black"><Check/></span>
              <span>Ưu tiên được nhận máu khi cần thiết</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 text-black"><Check/></span>
              <span>Đóng góp cho cộng đồng và xã hội</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
