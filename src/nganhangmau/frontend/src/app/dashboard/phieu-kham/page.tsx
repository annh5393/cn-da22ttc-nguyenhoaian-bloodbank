'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { phieukhamApi } from '@/api/phieukham.api';
import { useAuth } from '@/contexts/AuthContext';
import { PhieuKhamWithRelations } from '@/types/api.types';
import { formatDate } from '@/utils/formatters';
import { ClipboardList, Plus, Search, X, Trash2, Loader, Users, CheckCircle, XCircle, TrendingUp, Calendar, Eraser } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';


export default function PhieuKhamPage() {
  const [phieukhams, setPhieukhams] = useState<PhieuKhamWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { user } = useAuth();
  
  const clearFilters = () => {
    setSearchTerm('');
    setFilterResult('');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  useEffect(() => {
    fetchPhieuKham();
  }, []);

  const fetchPhieuKham = async () => {
    try {
      setLoading(true);
      const data = await phieukhamApi.getAll();
      setPhieukhams(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phiếu khám:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || user.vaitro !== 'Admin') {
      alert('Chỉ Admin mới có quyền xóa phiếu khám');
      return;
    }
    if (!confirm('Bạn có chắc muốn xóa phiếu khám này?')) return;

    try {
      await phieukhamApi.delete(id);
      alert('Xóa thành công!');
      fetchPhieuKham();
    } catch (error) {
      alert('Lỗi khi xóa!');
    }
  };

  const filteredPhieuKham = phieukhams.filter((pk) => {
    const matchSearch = 
      pk.maphieukham?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pk.nguoihienmau?.hotennguoihien?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pk.nhanvienyte?.hotennvyt?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchResult = !filterResult || pk.ketquasangloc === filterResult;

    // Date filter
    let matchDate = true;
    if (pk.ngaykham) {
      const examDate = new Date(pk.ngaykham);
      examDate.setHours(0, 0, 0, 0);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchDate = matchDate && examDate >= start;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchDate = matchDate && examDate <= end;
      }
    } else if (startDate || endDate) {
      matchDate = false;
    }

    return matchSearch && matchResult && matchDate;
  });

  // Count stats
  const totalPhieuKham = phieukhams.length;
  const passedCount = phieukhams.filter(pk => pk.ketquasangloc === 'Đạt').length;
  const failedCount = phieukhams.filter(pk => pk.ketquasangloc === 'Không đạt').length;
  const pendingCount = phieukhams.filter(pk => pk.ketquasangloc === 'Chờ xử lý').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className=" pr-10 pl-10 space-y-">
      {/* Hero Header - Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-2xl">
                <ClipboardList className="w-12 h-12 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2 tracking-tight">Phiếu khám sàng lọc</h1>
                <p className="text-green-100 text-lg font-arial">Quản lý phiếu khám và kết quả sàng lọc người hiến máu</p>
              </div>
            </div>
            
            <Link
              href="/dashboard/phieu-kham/them"
              className="group flex items-center gap-3 px-6 py-4 bg-white text-green-600 rounded-2xl hover:bg-green-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <Plus className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-bold text-lg">Tạo phiếu khám</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards - Glassmorphism */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl -z-10"></div>
        <div className="pt-6 pb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500 opacity-50" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{totalPhieuKham}</h3>
            <p className="text-gray-600 font-arial text-sm  tracking-wider">Tổng phiếu khám</p>
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
          </div>

          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{passedCount}</h3>
            <p className="text-gray-600 font-arial text-sm  tracking-wider">Đạt yêu cầu</p>
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-green-500 to-transparent rounded-full"></div>
          </div>

          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                <XCircle className="w-7 h-7 text-white" />
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{failedCount}</h3>
            <p className="text-gray-600 font-arial text-sm  tracking-wider">Không đạt</p>
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-red-500 to-transparent rounded-full"></div>
          </div>

          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <Loader className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">Pending</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{pendingCount}</h3>
            <p className="text-gray-600 font-arial text-sm tracking-wider">Chờ xử lý</p>
            <div className="mt-4 h-1 w-12 bg-gradient-to-r from-yellow-500 to-transparent rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Filter Section - Premium Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-green-600 mt-4 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bộ lọc & Tìm kiếm</h2>
            <p className="text-sm text-gray-500">Tìm kiếm phiếu khám nhanh chóng</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search input */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, tên người hiến..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all duration-300 font-arial"
            />
          </div>

          {/* Result filter */}
          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all duration-300 font-arial bg-white text-gray-700"
          >
            <option value="">Tất cả kết quả</option>
            <option value="Đạt">✓ Đạt yêu cầu</option>
            <option value="Không đạt">✗ Không đạt</option>
            <option value="Chờ xử lý">⏳ Chờ xử lý</option>
          </select>

          {/* Start Date */}
          <div>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Từ ngày..."
              className="w-[250px]"
            />
          </div>

          {/* End Date */}
          <div>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="Đến ngày..."
              className="w-[250px]"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 text-sm">
          <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <span className="text-gray-600">Tìm thấy </span>
            <span className="font-bold text-green-600 text-lg">{filteredPhieuKham.length}</span>
            <span className="text-gray-600"> phiếu khám</span>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            title="Xóa tất cả bộ lọc"
         >
            <Eraser className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* TABLE - Premium Design */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-emerald-600 ">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-emerald-100">
          <h3 className="text-lg font-bold text-gray-900">Danh sách phiếu khám</h3>
          <p className="text-sm text-gray-600">Theo dõi kết quả sàng lọc sức khỏe</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr className="">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700  tracking-wider">Mã phiếu</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700  tracking-wider">Người hiến máu</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700  tracking-wider">Nhân viên khám</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700  tracking-wider">Ngày khám</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700  tracking-wider">Kết quả</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700  tracking-wider">Ghi chú</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700  tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPhieuKham.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">Không tìm thấy phiếu khám nào</p>
                    <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc tạo phiếu khám mới</p>
                  </td>
                </tr>
              ) : (
                filteredPhieuKham.map((pk, index) => (
                  <tr 
                    key={pk.maphieukham} 
                    className="group hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 font-bold text-gray-900 text-sm">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-bold rounded-lg shadow-md flex items-center justify-center">
                          {index + 1}
                        </div>
                        {pk.maphieukham}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-bold text-gray-900">
                          {pk.nguoihienmau?.hotennguoihien || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                      {pk.nhanvienyte?.hotennvyt || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-arial text-gray-600">
                      {pk.ngaykham ? formatDate(pk.ngaykham) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {pk.ketquasangloc === 'Đạt' ? (
                        <span title="Kết quả sàng lọc: Đạt yêu cầu" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                          <CheckCircle className="w-4 h-4" />
                          Đạt
                        </span>
                      ) : pk.ketquasangloc === 'Không đạt' ? (
                        <span title="Kết quả sàng lọc: Không đạt" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg">
                          <XCircle className="w-4 h-4" />
                          Không đạt
                        </span>
                      ) : pk.ketquasangloc === 'Chờ xử lý' ? (
                        <span title="Kết quả sàng lọc: Chờ xử lý" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg animate-pulse">
                          <Loader className="w-4 h-4" />
                          Chờ xử lý
                        </span>
                      ) : (
                        <span title="Kết quả sàng lọc: Chưa có" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg">
                          <X className="w-4 h-4" />
                          Chưa có
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {pk.ghichu || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/phieu-kham/${pk.maphieukham}`}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Xem chi tiết"
                        >
                          Xem
                        </Link>
                        {(user && (user.vaitro === 'Admin' || user.vaitro === 'Nhân viên y tế')) && (
                          <Link
                            href={`/dashboard/phieu-kham/${pk.maphieukham}/sua`}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition-all duration-300 hover:scale-110"
                            title="Chỉnh sửa"
                          >
                            Sửa
                          </Link>
                        )}
                        {user && user.vaitro === 'Admin' && (
                          <button
                            onClick={() => handleDelete(pk.maphieukham)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
