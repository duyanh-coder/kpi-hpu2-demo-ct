
'use client';

import { useState } from 'react';
import type { SchoolKPICatalog, KPIGroupCatalog, UnitKPICatalog, IndividualKPICatalog } from '@/types';

const field = 'w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary';

export function SchoolCatalogForm({ item, groups, units, onSubmit, onCancel }: { item: SchoolKPICatalog | null; groups: KPIGroupCatalog[]; units: { id: string; name: string }[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [categoryId, setCategoryId] = useState(item?.categoryId || groups[0]?.id || '');
  const [formula, setFormula] = useState(item?.formula || '');
  const [unitId, setUnitId] = useState(item?.unitId || 'mu001');
  const [direction, setDirection] = useState(item?.direction || 'higher_better');
  const [requiredEvidence, setRequiredEvidence] = useState(item?.requiredEvidence ?? true);
  const [maxScore, setMaxScore] = useState(item?.maxScore ?? 10);
  const [target, setTarget] = useState(item?.target || '');
  const [cycle, setCycle] = useState(item?.cycle || 'Năm học');

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, code, categoryId, formula, unitId, direction, requiredEvidence, maxScore: Number(maxScore), target, cycle });
  };

  return <form onSubmit={handle} className="space-y-4">
    <div><label className="block text-sm font-medium mb-1">Nội dung chỉ tiêu *</label><input value={name} onChange={e => setName(e.target.value)} required className={field} /></div>
    <div className="grid grid-cols-2 gap-4">
      <div><label className="block text-sm font-medium mb-1">Mã KPI *</label><input value={code} onChange={e => setCode(e.target.value)} required className={field} /></div>
      <div><label className="block text-sm font-medium mb-1">Nhóm *</label><select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={field}>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div><label className="block text-sm font-medium mb-1">Đơn vị đo</label><select value={unitId} onChange={e => setUnitId(e.target.value)} className={field}>{units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
      <div><label className="block text-sm font-medium mb-1">Chỉ tiêu năm học</label><input value={target} onChange={e => setTarget(e.target.value)} className={field} /></div>
      <div><label className="block text-sm font-medium mb-1">Chu kỳ</label><select value={cycle} onChange={e => setCycle(e.target.value)} className={field}><option>Năm học</option><option>Học kỳ</option><option>Tháng</option><option>Học kỳ/Năm học</option></select></div>
    </div>
    <div><label className="block text-sm font-medium mb-1">Công thức / nguyên tắc đánh giá</label><input value={formula} onChange={e => setFormula(e.target.value)} className={field} /></div>
    <div className="grid grid-cols-3 gap-4">
      <div><label className="block text-sm font-medium mb-1">Hướng đánh giá</label><select value={direction} onChange={e => setDirection(e.target.value as 'higher_better' | 'lower_better')} className={field}><option value="higher_better">Cao hơn tốt hơn</option><option value="lower_better">Thấp hơn tốt hơn</option></select></div>
      <div><label className="block text-sm font-medium mb-1">Minh chứng</label><select value={requiredEvidence ? 'yes' : 'no'} onChange={e => setRequiredEvidence(e.target.value === 'yes')} className={field}><option value="yes">Có yêu cầu</option><option value="no">Không yêu cầu</option></select></div>
      <div><label className="block text-sm font-medium mb-1">Điểm tối đa</label><input type="number" value={maxScore} onChange={e => setMaxScore(Number(e.target.value))} className={field} /></div>
    </div>
    <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onCancel} className="btn-secondary">Hủy</button><button type="submit" className="btn-primary">{item ? 'Cập nhật' : 'Thêm mới'}</button></div>
  </form>;
}

export function UnitCatalogForm({ item, units, schoolCatalog, onSubmit, onCancel }: { item: UnitKPICatalog | null; units: { id: string; name: string }[]; schoolCatalog: SchoolKPICatalog[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [unitId, setUnitId] = useState(item?.unitId || 'mu001');
  const [target, setTarget] = useState(item?.target || '');
  const [cycle, setCycle] = useState(item?.cycle || 'Năm học');
  const [kind, setKind] = useState<'link' | 'own'>(item?.linkedCatalogId ? 'link' : 'own');
  const [linkedCatalogId, setLinkedCatalogId] = useState(item?.linkedCatalogId || '');
  const handle = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ name, code, unitId, target, cycle, linkedCatalogId: kind === 'link' ? linkedCatalogId || null : null }); };
  return <form onSubmit={handle} className="space-y-4">
    <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">KPI đơn vị *</label><input value={name} onChange={e => setName(e.target.value)} required className={field} /></div><div><label className="block text-sm font-medium mb-1">Mã *</label><input value={code} onChange={e => setCode(e.target.value)} required className={field} /></div></div>
    <div><label className="block text-sm font-medium mb-1">Loại KPI</label><select value={kind} onChange={e => setKind(e.target.value as 'link' | 'own')} className={field}><option value="link">Gắn chỉ tiêu Trường</option><option value="own">KPI riêng</option></select></div>
    {kind === 'link' && <div><label className="block text-sm font-medium mb-1">Chỉ tiêu Trường liên kết</label><select value={linkedCatalogId} onChange={e => setLinkedCatalogId(e.target.value)} className={field}>{schoolCatalog.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}</select></div>}
    <div className="grid grid-cols-3 gap-4"><div><label className="block text-sm font-medium mb-1">Đơn vị đo</label><select value={unitId} onChange={e => setUnitId(e.target.value)} className={field}>{units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div><div><label className="block text-sm font-medium mb-1">Chỉ tiêu</label><input value={target} onChange={e => setTarget(e.target.value)} className={field} /></div><div><label className="block text-sm font-medium mb-1">Chu kỳ</label><select value={cycle} onChange={e => setCycle(e.target.value)} className={field}><option>Năm học</option><option>Học kỳ</option><option>Tháng/Học kỳ</option></select></div></div>
    <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onCancel} className="btn-secondary">Hủy</button><button type="submit" className="btn-primary">{item ? 'Cập nhật' : 'Thêm mới'}</button></div>
  </form>;
}

export function IndividualCatalogForm({ item, positionCodes, units, onSubmit, onCancel }: { item: IndividualKPICatalog | null; positionCodes: string[]; units: { id: string; name: string }[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [positionCode, setPositionCode] = useState(item?.positionCode || positionCodes[0] || 'CV');
  const [unitId, setUnitId] = useState(item?.unitId || 'mu001');
  const [target, setTarget] = useState(item?.target || '');
  const [cycle, setCycle] = useState(item?.cycle || 'Năm học');
  const labels: Record<string,string> = { QL: 'Cán bộ quản lý', GV: 'Giảng viên', CV: 'Chuyên viên' };
  const handle = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ name, code, positionCode, unitId, target, cycle }); };
  return <form onSubmit={handle} className="space-y-4">
    <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">KPI cá nhân *</label><input value={name} onChange={e => setName(e.target.value)} required className={field} /></div><div><label className="block text-sm font-medium mb-1">Mã *</label><input value={code} onChange={e => setCode(e.target.value)} required className={field} /></div></div>
    <div className="grid grid-cols-3 gap-4"><div><label className="block text-sm font-medium mb-1">Nhóm đối tượng</label><select value={positionCode} onChange={e => setPositionCode(e.target.value)} className={field}>{positionCodes.map(pc => <option key={pc} value={pc}>{labels[pc] || pc}</option>)}</select></div><div><label className="block text-sm font-medium mb-1">Chỉ tiêu</label><input value={target} onChange={e => setTarget(e.target.value)} className={field} /></div><div><label className="block text-sm font-medium mb-1">Chu kỳ</label><select value={cycle} onChange={e => setCycle(e.target.value)} className={field}><option>Năm học</option><option>Học kỳ</option><option>Tháng/Học kỳ</option></select></div></div>
    <div><label className="block text-sm font-medium mb-1">Đơn vị đo</label><select value={unitId} onChange={e => setUnitId(e.target.value)} className={field}>{units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
    <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onCancel} className="btn-secondary">Hủy</button><button type="submit" className="btn-primary">{item ? 'Cập nhật' : 'Thêm mới'}</button></div>
  </form>;
}

export function GroupCatalogForm({ item, onSubmit, onCancel }: { item: KPIGroupCatalog | null; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [defaultWeight, setDefaultWeight] = useState(item?.defaultWeight ?? 10);
  const [targetLevel, setTargetLevel] = useState(item?.targetLevel || 'school');
  const handle = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ name, code, defaultWeight, targetLevel }); };
  return <form onSubmit={handle} className="space-y-4">
    <div><label className="block text-sm font-medium mb-1">Tên nhóm *</label><input value={name} onChange={e => setName(e.target.value)} required className={field} /></div>
    <div className="grid grid-cols-3 gap-4"><div><label className="block text-sm font-medium mb-1">Mã *</label><input value={code} onChange={e => setCode(e.target.value)} required className={field} /></div><div><label className="block text-sm font-medium mb-1">Trọng số mặc định *</label><input type="number" value={defaultWeight} onChange={e => setDefaultWeight(Number(e.target.value))} required className={field} /></div><div><label className="block text-sm font-medium mb-1">Cấp</label><select value={targetLevel} onChange={e => setTargetLevel(e.target.value as 'school' | 'unit' | 'individual')} className={field}><option value="school">Trường</option><option value="unit">Đơn vị</option><option value="individual">Cá nhân</option></select></div></div>
    <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onCancel} className="btn-secondary">Hủy</button><button type="submit" className="btn-primary">{item ? 'Cập nhật' : 'Thêm mới'}</button></div>
  </form>;
}
