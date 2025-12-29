'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { tuimauApi } from '@/api/tuimau.api';
import { khomauApi } from '@/api/khomau.api';
import { TuiMauWithRelations, KhoMau } from '@/types/api.types';
import { formatDate, formatBloodType } from '@/utils/formatters';
import { Package, Search, Edit, Trash2, Eye, Droplet, AlertTriangle, TrendingUp, Archive, Plus } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

export default function KhoMauPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [bloodBags, setBloodBags] = useState<TuiMauWithRelations[]>([]);
  const [warehouses, setWarehouses] = useState<KhoMau[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bagsData, warehousesData] = await Promise.all([
        tuimauApi.getAll(),
        khomauApi.getAll(),
      ]);
      setBloodBags(bagsData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Bạn có chắc muốn chuyển trạng thái túi máu này sang "${newStatus}"?`)) return;

    try {
      await tuimauApi.updateStatus(id, { trangthai: newStatus });
      alert('Cập nhật trạng thái thành công!');
      fetchData();
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Lỗi khi cập nhật trạng thái!');
    }
  };

  /**
   * FUNCTION: Kiểm tra túi máu sắp hết hạn
   * - Nếu còn < 7 ngày → cảnh báo
   */
  const isExpiringSoon = (expiryDate?: Date): boolean => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const warningStart = new Date(expiry);
    warningStart.setDate(warningStart.getDate() - 5);
    return today >= warningStart && today < expiry;
  };

  /**
   * FUNCTION: Kiểm tra đã hết hạn
   */
  const isExpired = (expiryDate?: Date): boolean => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  /**
   * COMPUTED: Lọc danh sách túi máu
   * - Tìm kiếm: theo mã túi, nhóm máu người hiến
   * - Filter: theo trạng thái, kho, và ngày nhập kho
   */
  const filteredBloodBags = bloodBags.filter((bag) => {
    const matchSearch = 
      bag.matuimau?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bag.nguoihienmau && formatBloodType(bag.nguoihienmau.nhommau, bag.nguoihienmau.rhesus).includes(searchTerm));
    
    const matchStatus = !filterStatus || bag.trangthai === filterStatus;
    const matchWarehouse = !filterWarehouse || bag.makho === filterWarehouse;

    // Date filter (based on ngaynhapkho)
    let matchDate = true;
    if (bag.ngaynhapkho) {
      const entryDate = new Date(bag.ngaynhapkho);
      entryDate.setHours(0, 0, 0, 0);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchDate = matchDate && entryDate >= start;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchDate = matchDate && entryDate <= end;
      }
    } else if (startDate || endDate) {
      matchDate = false;
    }

    return matchSearch && matchStatus && matchWarehouse && matchDate;
  });

  // === BLOOD GROUP GRID & PANEL ===
  const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'] as const;
  type BloodGroup = typeof BLOOD_GROUPS[number];
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'available' | 'expiring' | 'expired' | null>(null);

  const getBagGroup = (bag: TuiMauWithRelations): BloodGroup | null => {
    const g = bag.nguoihienmau ? formatBloodType(bag.nguoihienmau.nhommau, bag.nguoihienmau.rhesus) : '';
    return (BLOOD_GROUPS as readonly string[]).includes(g) ? (g as BloodGroup) : null;
  };

  const groupMap: Record<BloodGroup, TuiMauWithRelations[]> = BLOOD_GROUPS.reduce((acc, g) => {
    acc[g as BloodGroup] = [];
    return acc;
  }, {} as Record<BloodGroup, TuiMauWithRelations[]>);

  for (const bag of bloodBags) {
    const g = getBagGroup(bag);
    if (g) groupMap[g].push(bag);
  }

  const daysUntil = (date?: Date) => {
    if (!date) return Infinity;
    const d = new Date(date);
    const now = new Date();
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const cardStatus = (bags: TuiMauWithRelations[]) => {
    const hasExpired = bags.some(b => isExpired(b.hansudung));
    const hasExpSoon = bags.some(b => {
      const left = daysUntil(b.hansudung);
      return left >= 0 && left <= 7; // within 7 days
    });
    const hasAvailable = bags.some(b => !isExpired(b.hansudung));
    if (hasExpSoon) return 'soon';
    if (hasAvailable) return 'ok';
    if (hasExpired && !hasAvailable) return 'expired';
    return 'none';
  };

  // Fallback map nhóm máu + Rh -> vị trí kho mặc định (khớp backend)
  const getAutoPosition = (bag: TuiMauWithRelations) => {
    const nhom = (bag.nguoihienmau?.nhommau || '').toUpperCase();
    const rh = bag.nguoihienmau?.rhesus === 'Âm' || bag.nguoihienmau?.rhesus === '-' ? 'AM' : 'DUONG';
    const key = `${nhom}_${rh}`;
    const map: Record<string, { code: string; name: string }> = {
      A_DUONG: { code: 'VT_A_DUONG', name: 'Vị trí A+' },
      A_AM: { code: 'VT_A_AM', name: 'Vị trí A-' },
      B_DUONG: { code: 'VT_B_DUONG', name: 'Vị trí B+' },
      B_AM: { code: 'VT_B_AM', name: 'Vị trí B-' },
      O_DUONG: { code: 'VT_O_DUONG', name: 'Vị trí O+' },
      O_AM: { code: 'VT_O_AM', name: 'Vị trí O-' },
      AB_DUONG: { code: 'VT_AB_DUONG', name: 'Vị trí AB+' },
      AB_AM: { code: 'VT_AB_AM', name: 'Vị trí AB-' },
    };
    const pos = map[key] || map['O_DUONG'];
    return { mavitri: pos.code, tenvitri: pos.name };
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pr-10 pl-10">
      {/* Hero Header - Glassmorphism */}
      {/* Hero Header Section - Glassmorphism with Gradient */}
      <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white shadow-lg before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-purple-600 before:via-pink-600 before:to-red-600 before:rounded-t-3xl">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-purple/60"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border-2 border-purple-600 shadow-2xl">
                <Package className="w-12 h-12 fill-purple-600 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl text-black font-arial font-bold mb-2">Kho máu và Túi máu</h1>
                <p className="text-black text-xl font-arial">Quản lý túi máu, hạn sử dụng, kho và vị trí lưu trữ</p>
              </div>
            </div>
            <div className="hidden md:block" />
            {user?.vaitro === 'Nhân viên y tế' && (
              <Link
                href="/dashboard/tui-mau/them"
                className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                title="Thêm túi máu"
              >
                <Plus className="w-5 h-5" />
                <span>Thêm túi máu</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - Glassmorphism */}
      <div className="relative">
        <div className="m-0 absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 rounded-3xl -z-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <Archive className="w-7 h-7 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500 opacity-50" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{bloodBags.length}</h3>
            <p className="text-gray-600 font-arial text-sm tracking-wider">Tổng túi máu</p>    
          </div>

          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <Droplet className="w-7 h-7 text-white fill-white" />
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
              {bloodBags.filter(b => b.trangthai === 'CON_HAN').length}
            </h3>
            <p className="text-gray-600 font-arial text-sm tracking-wider">Còn hạn sử dụng</p>
          </div>

          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">Cảnh báo</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
              {bloodBags.filter(b => isExpiringSoon(b.hansudung)).length}
            </h3>
            <p className="text-gray-600 font-arial text-sm tracking-wider">Sắp hết hạn sử dụng</p>
          </div>

          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-t-2xl"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
              {bloodBags.filter(b => isExpired(b.hansudung)).length}
            </h3>
            <p className="text-gray-600 font-arial text-sm tracking-wider">Đã hết hạn sử dụng</p>
          </div>
        </div>
      </div>

      {/* Blood Positions Grid - Compact with 3 Status Columns Inside Each Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Droplet className="w-5 h-5 text-rose-600" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">Vị trí kho theo nhóm máu</h2>
            <p className="text-xs text-gray-500">Chọn nhóm máu để xem chi tiết</p>
          </div>
        </div>

        {/* Compact Grid with 3 Status Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BLOOD_GROUPS.map((g) => {
            const bags = groupMap[g];
            const availableCount = bags.filter(b => !isExpired(b.hansudung) && daysUntil(b.hansudung) > 7).length;
            const expiringCount = bags.filter(b => !isExpired(b.hansudung) && daysUntil(b.hansudung) <= 7).length;
            const expiredCount = bags.filter(b => isExpired(b.hansudung)).length;
            const totalCount = bags.length;
            
            const isActive = selectedGroup === g;
            
            return (
              <button
                key={g}
                onClick={() => {
                  setSelectedGroup(prev => prev === g ? null : g);
                  setSelectedStatus(null);
                }}
                className={`bg-white rounded-xl p-3 border-2 transition-all ${
                  isActive ? 'border-rose-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Blood Group Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-gray-900">{g}</span>
                  <span className="text-xs font-semibold text-gray-600">{totalCount}</span>
                </div>
                
                {/* 3 Status Columns */}
                <div className="grid grid-cols-3 gap-1">
                  {/* Available */}
                  <div className="text-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-1"></div>
                    <div className="text-xs font-bold text-green-600">{availableCount}</div>
                    <div className="text-[10px] text-gray-500">Còn hạn</div>
                  </div>
                  
                  {/* Expiring */}
                  <div className="text-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mx-auto mb-1"></div>
                    <div className="text-xs font-bold text-orange-600">{expiringCount}</div>
                    <div className="text-[10px] text-gray-500">Sắp hết</div>
                  </div>
                  
                  {/* Expired */}
                  <div className="text-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mb-1"></div>
                    <div className="text-xs font-bold text-red-600">{expiredCount}</div>
                    <div className="text-[10px] text-gray-500">Hết hạn</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Group Detail Panel */}
        {selectedGroup && (
          <div className="mt-4">
            <div className="px-4 py-3 rounded-t-xl border-2 bg-gray-50 border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Chi tiết túi máu {selectedGroup}</h3>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* 3 Status Tabs */}
            <div className="flex border-x-2 border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedStatus('available')}
                className={`flex-1 px-4 py-2 text-sm font-bold transition-colors ${
                  selectedStatus === 'available'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Còn hạn ({groupMap[selectedGroup].filter(b => !isExpired(b.hansudung) && daysUntil(b.hansudung) > 7).length})
                </div>
              </button>
              <button
                onClick={() => setSelectedStatus('expiring')}
                className={`flex-1 px-4 py-2 text-sm font-bold transition-colors ${
                  selectedStatus === 'expiring'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Sắp hết hạn ({groupMap[selectedGroup].filter(b => !isExpired(b.hansudung) && daysUntil(b.hansudung) <= 7).length})
                </div>
              </button>
              <button
                onClick={() => setSelectedStatus('expired')}
                className={`flex-1 px-4 py-2 text-sm font-bold transition-colors ${
                  selectedStatus === 'expired'
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Đã hết hạn ({groupMap[selectedGroup].filter(b => isExpired(b.hansudung)).length})
                </div>
              </button>
            </div>
            
            <div className="bg-white border-x-2 border-b-2 border-gray-200 rounded-b-xl overflow-hidden">
              {(() => {
                let filteredBags = groupMap[selectedGroup];
                
                if (selectedStatus === 'available') {
                  filteredBags = filteredBags.filter(b => !isExpired(b.hansudung) && daysUntil(b.hansudung) > 7);
                } else if (selectedStatus === 'expiring') {
                  filteredBags = filteredBags.filter(b => !isExpired(b.hansudung) && daysUntil(b.hansudung) <= 7);
                } else if (selectedStatus === 'expired') {
                  filteredBags = filteredBags.filter(b => isExpired(b.hansudung));
                }

                if (filteredBags.length === 0) {
                  return (
                    <div className="px-6 py-8 text-center text-gray-500 text-sm">
                      {selectedStatus ? 'Không có túi máu trong trạng thái này' : 'Chọn trạng thái để xem chi tiết'}
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Mã túi</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Nhóm máu</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Thể tích</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Ngày nhập</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Hạn sử dụng</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Còn lại</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredBags.map((bag) => {
                          const grp = bag.nguoihienmau ? formatBloodType(bag.nguoihienmau.nhommau, bag.nguoihienmau.rhesus) : '-';
                          const daysLeft = daysUntil(bag.hansudung);
                          return (
                            <tr key={bag.matuimau} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-bold text-gray-900">{bag.matuimau}</td>
                              <td className="px-4 py-3 text-sm text-gray-800">{grp}</td>
                              <td className="px-4 py-3 text-sm text-gray-800">{bag.thetich ? `${bag.thetich} ml` : '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-800">{bag.ngaynhapkho ? formatDate(bag.ngaynhapkho) : '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-800">{bag.hansudung ? formatDate(bag.hansudung) : '-'}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                                  daysLeft < 0 ? 'bg-red-100 text-red-700' :
                                  daysLeft <= 7 ? 'bg-orange-100 text-orange-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {daysLeft < 0 ? `Hết ${Math.abs(daysLeft)}d` : `${daysLeft}d`}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Filter Section - Premium Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-purple-600">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bộ lọc và Tìm kiếm</h2>
            <p className="text-sm text-gray-500">Tìm kiếm túi máu nhanh chóng</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm theo mã túi hoặc nhóm máu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 text-gray-700 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 font-medium"
            />
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 text-gray-700 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 font-medium bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Có sẵn">Có sẵn</option>
            <option value="Sắp hết hạn">Sắp hết hạn</option>
            <option value="Đã sử dụng">Đã sử dụng</option>
            <option value="Hết hạn">Hết hạn</option>
          </select>

          {/* Warehouse filter */}
          <select
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
            className="px-4 py-3 text-gray-700 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 font-medium bg-white"
          >
            <option value="">Tất cả kho</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.makho} value={warehouse.makho}>
                {warehouse.makho} - {warehouse.tenvitri}
              </option>
            ))}
          </select>

          {/* Start Date */}
          <div>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Từ ngày nhập..."
            />
          </div>

          {/* End Date */}
          <div>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="Đến ngày nhập..."
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 text-sm">
          <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <span className="text-gray-600">Tìm thấy </span>
            <span className="font-bold text-purple-600 text-lg">{filteredBloodBags.length}</span>
            <span className="text-gray-600"> túi máu</span>
          </div>
          {(searchTerm || filterStatus || filterWarehouse || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('');
                setFilterWarehouse('');
                setStartDate(undefined);
                setEndDate(undefined);
              }}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* TABLE - Premium Design */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-indigo-600">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-100">
          <h3 className="text-lg font-bold text-gray-900">Danh sách túi máu trong kho</h3>
          <p className="text-sm text-gray-600">Theo dõi trạng thái và hạn sử dụng</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mã túi</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nhóm máu</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Thể tích</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Vị trí</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ngày nhập</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Hạn sử dụng</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBloodBags.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">Không tìm thấy túi máu nào</p>
                    <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc thêm túi máu mới</p>
                  </td>
                </tr>
              ) : (
                filteredBloodBags.map((bag) => (
                  <tr 
                    key={bag.matuimau} 
                    className={`group transition-all duration-300 ${
                      isExpired(bag.hansudung) ? 'bg-gradient-to-r from-red-50 to-pink-50' : 
                      isExpiringSoon(bag.hansudung) ? 'bg-gradient-to-r from-yellow-50 to-amber-50' : 
                      'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 font-bold text-gray-900 text-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        {bag.matuimau}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {bag.nguoihienmau ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md">
                          <Droplet className="w-4 h-4 fill-white" />
                          {formatBloodType(bag.nguoihienmau.nhommau, bag.nguoihienmau.rhesus)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 font-medium"> - </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">
                        {bag.thetich ? `${bag.thetich} ml` : ' - '}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold w-fit">
                          <Archive className="w-3 h-3" />
                          {bag.khomau?.tenvitri || bag.makho || '-'}
                        </span>
                        <span className="mt-1 text-xs text-gray-600">
                          {bag.vitrikho?.tenvitri || getAutoPosition(bag).tenvitri} ({bag.vitrikho?.mavitri || getAutoPosition(bag).mavitri})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                      {bag.ngaynhapkho ? formatDate(bag.ngaynhapkho) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {bag.hansudung ? (
                        <div className="flex items-center gap-2">
                          {isExpired(bag.hansudung) && (
                            <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                          )}
                          {isExpiringSoon(bag.hansudung) && !isExpired(bag.hansudung) && (
                            <AlertTriangle className="w-5 h-5 text-yellow-600 animate-pulse" />
                          )}
                          <span className={`font-bold ${
                            isExpired(bag.hansudung) ? 'text-red-600' :
                            isExpiringSoon(bag.hansudung) ? 'text-yellow-600' :
                            'text-gray-700'
                          }`}>
                            {formatDate(bag.hansudung)}
                          </span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        // Normalize status text for display
                        const status = isExpired(bag.hansudung)
                          ? 'Hết hạn'
                          : isExpiringSoon(bag.hansudung)
                            ? 'Sắp hết hạn'
                            : bag.trangthai || 'Có sẵn';

                        // Color mapping rules:
                        // - Available/Ready (Còn hạn, Có sẵn, Sẵn sàng sử dụng) -> Green
                        // - Expiring soon (Sắp hết hạn / SAP_HET_HAN) -> Yellow
                        // - Expired or Used (Hết hạn / Đã sử dụng / DA_SU_DUNG / HET_HAN) -> Red
                        const isRed = isExpired(bag.hansudung)
                          || status === 'Đã sử dụng'
                          || status === 'DA_SU_DUNG'
                          || status === 'HET_HAN';
                        const isYellow = !isRed && (isExpiringSoon(bag.hansudung)
                          || status === 'Sắp hết hạn'
                          || status === 'SAP_HET_HAN');

                        const cls = isRed
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                          : isYellow
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';

                        return (
                          <span className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold shadow-md ${cls}`}>
                            {status}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/kho-mau/${bag.matuimau}`}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Xem chi tiết"
                        >
                          Xem
                        </Link>
                        <Link
                          href={`/dashboard/kho-mau/${bag.matuimau}/sua`}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Chỉnh sửa"
                        >
                          Sửa
                        </Link>
                        {bag.trangthai === 'Có sẵn' && (
                          <button
                            onClick={() => {
                              const status = prompt('Chọn trạng thái mới:\n1. Đã dùng\n2. Hết hạn\n3. Hủy\n\nNhập số (1-3):');
                              const statusMap: Record<string, string> = {
                                '1': 'Đã dùng',
                                '2': 'Hết hạn',
                                '3': 'Hủy'
                              };
                              if (status && statusMap[status]) {
                                handleUpdateStatus(bag.matuimau, statusMap[status]);
                              }
                            }}
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-xl transition-all duration-300 hover:scale-110"
                            title="Cập nhật trạng thái"
                          >
                            <Archive className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}