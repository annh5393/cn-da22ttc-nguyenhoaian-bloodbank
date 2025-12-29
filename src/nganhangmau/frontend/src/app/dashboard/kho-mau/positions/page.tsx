"use client";
import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/axios';

type PositionSummary = { mavitri: string; tenvitri: string; count: number; totalVolume: number };

export default function PositionsOverviewPage() {
  const [data, setData] = useState<PositionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/tuimau/positions/summary');
        setData(res.data as PositionSummary[]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h1>Tổng quan vị trí</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {data.map((p) => (
          <a key={p.mavitri} href={`/dashboard/kho-mau/positions/${p.mavitri}`} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600 }}>{p.tenvitri}</div>
            <div>Số túi: {p.count}</div>
            <div>Tổng thể tích: {p.totalVolume} ml</div>
          </a>
        ))}
      </div>
    </div>
  );
}
