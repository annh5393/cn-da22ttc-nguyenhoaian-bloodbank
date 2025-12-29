'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { nguoihienmauApi } from '@/api/nguoihienmau.api';
import { phieuhienmauApi } from '@/api/phieuhienmau.api';
import { User, Droplet, Phone, Mail, MapPin, Calendar, Heart, Award, Edit, User2Icon } from 'lucide-react';
import { formatDate, formatStatus } from '@/utils/formatters';
import Link from 'next/link';

/**
 * TRANG PROFILE NGƯỜI HIẾN MÁU
 * Hiển thị thông tin cá nhân và lịch sử hiến máu
 */

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [donationHistory, setDonationHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (user?.vaitro === 'Người hiến máu') {
        // Donor: only fetch own profile via ID and own donations (backend filters by token)
        if (!user.manguoihien) throw new Error('Thiếu mã người hiến trong phiên đăng nhập');
        const donor = await nguoihienmauApi.getById(user.manguoihien);
        setProfile(donor);

        const myDonations = await phieuhienmauApi.getAll();
        setDonationHistory(myDonations); ///
      } else {
        // Admin/Staff xem profile của chính họ
        setProfile(user);
      }
    } catch (error) {
      console.error('Lỗi khi tải profile:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Hiển thị nhóm máu: hỗ trợ cả giá trị 'Dương'/'Âm' hoặc '+'/'-'
  const rh = profile?.rhesus;
  const rhSymbol = rh === 'Dương' || rh === '+' ? '+' : rh === 'Âm' || rh === '-' ? '-' : '';
  const bloodDetermined = Boolean(profile?.nhommau && profile?.rhesus);
  const bloodType = bloodDetermined ? `${profile.nhommau}${rhSymbol}` : 'Chưa xác định';

  const totalDonations = donationHistory.length;
  const totalVolume = donationHistory.reduce((sum, d) => sum + (Number(d.luongmauhien) || 0), 0);

  return (
    <div className="space-y-6 pl-10 pr-10">
      {/* Hero Header */}
      <div className="relative backdrop-blur-lg bg-white/80 rounded-3xl p-8 shadow-2xl overflow-hidden border-2 border-red-100">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl flex items-center justify-center border-2 border-red-200 shadow-lg">
              <User className="w-9 h-9 text-red-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1 flex items-center gap-3">
                Hồ sơ cá nhân
                <Heart className="w-8 h-8 text-red-600 fill-red-600 animate-pulse" style={{ animationDuration: '2s' }}/>
              </h1>
              <p className="text-gray-700 text-base">
                Thông tin chi tiết và lịch sử hiến máu của bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Card */}
          <div className="relative backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border border-white/50 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                Thông tin cá nhân
              </h2>
              {user?.vaitro === 'Người hiến máu' && (
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/profile/donor/edit`}
                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors flex items-center gap-2 font-bold text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Chỉnh sửa
                  </Link>
                  <Link
                    href={`/dashboard/profile/donor/change-password`}
                    className="px-4 py-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors flex items-center gap-2 font-bold text-sm"
                  >
                    <User2Icon className="w-4 h-4" />
                    Đổi mật khẩu
                  </Link>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-bold uppercase">Họ và tên</label>
                <p className="text-gray-900 font-semibold text-lg">
                  {profile?.hotennguoihien || 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-bold uppercase">Vai trò</label>
                <p className="text-gray-900 font-semibold text-lg">{user?.vaitro}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-bold uppercase">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-900 font-medium">{(profile as any)?.email || user?.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-bold uppercase">Số điện thoại</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-900 font-medium">{profile?.sodienthoai || 'Chưa cập nhật'}</p>
                </div>
              </div>

              {profile?.ngaysinh && (
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-bold uppercase">Ngày sinh</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900 font-medium">{formatDate(profile.ngaysinh)}</p>
                  </div>
                </div>
              )}

              {profile?.gioitinh && (
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-bold uppercase">Giới tính</label>
                  <div className="flex items-center gap-2">
                    <User2Icon className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-900 font-medium">{profile.gioitinh}</p>
                  </div>
                </div>
              )}

              {profile?.diachi && (
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-gray-500 font-bold uppercase">Địa chỉ</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900 font-medium">{profile.diachi}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Donation History */}
          {user?.vaitro === 'Người hiến máu' && (
            <div className="relative backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border border-white/50 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600"></div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                Lịch sử hiến máu
              </h2>

              {donationHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Droplet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold">Chưa có lịch sử hiến máu</p>
                  <p className="text-sm text-gray-400 mt-2">Hãy tham gia hiến máu tình nguyện</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donationHistory.map((donation) => (
                    <div
                      key={donation.maphieuhien}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Droplet className="w-6 h-6 text-white fill-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{formatDate(donation.ngayhien)}</p>
                          <p className="text-sm text-gray-600">
                            {donation.luongmauhien} ml - {donation.diadiem || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {(() => { const label = formatStatus(donation.trangthai); return (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            label === 'Hoàn thành' 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {label}
                          </span>
                        ); })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Stats & Blood Type */}
        <div className="space-y-6">
          {/* Blood Type Card or Pending Badge */}
          {bloodDetermined ? (
            <div className="sticky top-6 backdrop-blur-lg bg-gradient-to-br from-red-50/80 to-pink-50/80 rounded-2xl p-6 shadow-xl border-2 border-red-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
                Nhóm máu của bạn
              </h3>

              <div className="text-center mb-6">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl mb-4">
                  <Droplet className="w-16 h-16 text-white fill-white" />
                </div>
                <div className="text-4xl font-arial font-bold text-red-600 mb-2">{bloodType}</div>
                <div className="text-sm text-gray-600 font-bold uppercase tracking-wider">Nhóm máu</div>
              </div>

              {user?.vaitro === 'Người hiến máu' && (
                <>
                  <div className="space-y-4 pt-6 border-t border-red-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-bold">Số lần hiến:</span>
                      <span className="text-2xl font-bold text-red-600">{totalDonations}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-bold">Tổng lượng máu:</span>
                      <span className="text-2xl font-bold text-red-600">{totalVolume} ml</span>
                    </div>
                  </div>

                  {/* Achievement Badge */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-yellow-300">
                    <div className="flex items-center gap-3">
                      <Award className="w-8 h-8 text-yellow-600" />
                      <div>
                        <p className="font-bold text-yellow-900">
                          {totalDonations >= 10 ? 'Người hùng hiến máu' : 
                           totalDonations >= 5 ? 'Người hiến máu tích cực' : 
                           'Người hiến máu mới'}
                        </p>
                        <p className="text-xs text-yellow-700">
                          {totalDonations >= 10 ? 'Đã hiến máu hơn 10 lần' : 
                           totalDonations >= 5 ? 'Đã hiến máu 5-9 lần' : 
                           'Cảm ơn sự đóng góp của bạn'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="sticky top-6 backdrop-blur-lg bg-white/80 rounded-2xl p-6 shadow-xl border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-gray-600" />
                Chưa có kết quả xét nghiệm
              </h3>
              <p className="text-sm text-gray-700">Nhóm máu sẽ được cập nhật sau khi hoàn tất xét nghiệm từ phiếu hiến máu.</p>
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700 font-semibold">Chưa hiến máu</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
