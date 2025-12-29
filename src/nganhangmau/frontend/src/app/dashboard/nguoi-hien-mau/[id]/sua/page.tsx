'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { nguoihienmauApi } from '@/api/nguoihienmau.api';
import { Heart, ArrowLeft, Save } from 'lucide-react';
import { GENDER } from '@/utils/constants';
import { DatePicker } from '@/components/ui/date-picker';

/**
 * GIẢI THÍCH:
 * Form sửa thông tin người hiến máu
 * - useParams(): Lấy ID từ URL (dynamic route [id])
 * - useEffect(): Fetch dữ liệu hiện tại khi component mount
 * - Pre-fill form: Điền sẵn dữ liệu cũ vào form
 */

export default function SuaNguoiHienMauPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  /**
   * STATE: Quản lý dữ liệu form
   * - Initial state rỗng, sẽ được fill bởi useEffect
   */
  const [formData, setFormData] = useState({
    manguoihien: '',
    hotennguoihien: '',
    ngaysinh: '',
    gioitinh: 'Nam',
    diachi: '',
    sodienthoai: '',
    email: '',
  });

  /**
   * EFFECT: Fetch dữ liệu người hiến theo ID
   * - Chạy 1 lần khi component mount (dependency [id])
   * - Format ngày sinh về yyyy-MM-dd cho input type="date"
   */
  useEffect(() => {
    const fetchDonor = async () => {
      try {
        setLoadingData(true);
        const donor = await nguoihienmauApi.getById(id);

        // Format date to yyyy-MM-dd for input
        const formattedDate = donor.ngaysinh
          ? new Date(donor.ngaysinh).toISOString().split('T')[0]
          : '';

        // Pre-fill form với dữ liệu hiện tại
        setFormData({
          manguoihien: donor.manguoihien || '',
          hotennguoihien: donor.hotennguoihien || '',
          ngaysinh: formattedDate,
          gioitinh: donor.gioitinh || 'Nam',
          diachi: donor.diachi || '',
          sodienthoai: donor.sodienthoai || '',
          email: donor.email || '',
        });
      } catch (err: any) {
        setError('Không thể tải thông tin người hiến');
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    if (id) fetchDonor();
  }, [id]);

  /**
   * FUNCTION: Handle input change
   * - Pattern giống form thêm mới
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /**
   * FUNCTION: Validate form
   * - Logic validation giống form thêm mới
   */
  const validateForm = (): boolean => {
    if (!formData.hotennguoihien.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }

    if (!formData.sodienthoai.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.sodienthoai)) {
      setError('Số điện thoại phải có 10 chữ số');
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email không hợp lệ');
      return false;
    }

    if (!formData.ngaysinh) {
      setError('Vui lòng chọn ngày sinh');
      return false;
    }

    const birthDate = new Date(formData.ngaysinh);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      setError('Người hiến phải từ 18 tuổi trở lên');
      return false;
    }

    return true;
  };

  /**
   * FUNCTION: Submit form update
   * - Gọi API update với ID
   * - Navigate về list page sau khi thành công
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      setLoading(true);

      const { nhommau, rhesus, ...rest } = (formData as any);
      const submitData = {
        ...rest,
        ngaysinh: new Date(formData.ngaysinh),
      };

      // Call API update
      await nguoihienmauApi.update(id, submitData);

      alert('Cập nhật thông tin thành công!');
      router.push('/dashboard/nguoi-hien-mau');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * CONDITIONAL RENDERING: Loading state
   * - Show spinner khi đang fetch dữ liệu
   */
  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sửa thông tin người hiến</h1>
              <p className="text-sm text-gray-500">Cập nhật thông tin cho mã: {formData.manguoihien}</p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Mã người hiến (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã người hiến
              </label>
              <input
                type="text"
                value={formData.manguoihien}
                readOnly
                className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="hotennguoihien"
                value={formData.hotennguoihien}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                required
                className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Ngày sinh & Giới tính */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh <span className="text-red-600">*</span>
                </label>
                <DatePicker
                  value={formData.ngaysinh ? new Date(formData.ngaysinh) : undefined}
                  onChange={(date) => setFormData({ ...formData, ngaysinh: date ? date.toISOString().split('T')[0] : '' })}
                  placeholder="Chọn ngày sinh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính <span className="text-red-600">*</span>
                </label>
                <select
                  name="gioitinh"
                  value={formData.gioitinh}
                  onChange={handleChange}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                >
                  {Object.entries(GENDER).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                name="sodienthoai"
                value={formData.sodienthoai}
                onChange={handleChange}
                placeholder="0123456789"
                required
                maxLength={10}
                className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="donor@example.com"
                className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <input
                type="text"
                name="diachi"
                value={formData.diachi}
                onChange={handleChange}
                placeholder="123 Nguyễn Văn Linh, Quận 7, TP.HCM"
                className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Nhóm máu & Rh: không cho phép chỉnh trực tiếp; sẽ được xác định sau khi hoàn tất phiếu hiến */}
          </div>

          {/* BUTTONS */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-900 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
