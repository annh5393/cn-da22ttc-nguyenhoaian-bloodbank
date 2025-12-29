'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nguoihienmauApi } from '@/api/nguoihienmau.api';
import { Heart, ArrowLeft, Save } from 'lucide-react';
import { GENDER } from '@/utils/constants';
import { DatePicker } from '@/components/ui/date-picker';


export default function ThemNguoiHienMauPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    manguoihien: '',
    hotennguoihien: '',
    ngaysinh: new Date(),
    gioitinh: 'Nam',
    email: '',
    diachi: '',
    sodienthoai: '',
  });

  const generateMaNguoiHien = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `NH${timestamp}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (): boolean => {
    // Check required fields
    if (!formData.hotennguoihien.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }

    if (!formData.sodienthoai.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return false;
    }

    // Validate phone number format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.sodienthoai)) {
      setError('Số điện thoại phải có 10 chữ số');
      return false;
    }

    if (!formData.ngaysinh) {
      setError('Vui lòng chọn ngày sinh');
      return false;
    }

    // Check age >= 18
    const birthDate = new Date(formData.ngaysinh);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      setError('Người hiến phải từ 18 tuổi trở lên');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn form submit mặc định
    setError('');

    // Validate form
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Generate mã người hiến nếu chưa có
      const manguoihien = formData.manguoihien || generateMaNguoiHien();

      // Prepare data để gửi API
      const { nhommau, rhesus, ...rest } = (formData as any);
      const submitData = {
        ...rest,
        manguoihien,
        ngaysinh: new Date(formData.ngaysinh), // Convert string to Date
      };

      // Call API
      await nguoihienmauApi.create(submitData);

      // Success: Navigate về list page
      alert('Thêm người hiến thành công!');
      router.push('/dashboard/nguoi-hien-mau');
    } catch (err: any) {
      // Error handling
      setError(err.response?.data?.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 text-black hover:bg-red-500 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 ">Thêm người hiến máu</h1>
              <p className="text-sm text-gray-500">Nhập thông tin người hiến mới</p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Mã người hiến (optional - auto generate) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã người hiến (để trống để tạo tự động)
              </label>
              <input
                type="text"
                name="manguoihien"
                value={formData.manguoihien}
                onChange={handleChange}
                placeholder="VD: NH123456"
                className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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
                className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Ngày sinh & Giới tính */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh <span className="text-red-600">*</span>
                </label>
                <DatePicker
                  value={formData.ngaysinh}
                  onChange={(date) => setFormData({ ...formData, ngaysinh: date || new Date() })}
                  placeholder="Chọn ngày sinh"
                  className=''
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
                  className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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
                className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
              
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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
                className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Nhóm máu & Rhesus */}
            {/* <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhóm máu <span className="text-red-600">*</span>
                </label>
                <select
                  name="nhommau"
                  value={formData.nhommau}
                  onChange={handleChange}
                  className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                >
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yếu tố Rh <span className="text-red-600">*</span>
                </label>
                <select
                  name="rhesus"
                  value={formData.rhesus}
                  onChange={handleChange}
                  className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                >
                  {RHESUS_FACTORS.map((factor) => (
                    <option key={factor} value={factor}>
                      {factor}
                    </option>
                  ))}
                </select>
              </div>
            </div> */}
          </div>

          {/* BUTTONS */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
