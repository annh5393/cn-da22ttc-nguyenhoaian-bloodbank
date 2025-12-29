"use client";
import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/axios';

interface Bag {
  matuimau: string;
  thetich: number | null;
  hansudung: string;
  trangthai: string;
  vitrikho?: { mavitri: string; tenvitri: string };
  nguoihienmau?: { nhommau: string; rhesus: string; hotennguoihien: string };
}

export default function PositionDetailPage({ params }: { params: { mavitri: string } }) {
  const { mavitri } = params;
  const [bags, setBags] = useState<Bag[]>([]);
  const [positionName, setPositionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [moveTo, setMoveTo] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get(`/tuimau/positions/${mavitri}`);
        setPositionName(res.data.position.tenvitri);
        setBags(res.data.bags);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mavitri]);

  const moveBag = async (id: string) => {
    if (!moveTo) return;
    await apiClient.patch(`/tuimau/${id}/move`, { mavitri: moveTo });
    location.reload();
  };

  const updateStatus = async (id: string, status: 'Đã dùng' | 'Hủy') => {
    await apiClient.patch(`/tuimau/${id}/status`, { trangthai: status });
    location.reload();
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h1>Vị trí: {positionName} ({mavitri})</h1>
      <div style={{ margin: '12px 0' }}>
        <label>Chuyển túi sang vị trí: </label>
        <input placeholder="VD: VT_A_DUONG" value={moveTo} onChange={(e) => setMoveTo(e.target.value)} />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Túi</th>
            <th>Thể tích</th>
            <th>HSD</th>
            <th>Nhóm máu</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {bags.map((b) => (
            <tr key={b.matuimau}>
              <td>{b.matuimau}</td>
              <td>{b.thetich ?? 0} ml</td>
              <td>{new Date(b.hansudung).toLocaleDateString()}</td>
              <td>{b.nguoihienmau?.nhommau} {b.nguoihienmau?.rhesus}</td>
              <td>
                <button onClick={() => moveBag(b.matuimau)} style={{ marginRight: 8 }}>Chuyển vị trí</button>
                <button onClick={() => updateStatus(b.matuimau, 'Đã dùng')} style={{ marginRight: 8 }}>Đã dùng</button>
                <button onClick={() => updateStatus(b.matuimau, 'Hủy')}>Hủy</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
