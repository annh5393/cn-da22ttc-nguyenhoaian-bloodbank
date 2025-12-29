'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { phieuhienmauApi } from '@/api/phieuhienmau.api';
import { nguoihienmauApi } from '@/api/nguoihienmau.api';
import { phieukhamApi } from '@/api/phieukham.api';
import { FileHeart, User, Droplet, FileText, AlertCircle, CheckCircle, ArrowLeft, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { DatePicker } from '@/components/ui/date-picker';

/**
 * TRANG TẠO PHIẾU HIẾN MÁU (CHO ADMIN/STAFF)
 * Form tạo phiếu hiến máu mới sau khi người hiến đã khám sàng lọc
 */

export default function ThemPhieuHienPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check permission
  useEffect(() => {
    if (user && user.vaitro !== 'Nhân viên y tế') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Form data
  const [maphieukham, setMaphieukham] = useState('');
  const [ngayhien, setNgayhien] = useState<Date>(new Date());
  const [luongmau, setLuongmau] = useState('350');
  const [ghichu, setGhichu] = useState('');

  // Data for dropdowns
  const [phieukhamList, setPhieukhamList] = useState<any[]>([]);

  // Selected data - auto-populated from phieukham
  const [selectedPhieukham, setSelectedPhieukham] = useState<any>(null);
  const [selectedNguoi, setSelectedNguoi] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Chỉ cần load phiếu khám
      const khamData = await phieukhamApi.getAll();
      
      // Filter chỉ lấy phiếu khám "Đạt"
      const passedScreenings = khamData.filter(pk => isDat(pk.ketquasangloc));
      
      setPhieukhamList(passedScreenings);
      
      console.log('📋 Loaded screenings:', {
        total: khamData.length,
        passed: passedScreenings.length
      });
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
      setError('Không tải được danh sách phiếu khám. Vui lòng kiểm tra kết nối API.');
    }
  };

  // Helper to format rhesus
  const formatRhesus = (rhesus?: string): string => {
    if (!rhesus) return '';
    const normalized = rhesus.toLowerCase().trim();
    if (normalized === 'dương' || normalized === 'duong' || normalized === '+') return '+';
    if (normalized === 'âm' || normalized === 'am' || normalized === '-') return '-';
    return rhesus;
  };

  // Helper: normalize Vietnamese text for comparison
  const normalizeVi = (s?: string | null) => {
    if (!s) return '';
    return s
      .toString()
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/Đ/g, 'D')
      .replace(/đ/g, 'D');
  };
  
  // Kiểm tra "Đạt"
  const isDat = (s?: string | null) => {
    const normalized = normalizeVi(s);
    return normalized === 'DAT' || 
           normalized === 'PASS' || 
           normalized === 'OK' ||
           normalized === 'QUALIFIED';
  };

  const handlePhieuKhamChange = async (phieuId: string) => {
    setMaphieukham(phieuId);
    const phieu = phieukhamList.find(pk => pk.maphieukham === phieuId);
    setSelectedPhieukham(phieu);
    
    // Tự động load thông tin người hiến từ phiếu khám
    if (phieu && phieu.manguoihien) {
      try {
        const nguoi = await nguoihienmauApi.getById(phieu.manguoihien);
        setSelectedNguoi(nguoi);
      } catch (err) {
        console.error('Không thể tải thông tin người hiến:', err);
        setError('Không thể tải thông tin người hiến');
      }
    } else {
      setSelectedNguoi(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Client-side validations
      if (!maphieukham) throw new Error('Vui lòng chọn phiếu khám sàng lọc');
      if (!selectedNguoi) throw new Error('Không tìm thấy thông tin người hiến');
      if (ngayhien > new Date()) throw new Error('Ngày hiến không được ở tương lai');
      if (!['250','350','450'].includes(luongmau)) throw new Error('Lượng máu không hợp lệ');

      await phieuhienmauApi.create({
        manguoihien: selectedNguoi.manguoihien,
        maphieukham,
        ngaytaophieuhien: ngayhien,
        luongmauhien: parseInt(luongmau, 10),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/phieu-hien');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Không thể tạo phiếu hiến máu');
    } finally {
      setLoading(false);
    }
  };

  // Helper to format blood type display
  const getBloodTypeDisplay = () => {
    if (!selectedNguoi) return 'Chưa chọn';
    if (selectedNguoi.nhommau && selectedNguoi.rhesus) {
      return `${selectedNguoi.nhommau}${formatRhesus(selectedNguoi.rhesus)}`;
    }
    return 'Chưa xác định';
  };

  const bloodType = getBloodTypeDisplay();
  const disableCreate = loading || !maphieukham || !selectedNguoi;

  return (
    <div className="space-y-6 pb-12 pr-8 pl-8">
      {/* Hero Header */}
      <div className="relative backdrop-blur-lg bg-white/80 rounded-3xl p-8 shadow-2xl border-t-4 border-pink-500">
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
                  Tạo phiếu hiến máu
                  <Droplet className="w-8 h-8 text-pink-600 fill-pink-600 animate-bounce" style={{ animationDuration: '2s' }}/>
                </h1>
                <p className="text-gray-700 text-base">
                  Ghi nhận thông tin hiến máu của người hiến
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
            Tạo phiếu hiến máu thành công! Đang chuyển hướng...
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Left Side (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Thông tin phiếu */}
          <div className="relative backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border-t-4 border-pink-500">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileHeart className="w-6 h-6 text-pink-600" />
              Thông tin phiếu hiến
            </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-arial font-bold text-gray-700 mb-2">Mã phiếu hiến</label>
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500">Sẽ được hệ thống tự sinh</div>
              </div>

              <div>
                <label className="block text-sm font-arial font-bold text-gray-700 mb-2">
                  Ngày hiến <span className="text-red-600">*</span>
                </label>
                <DatePicker
                  value={ngayhien}
                  onChange={(date) => setNgayhien(date || new Date())}
                  placeholder="Chọn ngày hiến"
                />
              </div>

              <div>
                <label className="block text-sm font-arial font-bold text-gray-700 mb-2">
                  Lượng máu (ml) <span className="text-red-600">*</span>
                </label>
                <select
                  value={luongmau}
                  onChange={(e) => setLuongmau(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-gray-600"
                  required
                >
                  <option value="250">250 ml</option>
                  <option value="350">350 ml</option>
                  <option value="450">450 ml</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-arial font-bold text-gray-700 mb-2">Trạng thái</label>
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">Mặc định: CREATED</div>
              </div>
            </div>
          </div>

          {/* Section 2: Chọn phiếu khám */}
          <div className="relative backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border-t-4 border-blue-500">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Search className="w-6 h-6 text-blue-600" />
              Chọn phiếu khám sàng lọc
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-arial font-bold text-gray-700 mb-2">
                  Phiếu khám (chỉ hiển thị phiếu Đạt) <span className="text-red-600">*</span>
                </label>
                <select
                  value={maphieukham}
                  onChange={(e) => handlePhieuKhamChange(e.target.value)}
                  className="w-full text-gray-600 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">-- Chọn phiếu khám --</option>
                  {phieukhamList.map((phieu) => {
                    const nguoiName = phieu.nguoihienmau?.hotennguoihien || 'N/A';
                    const ngayKham = new Date(phieu.ngaykham).toLocaleDateString('vi-VN');
                    return (
                      <option key={phieu.maphieukham} value={phieu.maphieukham}>
                        {phieu.maphieukham} - {nguoiName} - {ngayKham} - Đạt
                      </option>
                    );
                  })}
                </select>
                {phieukhamList.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-2">
                    Không có phiếu khám nào đạt yêu cầu. Vui lòng tạo phiếu khám trước.
                  </p>
                )}
              </div>

              {/* Thông tin người hiến - tự động hiển thị */}
              {selectedNguoi && selectedPhieukham && (
                <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Thông tin người hiến
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 font-bold">Họ tên:</span>
                      <p className="text-gray-900 font-semibold text-base">{selectedNguoi.hotennguoihien}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-bold">Nhóm máu:</span>
                      <p className="text-blue-600 font-bold text-xl">{bloodType}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-bold">Email:</span>
                      <p className="text-gray-900">{selectedNguoi.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-bold">SĐT:</span>
                      <p className="text-gray-900">{selectedNguoi.sodienthoai || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-bold">Ngày khám:</span>
                      <p className="text-gray-900">{new Date(selectedPhieukham.ngaykham).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-bold">Kết quả:</span>
                      <p className="text-green-600 font-bold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {selectedPhieukham.ketquasangloc}
                      </p>
                    </div>
                  </div>
                  {selectedPhieukham.ghichu && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <span className="text-gray-600 font-bold text-xs">Ghi chú khám:</span>
                      <p className="text-gray-700 text-sm mt-1">{selectedPhieukham.ghichu}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Ghi chú */}
          <div className="relative backdrop-blur-lg bg-white/70 rounded-2xl p-6 shadow-xl border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              Ghi chú bổ sung
            </h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                value={ghichu}
                onChange={(e) => setGhichu(e.target.value)}
                rows={4}
                className="w-full text-gray-600 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                placeholder="Nhập ghi chú về quá trình hiến máu (nếu có)..."
              />
            </div>
          </div>
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
                <div className="text-3xl font-black text-pink-600 mb-1">{bloodType}</div>
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Nhóm máu</div>
              </div>

              {/* Info */}
              <div className="bg-white rounded-xl p-4 space-y-3 text-sm border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Mã phiếu:</span>
                  <span className="text-gray-500">Sẽ được hệ thống tự sinh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Lượng máu:</span>
                  <span className="text-pink-600 font-bold text-lg">{luongmau} ml</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Người hiến:</span>
                  <span className="text-gray-900 font-semibold">{selectedNguoi?.hotennguoihien || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Trạng thái:</span>
                  <span className="font-bold text-blue-600">CREATED</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="p-4 rounded-xl text-center font-bold text-sm bg-blue-100 text-blue-700 border-2 border-blue-300">CREATED</div>
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
            onClick={handleSubmit}
            disabled={disableCreate}
            className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Tạo phiếu hiến</span>
              </>
            )}
          </button>
          {disableCreate && (
            <div className="text-sm text-red-600 font-semibold">Cần chọn phiếu khám đạt cho người hiến trước khi tạo.</div>
          )}
        </div>
      </div>
    </div>
  );
}
