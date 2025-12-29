"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { khomauApi } from '@/api/khomau.api';
import { KhoMauWithRelations } from '@/types/api.types';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Edit, Trash2, Package, Users, MapPin } from 'lucide-react';

export default function KhoMauDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [data, setData] = useState<KhoMauWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await khomauApi.getById(id);
        setData(res);
      } catch (e: any) {
        setError(e.response?.data?.error || 'Không tải được kho');
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  const handleDelete = async () => {
    if (!user || user.vaitro !== 'Admin') {
      alert('Chỉ Admin mới có quyền xóa kho');
      return;
    }
    if (!confirm('Xóa kho này?')) return;
    try {
      await khomauApi.delete(id);
      router.push('/dashboard/kho-mau');
    } catch (e: any) {
      alert(e.response?.data?.error || 'Không thể xóa kho');
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">Không tìm thấy kho</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="px-3 py-2 bg-gray-100 rounded">Quay lại</button>
        {(user && (user.vaitro === 'Admin' || user.vaitro === 'Nhân viên y tế')) && (
          <div className="flex gap-2">
            <Link href={`/dashboard/kho-mau/${id}/sua`} className="px-3 py-2 bg-green-600 text-white rounded">Sửa</Link>
            {user.vaitro === 'Admin' && (
              <button onClick={handleDelete} className="px-3 py-2 bg-red-600 text-white rounded">Xóa</button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Kho {data.makho}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div>
            <div className="font-semibold">Tên vị trí</div>
            <div>{data.tenvitri || '-'}</div>
          </div>
          <div>
            <div className="font-semibold">Nhiệt độ bảo quản</div>
            <div>{data.nhietdobaoquan || '-'}</div>
          </div>
          <div>
            <div className="font-semibold">Trạng thái</div>
            <div>{data.trangthai || '-'}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Túi máu trong kho</h2>
        {data.tuimau.length === 0 ? (
          <div>Chưa có túi máu</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.tuimau.map((bag) => (
              <div key={bag.matuimau} className="border rounded p-4">
                <div className="font-bold">{bag.matuimau}</div>
                <div className="text-sm">Nhóm máu: {bag.nguoihienmau?.nhommau} {bag.nguoihienmau?.rhesus}</div>
                <div className="text-sm">Thể tích: {bag.thetich || 0} ml</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Nhân viên phụ trách</h2>
        {data.phutrach.length === 0 ? (
          <div>Chưa phân công</div>
        ) : (
          <ul className="space-y-2">
            {data.phutrach.map((p) => (
              <li key={`${p.manvyt}_${p.makho}`} className="flex items-center justify-between">
                <span>{p.nhanvienyte?.hotennvyt || p.manvyt}</span>
                <span className="text-sm text-gray-600">{p.ngayphutrach ? new Date(p.ngayphutrach).toLocaleDateString() : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
