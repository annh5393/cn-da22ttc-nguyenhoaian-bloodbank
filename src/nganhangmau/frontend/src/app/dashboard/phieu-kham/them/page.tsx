'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { phieukhamApi } from '@/api/phieukham.api';
import { nguoihienmauApi } from '@/api/nguoihienmau.api';
import { NguoiHienMau } from '@/types/api.types';
import { ArrowLeft, Save, Loader2, ClipboardList, User, Calendar, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { DatePicker } from '@/components/ui/date-picker';

export default function ThemPhieuKhamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState<NguoiHienMau[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    manguoihien: '',
    ngaykham: new Date(),
    ketquasangloc: 'Đạt',
    ghichu: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch danh sách người hiến máu
  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoadingDonors(true);
      const resp = await nguoihienmauApi.getAll({ page: 1, pageSize: 200 });
      const list = Array.isArray(resp?.data) ? resp.data : [];
      setDonors(list);
    } catch (error) {
      console.error('Lỗi khi tải danh sách người hiến:', error);
    } finally {
      setLoadingDonors(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.manguoihien) {
      newErrors.manguoihien = 'Vui lòng chọn người hiến máu';
    }

    if (!formData.ngaykham) {
      newErrors.ngaykham = 'Vui lòng chọn ngày khám';
    }

    if (!formData.ketquasangloc) {
      newErrors.ketquasangloc = 'Vui lòng chọn kết quả sàng lọc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Ensure the user is a staff with a valid manvyt
    if (!user?.manvyt) {
      alert('Bạn cần đăng nhập bằng tài khoản Nhân viên y tế để lập phiếu khám.');
      return;
    }

    setLoading(true);
    try {
      await phieukhamApi.create({
        manguoihien: formData.manguoihien,
        manvyt: user.manvyt,
        ngaykham: formData.ngaykham instanceof Date ? formData.ngaykham : new Date(formData.ngaykham),
        ketquasangloc: formData.ketquasangloc,
        ghichu: formData.ghichu || null,
      });

      alert('Tạo phiếu khám thành công!');
      router.push('/dashboard/phieu-kham');
    } catch (error: any) {
      console.error('Lỗi:', error?.response?.data);
      const details = error?.response?.data?.details;
      if (details?.[0]) {
        alert(`Lỗi: ${details[0].field} - ${details[0].message}`);
      } else {
        alert(error?.response?.data?.error || 'Có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6 pl-8 pr-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo phiếu khám sàng lọc</h1>
          <p className="text-gray-600 mt-1">Thêm phiếu khám mới cho người hiến máu</p>
        </div>
        <Link
          href="/dashboard/phieu-kham"
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl border-t-4 border-green-600">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Thông tin phiếu khám</h2>
              <p className="text-sm text-gray-600">Điền đầy đủ thông tin bên dưới</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Người hiến máu */}
            <div>
              <label className="flex items-center gap-2 text-sm text-black font-arial font-bold text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Người hiến máu <span className="text-red-500">*</span>
              </label>
              {loadingDonors ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải danh sách...
                </div>
              ) : (
                <select
                  value={formData.manguoihien}
                  onChange={(e) => handleChange('manguoihien', e.target.value)}
                  className={`text-gray-700 font-arial w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all ${
                    errors.manguoihien ? 'border-red-500' : 'border-gray-200' 
                  }`}
                  required
                >
                  <option value="" className="text-black font-arial">-- Chọn người hiến máu --</option>
                  {(Array.isArray(donors) ? donors : []).map((donor) => (
                    <option key={donor.manguoihien} value={donor.manguoihien} className="text-black font-arial">
                      {donor.hotennguoihien} - {donor.manguoihien}
                    </option>
                  ))}
                </select>
              )}
              {errors.manguoihien && (
                <p className="mt-1 text-sm text-red-500">{errors.manguoihien}</p>
              )}
            </div>

            {/* Ngày khám và Kết quả sàng lọc */}
            <div className="grid grid-cols-2 gap-4">
              {/* Ngày khám */}
              <div>
                <label className="flex items-center gap-2 text-sm text-black font-arial font-bold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Ngày khám <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={formData.ngaykham instanceof Date ? formData.ngaykham : new Date(formData.ngaykham)}
                  onChange={(date) => handleChange('ngaykham', date || new Date())}
                  placeholder="Chọn ngày khám"
                  className=''
                />
                {errors.ngaykham && (
                  <p className="mt-1 text-sm text-red-500">{errors.ngaykham}</p>
                )}
              </div>

              {/* Kết quả sàng lọc */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  Kết quả sàng lọc <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.ketquasangloc}
                  onChange={(e) => handleChange('ketquasangloc', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-gray-700 ${
                    errors.ketquasangloc ? 'border-red-500' : 'border-gray-200'
                  }`}
                  required
                >
                  <option value="Đạt">Đạt - Đủ điều kiện hiến máu</option>
                  <option value="Không đạt">Không đạt - Chưa đủ điều kiện</option>
                  <option value="Chờ xử lý">Chờ xử lý - Cần theo dõi thêm</option>
                </select>
                {errors.ketquasangloc && (
                  <p className="mt-1 text-sm text-red-500">{errors.ketquasangloc}</p>
                )}
              </div>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Ghi chú
              </label>
              <textarea
                value={formData.ghichu}
                onChange={(e) => handleChange('ghichu', e.target.value)}
                rows={4}
                placeholder="Nhập ghi chú về tình trạng sức khỏe, các chỉ số khám..."
                className="text-black font-arial w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Ghi chú chi tiết về kết quả khám, các chỉ số sức khỏe, lý do không đạt (nếu có)
              </p>
            </div>

            {/* Thông tin nhân viên */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Nhân viên thực hiện:</strong> {user?.hotennvyt} ({user?.manvyt})
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading || loadingDonors}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Tạo phiếu khám
                  </>
                )}
              </button>

              <Link
                href="/dashboard/phieu-kham"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Hủy
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Lưu ý khi tạo phiếu khám
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Kiểm tra kỹ thông tin người hiến trước khi tạo phiếu</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Kết quả "Đạt" cho phép người hiến tiếp tục quy trình hiến máu</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Kết quả "Chờ xử lý" dành cho trường hợp cần theo dõi thêm (huyết áp thất thường, uống cafe trước đó...)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Có thể cập nhật kết quả từ "Chờ xử lý" sang "Đạt" hoặc "Không đạt" sau khi theo dõi</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Ghi chú chi tiết giúp theo dõi tình trạng sức khỏe người hiến</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Phiếu khám là bước bắt buộc trước khi lập phiếu hiến máu</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
