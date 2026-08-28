'use client';

import { useEffect, useState } from 'react';
import CrudTable from '@/components/admin/CrudTable';
import { apiGet } from '@/lib/api';

interface UnitRow {
  id: string;
  parentId: string | null;
  name: string;
  code: string;
  type: string;
  status: string;
}

const typeOptions = [
  { value: 'university', label: 'Trường Đại học' },
  { value: 'faculty', label: 'Khoa' },
  { value: 'department', label: 'Phòng/Bộ môn' },
  { value: 'center', label: 'Trung tâm' },
  { value: 'division', label: 'Vụ/Đơn vị' },
  { value: 'research', label: 'Viện' },
];

export default function DanhMucDonViPage() {
  const [units, setUnits] = useState<UnitRow[]>([]);

  useEffect(() => {
    apiGet<UnitRow[]>('/api/units').then(setUnits).catch(() => { /* empty */ });
  }, []);

  const nameById = (id: string | null) => {
    if (!id) return null;
    return units.find(u => u.id === id)?.name || null;
  };

  const parentOptions = [...new Map(units.map(u => [u.id, u])).values()]
    .filter(u => u.parentId !== null)
    .map(u => ({ value: u.id, label: `${u.code} - ${u.name}` }));

  return (
    <CrudTable
      title="Danh mục đơn vị"
      description="Các đơn vị, phòng ban trong trường"
      endpoint="units"
      extraSelects={{ parentId: parentOptions }}
      columns={[
        { key: 'code', label: 'Mã đơn vị' },
        { key: 'name', label: 'Tên đơn vị' },
        {
          key: 'type', label: 'Loại đơn vị',
          render: (row) => typeOptions.find(o => o.value === String(row.type))?.label ?? String(row.type || '—'),
        },
        {
          key: 'parentId', label: 'Trực thuộc',
          render: (row) => nameById(row.parentId as string | null) || '—',
        },
        {
          key: 'status', label: 'Trạng thái',
          render: (row) => <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{row.status === 'active' ? 'Đang dùng' : 'Ngừng'}</span>,
        },
      ]}
      fields={[
        { key: 'code', label: 'Mã đơn vị', required: true },
        { key: 'name', label: 'Tên đơn vị', required: true },
        { key: 'type', label: 'Loại đơn vị', type: 'select', options: typeOptions },
        { key: 'parentId', label: 'Trực thuộc', type: 'select' },
      ]}
    />
  );
}