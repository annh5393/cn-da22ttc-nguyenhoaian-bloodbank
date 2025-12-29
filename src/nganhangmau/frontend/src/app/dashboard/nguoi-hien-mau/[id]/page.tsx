"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { nguoihienmauApi } from '@/api/nguoihienmau.api';
import { NguoiHienMauWithRelations, PhieuHienMauWithRelations } from '@/types/api.types';
import { formatDate, formatStatus } from '@/utils/formatters';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Droplet, Heart } from 'lucide-react';

export default function DonorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [donor, setDonor] = useState<NguoiHienMauWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await nguoihienmauApi.getById(id);
        setDonor(data);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Không tải được thông tin người hiến');
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return (
    <div className="p-6">
      <button onClick={() => router.back()} className="px-3 py-2 bg-gray-100 rounded mr-3">Quay lại</button>
      <span className="text-red-600">{error}</span>
    </div>
  );
  if (!donor) return <div className="p-6">Không tìm thấy người hiến</div>;

  const rh = donor.rhesus;
  const rhSymbol = rh === 'Dương' || rh === '+' ? '+' : rh === 'Âm' || rh === '-' ? '-' : '';
  const bloodType = donor.nhommau ? `${donor.nhommau}${rhSymbol}` : 'Chưa xác định';

  const donations: PhieuHienMauWithRelations[] = (donor.phieuhienmau || []) as any;
  const totalDonations = donations.length;
  const totalVolume = donations.reduce((sum, d) => sum + (Number(d.luongmauhien) || 0), 0);
  // Determine the latest donation date from history
  const latestDonationDate = (() => {
    const byDateDesc = [...donations]
      .filter((d) => !!d.ngaytaophieuhien)
      .sort((a, b) => {
        const bt = new Date((b.ngaytaophieuhien as any) || 0).getTime();
        const at = new Date((a.ngaytaophieuhien as any) || 0).getTime();
        return bt - at;
      });
    return byDateDesc[0]?.ngaytaophieuhien ? formatDate(byDateDesc[0].ngaytaophieuhien as any) : 'N/A';
  })();

  return (
    <div className="space-y-6 pl-10 pr-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="px-3 py-2 bg-white rounded border border-gray-300 shadow-1xl text-black hover:bg-gray-200">
            <ArrowLeft className="inline-block w-4 h-4 mr-2" /> Quay lại
            </button>
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/nguoi-hien-mau/${id}/sua`} className="px-3 py-2 bg-blue-600 text-white rounded">Sửa</Link>
        </div>
      </div>

      {/* Donor Info */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-4 mb-4 col-3">
          <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center border border-red-200">
            <User className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl text-arial text-black font-bold">{donor.hotennguoihien || donor.manguoihien}</h1>
            <div className="text-gray-600">Mã người hiến: {donor.manguoihien}</div>
          </div>
          <div className=" flex items-center gap-2 px-3 py-1 rounded-full border text-sm border-red-600 bg-red-500 text-white justify-between">
            <Droplet className="w-4 h-4 text-white " />
            <span className="font-arial text-white text-lg">Nhóm máu: {bloodType}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
          <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" /><span>{(donor as any).email || 'Chưa cập nhật'}</span></div>
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" /><span>{donor.sodienthoai || 'Chưa cập nhật'}</span></div>
          {donor.ngaysinh && (
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" /><span>{formatDate(donor.ngaysinh)}</span></div>
          )}
          {donor.diachi && (
            <div className="flex items-center gap-2 md:col-span-1"><MapPin className="w-4 h-4 text-gray-500" /><span>{donor.diachi}</span></div>
          )}
          <div><span className="text-sm text-gray-500">Trạng thái:</span> <span className="font-medium">{formatStatus(donor.trangthai || 'HOAT_DONG')}</span></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-600" />
          <div>
            <div className="text-sm text-gray-800">Số lần hiến</div>
            <div className="text-xl font-bold text-gray-800">{totalDonations}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
          <Droplet className="w-6 h-6 text-blue-600" />
          <div>
            <div className="text-sm text-gray-800">Tổng lượng máu</div>
            <div className="text-xl font-bold text-gray-800">{totalVolume} ml</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
          <Calendar className="w-6 h-6 text-purple-600" />
          <div>
            <div className="text-sm text-gray-800">Gần nhất</div>
            <div className="text-xl font-bold text-gray-800">{latestDonationDate}</div>
          </div>
        </div>
      </div>

      {/* Donation history */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl text-black font-bold mb-4">Lịch sử hiến máu</h2>
        {donations.length === 0 ? (
          <div><p className="text-gray-800">Chưa có dữ liệu</p></div>
        ) : (
          <div className="space-y-3">
            {donations.map((d) => (
              <div key={d.maphieuhien} className="border rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-50 rounded flex items-center justify-center border"><Droplet className="w-4 h-4 text-red-600" /></div>
                  <div>
                    <div className="font-arial text-gray-600">Phiếu {d.maphieuhien}</div>
                    <div className="text-sm text-gray-600">Ngày: {d.ngaytaophieuhien ? formatDate(d.ngaytaophieuhien) : 'N/A'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-600">{Number(d.luongmauhien) || 0} ml</div>
                  <div className="text-sm text-gray-600">{formatStatus(d.trangthai || 'HOAN_THANH')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
