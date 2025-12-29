"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { nguoihienmauApi } from '@/api/nguoihienmau.api';
import { adminApi } from '@/api/admin.api';
import { useAuth } from '@/contexts/AuthContext';
import { NguoiHienMau } from '@/types/api.types';
import { formatDate, formatPhoneNumber, formatBloodType } from '@/utils/formatters';
import { Droplet, Heart, Plus, Search, Users, TrendingUp, Activity, Eraser, ArrowUpAZ, ArrowDownZA } from 'lucide-react';

/**
 * GIẢI THÍCH:
 * Component này hiển thị DANH SÁCH người hiến máu với các chức năng:
 * - Xem danh sách với phân trang
 * - Tìm kiếm theo tên/SĐT
 * - Lọc theo nhóm máu
 * - Thêm/Sửa/Xóa người hiến
 */

export default function NguoiHienMauPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // STATE MANAGEMENT - Quản lý trạng thái của component
  const [donors, setDonors] = useState<NguoiHienMau[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(Number(searchParams.get('page') || 1));
  const [pageSize, setPageSize] = useState<number>(Number(searchParams.get('pageSize') || 10));
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterBloodType, setFilterBloodType] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const clearFilters = () => {
    setSearchTerm('');
    setFilterBloodType('');
    setSortOrder('asc');
  };

  useEffect(() => {
    fetchDonors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      // Lấy TẤT CẢ dữ liệu, không filter ở backend
      const response = await nguoihienmauApi.getAll({ pageSize: 1000 });
      setDonors(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Lỗi khi tải danh sách:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa người hiến này?')) return;

    try {
      await nguoihienmauApi.delete(id);
      alert('Xóa thành công!');
      fetchDonors(); // Reload danh sách
    } catch (error) {
      alert('Lỗi khi xóa!');
    }
  };

  const handleToggleStatus = async (id: string, active: boolean) => {
    if (user?.vaitro !== 'Admin') return;
    try {
      await adminApi.setDonorStatus(id, !active);
      alert(`${!active ? 'Kích hoạt' : 'Vô hiệu hóa'} người hiến thành công!`);
      fetchDonors();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Không thể cập nhật trạng thái!');
    }
  };

  const toggleMenu = (id: string) => {
    setMenuOpenId((prev) => (prev === id ? null : id));
  };

  const changeStatus = async (id: string, toActive: boolean) => {
    if (user?.vaitro !== 'Admin') return;
    const label = toActive ? 'Còn hoạt động' : 'Ngưng hoạt động';
    if (!confirm(`Xác nhận ${label.toLowerCase()} cho tài khoản ${id}?`)) return;
    try {
      await adminApi.setDonorStatus(id, toActive);
      alert(`${label} thành công!`);
      setMenuOpenId(null);
      fetchDonors();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Không thể cập nhật trạng thái!');
    }
  };

  const filteredDonors = donors
    // Lọc theo trạng thái
    .filter((donor) => donor.trangthai !== 'NGUNG_HOAT_DONG')
    // Lọc theo search term
    .filter((donor) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      const name = (donor.hotennguoihien || '').toLowerCase();
      const phone = (donor.sodienthoai || '').toLowerCase();
      return name.includes(search) || phone.includes(search);
    })
    // Lọc theo nhóm máu
    .filter((donor) => {
      if (!filterBloodType) return true;
      if (filterBloodType === 'unknown') {
        return !donor.nhommau || !donor.rhesus;
      }
      const bloodType = formatBloodType(donor.nhommau, donor.rhesus);
      return bloodType === filterBloodType;
    })
    // Sắp xếp theo tên (từ cuối cùng trong họ tên)
    .sort((a, b) => {
      const fullNameA = (a.hotennguoihien || '').trim();
      const fullNameB = (b.hotennguoihien || '').trim();
      
      // Tách lấy tên (từ cuối cùng)
      const getLastName = (fullName: string) => {
        const parts = fullName.split(' ').filter(p => p.length > 0);
        return parts.length > 0 ? parts[parts.length - 1].toLowerCase() : '';
      };
      
      const lastNameA = getLastName(fullNameA);
      const lastNameB = getLastName(fullNameB);
      
      // So sánh tên trước
      const nameCompare = lastNameA.localeCompare(lastNameB, 'vi');
      
      // Nếu tên giống nhau, so sánh toàn bộ họ tên
      if (nameCompare === 0) {
        return fullNameA.toLowerCase().localeCompare(fullNameB.toLowerCase(), 'vi');
      }
      
      if (sortOrder === 'asc') {
        return nameCompare;
      } else {
        return -nameCompare;
      }
    });

  // LOADING STATE - Hiển thị spinner khi đang tải
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pr-10 pl-10">
      {/* Hero Header Section - Glassmorphism with Gradient */}
      <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white shadow-lg before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-red-500 before:to-pink-600 before:rounded-t-3xl">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-red/60"></div>
        
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border-2 border-red-600">
                <Droplet className="w-12 h-12 fill-red-600 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl text-black font-arial font-bold mb-2">Người hiến máu</h1>
                <p className="text-black text-xl ">Quản lý thông tin người hiến máu </p>
              </div>
            </div>
            
            <Link
              href="/dashboard/nguoi-hien-mau/them"
              className="group flex items-center gap-3 px-6 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <Plus className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-white text-lg">Thêm người hiến mới</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Section - Premium Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-red-600">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl text-black font-bold">Bộ lọc & Tìm kiếm</h2>
            <p className="text-sm text-black">Tìm kiếm nhanh người hiến máu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search input */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Instant search!
              className="w-full pl-12 text-gray-700 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-300 font-medium"
            />
          </div>

          {/* Blood type filter */}
          <select
            value={filterBloodType}
            onChange={(e) => setFilterBloodType(e.target.value)} // Instant filter!
            className="px-4 py-3 text-gray-700 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-300 font-medium bg-white"
          >
            <option value="">🩸 Tất cả nhóm máu</option>
            <option value="A+">A+ (A Positive)</option>
            <option value="A-">A- (A Negative)</option>
            <option value="B+">B+ (B Positive)</option>
            <option value="B-">B- (B Negative)</option>
            <option value="AB+">AB+ (AB Positive)</option>
            <option value="AB-">AB- (AB Negative)</option>
            <option value="O+">O+ (O Positive)</option>
            <option value="O-">O- (O Negative)</option>
            <option value="unknown">Chưa xác định</option>
          </select>

          {/* Sort buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortOrder('asc')} // Instant sort!
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 font-semibold ${
                sortOrder === 'asc'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
              title="Sắp xếp A → Z"
            >
              <ArrowUpAZ className="w-5 h-5" />
              <span className="hidden sm:inline">A → Z</span>
            </button>
            
            <button
              onClick={() => setSortOrder('desc')} // Instant sort!
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 font-semibold ${
                sortOrder === 'desc'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-600 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-purple-400 hover:bg-purple-50'
              }`}
              title="Sắp xếp Z → A"
            >
              <ArrowDownZA className="w-5 h-5" />
              <span className="hidden sm:inline">Z → A</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 text-sm">
          <div className="px-4 py-2 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
            <span className="text-gray-600">Tìm thấy </span>
            <span className="font-bold text-red-600 text-lg">{filteredDonors.length}</span>
            <span className="text-gray-600"> người hiến</span>
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
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-purple-600">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-100">
          <h3 className="text-lg font-bold text-gray-900">Danh sách người hiến máu</h3>
          <p className="text-sm text-gray-600">Quản lý thông tin chi tiết</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mã</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Họ tên</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ngày sinh</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Giới tính</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">SĐT</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nhóm máu</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">Không tìm thấy người hiến nào</p>
                    <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc thêm người hiến mới</p>
                  </td>
                </tr>
              ) : (
                filteredDonors.map((donor, index) => (
                  <tr 
                    key={donor.manguoihien} 
                    className="group hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold rounded-lg shadow-md">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                          <Heart className="w-5 h-5 text-red-600 fill-red-600" />
                        </div> */}
                        <span className="font-bold text-gray-900">{donor.hotennguoihien}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                      {donor.ngaysinh ? formatDate(donor.ngaysinh) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        donor.gioitinh === 'Nam' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-pink-100 text-pink-700'
                      }`}>
                        {donor.gioitinh}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                      {donor.sodienthoai ? formatPhoneNumber(donor.sodienthoai) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {(donor.nhommau && donor.rhesus) ? (
                          <span title="Nhóm máu đã xác định qua xét nghiệm" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-red-500 to-pink-600 text-white shadow">
                            <Heart className="w-4 h-4 fill-white" />
                            {formatBloodType(donor.nhommau, donor.rhesus)}
                          </span>
                        ) : (
                          (user?.vaitro === 'Nhân viên y tế' || user?.vaitro === 'Admin') ? (
                            <span title="Chưa có dữ liệu hiến máu" className="text-sm text-gray-700">—</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span title="Nhóm máu sẽ được cập nhật sau khi hoàn tất hiến máu" className="text-sm text-gray-500 italic">Chưa xác định</span>
                              <span title="Chưa hiến máu" className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 font-semibold">Chưa hiến máu</span>
                            </div>
                          )
                        )}
                        <span title="Trạng thái tài khoản" className={`px-2 py-1 rounded-full text-xs ${(donor.is_active !== false) ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                          {(donor.is_active !== false) ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 relative">
                        <Link
                          href={`/dashboard/nguoi-hien-mau/${donor.manguoihien}`}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Xem chi tiết"
                        >
                          Xem
                        </Link>
                        <Link
                          href={`/dashboard/nguoi-hien-mau/${donor.manguoihien}/sua`}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Chỉnh sửa"
                        >
                          Sửa
                        </Link>
                        {user?.vaitro === 'Admin' && (
                          <div className="relative">
                            <button
                              onClick={() => toggleMenu(donor.manguoihien)}
                              className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-105 border border-gray-200"
                              title="Khác"
                            >
                              Khác
                            </button>
                            {menuOpenId === donor.manguoihien && (
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-10">
                                <button
                                  className="w-full text-left px-4 py-2 hover:bg-green-50 text-green-700"
                                  onClick={() => changeStatus(donor.manguoihien, true)}
                                >
                                  Còn hoạt động
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-700"
                                  onClick={() => changeStatus(donor.manguoihien, false)}
                                >
                                  Ngưng hoạt động
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Hard delete disabled per policy */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 px-6">
        <button
          className="text-gray-700 px-4 py-2 rounded-xl border-2 border-gray-300 hover:bg-gray-200"
          disabled={page <= 1}
          onClick={() => {
            const qp = new URLSearchParams(searchParams.toString());
            const nextPage = Math.max(1, page - 1);
            setPage(nextPage);
            qp.set('page', String(nextPage));
            qp.set('pageSize', String(pageSize));
            router.replace(`/dashboard/nguoi-hien-mau?${qp.toString()}`);
          }}
        >
          Trang trước
        </button>
        <button
          className="text-gray-700 px-4 py-2 rounded-xl border-2 border-gray-300 hover:bg-gray-200"
          onClick={() => {
            const qp = new URLSearchParams(searchParams.toString());
            const nextPage = page + 1;
            setPage(nextPage);
            qp.set('page', String(nextPage));
            qp.set('pageSize', String(pageSize));
            router.replace(`/dashboard/nguoi-hien-mau?${qp.toString()}`);
          }}
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}
