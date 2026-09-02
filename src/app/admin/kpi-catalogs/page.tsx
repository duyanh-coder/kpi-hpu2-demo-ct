'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Target, Building, Plus, Edit, Trash2, CalendarPlus } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import PagedTable from '@/components/ui/PagedTable';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { SchoolCatalogForm, UnitCatalogForm } from '@/components/forms/kpi-catalog-forms';
import type { SchoolKPICatalog, KPIGroupCatalog, UnitKPICatalog } from '@/types';

type TabKey = 'school-catalog' | 'unit-catalog';

export default function KPICatalogsPage() {
  const [tab, setTab] = useState<TabKey>('school-catalog');

  const [schoolCatalog, setSchoolCatalog] = useState<SchoolKPICatalog[]>([]);
  const [unitCatalog, setUnitCatalog] = useState<UnitKPICatalog[]>([]);
  const [groupCatalog, setGroupCatalog] = useState<KPIGroupCatalog[]>([]);
  const [kpiGroups, setKpiGroups] = useState<{ id: string; name: string }[]>([]);
  const [orgUnits, setOrgUnits] = useState<{ id: string; name: string }[]>([]);
  const [measurementUnits, setMeasurementUnits] = useState<{ id: string; name: string }[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [catalogGroupFilter, setCatalogGroupFilter] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [sc, uc, gc, kg, ou, mu] = await Promise.all([
      apiGet<SchoolKPICatalog[]>('/api/school-kpi-catalog'),
      apiGet<UnitKPICatalog[]>('/api/unit-kpi-catalog'),
      apiGet<KPIGroupCatalog[]>('/api/kpi-group-catalog'),
      apiGet<{ id: string; name: string }[]>('/api/kpi-groups'),
      apiGet<{ id: string; name: string }[]>('/api/units'),
      apiGet<{ id: string; name: string }[]>('/api/measurement-units'),
    ]);
    setSchoolCatalog(sc); setUnitCatalog(uc); setGroupCatalog(gc); setKpiGroups(kg); setOrgUnits(ou); setMeasurementUnits(mu);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const apiEntity = (t: TabKey) => {
    if (t === 'school-catalog') return 'school-kpi-catalog';
    if (t === 'unit-catalog') return 'unit-kpi-catalog';
    return 'school-kpi-catalog';
  };

  const handleSave = async (data: any) => {
    const entity = apiEntity(tab);
    if (editId) {
      await apiPut(`/api/${entity}/${editId}`, data);
    } else {
      await apiPost(`/api/${entity}`, data);
    }
    setShowModal(false); setEditId(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa mục này?')) return;
    await apiDelete(`/api/${apiEntity(tab)}/${id}`);
    loadData();
  };

  const tabs = [
    { id: 'school-catalog' as TabKey, label: 'Chỉ tiêu Trường', icon: Target, count: schoolCatalog.length },
    { id: 'unit-catalog' as TabKey, label: 'KPI đơn vị', icon: Building, count: unitCatalog.length },
  ];

  const filteredUnitGroups = useMemo(() => {
    const visible = catalogGroupFilter
      ? unitCatalog.filter(u => {
          const catId = (schoolCatalog.find(s => s.id === u.linkedCatalogId)?.categoryId || '');
          return catId === catalogGroupFilter;
        })
      : unitCatalog;
    const map = new Map<string, UnitKPICatalog[]>();
    for (const u of visible) {
      const catId = u.linkedCatalogId ? (schoolCatalog.find(s => s.id === u.linkedCatalogId)?.categoryId || '') : '';
      const g = u.linkedCatalogId ? (kpiGroups.find(g => g.id === catId)?.name || 'Khác') : 'KPI riêng';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(u);
    }
    return map;
  }, [unitCatalog, schoolCatalog, kpiGroups, catalogGroupFilter]);

  const visibleSchool = useMemo(
    () => (catalogGroupFilter ? schoolCatalog.filter(s => s.categoryId === catalogGroupFilter) : schoolCatalog),
    [schoolCatalog, catalogGroupFilter]
  );

  const unitName = (id?: string) => measurementUnits.find(m => m.id === id)?.name || id || '—';

  const schoolColumns = [
    { key: 'code', label: 'Mã', width: 'w-[8%]', render: (s: SchoolKPICatalog) => s.code },
    { key: 'name', label: 'Nội dung chỉ tiêu', width: 'w-[34%]', render: (s: SchoolKPICatalog) => <span className="font-medium break-words">{s.name}</span> },
    { key: 'target', label: 'Chỉ tiêu năm', width: 'w-[16%]', render: (s: SchoolKPICatalog) => <span className="font-medium">{s.target || 'Theo QĐ 1480/QĐ-ĐHSPHN2'}</span> },
    { key: 'unitId', label: 'ĐVT', width: 'w-[12%]', render: (s: SchoolKPICatalog) => unitName(s.unitId) },
    { key: 'cycle', label: 'Chu kỳ', width: 'w-[12%]', render: (s: SchoolKPICatalog) => s.cycle || 'Năm học' },
    { key: 'actions', label: 'Thao tác', width: 'w-[8%]', render: (s: SchoolKPICatalog) => (
      <div className="flex justify-center gap-1">
        <button onClick={() => { setEditId(s.id); setShowModal(true); }} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded"><Edit size={14} /></button>
        <button onClick={() => handleDelete(s.id)} className="p-1 text-accent-red hover:bg-accent-red/10 rounded"><Trash2 size={14} /></button>
      </div>
    ) },
  ];

  const unitColumns = [
    { key: 'code', label: 'Mã', width: 'w-[8%]', render: (u: UnitKPICatalog) => u.code },
    { key: 'name', label: 'Nội dung chỉ tiêu', width: 'w-[34%]', render: (u: UnitKPICatalog) => <span className="font-medium break-words">{u.name}</span> },
    { key: 'target', label: 'Chỉ tiêu năm', width: 'w-[16%]', render: (u: UnitKPICatalog) => <span className="font-medium">{u.target || '—'}</span> },
    { key: 'unitId', label: 'ĐVT', width: 'w-[12%]', render: (u: UnitKPICatalog) => unitName(u.unitId) },
    { key: 'cycle', label: 'Chu kỳ', width: 'w-[12%]', render: (u: UnitKPICatalog) => u.cycle || 'Học kỳ' },
    { key: 'type', label: 'Loại', width: 'w-[10%]', render: (u: UnitKPICatalog) => (
      <span className={`badge whitespace-nowrap ${u.linkedCatalogId ? 'badge-info' : 'badge-warning'}`}>{u.linkedCatalogId ? 'Phân bổ' : 'Riêng'}</span>
    ) },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold text-text-dark">Bộ chỉ tiêu KPI</h1>

      <div className="flex gap-2 border-b border-border">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setEditId(null); setShowModal(false); setCatalogGroupFilter(null); }}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-dark'}`}>
              <Icon size={16} /> {t.label}
              <span className="badge badge-info ml-1">{t.count}</span>
            </button>
          );
        })}
      </div>

      <div className="card p-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <select value={catalogGroupFilter || ''} onChange={e => setCatalogGroupFilter(e.target.value || null)}
            className="px-3 py-2 rounded-lg border border-border bg-white text-text-dark text-sm focus:outline-none focus:border-primary">
            <option value="">Tất cả lĩnh vực</option>
            {kpiGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <button onClick={() => { setEditId(null); setShowModal(true); }} className="btn-primary text-sm flex items-center gap-1">
            <Plus size={15} /> Thêm
          </button>
          <button className="btn-primary text-sm flex items-center gap-1" onClick={() => {}}>
            <CalendarPlus size={15} /> Lập kế hoạch
          </button>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button className="btn-primary text-sm flex items-center gap-1" onClick={() => {}}>
            <img src="/images/word.png" alt="Word" className="h-4 w-4 object-contain" /> Xuất word
          </button>
          <button className="btn-primary text-sm flex items-center gap-1" onClick={() => {}}>
            <img src="/images/excel.png" alt="Excel" className="h-4 w-4 object-contain" /> Xuất excel
          </button>
          <button className="btn-primary text-sm flex items-center gap-1" onClick={() => {}}>
            <img src="/images/pdf.png" alt="PDF" className="h-4 w-4 object-contain" /> Xuất pdf
          </button>
        </div>
      </div>

      <div className="card">
        <div className="p-0">
          {tab === 'school-catalog' && (
            <PagedTable
              data={visibleSchool}
              rowKey={s => s.id}
              pageSize={10}
              groupBy={s => kpiGroups.find(g => g.id === s.categoryId)?.name || 'Khác'}
              columns={schoolColumns}
            />
          )}
          {tab === 'unit-catalog' && (
            <PagedTable
              data={Array.from(filteredUnitGroups).flatMap(([, items]) => items)}
              rowKey={u => u.id}
              pageSize={10}
              groupBy={u => {
                const catId = u.linkedCatalogId ? (schoolCatalog.find(s => s.id === u.linkedCatalogId)?.categoryId || '') : '';
                return u.linkedCatalogId ? (kpiGroups.find(g => g.id === catId)?.name || 'Khác') : 'KPI riêng';
              }}
              columns={unitColumns}
            />
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditId(null); }}
        title={tab === 'school-catalog' ? `${editId ? 'Sửa' : 'Thêm'} Chỉ tiêu Trường` : 'Thêm KPI riêng của đơn vị'} maxWidth="max-w-3xl">
        {tab === 'school-catalog' && <SchoolCatalogForm item={editId ? (schoolCatalog.find(s => s.id === editId) || null) : null} groups={groupCatalog} units={measurementUnits} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditId(null); }} />}
        {tab === 'unit-catalog' && <UnitCatalogForm item={null} orgUnits={orgUnits.filter(o => o.id !== 'u001')} units={measurementUnits} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditId(null); }} />}
      </Modal>
    </div>
  );
}