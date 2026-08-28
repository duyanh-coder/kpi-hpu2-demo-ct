'use client';

import { useState, useEffect, useCallback } from 'react';
import { Target, Building, Plus, Edit, Trash2 } from 'lucide-react';
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

  const orgUnitName = (id?: string) => orgUnits.find(o => o.id === id)?.name || id || '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Bộ chỉ tiêu KPI</h1>
          <p className="text-text-light mt-1">Quản lý chỉ tiêu cấp Trường và bộ KPI được phân rã cho đơn vị.</p>
        </div>
      </div>

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

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-white">{tabs.find(t => t.id === tab)?.label || 'Danh mục'}</h3>
          <div className="flex items-center gap-2">
            {tab === 'school-catalog' && (
              <select value={catalogGroupFilter || ''} onChange={e => setCatalogGroupFilter(e.target.value || null)}
                className="px-2 py-1 rounded border border-border bg-white text-text-dark text-xs focus:outline-none">
                <option value="">Tất cả nhóm</option>
                {groupCatalog.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            )}
            <button onClick={() => { setEditId(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
              <Plus size={14} /> Thêm
            </button>
          </div>
        </div>
        <div className="p-0">
          {tab === 'school-catalog' && (
            <table className="table">
              <thead><tr><th>Mã</th><th>Nội dung chỉ tiêu</th><th>Nhóm</th><th>ĐVT</th><th>Chỉ tiêu năm</th><th>Chu kỳ</th><th>Thao tác</th></tr></thead>
              <tbody>
                {(catalogGroupFilter ? schoolCatalog.filter(s => s.categoryId === catalogGroupFilter) : schoolCatalog).map(s => (
                  <tr key={s.id}>
                    <td><span className="badge badge-info">{s.code}</span></td>
                    <td className="font-medium max-w-[250px] truncate" title={s.name}>{s.name}</td>
                    <td>{groupCatalog.find(g => g.id === s.categoryId)?.name || s.categoryId}</td>
                    <td>{measurementUnits.find(m => m.id === s.unitId)?.name || s.unitId}</td>
                    <td className="font-medium">{s.target || 'Theo QĐ'}</td>
                    <td>{s.cycle || 'Năm học'}</td>
                    <td><Actions id={s.id} onEdit={() => { setEditId(s.id); setShowModal(true); }} onDelete={() => handleDelete(s.id)} /></td>
                  </tr>
                ))}
                {schoolCatalog.length === 0 && <tr><td colSpan={7} className="text-center text-text-light text-sm py-8">Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          )}
          {tab === 'unit-catalog' && (
            <table className="table">
              <thead><tr><th>STT</th><th>Đơn vị</th><th>KPI</th><th>Nhóm</th><th>Loại</th><th>ĐVT</th><th>Chỉ tiêu năm</th><th>Chu kỳ</th></tr></thead>
              <tbody>
                {unitCatalog.map((u, idx) => (
                  <tr key={u.id}>
                    <td>{idx + 1}</td>
                    <td className="font-medium">{orgUnitName(u.orgUnitId)}</td>
                    <td className="max-w-[280px] truncate" title={u.name}>{u.name}</td>
                    <td>{u.linkedCatalogId ? (kpiGroups.find(g => g.id === (schoolCatalog.find(s => s.id === u.linkedCatalogId)?.categoryId || ''))?.name || '—') : '—'}</td>
                    <td><span className={`badge ${u.linkedCatalogId ? 'badge-info' : 'badge-warning'}`}>{u.linkedCatalogId ? 'Phân bổ' : 'Riêng'}</span></td>
                    <td>{measurementUnits.find(m => m.id === u.unitId)?.name || u.unitId}</td>
                    <td className="font-medium">{u.target || '—'}</td>
                    <td>{u.cycle || 'Năm học'}</td>
                  </tr>
                ))}
                {unitCatalog.length === 0 && <tr><td colSpan={8} className="text-center text-text-light text-sm py-8">Chưa có dữ liệu</td></tr>}
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
    <div className="flex gap-1">
      <button onClick={onEdit} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded"><Edit size={14} /></button>
      <button onClick={onDelete} className="p-1 text-accent-red hover:bg-accent-red/10 rounded"><Trash2 size={14} /></button>
    </div>
  );
}