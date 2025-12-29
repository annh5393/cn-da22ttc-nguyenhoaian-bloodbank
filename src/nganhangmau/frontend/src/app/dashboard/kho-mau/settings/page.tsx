"use client";
import React, { useEffect, useState } from 'react';
import axios from '../../../../lib/axios';

type Kho = { makho: string; tenvitri: string | null; nhietdobaoquan: string | null; trangthai: string | null };

export default function WarehouseSettingsPage() {
  const [kho, setKho] = useState<Kho | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get('/khomau/KHO_MAIN');
      setKho(res.data);
    };
    load();
  }, []);

  const save = async () => {
    if (!kho) return;
    setSaving(true);
    await axios.put(`/khomau/${kho.makho}`, {
      tenvitri: kho.tenvitri,
      nhietdobaoquan: kho.nhietdobaoquan,
      trangthai: kho.trangthai,
    });
    setSaving(false);
    alert('Đã lưu');
  };

  if (!kho) return <div>Đang tải...</div>;

  return (
    <div>
      <h1>Cài đặt kho</h1>
      <div style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
        <label>
          Tên hiển thị
          <input value={kho.tenvitri ?? ''} onChange={(e) => setKho({ ...kho, tenvitri: e.target.value })} />
        </label>
        <label>
          Nhiệt độ bảo quản
          <input value={kho.nhietdobaoquan ?? ''} onChange={(e) => setKho({ ...kho, nhietdobaoquan: e.target.value })} />
        </label>
        <label>
          Trạng thái
          <input value={kho.trangthai ?? ''} onChange={(e) => setKho({ ...kho, trangthai: e.target.value })} />
        </label>
        <button onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
      </div>
    </div>
  );
}
