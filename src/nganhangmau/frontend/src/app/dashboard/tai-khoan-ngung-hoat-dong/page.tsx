'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllStaff, setStaffStatus, StaffAccount } from '@/api/staff.api';
import { nguoihienmauApi } from '@/api/nguoihienmau.api';
import { Eye, UserX, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function InactiveAccountsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [inactiveStaff, setInactiveStaff] = useState<StaffAccount[]>([]);
  const [inactiveDonors, setInactiveDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.vaitro !== 'Admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [staff, donorsRes] = await Promise.all([
          getAllStaff(),
          nguoihienmauApi.getAll({ status: 'NGUNG_HOAT_DONG', page: 1, pageSize: 200 }),
        ]);
        setInactiveStaff((staff || []).filter((s: any) => (s?.trangthai || '').toUpperCase().includes('NGUNG')));
        setInactiveDonors(Array.isArray(donorsRes?.data) ? donorsRes.data : []);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Không thể tải danh sách tài khoản ngưng hoạt động');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reactivateStaff = async (id: string) => {
    await setStaffStatus(id, true);
    setInactiveStaff((prev) => prev.filter((s) => s.manvyt !== id));
  };

  const reactivateDonor = async (id: string) => {
    // Reuse admin API if available; fall back to nguoihienmauApi when provided
    try {
      // Simple PATCH via direct client to admin route would be better, but keeping scope to UI
      await fetch('/api/admin/nguoihien/' + id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (localStorage.getItem('token') || '') },
        body: JSON.stringify({ is_active: true }),
      });
      setInactiveDonors((prev) => prev.filter((d) => d.manguoihien !== id));
    } catch {}
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-8 p-2">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-gray-600">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Tài khoản Nhân viên y tế ngưng hoạt động</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mã NV</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Họ tên</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inactiveStaff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Không có tài khoản</td>
                </tr>
              ) : (
                inactiveStaff.map((s) => (
                  <tr key={s.manvyt} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{s.manvyt}</td>
                    <td className="px-6 py-4">{s.hotennvyt}</td>
                    <td className="px-6 py-4">{s.email}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => reactivateStaff(s.manvyt)} className="text-green-600 hover:text-green-800 inline-flex items-center gap-1">
                        <UserCheck className="w-4 h-4" /> Kích hoạt lại
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-gray-600">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Tài khoản Người hiến máu ngưng hoạt động</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mã</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Họ tên</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inactiveDonors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Không có tài khoản</td>
                </tr>
              ) : (
                inactiveDonors.map((d) => (
                  <tr key={d.manguoihien} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{d.manguoihien}</td>
                    <td className="px-6 py-4">{d.hotennguoihien}</td>
                    <td className="px-6 py-4">{d.email}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => reactivateDonor(d.manguoihien)} className="text-green-600 hover:text-green-800 inline-flex items-center gap-1">
                        <UserCheck className="w-4 h-4" /> Kích hoạt lại
                      </button>
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
