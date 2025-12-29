"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { phieukhamApi } from '@/api/phieukham.api';
import { PhieuKham } from '@/types/api.types';
import { useAuth } from '@/contexts/AuthContext';
import { DatePicker } from '@/components/ui/date-picker';

export default function EditPhieuKhamPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [form, setForm] = useState<{ ketquasangloc?: string; ghichu?: string }>({
    ketquasangloc: '',
    ghichu: '',
  });
  const [ngaykham, setNgaykham] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || (user.vaitro !== 'Admin' && user.vaitro !== 'Nhân viên y tế')) {
      router.push('/dashboard/phieu-kham');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const pk = await phieukhamApi.getById(id);
        setForm({
          ketquasangloc: pk.ketquasangloc || '',
          ghichu: pk.ghichu || '',
        });
        setNgaykham(pk.ngaykham ? new Date(pk.ngaykham as Date) : undefined);
      } catch (err) {
        setError('Không tải được phiếu khám');
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload: Partial<PhieuKham> = {
        ketquasangloc: form.ketquasangloc || undefined,
        ghichu: form.ghichu || undefined,
        ngaykham: ngaykham,
      };
      await phieukhamApi.update(id, payload);
      setSuccess('Cập nhật phiếu khám thành công');
      router.push('/dashboard/phieu-kham');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi cập nhật');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl text-black font-arial font-bold mb-4">Chỉnh sửa phiếu khám {id}</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-arial text-gray-700 mb-1">Kết quả sàng lọc</label>
          <select
            value={form.ketquasangloc || ''}
            onChange={(e) => setForm({ ...form, ketquasangloc: e.target.value })}
            className=" text-gray-700 w-full px-3 py-2 border rounded"
          >
            <option value="">Chọn kết quả</option>
            <option value="Đạt">✓ Đạt - Đủ điều kiện hiến máu</option>
            <option value="Không đạt">✗ Không đạt - Chưa đủ điều kiện</option>
            <option value="Chờ xử lý">⏳ Chờ xử lý - Cần theo dõi thêm</option>
          </select>
        </div>

        <div>
          <label className="text-gray-700 block text-sm font-arial mb-1">Ngày khám</label>
          <DatePicker
            value={ngaykham}
            onChange={setNgaykham}
            placeholder="Chọn ngày khám"
          />
        </div>

        <div>
          <label className="block text-sm font-arial text-gray-700 mb-1">Ghi chú</label>
          <textarea
            value={form.ghichu || ''}
            onChange={(e) => setForm({ ...form, ghichu: e.target.value })}
            className=" text-gray-700 w-full px-3 py-2 border rounded"
            rows={4}
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Lưu</button>
          <button type="button" onClick={() => router.push('/dashboard/phieu-kham')} className="text-black px-4 py-2 bg-gray-200 rounded">Hủy</button>
        </div>
      </form>
    </div>
  );
}
