"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { phieukhamApi } from '@/api/phieukham.api';
import { PhieuKhamWithRelations } from '@/types/api.types';
import { formatDate } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Eye } from 'lucide-react';

export default function PhieuKhamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<PhieuKhamWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const pk = await phieukhamApi.getById(id);
        setData(pk);
      } catch (err) {
        console.error('Lỗi tải phiếu khám:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <button onClick={() => router.back()} className="px-3 py-2 bg-gray-100 rounded">Quay lại</button>
        <div className="mt-4 text-red-600">Không tìm thấy phiếu khám</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pr-8 pl-8">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 text-black border-gray-300 bg-gray-300 hover:bg-gray-200 rounded-lg ">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        {(user && (user.vaitro === 'Admin' || user.vaitro === 'Nhân viên y tế')) && (
          <Link href={`/dashboard/phieu-kham/${data.maphieukham}/sua`} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Chỉnh sửa
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4 font-arial text-gray-800">Phiếu khám {data.maphieukham}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div>
            <div className="font-semibold">Người hiến máu</div>
            <div>{data.nguoihienmau?.hotennguoihien || '-'}</div>
          </div>
          <div>
            <div className="font-semibold">Nhân viên khám</div>
            <div>{data.nhanvienyte?.hotennvyt || '-'}</div>
          </div>
          <div>
            <div className="font-semibold">Ngày khám</div>
            <div>{data.ngaykham ? formatDate(data.ngaykham) : '-'}</div>
          </div>
          <div>
            <div className="font-semibold">Kết quả sàng lọc</div>
            <div>{data.ketquasangloc || 'Chờ kết quả'}</div>
          </div>
          <div className="md:col-span-2">
            <div className="font-semibold">Ghi chú</div>
            <div>{data.ghichu || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
