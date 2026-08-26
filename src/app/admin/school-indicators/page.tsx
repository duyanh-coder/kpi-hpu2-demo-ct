'use client';

import { Plus, Edit, Trash2, Copy, Search } from 'lucide-react';
import sourceIndicators from '@/data/hpu2-school-indicators.json';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { KPIIndicator, AcademicYear, StrategicObjective, BSCMapLink } from '@/types';

export default function SchoolIndicatorsPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [items, setItems] = useState<KPIIndicator[]>([]);
  const [links, setLinks] = useState<BSCMapLink[]>([]);
  const [objectives, setObjectives] = useState<StrategicObjective[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<KPIIndicator | null>(null);
  const [editObjIds, setEditObjIds] = useState<string[]>([]);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');
  const [cloneFromYear, setCloneFromYear] = useState('');

  const loadYears = useCallback(async () => {
    const y = await apiGet<AcademicYear[]>('/api/academic-years');
    setYears(y);
    if (!selectedYearId) {
      const active = y.find(ay => ay.status === 'active');
      if (active) setSelectedYearId(active.id);
    }
  }, [selectedYearId]);

  const loadItems = useCallback(async (yearId: string) => {
    if (!yearId) return;
    const [i, l, o] = await Promise.all([
      apiGet<KPIIndicator[]>(`/api/indicators?academicYearId=${yearId}`),
      apiGet<BSCMapLink[]>('/api/bsc-map-links'),
      apiGet<StrategicObjective[]>('/api/strategic-objectives'),
    ]);
    setItems(i);
    setLinks(l);
    setObjectives(o);
  }, []);

  useEffect(() => { loadYears(); }, [loadYears]);
  useEffect(() => { if (selectedYearId) loadItems(selectedYearId); }, [selectedYearId, loadItems]);

  const objToPerspective = useMemo(() => {
    const map: Record<string, string> = {};
    links.filter(l => l.linkType === 'perspective_to_objective').forEach(l => { map[l.objectiveId] = l.perspectiveId; });
    return map;
  }, [links]);

  const indicatorToObjectives = useMemo(() => {
    const approvedIds = new Set(objectives.filter(o => o.status === 'approved').map(o => o.id));
    const map: Record<string, string[]> = {};
    links.filter(l => l.linkType === 'objective_to_indicator' && l.indicatorId).forEach(l => {
      if (!approvedIds.has(l.objectiveId)) return;
      const obj = objectives.find(o => o.id === l.objectiveId);
      if (obj) {
        if (!map[l.indicatorId!]) map[l.indicatorId!] = [];
        if (!map[l.indicatorId!].includes(obj.name)) map[l.indicatorId!].push(obj.name);
      }
    });
    return map;
  }, [links, objectives]);

  const sourceGroups = useMemo(() => [...new Set(sourceIndicators.map(x => x.group))], []);
  const sourceRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sourceIndicators.filter(x =>
      (groupFilter === 'all' || x.group === groupFilter) &&
      (cycleFilter === 'all' || x.cycle === cycleFilter) &&
      (!q || `${x.code} ${x.name} ${x.group} ${x.target}`.toLowerCase().includes(q))
    );
  }, [search, groupFilter, cycleFilter]);

  const getObjIdsForIndicator = (indicatorCode: string): string[] => {
    return links
      .filter(l => l.linkType === 'objective_to_indicator' && l.indicatorId === indicatorCode)
      .map(l => l.objectiveId);
  };

  const openEdit = (ind: KPIIndicator) => {
    setEditItem(ind);
    setEditObjIds(getObjIdsForIndicator(ind.code));
    setShowModal(true);
  };

  const openCreate = () => {
    setEditItem(null);
    setEditObjIds([]);
    setShowModal(true);
  };

  const handleSave = async (data: Partial<KPIIndicator>, objectiveIds: string[]) => {
    const payload = { ...data, academicYearId: selectedYearId };
    let savedCode = data.code;
    if (editItem) {
      await apiPut(`/api/indicators/${editItem.id}`, payload);
      savedCode = editItem.code;
    } else {
      const created = await apiPost<KPIIndicator>('/api/indicators', payload);
      savedCode = created.code;
    }

    const existingLinks = links.filter(
      l => l.linkType === 'objective_to_indicator' && l.indicatorId === savedCode
    );
    for (const link of existingLinks) {
      await apiDelete(`/api/bsc-map-links/${link.id}`);
    }

    for (const objId of objectiveIds) {
      const perspectiveId = objToPerspective[objId] || '';
      if (!perspectiveId) continue;
      await apiPost('/api/bsc-map-links', {
        perspectiveId,
        objectiveId: objId,
        indicatorId: savedCode,
        linkType: 'objective_to_indicator',
        weight: 1,
      });
    }

    setShowModal(false);
    setEditItem(null);
    setEditObjIds([]);
    loadItems(selectedYearId);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm('Xóa chỉ tiêu này?')) return;
    await apiDelete(`/api/indicators/${id}`);
    const relatedLinks = links.filter(l => l.linkType === 'objective_to_indicator' && l.indicatorId === code);
    for (const link of relatedLinks) {
      await apiDelete(`/api/bsc-map-links/${link.id}`);
    }
    loadItems(selectedYearId);
  };

  const handleClone = async () => {
    if (!cloneFromYear || !selectedYearId) return;
    await apiPost(`/api/kpi-data/clone?fromYear=${cloneFromYear}&toYear=${selectedYearId}`, {});
    setShowCloneModal(false);
    loadItems(selectedYearId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">
            Chỉ tiêu Trường
            {selectedYearId && <span className="text-lg font-normal text-text-light ml-2">— {years.find(y => y.id === selectedYearId)?.name || ''}</span>}
          </h1>
          <p className="text-text-light mt-1">Quản lý chỉ tiêu KPI cấp Trường theo năm học</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setCloneFromYear(''); setShowCloneModal(true); }} className="btn-secondary text-xs flex items-center gap-1">
            <Copy size={14} /> Sao chép
          </button>
          <button onClick={openCreate} className="btn-primary text-xs flex items-center gap-1">
            <Plus size={14} /> Thêm chỉ tiêu
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-text-dark">Năm học:</span>
        {years.map(ay => (
          <button key={ay.id} onClick={() => setSelectedYearId(ay.id)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${selectedYearId === ay.id ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>
            {ay.name}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-white">Bộ chỉ tiêu cấp Trường</h3>
            <p className="text-white/80 text-xs mt-1">Dữ liệu nguồn: Bộ KPI chính năm học 2026–2027.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-sm bg-white text-text-dark">
              <option value="all">Tất cả lĩnh vực</option>
              {sourceGroups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={cycleFilter} onChange={e => setCycleFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-sm bg-white text-text-dark">
              <option value="all">Tất cả chu kỳ</option><option value="Năm học">Năm học</option><option value="Học kỳ">Học kỳ</option>
            </select>
            <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã hoặc nội dung..." className="w-full lg:w-64 pl-9 pr-3 py-2 rounded-lg border text-sm bg-white text-text-dark"/></div>
          </div>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto"><table className="table">
            <thead>
              <tr><th>Mã KPI</th><th>Nội dung chỉ tiêu / Lĩnh vực</th><th>ĐVT</th><th>Chỉ tiêu năm học 2026–2027</th><th>Chu kỳ</th><th>Mục tiêu CL</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {sourceRows.map((ind, idx) => {
                const existing = items.find(x => x.code === ind.code);
                const objNames = indicatorToObjectives[ind.code] || [];
                return (
                  <tr key={ind.code}>
                    <td><span className="badge badge-info">{ind.code}</span></td>
                    <td><div className="font-medium">{ind.name}</div><div className="text-xs text-text-light mt-1">{ind.group}</div></td>
                    <td className="text-sm">{ind.unit}</td>
                    <td className="text-sm font-medium">{ind.target}</td>
                    <td className="text-sm">{ind.cycle}</td>
                    <td>
                      {objNames.length > 0 ? <div className="flex flex-wrap gap-1">{objNames.map(n => <span key={n} className="badge badge-secondary text-[10px]">{n}</span>)}</div> : <span className="text-text-light text-xs">Chưa liên kết</span>}
                    </td>
                    <td>
                      {existing ? <div className="flex gap-1">
                        <button onClick={() => openEdit(existing)} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(existing.id, existing.code)} className="p-1 text-accent-red hover:bg-accent-red/10 rounded"><Trash2 size={14} /></button>
                      </div> : <button onClick={openCreate} className="text-xs text-primary hover:underline">Thêm vào quản lý</button>}
                    </td>
                  </tr>
                );
              })}
              {sourceRows.length === 0 && <tr><td colSpan={7} className="text-center text-text-light text-sm py-8">Không tìm thấy chỉ tiêu phù hợp</td></tr>}
            </tbody>
          </table></div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); setEditObjIds([]); }} title={editItem ? 'Sửa chỉ tiêu' : 'Thêm chỉ tiêu'}>
        <IndicatorForm item={editItem} selectedObjIds={editObjIds} objectives={objectives} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditItem(null); setEditObjIds([]); }} />
      </Modal>

      <Modal isOpen={showCloneModal} onClose={() => setShowCloneModal(false)} title="Sao chép chỉ tiêu">
        <div className="space-y-4">
          <p className="text-sm text-text-light">Chọn năm học nguồn để sao chép sang năm <strong>{years.find(y => y.id === selectedYearId)?.name}</strong>:</p>
          <select value={cloneFromYear} onChange={e => setCloneFromYear(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="">-- Chọn năm học --</option>
            {years.filter(y => y.id !== selectedYearId).map(y => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={() => setShowCloneModal(false)} className="btn-secondary">Hủy</button>
            <button type="button" onClick={handleClone} disabled={!cloneFromYear} className="btn-primary">Sao chép</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function IndicatorForm({ item, selectedObjIds, objectives, onSubmit, onCancel }: {
  item: KPIIndicator | null;
  selectedObjIds: string[];
  objectives: StrategicObjective[];
  onSubmit: (data: Partial<KPIIndicator>, objectiveIds: string[]) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [categoryId, setCategoryId] = useState(item?.categoryId || '');
  const [formula, setFormula] = useState(item?.formula || '');
  const [unit, setUnit] = useState(item?.unit || '%');
  const [direction, setDirection] = useState(item?.direction || 'higher_better');
  const [requiredEvidence, setRequiredEvidence] = useState(item?.requiredEvidence ?? true);
  const [maxScore, setMaxScore] = useState(item?.maxScore ?? 10);
  const [targetValue, setTargetValue] = useState(item?.targetValue ?? 0);
  const [weight, setWeight] = useState(item?.weight ?? 5);
  const [objectiveIds, setObjectiveIds] = useState<string[]>(selectedObjIds);

  const toggleObjective = (id: string) => {
    setObjectiveIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, code, categoryId, formula, unit, direction, requiredEvidence, maxScore, targetValue: Number(targetValue), weight: Number(weight) }, objectiveIds);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Tên chỉ tiêu *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Mã</label>
          <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="VD: HPU2-KPI-01"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Mã nhóm</label>
          <input type="text" value={categoryId} onChange={e => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Công thức</label>
        <input type="text" value={formula} onChange={e => setFormula(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Đơn vị đo</label>
          <input type="text" value={unit} onChange={e => setUnit(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Hướng</label>
          <select value={direction} onChange={e => setDirection(e.target.value as 'higher_better' | 'lower_better')}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="higher_better">Cao hơn tốt hơn</option>
            <option value="lower_better">Thấp hơn tốt hơn</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Cần minh chứng?</label>
          <select value={requiredEvidence ? 'yes' : 'no'} onChange={e => setRequiredEvidence(e.target.value === 'yes')}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="yes">Có</option>
            <option value="no">Không</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Chỉ tiêu mục tiêu *</label>
          <input type="number" value={targetValue} onChange={e => setTargetValue(Number(e.target.value))} required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Điểm tối đa</label>
          <input type="number" value={maxScore} onChange={e => setMaxScore(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Trọng số %</label>
          <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} min={0} max={100}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-dark mb-2">Mục tiêu chiến lược</label>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-3 bg-bg-cream rounded-lg border border-border">
          {objectives.filter(o => o.status === 'approved').map(obj => (
            <label key={obj.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white rounded px-2 py-1">
              <input type="checkbox" checked={objectiveIds.includes(obj.id)} onChange={() => toggleObjective(obj.id)} className="rounded" />
              <span className="font-medium">{obj.name}</span>
              <span className="text-xs text-text-light">— {obj.field}</span>
            </label>
          ))}
        </div>
        {objectiveIds.length > 0 && (
          <p className="text-xs text-text-light mt-1">Đã chọn {objectiveIds.length} mục tiêu</p>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
        <button type="submit" className="btn-primary">{item ? 'Cập nhật' : 'Thêm mới'}</button>
      </div>
    </form>
  );
}
