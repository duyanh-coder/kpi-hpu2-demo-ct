'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost } from '@/lib/api';

interface AcademicYear {
  id: string;
  name: string;
  status: string;
}

interface KPICycle {
  id: string;
  academicYearId: string;
  name: string;
  status: string;
}

interface OrgUnit {
  id: string;
  name: string;
  parentId: string | null;
}

interface UnitKPI {
  id: string;
  code: string;
  name: string;
  orgUnitId?: string;
  target?: string;
}

interface PlanItem {
  indicatorId: string;
  indicatorName: string;
  targetValue: number;
  weight: number;
  note: string;
}

const fieldCls = 'w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary';
const btnDanger = 'p-1.5 rounded-lg border border-accent-red text-accent-red hover:bg-accent-red/10';

export default function PlanModal({
  isOpen,
  onClose,
  defaultUnitId = '',
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultUnitId?: string;
}) {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [cycles, setCycles] = useState<KPICycle[]>([]);
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [unitKpis, setUnitKpis] = useState<UnitKPI[]>([]);

  const [yearId, setYearId] = useState('');
  const [cycleId, setCycleId] = useState('');
  const [unitId, setUnitId] = useState(defaultUnitId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<PlanItem[]>([
    { indicatorId: '', indicatorName: '', targetValue: 0, weight: 10, note: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      apiGet<AcademicYear[]>('/api/academic-years'),
      apiGet<KPICycle[]>('/api/cycles'),
      apiGet<OrgUnit[]>('/api/units'),
      apiGet<UnitKPI[]>('/api/unit-kpi-catalog'),
    ]).then(([y, c, u, uk]) => {
      setYears(y); setCycles(c); setUnits(u); setUnitKpis(uk);
      const activeYear = y.find(a => a.status === 'active') || y[0];
      if (activeYear) {
        setYearId(activeYear.id);
        const yearCycles = c.filter(cy => cy.academicYearId === activeYear.id);
        if (yearCycles.length > 0) setCycleId(yearCycles[0].id);
      }
      setUnitId(prev => prev || (u.find(x => x.parentId !== null)?.id || ''));
    }).catch(() => setError('Không thể tải dữ liệu.'));
  }, [isOpen]);

  const yearCycles = cycles.filter(c => c.academicYearId === yearId);

  const kpiName = (id: string) => {
    const k = unitKpis.find(x => x.id === id);
    return k ? `${k.code} - ${k.name}` : '';
  };

  const updateItem = (idx: number, patch: Partial<PlanItem>) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  };

  const addItem = () => setItems(prev => [...prev, { indicatorId: '', indicatorName: '', targetValue: 0, weight: 10, note: '' }]);
  const removeItem = (idx: number) => setItems(prev => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const handleSubmit = async () => {
    setError('');
    if (!cycleId || !unitId || !name.trim()) {
      setError('Vui lòng chọn Chu kỳ, Đơn vị và nhập Tên kế hoạch.');
      return;
    }
    const finalItems = items
      .filter(it => it.indicatorId)
      .map(it => ({
        indicatorId: it.indicatorId,
        indicatorName: kpiName(it.indicatorId),
        targetValue: it.targetValue,
        unit: '',
        weight: it.weight,
        note: it.note,
        dueDate: '',
      }));
    if (finalItems.length === 0) {
      setError('Vui lòng chọn ít nhất một chỉ tiêu KPI.');
      return;
    }
    setSaving(true);
    try {
      await apiPost('/api/department-plans', {
        cycleId,
        departmentId: unitId,
        name: name.trim(),
        description,
        items: finalItems,
      });
      onClose();
    } catch {
      setError('Lưu kế hoạch thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lập kế hoạch" maxWidth="max-w-3xl">
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Năm học *</label>
            <select value={yearId} onChange={e => {
              setYearId(e.target.value);
              const yc = cycles.filter(c => c.academicYearId === e.target.value);
              setCycleId(yc[0]?.id || '');
            }} className={fieldCls}>
              {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chu kỳ *</label>
            <select value={cycleId} onChange={e => setCycleId(e.target.value)} className={fieldCls}>
              <option value="">-- Chọn chu kỳ --</option>
              {yearCycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Đơn vị *</label>
            <select value={unitId} onChange={e => setUnitId(e.target.value)} className={fieldCls}>
              <option value="">-- Chọn đơn vị --</option>
              {units.filter(u => u.parentId !== null).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tên kế hoạch *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="VD: Kế hoạch KPI năm học 2026-2027 - Phòng Đào tạo" className={fieldCls} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className={fieldCls} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Chỉ tiêu KPI</label>
            <button type="button" onClick={addItem} className="btn-primary text-xs flex items-center gap-1"><Plus size={14} /> Thêm chỉ tiêu</button>
          </div>
          {items.map((it, idx) => (
            <div key={idx} className="border border-border rounded-lg p-3 mb-2 grid grid-cols-12 gap-3 items-end">
              <div className="col-span-6">
                <label className="block text-xs text-text-light mb-1">Chỉ tiêu KPI</label>
                <select value={it.indicatorId} onChange={e => updateItem(idx, { indicatorId: e.target.value })} className={fieldCls}>
                  <option value="">-- Chọn chỉ tiêu --</option>
                  {unitKpis.map(k => <option key={k.id} value={k.id}>{k.code} - {k.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-text-light mb-1">Chỉ tiêu (target)</label>
                <input type="number" value={it.targetValue} onChange={e => updateItem(idx, { targetValue: Number(e.target.value) })} className={fieldCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-text-light mb-1">Trọng số (%)</label>
                <input type="number" value={it.weight} onChange={e => updateItem(idx, { weight: Number(e.target.value) })} className={fieldCls} />
              </div>
              <div className="col-span-1 flex items-center">
                <button type="button" onClick={() => removeItem(idx)} className={btnDanger} aria-label="Xóa"><Trash2 size={15} /></button>
              </div>
              <div className="col-span-11">
                <label className="block text-xs text-text-light mb-1">Ghi chú</label>
                <input value={it.note} onChange={e => updateItem(idx, { note: e.target.value })} className={fieldCls} />
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-accent-red">{error}</p>}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
          <button type="button" onClick={handleSubmit} disabled={saving} className="btn-primary">{saving ? 'Đang lưu...' : 'Lưu kế hoạch'}</button>
        </div>
      </div>
    </Modal>
  );
}
