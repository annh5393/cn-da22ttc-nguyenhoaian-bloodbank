'use client';

import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/utils/formatters';
import { User, MapPin, Phone, Calendar, Mail, Shield, Edit } from 'lucide-react';
import Link from 'next/link';

export default function AdminProfilePage() {
  const { user } = useAuth();

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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.hotennvyt}</h1>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-semibold text-blue-600">{user.vaitro}</span>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/profile/admin/edit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
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
        <div className="relative backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border border-white/50 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-6 h-6 text-blue-600" />
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
        <div className="relative backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border border-white/50 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600" />
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
                <Shield className="w-5 h-5 text-gray-500" />
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
