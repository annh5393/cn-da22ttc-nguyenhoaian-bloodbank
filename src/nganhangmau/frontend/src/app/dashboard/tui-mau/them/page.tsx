'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { tuimauApi } from '@/api/tuimau.api';
import { phieuhienmauApi } from '@/api/phieuhienmau.api';
import { khomauApi } from '@/api/khomau.api';
import { Package, Droplet, Calendar, MapPin, User, FileText, AlertCircle, CheckCircle, ArrowLeft, Save, Plus, BoxSelect } from 'lucide-react';
import Link from 'next/link';
import { DatePicker } from '@/components/ui/date-picker';

/**
 * TRANG THÊM TÚI MÁU MỚI (GLASSMORPHISM EDITION)
 * Form tạo túi máu với thiết kế glassmorphism cao cấp
 */

export default function ThemTuiMauPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form data
  const [matuimau, setMatuimau] = useState('');
  const [thetich, setThetich] = useState('');
  const [ngaynhapkho, setNgaynhapkho] = useState<Date | undefined>(new Date());
  const [hansudung, setHansudung] = useState<Date | undefined>(undefined);
  const [maphieuhien, setMaphieuhien] = useState('');
  const [manguoihien, setManguoihien] = useState('');
  const [makho, setMakho] = useState('');
  const [trangthai, setTrangthai] = useState('Chờ kết quả xét nghiệm');
  const [ghichu, setGhichu] = useState('');

  // Data for dropdowns
  const [phieuhienList, setPhieuhienList] = useState<any[]>([]);
  const [khoList, setKhoList] = useState<any[]>([]); // retained but not used for positions
  
  // Selected data for preview
  const [selectedPhieu, setSelectedPhieu] = useState<any>(null);
  const [selectedNguoi, setSelectedNguoi] = useState<any>(null);
  const [selectedKho, setSelectedKho] = useState<any>(null);
  const POSITIONS = [
    { code: 'VT_A_DUONG', label: 'A+ (VT_A_DUONG)' },
    { code: 'VT_A_AM', label: 'A- (VT_A_AM)' },
    { code: 'VT_B_DUONG', label: 'B+ (VT_B_DUONG)' },
    { code: 'VT_B_AM', label: 'B- (VT_B_AM)' },
    { code: 'VT_AB_DUONG', label: 'AB+ (VT_AB_DUONG)' },
    { code: 'VT_AB_AM', label: 'AB- (VT_AB_AM)' },
    { code: 'VT_O_DUONG', label: 'O+ (VT_O_DUONG)' },
    { code: 'VT_O_AM', label: 'O- (VT_O_AM)' },
  ] as const;
  const [mavitri, setMavitri] = useState<string>('');
  const [positionValid, setPositionValid] = useState<boolean>(false);

  useEffect(() => {
    loadData();
    generateMaTuiMau();
  }, []);

  useEffect(() => {
    // Auto-calculate expiry date (35 days from input date)
    if (ngaynhapkho) {
      const expiryDate = new Date(ngaynhapkho);
      expiryDate.setDate(expiryDate.getDate() + 35);
      setHansudung(expiryDate);
    }
  }, [ngaynhapkho]);

  const loadData = async () => {
    try {
      const [phieuData, khoData] = await Promise.all([
        phieuhienmauApi.getAll(),
        khomauApi.getAll(),
      ]);
      setPhieuhienList(phieuData);
      setKhoList(khoData);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
    }
  };

  const generateMaTuiMau = () => {
    // Generate 10-char ID: TM + 8 digits
    const randomNum = Math.floor(Math.random() * 1_0000_0000).toString().padStart(8, '0');
    setMatuimau(`TM${randomNum}`);
  };

  const handlePhieuChange = async (phieuId: string) => {
    setMaphieuhien(phieuId);
    setSelectedPhieu(null);
    setSelectedNguoi(null);
    setThetich('');
    if (!phieuId) return;
    try {
      const detail = await phieuhienmauApi.getById(phieuId);
      setSelectedPhieu(detail);
      // Prefill from detail
      setManguoihien(detail.manguoihien);
      const vol = detail.luongmauhien ? String(detail.luongmauhien) : '';
      setThetich(vol);
      setSelectedNguoi(detail.nguoihienmau || null);
      // Update initial UI status based on blood type availability
      const hasBlood = Boolean(detail.nguoihienmau?.nhommau) && Boolean(detail.nguoihienmau?.rhesus);
      setTrangthai(hasBlood ? 'Sẵn sàng sử dụng' : 'Chờ kết quả xét nghiệm');
    } catch (e) {
      console.error('Không tải được chi tiết phiếu hiến', e);
    }
  };

  // Người dùng không chọn trực tiếp người hiến: lấy từ phiếu hiến

  const computeExpectedPosition = () => {
    const n = (selectedNguoi?.nhommau || '').toUpperCase();
    const r = (selectedNguoi?.rhesus || '').trim();
    const token = (r === '+' || r === 'Dương' || r?.toUpperCase() === 'DUONG') ? 'DUONG' : 'AM';
    if (!n) return '';
    return `VT_${n}_${token}`;
  };

  const handlePositionChange = (code: string) => {
    setMavitri(code);
    // All bags are stored under KHO_MAIN warehouse
    setMakho('KHO_MAIN');
    setSelectedKho({ makho: 'KHO_MAIN', tenvitri: 'Kho chính' });
    const expected = computeExpectedPosition();
    setPositionValid(Boolean(expected) && expected.toUpperCase() === code.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitOnce = async () => {
      if (!maphieuhien) throw new Error('Vui lòng chọn phiếu hiến máu');
      if (!manguoihien) throw new Error('Thiếu người hiến từ phiếu hiến');
      if (!thetich) throw new Error('Thiếu thể tích từ phiếu hiến');
      // Không cho tạo nếu chưa có kết quả xét nghiệm
      const hasBlood = Boolean(selectedNguoi?.nhommau) && Boolean(selectedNguoi?.rhesus);
      if (!hasBlood) throw new Error('Phiếu hiến chưa có kết quả xét nghiệm (nhóm máu/Rh).');
      const payload: any = {
        matuimau,
        thetich: parseInt(thetich, 10),
        ngaynhapkho: ngaynhapkho,
        manguoihien,
        makho: 'KHO_MAIN',
        mavitri,
      };
      await tuimauApi.create(payload);
    };

    try {
      try {
        await submitOnce();
      } catch (err: any) {
        const msg = err.response?.data?.error || err.message || '';
        // If duplicate code, regenerate and retry once
        if (/exist|tồn tại|duplicate|unique/i.test(msg)) {
          generateMaTuiMau();
          await submitOnce();
        } else {
          throw err;
        }
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/tui-mau');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể thêm túi máu');
    } finally {
      setLoading(false);
    }
  };

  const bloodType = selectedNguoi
    ? (selectedNguoi.nhommau && selectedNguoi.rhesus
        ? `${selectedNguoi.nhommau}${selectedNguoi.rhesus}`
        : 'Chưa có kết quả')
    : '—';

  const canSubmit = !loading
    && Boolean(maphieuhien)
    && Boolean(mavitri)
    && positionValid
    && Boolean(thetich)
    && Boolean(ngaynhapkho)
    && Boolean(selectedNguoi?.nhommau)
    && Boolean(selectedNguoi?.rhesus);

  return (
    <div className="space-y-6 pb-12 pr-8 pl-8">
      {/* Hero Header */}
      <div className="relative backdrop-blur-lg bg-white rounded-3xl p-8 shadow-2xl border-t-4 border-pink-500">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/kho-mau"
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl flex items-center justify-center border-2 border-red-200 shadow-lg">
                <Droplet className="w-9 h-9 text-red-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1 flex items-center gap-3">
                  Thêm túi máu mới
                  <Droplet className="w-8 h-8 text-red-600 fill-red-600 animate-bounce" style={{ animationDuration: '2s' }}/>
                </h1>
                <p className="text-gray-700 text-base">
                  Nhập thông tin túi máu để thêm vào hệ thống
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
          {/* Bước 1: Chọn phiếu hiến */}
          <div className="relative backdrop-blur-lg bg-white rounded-2xl p-6 shadow-xl border-t-4 border-blue-500 ">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-blue-600 text-white">1</span>
              Chọn phiếu hiến máu
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-arial font-bold text-gray-700 mb-2">
                  Phiếu hiến máu <span className="text-red-600">*</span>
                </label>
                <select
                  value={maphieuhien}
                  onChange={(e) => handlePhieuChange(e.target.value)}
                  className="text-gray-700 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="" className="text-gray-600">-- Chọn phiếu hiến --</option>
                  {phieuhienList.map((phieu) => (
                    <option key={phieu.maphieuhien} value={phieu.maphieuhien}>
                      {phieu.maphieuhien} - {phieu.nguoihienmau?.hotennguoihien || phieu.manguoihien}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tóm tắt từ phiếu hiến */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-xs text-gray-500 font-bold mb-1">Người hiến</div>
                  <div className="font-semibold text-gray-900">{selectedNguoi?.hotennguoihien || '—'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-xs text-gray-500 font-bold mb-1">Nhóm máu</div>
                  <div className="font-semibold text-gray-900">{bloodType}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-xs text-gray-500 font-bold mb-1">Ngày hiến</div>
                  <div className="font-semibold text-gray-900">{selectedPhieu?.ngaytaophieuhien ? new Date(selectedPhieu.ngaytaophieuhien).toLocaleDateString('vi-VN') : '—'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-xs text-gray-500 font-bold mb-1">Thể tích</div>
                  <div className="font-semibold text-red-600">{thetich || '—'} ml</div>
                </div>
              </div>
              {!selectedNguoi?.nhommau || !selectedNguoi?.rhesus ? (
                <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 p-3 rounded">
                  Phiếu hiến chưa có kết quả xét nghiệm. Vui lòng xác nhận nhóm máu trước khi nhập kho.
                </div>
              ) : null}
            </div>
          </div>

          {/* Bước 2: Nhập kho */}
          <div className="relative backdrop-blur-lg bg-white rounded-2xl p-6 shadow-xl border-t-4 border-blue-500">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-purple-600 text-white">2</span>
              Thông tin nhập kho
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Vị trí kho <span className="text-red-600">*</span>
                </label>
                <select
                  value={mavitri}
                  onChange={(e) => handlePositionChange(e.target.value)}
                  className="text-gray-700 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="" className='text-gray-700'>-- Chọn vị trí kho --</option>
                  {POSITIONS.map((p) => (
                    <option key={p.code} value={p.code}>{p.label}</option>
                  ))}
                </select>
                {!positionValid && mavitri && (
                  <p className="text-sm text-red-600 mt-2">Vị trí kho không phù hợp với nhóm máu/Rh của túi máu</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ngày nhập kho <span className="text-red-600">*</span>
                </label>
                <DatePicker
                  value={ngaynhapkho}
                  onChange={setNgaynhapkho}
                  placeholder="Chọn ngày nhập kho"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Hạn sử dụng</label>
                <DatePicker
                  value={hansudung}
                  onChange={() => {}}
                  placeholder="Tự động tính"
                  disabled={true}
                />
                <p className="text-xs text-gray-500 mt-1">Tự động tính +35 ngày từ ngày nhập</p>
              </div>
            </div>
          </div>

          {/* Bước 3: Thông tin túi máu */}
          <div className="relative backdrop-blur-lg bg-white rounded-2xl p-6 shadow-xl border-t-4 border-pink-500">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-rose-600 text-white">3</span>
              Thông tin túi máu
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center justify-between">
                  <span>Mã túi máu <span className="text-red-600">*</span></span>
                  <button
                    type="button"
                    onClick={generateMaTuiMau}
                    className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-600 font-bold hover:bg-red-200 transition"
                  >Tạo lại</button>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={matuimau}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none cursor-not-allowed text-gray-700 font-semibold tracking-wide"
                    required
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 right-3 text-xs font-bold text-gray-500 uppercase">AUTO</div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Tự động sinh dựa trên ngày + số ngẫu nhiên. Nhấn "Tạo lại" nếu trùng.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Thể tích (ml) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={thetich}
                  readOnly
                  className="w-full text-gray-700 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none cursor-not-allowed"
                  placeholder="Tự động lấy từ phiếu hiến"
                  required
                />
              </div>
            </div>
          </div>

          {/* Trạng thái hiển thị (readonly) */}
          <div className="relative backdrop-blur-lg bg-white rounded-2xl p-6 shadow-xl border-t-4 border-pink-500">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">Trạng thái</h2>
            <input
              type="text"
              value={trangthai}
              readOnly
              className="text-gray-700 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none cursor-not-allowed"
            />
          </div>

          {/* Section 4: Ghi chú */}
          <div className="relative backdrop-blur-lg bg-white rounded-2xl p-6 shadow-xl border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              Thông tin bổ sung
            </h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                value={ghichu}
                onChange={(e) => setGhichu(e.target.value)}
                rows={4}
                className="text-gray-600 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                placeholder="Nhập ghi chú (nếu có)..."
              />
            </div>
          </div>
        </div>

        {/* Preview Card - Right Side (1 column) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 backdrop-blur-lg bg-gradient-to-br from-red-50/80 to-pink-50/80 rounded-2xl p-6 shadow-xl border-2 border-red-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
              Xem trước
            </h3>

            <div className="space-y-4">
              {/* Blood Type Badge */}
              <div className="bg-white rounded-xl p-4 text-center border-2 border-red-200">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <Droplet className="w-10 h-10 text-white fill-white" />
                </div>
                {<div className="text-3xl font-black text-red-600 mb-1">{bloodType}</div> }
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
                  <span className="text-red-600 font-bold">{thetich} ml</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Người hiến:</span>
                  <span className="text-gray-900 font-semibold">{selectedNguoi?.hotennguoihien || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Vị trí kho:</span>
                  <span className="text-gray-900 font-semibold">{mavitri ? (POSITIONS.find(p => p.code === mavitri)?.label || mavitri) : 'N/A'}</span>
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
            disabled={!canSubmit}
            className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
