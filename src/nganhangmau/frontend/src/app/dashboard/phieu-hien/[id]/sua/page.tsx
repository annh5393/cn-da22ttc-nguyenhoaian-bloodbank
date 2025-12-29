'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { phieuhienmauApi } from '@/api/phieuhienmau.api';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, CheckCircle, ArrowLeft, FileHeart, Droplet, Calendar, Activity, TestTube } from 'lucide-react';
import Link from 'next/link';
import { DatePicker } from '@/components/ui/date-picker';

export default function SuaPhieuHienPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [ngay, setNgay] = useState<Date | undefined>(undefined);
  const [luong, setLuong] = useState('');
  const [trangthai, setTrangthai] = useState('');
  const [nhommau, setNhommau] = useState('');
  const [rhesus, setRhesus] = useState('');

  const [override, setOverride] = useState(false);
  const [reason, setReason] = useState('');

  const isStaff = user?.vaitro === 'Nhân viên y tế';
  const isAdmin = user?.vaitro === 'Admin';
  const isLocked = trangthai === 'STORED' || trangthai === 'CANCELED';
  const canEdit = isStaff && !isLocked && trangthai === 'CREATED';
  const allowedStatuses = ['CREATED', 'COLLECTED', 'CANCELED'];

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const phieu = await phieuhienmauApi.getById(id);
        setNgay(phieu.ngaytaophieuhien ? new Date(phieu.ngaytaophieuhien as Date) : undefined);
        setLuong(phieu.luongmauhien ? String(phieu.luongmauhien) : '');
        setTrangthai(phieu.trangthai || '');
        // Prefill lab result if visible (COMPLETED/COLLECTED)
        setNhommau((phieu as any)?.nguoihienmau?.nhommau || '');
        setRhesus((phieu as any)?.nguoihienmau?.rhesus || '');
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Không tải được phiếu hiến');
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (!isStaff) throw new Error('Chỉ nhân viên y tế được sửa phiếu hiến');
      if (isLocked) throw new Error('Phiếu đã nhập kho / hủy – không thể sửa');
      const todayStr = new Date().toISOString().split('T')[0];
      if (ngay && ngay > todayStr) throw new Error('Ngày hiến không được ở tương lai');
      if (luong && !['250','350','450'].includes(luong)) throw new Error('Lượng máu không hợp lệ');
      if (override && !isAdmin && !isStaff) throw new Error('Không đủ quyền để bật bất khả kháng');
      if (override && !reason.trim()) throw new Error('Vui lòng nhập lý do khi bật bất khả kháng');

      const payload: any = {
        ngaytaophieuhien: ngay || undefined,
        luongmauhien: luong ? parseFloat(luong) : undefined,
        trangthai: trangthai || undefined,
      };
      await phieuhienmauApi.update(id, payload);
      setSuccess('Cập nhật phiếu hiến thành công');
      setTimeout(() => router.push('/dashboard/phieu-hien'), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Cập nhật thất bại');
    }
  };

  if (user?.vaitro === 'Người hiến máu') {
    router.push('/dashboard');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="relative backdrop-blur-lg bg-white/80 rounded-3xl p-8 shadow-2xl overflow-hidden border-2 border-pink-100">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-red-500 to-rose-500"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/phieu-hien"
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl flex items-center justify-center border-2 border-pink-200 shadow-lg">
                <FileHeart className="w-9 h-9 text-pink-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1 flex items-center gap-3">
                  Sửa phiếu hiến: {id}
                  <Droplet className="w-8 h-8 text-pink-600 fill-pink-600" />
                </h1>
                <p className="text-gray-700 text-base">
                  Cập nhật thông tin phiếu hiến máu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-lg bg-red-50/80 border-2 border-red-300 rounded-2xl p-5 text-red-900 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="backdrop-blur-lg bg-green-50/80 border-2 border-green-300 rounded-2xl p-5 text-green-900 shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            {success}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Left Side (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Thông tin phiếu */}
          <div className="relative backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border border-white/50 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-red-600"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileHeart className="w-6 h-6 text-pink-600" />
              Thông tin phiếu hiến
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-arial font-bold text-gray-700 mb-2">
                  Ngày hiến <span className="text-red-600">*</span>
                </label>
                <DatePicker
                  value={ngay}
                  onChange={(date) => setNgay(date)}
                  placeholder="Chọn ngày hiến"
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label className="block text-sm font-arial font-bold text-gray-700 mb-2">
                  Lượng máu (ml) <span className="text-red-600">*</span>
                </label>
                <select
                  value={luong}
                  onChange={(e) => setLuong(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-gray-600 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  disabled={!canEdit}
                >
                  <option value="">-- Chọn --</option>
                  <option value="250">250 ml</option>
                  <option value="350">350 ml</option>
                  <option value="450">450 ml</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-arial font-bold text-gray-700 mb-2">
                  Trạng thái <span className="text-red-600">*</span>
                </label>
                <select
                  value={trangthai}
                  onChange={(e) => setTrangthai(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-gray-600 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  disabled={!canEdit}
                >
                  {['CREATED', 'COLLECTED', 'STORED', 'CANCELED'].map((s) => (
                    <option
                      key={s}
                      value={s}
                      disabled={trangthai === 'CREATED' ? !allowedStatuses.includes(s) : true}
                    >
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Kết quả xét nghiệm */}
          {trangthai === 'CREATED' && isStaff && (
            <div className="relative backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border border-white/50 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TestTube className="w-6 h-6 text-emerald-600" />
                Kết quả xét nghiệm
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-arial font-bold text-gray-700 mb-2">Nhóm máu</label>
                  <select
                    value={nhommau}
                    onChange={(e) => setNhommau(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-600"
                  >
                    <option value="">-- Chọn --</option>
                    {['O', 'A', 'B', 'AB'].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-arial font-bold text-gray-700 mb-2">Rh</label>
                  <select
                    value={rhesus}
                    onChange={(e) => setRhesus(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-600"
                  >
                    <option value="">-- Chọn --</option>
                    <option value="+">+</option>
                    <option value="-">-</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={!nhommau || !rhesus}
                onClick={async () => {
                  try {
                    setError('');
                    setSuccess('');
                    await phieuhienmauApi.confirmLabResult(id, { nhommau: nhommau as any, rhesus: rhesus as any });
                    setSuccess('Đã xác nhận kết quả xét nghiệm');
                    setTrangthai('COLLECTED');
                  } catch (err: any) {
                    setError(err?.response?.data?.error || err?.message || 'Xác nhận thất bại');
                  }
                }}
              >
                <CheckCircle className="w-5 h-5" />
                Xác nhận kết quả xét nghiệm
              </button>
            </div>
          )}

          {/* Section 3: Bất khả kháng */}
          {(isAdmin || isStaff) && (
            <div className={`relative backdrop-blur-lg rounded-2xl p-6 shadow-xl border overflow-hidden ${
              override ? 'bg-yellow-50/70 border-yellow-300' : 'bg-white/70 border-white/50'
            }`}>
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                override ? 'bg-gradient-to-r from-yellow-500 to-orange-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'
              }`}></div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-gray-600" />
                Bất khả kháng (Sửa/xóa dữ liệu đã bị khóa trong các trường hợp đặc biệt, khẩn cấp.)
              </h2>

              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={override}
                  onChange={(e) => setOverride(e.target.checked)}
                  disabled={!canEdit}
                  className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500 disabled:cursor-not-allowed"
                />
                <span className="text-sm font-semibold text-gray-700">Bật chế độ bất khả kháng</span>
              </label>

              {override && (
                <div className="mt-4">
                  <label className="block text-sm font-arial font-bold text-gray-700 mb-2">
                    Lý do <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none text-gray-600"
                    placeholder="Nhập lý do cụ thể cho trường hợp bất khả kháng..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Warning if locked */}
          {isLocked && (
            <div className="backdrop-blur-lg bg-red-50/80 border-2 border-red-300 rounded-2xl p-5 text-red-900 shadow-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6" />
                <span className="font-bold">Phiếu đã nhập kho / hủy – không thể sửa</span>
              </div>
            </div>
          )}
        </div>

        {/* Preview Card - Right Side (1 column) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 backdrop-blur-lg bg-gradient-to-br from-pink-50/80 to-red-50/80 rounded-2xl p-6 shadow-xl border-2 border-pink-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-pink-600 fill-pink-600" />
              Xem trước
            </h3>

            <div className="space-y-4">
              {/* Blood Type Badge */}
              <div className="bg-white rounded-xl p-4 text-center border-2 border-pink-200">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <Droplet className="w-10 h-10 text-white fill-white" />
                </div>
                <div className="text-3xl font-black text-pink-600 mb-1">
                  {nhommau && rhesus ? `${nhommau}${rhesus}` : 'Chưa xác định'}
                </div>
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Nhóm máu</div>
              </div>

              {/* Info */}
              <div className="bg-white rounded-xl p-4 space-y-3 text-sm border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Mã phiếu:</span>
                  <span className="text-gray-900 font-semibold">{id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Ngày hiến:</span>
                  <span className="text-gray-900 font-semibold">
                    {ngay ? new Date(ngay).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Lượng máu:</span>
                  <span className="text-pink-600 font-bold text-lg">{luong || 'N/A'} ml</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Trạng thái:</span>
                  <span className={`font-bold ${
                    trangthai === 'CREATED' ? 'text-blue-600' :
                    trangthai === 'COLLECTED' ? 'text-yellow-600' :
                    trangthai === 'STORED' ? 'text-green-600' :
                    'text-red-600'
                  }`}>
                    {trangthai || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className={`p-4 rounded-xl text-center font-bold text-sm border-2 ${
                trangthai === 'CREATED' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                trangthai === 'COLLECTED' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                trangthai === 'STORED' ? 'bg-green-100 text-green-700 border-green-300' :
                'bg-red-100 text-red-700 border-red-300'
              }`}>
                {trangthai || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Action Buttons */}
      <div className="backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border border-white/50">
        <div className="flex flex-wrap gap-4 justify-end">
          <Link
            href="/dashboard/phieu-hien"
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
          >
            Hủy
          </Link>
          <button
            type="button"
            onClick={submit}
            disabled={!canEdit}
            className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
