'use client';

import { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import { Target, Building, Plus, Edit, Trash2, CalendarPlus, FileText, FileSpreadsheet, FileOutput } from 'lucide-react';
import Modal from '@/components/ui/Modal';
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
        <select value={catalogGroupFilter || ''} onChange={e => setCatalogGroupFilter(e.target.value || null)}
          className="px-3 py-2 rounded-lg border border-border bg-white text-text-dark text-sm focus:outline-none focus:border-primary">
          <option value="">Tất cả lĩnh vực</option>
          {kpiGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={() => { setEditId(null); setShowModal(true); }} className="btn-primary text-sm flex items-center gap-1">
          <Plus size={15} /> Thêm
        </button>
        <button className="btn-secondary text-sm flex items-center gap-1" onClick={() => {}}>
          <CalendarPlus size={15} /> Lập kế hoạch
        </button>
        <button className="btn-secondary text-sm flex items-center gap-1" onClick={() => {}}>
          <FileText size={15} /> Xuất word
        </button>
        <button className="btn-secondary text-sm flex items-center gap-1" onClick={() => {}}>
          <FileSpreadsheet size={15} /> Xuất excel
        </button>
        <button className="btn-secondary text-sm flex items-center gap-1" onClick={() => {}}>
          <FileOutput size={15} /> Xuất pdf
        </button>
      </div>

      <div className="card">
        <div className="p-0">
          {tab === 'school-catalog' && (
            <table className="table table-fixed">
              <thead><tr><th className="w-[4%]">STT</th><th className="w-[38%]">Nội dung chỉ tiêu</th><th className="w-[16%]">Chỉ tiêu năm</th><th className="w-[12%]">ĐVT</th><th className="w-[12%]">Chu kỳ</th><th className="w-[8%]">Thao tác</th></tr></thead>
              <tbody>
                {visibleSchool.map((s, idx) => (
                  <tr key={s.id}>
                    <td>{idx + 1}</td>
                    <td className="font-medium break-words">{s.name}</td>
                    <td className="font-medium">{s.target || 'Theo QĐ'}</td>
                    <td>{measurementUnits.find(m => m.id === s.unitId)?.name || s.unitId}</td>
                    <td>{s.cycle || 'Năm học'}</td>
                    <td><Actions id={s.id} onEdit={() => { setEditId(s.id); setShowModal(true); }} onDelete={() => handleDelete(s.id)} /></td>
                  </tr>
                ))}
                {visibleSchool.length === 0 && <tr><td colSpan={6} className="text-center text-text-light text-sm py-8">Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          )}
          {tab === 'unit-catalog' && (
            <table className="table table-fixed">
              <thead><tr><th className="w-[4%]">STT</th><th className="w-[38%]">Nội dung chỉ tiêu</th><th className="w-[16%]">Chỉ tiêu năm</th><th className="w-[12%]">ĐVT</th><th className="w-[12%]">Chu kỳ</th><th className="w-[10%]">Loại</th></tr></thead>
              <tbody>
                {Array.from(filteredUnitGroups).map(([groupName, items]) => (
                  <Fragment key={groupName}>
                    <tr className="bg-bg-cream">
                      <td></td>
                      <td colSpan={5} className="font-semibold text-primary">{groupName}</td>
                    </tr>
                    {items.map((u, idx) => (
                      <tr key={u.id}>
                        <td>{idx + 1}</td>
                        <td className="font-medium break-words">{u.name}</td>
                        <td className="font-medium">{u.target || '—'}</td>
                        <td>{measurementUnits.find(m => m.id === u.unitId)?.name || u.unitId}</td>
                        <td>{u.cycle || 'Học kỳ'}</td>
                        <td><span className={`badge whitespace-nowrap ${u.linkedCatalogId ? 'badge-info' : 'badge-warning'}`}>{u.linkedCatalogId ? 'Phân bổ' : 'Riêng'}</span></td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
                {filteredUnitGroups.size === 0 && <tr><td colSpan={6} className="text-center text-text-light text-sm py-8">Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
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

function Actions({ id, onEdit, onDelete }: { id: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-center gap-1">
      <button onClick={onEdit} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded"><Edit size={14} /></button>
      <button onClick={onDelete} className="p-1 text-accent-red hover:bg-accent-red/10 rounded"><Trash2 size={14} /></button>
    </div>
  );
}