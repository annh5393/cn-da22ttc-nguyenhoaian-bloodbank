"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { khomauApi } from '@/api/khomau.api';
import { KhoMau } from '@/types/api.types';
import { useAuth } from '@/contexts/AuthContext';

export default function EditKhoMauPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [form, setForm] = useState<Partial<KhoMau>>({
    tenvitri: '',
    nhietdobaoquan: '',
    trangthai: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || (user.vaitro !== 'Admin' && user.vaitro !== 'Nhân viên y tế')) {
      router.push('/dashboard/kho-mau');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const km = await khomauApi.getById(id);
        setForm({
          tenvitri: km.tenvitri || '',
          nhietdobaoquan: km.nhietdobaoquan || '',
          trangthai: km.trangthai || '',
        });
      } catch (err) {
        setError('Không tải được kho');
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
      await khomauApi.update(id, form);
      setSuccess('Cập nhật kho thành công');
      router.push(`/dashboard/kho-mau/${id}`);
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
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa kho {id}</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên vị trí</label>
          <input
            type="text"
            value={form.tenvitri || ''}
            onChange={(e) => setForm({ ...form, tenvitri: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nhiệt độ bảo quản</label>
          <input
            type="text"
            value={form.nhietdobaoquan || ''}
            onChange={(e) => setForm({ ...form, nhietdobaoquan: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <input
            type="text"
            value={form.trangthai || ''}
            onChange={(e) => setForm({ ...form, trangthai: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Lưu</button>
          <button type="button" onClick={() => router.push(`/dashboard/kho-mau/${id}`)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
        </div>
      </form>
    </div>
  );
}
