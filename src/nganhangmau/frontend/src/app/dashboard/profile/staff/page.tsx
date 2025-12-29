'use client';

import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/utils/formatters';
import { User, MapPin, Phone, Calendar, Mail, Briefcase, Edit } from 'lucide-react';
import Link from 'next/link';

export default function StaffProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pr-8 pl-8">
      {/* Hero Header */}
      <div className="relative backdrop-blur-lg bg-white rounded-3xl p-8 shadow-2xl overflow-hidden border-t-4 border-green-500">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.hotennvyt}</h1>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">{user.vaitro}</span>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/profile/staff/edit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Edit className="w-5 h-5" />
              Chỉnh sửa
            </Link>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info Card */}
        <div className="relative backdrop-blur-lg bg-white rounded-2xl p-6 shadow-xl border-t-4 border-green-500 overflow-hidden">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-6 h-6 text-green-600" />
            Thông tin liên hệ
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-gray-500" />
                <p className="text-sm text-gray-600 font-semibold">Email</p>
              </div>
              <p className="text-base font-medium text-gray-900 ml-8">{user.email}</p>
            </div>

            <div className="bg-white/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-gray-500" />
                <p className="text-sm text-gray-600 font-semibold">Số điện thoại</p>
              </div>
              <p className="text-base font-medium text-gray-900 ml-8">{user.sodienthoai || 'Chưa cập nhật'}</p>
            </div>

            <div className="bg-white/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <p className="text-sm text-gray-600 font-semibold">Địa chỉ</p>
              </div>
              <p className="text-base font-medium text-gray-900 ml-8">{user.diachi || 'Chưa cập nhật'}</p>
            </div>
          </div>
        </div>

        {/* Personal Info Card */}
        <div className="relative backdrop-blur-lg bg-white rounded-2xl p-6 shadow-xl border-t-4 border-green-500 overflow-hidden">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-600" />
            Thông tin cá nhân
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <p className="text-sm text-gray-600 font-semibold">Ngày sinh</p>
              </div>
              <p className="text-base font-medium text-gray-900 ml-8">
                {user.ngaysinh ? formatDate(user.ngaysinh) : 'Chưa cập nhật'}
              </p>
            </div>

            <div className="bg-white/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-gray-500" />
                <p className="text-sm text-gray-600 font-semibold">Giới tính</p>
              </div>
              <p className="text-base font-medium text-gray-900 ml-8">{user.gioitinh || 'Chưa cập nhật'}</p>
            </div>

            <div className="bg-white/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-5 h-5 text-gray-500" />
                <p className="text-sm text-gray-600 font-semibold">Mã nhân viên</p>
              </div>
              <p className="text-base font-medium text-gray-900 ml-8 font-mono">{user.manvyt}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
