'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { tuimauApi } from '@/api/tuimau.api';
import { nguoihienmauApi } from '@/api/nguoihienmau.api';
import { khomauApi } from '@/api/khomau.api';
import { Package, Droplet, Calendar, MapPin, AlertCircle, CheckCircle, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { DatePicker } from '@/components/ui/date-picker';

/**
 * TRANG THÊM TÚI MÁU (CHO ADMIN/STAFF)
 * Form đơn giản để thêm túi máu vào kho
 */

export default function ThemTuiMauKhoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check permission
  useEffect(() => {
    if (user && user.vaitro === 'Người hiến máu') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Form data
  const [matuimau, setMatuimau] = useState('');
  const [nhommau, setNhommau] = useState('');
  const [rhesus, setRhesus] = useState('');
  const [thetich, setThetich] = useState('350');
  const [ngaynhapkho, setNgaynhapkho] = useState(new Date().toISOString().split('T')[0]);
  const [hansudung, setHansudung] = useState('');
  const [makho, setMakho] = useState('');
  const [trangthai, setTrangthai] = useState('Sẵn sàng sử dụng');
  const [ghichu, setGhichu] = useState('');

  // Data for dropdowns
  const [khoList, setKhoList] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    generateMaTuiMau();
  }, []);

  useEffect(() => {
    // Auto-calculate expiry date (35 days from input date)
    if (ngaynhapkho) {
      const inputDate = new Date(ngaynhapkho);
      inputDate.setDate(inputDate.getDate() + 35);
      setHansudung(inputDate.toISOString().split('T')[0]);
    }
  }, [ngaynhapkho]);

  const loadData = async () => {
    try {
      const khoData = await khomauApi.getAll();
      setKhoList(khoData);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const generateMaTuiMau = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setMatuimau(`TM-${dateStr}-${randomNum}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await tuimauApi.create({
        matuimau,
        thetich: parseInt(thetich),
        ngaynhapkho: new Date(ngaynhapkho),
        hansudung: new Date(hansudung),
        makho,
        trangthai,
        // Note: Backend might need manguoihien - adjust based on your API
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/kho-mau');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể thêm túi máu');
    } finally {
      setLoading(false);
    }
  };

  const bloodTypeDisplay = nhommau && rhesus ? `${nhommau}${rhesus}` : 'N/A';

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="relative backdrop-blur-lg bg-white/80 rounded-3xl p-8 shadow-2xl overflow-hidden border-2 border-purple-100">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/kho-mau"
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl flex items-center justify-center border-2 border-purple-200 shadow-lg">
                <Package className="w-9 h-9 text-purple-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1 flex items-center gap-3">
                  Thêm túi máu mới
                  <Droplet className="w-8 h-8 text-purple-600 fill-purple-600 animate-bounce" style={{ animationDuration: '2s' }}/>
                </h1>
                <p className="text-gray-700 text-base">
                  Nhập thông tin túi máu để thêm vào kho
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
            Thêm túi máu thành công! Đang chuyển hướng...
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Left Side (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Thông tin túi máu */}
          <div className="relative backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border border-white/50 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-600" />
              Thông tin túi máu
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Mã túi máu *
                </label>
                <input
                  type="text"
                  value={matuimau}
                  onChange={(e) => setMatuimau(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Thể tích (ml) *
                </label>
                <select
                  value={thetich}
                  onChange={(e) => setThetich(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="250">250 ml</option>
                  <option value="350">350 ml</option>
                  <option value="450">450 ml</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nhóm máu *
                </label>
                <select
                  value={nhommau}
                  onChange={(e) => setNhommau(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">-- Chọn nhóm máu --</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="O">O</option>
                  <option value="AB">AB</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Rh *
                </label>
                <select
                  value={rhesus}
                  onChange={(e) => setRhesus(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">-- Chọn Rh --</option>
                  <option value="+">+ (Dương)</option>
                  <option value="-">- (Âm)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ngày nhập kho *
                </label>
                <DatePicker
                  value={ngaynhapkho ? new Date(ngaynhapkho) : new Date()}
                  onChange={(date) => setNgaynhapkho(date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0])}
                  placeholder="Chọn ngày nhập kho"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Hạn sử dụng *
                </label>
                <DatePicker
                  value={hansudung ? new Date(hansudung) : undefined}
                  onChange={(date) => setHansudung(date ? date.toISOString().split('T')[0] : '')}
                  placeholder="Chọn hạn sử dụng"
                />
                <p className="text-xs text-gray-500 mt-1">Tự động tính +35 ngày từ ngày nhập</p>
              </div>
            </div>
          </div>

          {/* Section 2: Vị trí lưu trữ */}
          <div className="relative backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border border-white/50 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              Vị trí lưu trữ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Kho máu *
                </label>
                <select
                  value={makho}
                  onChange={(e) => setMakho(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">-- Chọn kho --</option>
                  {khoList.map((kho) => (
                    <option key={kho.makho} value={kho.makho}>
                      {kho.tenvitri} - {kho.nhietdo}°C
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Trạng thái *
                </label>
                <select
                  value={trangthai}
                  onChange={(e) => setTrangthai(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="Sẵn sàng sử dụng">Sẵn sàng sử dụng</option>
                  <option value="Đang kiểm tra">Đang kiểm tra</option>
                  <option value="Cách ly">Cách ly</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={ghichu}
                  onChange={(e) => setGhichu(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Nhập ghi chú (nếu có)..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Card - Right Side (1 column) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 backdrop-blur-lg bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-2xl p-6 shadow-xl border-2 border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-purple-600 fill-purple-600" />
              Xem trước
            </h3>

            <div className="space-y-4">
              {/* Blood Type Badge */}
              <div className="bg-white rounded-xl p-4 text-center border-2 border-purple-200">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <Droplet className="w-10 h-10 text-white fill-white" />
                </div>
                <div className="text-3xl font-black text-purple-600 mb-1">{bloodTypeDisplay}</div>
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Nhóm máu</div>
              </div>

              {/* Info */}
              <div className="bg-white rounded-xl p-4 space-y-3 text-sm border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Mã túi:</span>
                  <span className="text-gray-900 font-semibold">{matuimau || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Thể tích:</span>
                  <span className="text-purple-600 font-bold">{thetich} ml</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Kho:</span>
                  <span className="text-gray-900 font-semibold">
                    {khoList.find(k => k.makho === makho)?.tenvitri || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Trạng thái:</span>
                  <span className={`font-bold ${
                    trangthai === 'Sẵn sàng sử dụng' ? 'text-green-600' :
                    trangthai === 'Đang kiểm tra' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>{trangthai}</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className={`p-4 rounded-xl text-center font-bold text-sm ${
                trangthai === 'Sẵn sàng sử dụng' ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                trangthai === 'Đang kiểm tra' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' :
                'bg-red-100 text-red-700 border-2 border-red-300'
              }`}>
                {trangthai === 'Sẵn sàng sử dụng' && <CheckCircle className="w-5 h-5 inline mr-2" />}
                {trangthai === 'Đang kiểm tra' && <AlertCircle className="w-5 h-5 inline mr-2" />}
                {trangthai}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Action Buttons */}
      <div className="backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border border-white/50">
        <div className="flex flex-wrap gap-4 justify-end">
          <Link
            href="/dashboard/kho-mau"
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
          >
            Hủy
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Thêm túi máu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
