'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplet, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface BloodTypeData {
  nhommau: string;
  rhesus: string;
  available: number;
  expired: number;
  expiringSoon: number;
  totalVolume: number;
  availableVolume: number;
  total: number;
}

interface Props {
  data: BloodTypeData[];
}

const BLOOD_TYPE_COLORS: Record<string, string> = {
  'A': '#ef4444',    // red-500
  'B': '#3b82f6',    // blue-500
  'O': '#10b981',    // green-500
  'AB': '#8b5cf6',   // purple-500
};

export default function BloodInventoryChart({ data }: Props) {
  // Helper function to format rhesus
  const formatRhesus = (rhesus: string): string => {
    const normalized = rhesus.toLowerCase().trim();
    if (normalized === 'dương' || normalized === 'duong' || normalized === '+') return '+';
    if (normalized === 'âm' || normalized === 'am' || normalized === '-') return '-';
    return rhesus;
  };

  // Transform data for chart
  const chartData = data.map(item => ({
    name: `${item.nhommau}${formatRhesus(item.rhesus)}`,
    'Khả dụng': item.available,
    'Hết hạn': item.expired,
    'Sắp hết hạn': item.expiringSoon,
    nhommau: item.nhommau,
    rhesus: item.rhesus,
    totalVolume: item.totalVolume,
    availableVolume: item.availableVolume,
  }));

  // Calculate totals
  const totalAvailable = data.reduce((sum, item) => sum + item.available, 0);
  const totalExpired = data.reduce((sum, item) => sum + item.expired, 0);
  const totalExpiringSoon = data.reduce((sum, item) => sum + item.expiringSoon, 0);
  const totalBags = data.reduce((sum, item) => sum + item.total, 0);
  const totalAvailableVolume = data.reduce((sum, item) => sum + item.availableVolume, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-xl">
          <p className="font-bold text-base text-gray-900 mb-2 flex items-center gap-2">
            <Droplet className="w-4 h-4 text-red-600 fill-red-600" />
            Nhóm máu {data.name}
          </p>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-green-700">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="font-medium">Khả dụng:</span>
              </span>
              <span className="font-bold text-green-700">{data['CON_HAN']} túi</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-orange-600">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium">Sắp hết hạn:</span>
              </span>
              <span className="font-bold text-orange-600">{data['Sắp hết hạn']} túi</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-red-600">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-medium">Hết hạn:</span>
              </span>
              <span className="font-bold text-red-600">{data['Hết hạn']} túi</span>
            </div>
            <div className="pt-1.5 mt-1.5 border-t border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-gray-700">Thể tích:</span>
                <span className="font-bold text-blue-600">{data.availableVolume.toLocaleString()} ml</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-xs font-semibold text-gray-600 uppercase">Khả dụng</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalAvailable}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-orange-600" />
            <p className="text-xs font-semibold text-gray-600 uppercase">Sắp hết hạn</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalExpiringSoon}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-xs font-semibold text-gray-600 uppercase">Hết hạn</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalExpired}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Droplet className="w-5 h-5 text-blue-600 fill-blue-600" />
            <p className="text-xs font-semibold text-gray-600 uppercase">Tổng túi</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalBags}</p>
        </div>
      </div>

      {/* Volume Card - Single Row */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
              <Droplet className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase mb-0.5">Tổng lượng máu khả dụng</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalAvailableVolume.toLocaleString()}
                <span className="text-base text-gray-600 font-medium ml-1">ml</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">≈ {(totalAvailableVolume / 1000).toFixed(2)} lít</p>
          </div>
        </div>
      </div>

      {/* Chart - Cleaner */}
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart className="w-5 h-5 text-purple-600" />
          Biểu đồ theo nhóm máu
        </h3>
        
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#374151', fontWeight: '600', fontSize: 14 }}
              axisLine={{ stroke: '#9ca3af' }}
            />
            <YAxis 
              tick={{ fill: '#374151', fontWeight: '600', fontSize: 12 }}
              axisLine={{ stroke: '#9ca3af' }}
              label={{ value: 'Số lượng túi', angle: -90, position: 'insideLeft', style: { fontWeight: '600', fontSize: 12 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontWeight: '600', fontSize: 14 }}
              iconType="circle"
            />
            <Bar dataKey="Khả dụng" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Sắp hết hạn" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Hết hạn" fill="#ef4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table - Simplified */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-purple-600 fill-purple-600" />
            Chi tiết theo nhóm máu
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Nhóm máu
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                  Khả dụng
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                  Sắp hết hạn
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                  Hết hạn
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                  Tổng
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                  Thể tích (ml)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${BLOOD_TYPE_COLORS[item.nhommau]}20` }}
                      >
                        <Droplet 
                          className="w-5 h-5" 
                          style={{ color: BLOOD_TYPE_COLORS[item.nhommau] }}
                          fill={BLOOD_TYPE_COLORS[item.nhommau]}
                        />
                      </div>
                      <span className="text-base font-bold text-gray-900">
                        {item.nhommau}{formatRhesus(item.rhesus)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {item.available}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {item.expiringSoon}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {item.expired}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-base font-bold text-gray-900">{item.total}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm">
                      <p className="font-bold text-blue-600">{item.availableVolume.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 font-medium">/ {item.totalVolume.toLocaleString()}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
