"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllStaff } from '@/api/staff.api';
import { nguoihienmauApi } from '@/api/nguoihienmau.api';
import { NguoiHienMau } from '@/types/api.types';

type StaffAny = any; // Use runtime fields from backend (includes trangthai, manvyt, hotennvyt, emailnv, sodienthoai, vaitro)

export default function QuanLyTaiKhoanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeStaff, setActiveStaff] = useState<StaffAny[]>([]);
  const [activeDonors, setActiveDonors] = useState<NguoiHienMau[]>([]);
  const [inactiveAccounts, setInactiveAccounts] = useState<Array<{ type: 'Nhân viên' | 'Người hiến'; id: string; name: string; email?: string; phone?: string; role?: string }>>([]);

  useEffect(() => {
    const normalizeStatus = (s?: string | null) => {
      if (!s) return 'HOAT_DONG';
      const t = s.replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      // Map accented forms to canonical
      if (t.toUpperCase().includes('NGUNG') && t.toUpperCase().includes('HOAT') && t.toUpperCase().includes('DONG')) return 'NGUNG_HOAT_DONG';
      if (t.toUpperCase().includes('HOAT') && t.toUpperCase().includes('DONG')) return 'HOAT_DONG';
      return t.toUpperCase();
    };

    const fetchAll = async () => {
      try {
        setLoading(true);
        // Fetch staff (all), then split by trangthai
        const staff = await getAllStaff();
        const staffActive = (staff as StaffAny[]).filter(s => s.trangthai !== 'NGUNG_HOAT_DONG');
        const staffInactive = (staff as StaffAny[]).filter(s => s.trangthai === 'NGUNG_HOAT_DONG');

        setActiveStaff(staffActive);

        // Fetch donors once (no status filter) - show all donors
        const donorRes = await nguoihienmauApi.getAll({ page: 1, pageSize: 500 });
        const donorsAll = donorRes.data;
        
        // Show ALL donors in active section (not filtering by status)
        setActiveDonors(donorsAll);

        // Merge inactive accounts (only staff, not donors)
        const inactiveCombined: Array<{ type: 'Nhân viên' | 'Người hiến'; id: string; name: string; email?: string; phone?: string; role?: string }> = [
          ...staffInactive.map(s => ({
            type: 'Nhân viên' as const,
            id: s.manvyt,
            name: s.hotennvyt,
            email: s.emailnv,
            phone: s.sodienthoai,
            role: s.vaitro,
          })),
        ];

        setInactiveAccounts(inactiveCombined);
      } catch (e) {
        console.error('Lỗi tải dữ liệu tài khoản:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (user?.vaitro !== 'Admin') {
    return (
      <div className="p-6">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
          Chỉ Admin mới có quyền truy cập trang này.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pr-4 pl-4">
      {/* Header */}
      <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white shadow-lg before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-red-500 before:to-pink-600 before:rounded-t-3xl">
        <div className="relative p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý tài khoản</h1>
          <p className="text-gray-600">Xem nhanh tài khoản đang hoạt động và đã ngưng hoạt động</p>
        </div>
      </div>

      {/* Active Staff */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-blue-600">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
          <h3 className="text-lg font-bold text-gray-900">Tài khoản nhân viên đang hoạt động</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Mã NV</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Họ tên</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">SĐT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeStaff.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-gray-500" colSpan={4}>Không có nhân viên đang hoạt động</td>
                </tr>
              ) : (
                activeStaff.map((s: StaffAny) => (
                  <tr key={s.manvyt} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-semibold text-gray-800">{s.manvyt}</td>
                    <td className="px-6 py-3 text-sm text-gray-800">{s.hotennvyt}</td>
                    <td className="px-6 py-3 text-sm text-gray-800">{s.emailnv}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{s.vaitro || 'Nhân viên y tế'}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{s.sodienthoainv || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Donors */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-emerald-600">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-emerald-100">
          <h3 className="text-lg font-bold text-gray-900">Tài khoản người hiến đang hoạt động</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Mã</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Họ tên</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">SĐT</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeDonors.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-gray-500" colSpan={4}>Không có người hiến đang hoạt động</td>
                </tr>
              ) : (
                activeDonors.map((d) => (
                  <tr key={d.manguoihien} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-semibold text-gray-800">{d.manguoihien}</td>
                    <td className="px-6 py-3 text-sm text-gray-800">{d.hotennguoihien}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{d.sodienthoai || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{d.email || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inactive Accounts (Both) */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-gray-400">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Tài khoản ngưng hoạt động</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Mã</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Họ tên</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">SĐT</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inactiveAccounts.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-gray-500" colSpan={5}>Không có tài khoản ngưng hoạt động</td>
                </tr>
              ) : (
                inactiveAccounts.map((acc) => (
                  <tr key={`${acc.type}-${acc.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-semibold text-gray-800">{acc.type}</td>
                    <td className="px-6 py-3 text-sm text-gray-800">{acc.id}</td>
                    <td className="px-6 py-3 text-sm text-gray-800">{acc.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{acc.phone || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{acc.email || '-'}</td>
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
