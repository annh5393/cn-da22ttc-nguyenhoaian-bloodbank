'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  getAllStaff,
  createStaffAccount,
  updateStaffAccount,
  deleteStaffAccount,
  setStaffStatus,
  StaffAccount,
  CreateStaffRequest,
} from '@/api/staff.api';
import { DatePicker } from '@/components/ui/date-picker';

export default function StaffManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<CreateStaffRequest>({
    manvyt: '',
    hotennvyt: '',
    email: '',
    password: '',
    vaitro: 'Nhân viên y tế',
    ngaysinh: '',
    gioitinh: '',
    diachi: '',
    sodienthoai: '',
  });

  // Check if user is admin
  useEffect(() => {
    if (!user || user.vaitro !== 'Admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Load staff list
  useEffect(() => {
    loadStaffList();
  }, []);

  const loadStaffList = async () => {
    try {
      setLoading(true);
      const data = await getAllStaff();
      setStaffList(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!editingStaff && !formData.manvyt.trim()) {
      setError('Vui lòng nhập mã nhân viên');
      return;
    }
    if (!formData.hotennvyt.trim()) {
      setError('Vui lòng nhập họ và tên');
      return;
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!formData.vaitro) {
      setError('Vui lòng chọn vai trò');
      return;
    }

    try {
      if (editingStaff) {
        // Update existing staff
        await updateStaffAccount(editingStaff.manvyt, formData);
        setSuccess('Cập nhật nhân viên thành công');
      } else {
        // Create new staff
        const response = await createStaffAccount(formData);
        
        // Show temp password if auto-generated
        if (response.tempPassword) {
          setSuccess(`Tạo tài khoản thành công! Mật khẩu tạm thời: ${response.tempPassword}`);
        } else {
          setSuccess('Tạo tài khoản nhân viên thành công');
        }
      }

      // Reset form and reload list
      resetForm();
      loadStaffList();
    } catch (err: any) {
      console.error('Submit error detail:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Có lỗi xảy ra';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleEdit = (staff: StaffAccount) => {
    setEditingStaff(staff);
    setFormData({
      manvyt: staff.manvyt,
      hotennvyt: staff.hotennvyt,
      email: staff.email,
      password: '', // Don't pre-fill password
      vaitro: staff.vaitro,
      ngaysinh: staff.ngaysinh || '',
      gioitinh: staff.gioitinh || '',
      diachi: staff.diachi || '',
      sodienthoai: staff.sodienthoai || '',
    });
    setShowCreateForm(true);
  };

  // Hard delete is not allowed per policy; use toggle instead

  const handleToggleStatus = async (staff: StaffAccount) => {
    try {
      await setStaffStatus(staff.manvyt, !staff.is_active);
      setSuccess(`${!staff.is_active ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản thành công`);
      loadStaffList();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể cập nhật trạng thái');
    }
  };

  const resetForm = () => {
    setFormData({
      manvyt: '',
      hotennvyt: '',
      email: '',
      password: '',
      vaitro: 'Nhân viên y tế',
      ngaysinh: '',
      gioitinh: '',
      diachi: '',
      sodienthoai: '',
    });
    setEditingStaff(null);
    setShowCreateForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 border border-gray-200 shadow-xl rounded-lg">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl text-black font-bold font-arial">Quản lý Nhân viên</h1>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Tạo tài khoản mới
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {editingStaff ? 'Chỉnh sửa nhân viên' : 'Tạo tài khoản mới'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!editingStaff && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Mã nhân viên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.manvyt}
                    onChange={(e) => setFormData({ ...formData, manvyt: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-gray-700"
                    placeholder='Nhập mã nhân viên (VD: NV001)'
                    maxLength={10}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.hotennvyt}
                  onChange={(e) => setFormData({ ...formData, hotennvyt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg   text-gray-700"
                  placeholder='Nhập họ tên'
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-1 rounded-lg   text-gray-700"
                  placeholder='Nhập email'
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Mật khẩu {editingStaff ? '(để trống nếu không đổi)' : '(để trống để tạo mật khẩu tạm thời)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-gray-700"
                  placeholder={editingStaff ? 'Để trống nếu không đổi' : 'Để trống để tạo mật khẩu tạm thời'}
                />
                {!editingStaff && !formData.password && (
                  <p className="text-xs text-gray-500 mt-1">
                    Mật khẩu tạm thời sẽ là: <code className="bg-gray-100 px-1 rounded">{formData.manvyt}@2025</code>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.vaitro}
                  onChange={(e) => setFormData({ ...formData, vaitro: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg   text-gray-700"
                >
                  <option value="Nhân viên y tế">Nhân viên y tế</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Ngày sinh</label>
                <DatePicker
                  value={formData.ngaysinh ? new Date(formData.ngaysinh) : undefined}
                  onChange={(date) => setFormData({ ...formData, ngaysinh: date ? date.toISOString().split('T')[0] : '' })}
                  placeholder="Chọn ngày sinh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Giới tính</label>
                <select
                  value={formData.gioitinh}
                  onChange={(e) => setFormData({ ...formData, gioitinh: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg   text-gray-700"
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.sodienthoai}
                  onChange={(e) => setFormData({ ...formData, sodienthoai: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg   text-gray-700"
                  placeholder='Nhập số điện thoại'
                />
                
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.diachi}
                  onChange={(e) => setFormData({ ...formData, diachi: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg   text-gray-700"
                  placeholder='Nhập địa chỉ'
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingStaff ? 'Cập nhật' : 'Tạo tài khoản'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Mã NV
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Họ tên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-700">
                  Chưa có nhân viên nào
                </td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff.manvyt} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{staff.manvyt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{staff.hotennvyt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{staff.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        staff.vaitro === 'Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {staff.vaitro}
                    </span>
                  </td>
                  {/* Trạng thái (hiển thị khi Admin set ngưng hoạt động) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${(staff.is_active !== false) ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                      {(staff.is_active !== false) ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  {/* SĐT */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{staff.sodienthoai || '-'}</td>
                  {/* Ngày tạo */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{staff.created_at ? new Date(staff.created_at).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(staff)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleToggleStatus(staff)}
                      className={`mr-3 ${ (staff.is_active !== false) ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                    >
                      {(staff.is_active !== false) ? 'Ngưng hoạt động' : 'Kích hoạt'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
