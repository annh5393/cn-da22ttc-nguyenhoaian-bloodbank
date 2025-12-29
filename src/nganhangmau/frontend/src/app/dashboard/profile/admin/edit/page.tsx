'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, MapPin, Phone, Calendar, Mail, Save, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DatePicker } from '@/components/ui/date-picker';
import { updateStaffAccount } from '@/api/staff.api';

export default function AdminEditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    hotennvyt: '',
    email: '',
    sodienthoai: '',
    diachi: '',
    gioitinh: '',
  });
  const [ngaysinh, setNgaysinh] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (user) {
      setFormData({
        hotennvyt: user.hotennvyt || '',
        email: user.email || '',
        sodienthoai: user.sodienthoai || '',
        diachi: user.diachi || '',
        gioitinh: user.gioitinh || '',
      });
      setNgaysinh(user.ngaysinh ? new Date(user.ngaysinh) : undefined);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!user?.manvyt) throw new Error('Thiếu mã nhân viên');
      const payload: any = {
        hotennvyt: formData.hotennvyt,
        email: formData.email,
        sodienthoai: formData.sodienthoai,
        diachi: formData.diachi,
        gioitinh: formData.gioitinh,
      };
      if (ngaysinh) payload.ngaysinh = ngaysinh.toISOString();

      await updateStaffAccount(user.manvyt, payload);

      const updatedUser = {
        ...user,
        ...payload,
        ngaysinh: ngaysinh ? ngaysinh.toISOString() : user.ngaysinh,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard/profile/admin';
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative backdrop-blur-lg bg-white/80 rounded-3xl p-8 shadow-2xl overflow-hidden border-2 border-blue-100">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/profile/admin"
              className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center border-2 border-white shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Chỉnh sửa thông tin</h1>
              <p className="text-gray-600">Cập nhật thông tin cá nhân của bạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="backdrop-blur-lg bg-red-50/80 border-2 border-red-300 rounded-2xl p-5 text-red-900 shadow-lg">
          <div className="flex items-center gap-3">
            <X className="w-6 h-6" />
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="backdrop-blur-lg bg-green-50/80 border-2 border-green-300 rounded-2xl p-5 text-green-900 shadow-lg">
          <div className="flex items-center gap-3">
            <Save className="w-6 h-6" />
            Cập nhật thành công! Đang chuyển hướng...
          </div>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info Card */}
          <div className="relative backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border border-white/50 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              Thông tin cá nhân
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hotennvyt"
                  value={formData.hotennvyt}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ngày sinh
                </label>
                <DatePicker
                  value={ngaysinh}
                  onChange={setNgaysinh}
                  placeholder="Chọn ngày sinh"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Giới tính
                </label>
                <select
                  name="gioitinh"
                  value={formData.gioitinh}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="relative backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border border-white/50 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Phone className="w-6 h-6 text-indigo-600" />
              Thông tin liên hệ
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="sodienthoai"
                    value={formData.sodienthoai}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="diachi"
                    value={formData.diachi}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Nhập địa chỉ đầy đủ"
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mt-6">
                <p className="text-sm text-blue-800 font-semibold mb-1">Mã nhân viên</p>
                <p className="text-base font-mono font-bold text-blue-900">{user.manvyt}</p>
                <p className="text-xs text-blue-600 mt-1">Không thể thay đổi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border border-white/50">
          <div className="flex flex-wrap gap-4 justify-end">
            <Link
              href="/dashboard/profile/admin"
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
