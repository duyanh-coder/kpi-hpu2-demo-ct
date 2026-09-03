'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Send, Search, ChevronRight, ChevronDown } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { WORK_PLAN, type WorkPlanTask, type WorkPlanItem } from '@/data/annual-work-plan';

interface AcademicYear {
  id: string;
  name: string;
  status: string;
}

function fmtPct(v: number): string {
  return `${(v * 100).toFixed(1).replace(/\.0$/, '')}%`;
}

function fmtNum(v: number | string): string {
  return String(v);
}

export default function AnnualWorkPlanPage() {
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [selectedYearId, setSelectedYearId] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [orgUnits, setOrgUnits] = useState<{ id: string; name: string; parentId: string | null }[]>([]);

  useEffect(() => {
    apiGet<AcademicYear[]>('/api/academic-years').then(setAcademicYears);
    apiGet<{ id: string; name: string; parentId: string | null }[]>('/api/units').then(setOrgUnits);
  }, []);

  useEffect(() => {
    if (!selectedYearId && academicYears.length > 0) {
      const active = academicYears.find(a => a.status === 'active');
      setSelectedYearId(active?.id || academicYears[0].id);
    }
  }, [academicYears, selectedYearId]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const base = unitFilter ? WORK_PLAN.filter(t => t.orgUnitId === unitFilter) : WORK_PLAN;
    if (!kw) return base;
    return base
      .map(task => {
        const children = task.children.filter(c =>
          `${c.name} ${c.chuTri} ${c.phoiHop}`.toLowerCase().includes(kw)
        );
        if (`${task.name} ${task.children.map(c => `${c.name} ${c.chuTri}`).join(' ')}`.toLowerCase().includes(kw)) {
          return task;
        }
        return children.length ? { ...task, children } : null;
      })
      .filter((t): t is WorkPlanTask => t !== null);
  }, [keyword, unitFilter]);

  const totalItems = WORK_PLAN.reduce((n, t) => n + t.children.length, 0);
  const isOpen = (code: string) => open[code] !== undefined ? open[code] === true : Number(code) <= 3;
  const toggle = (code: string) => setOpen(o => ({ ...o, [code]: !isOpen(code) }));

  const selectedUnitName = orgUnits.find(u => u.id === unitFilter)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Kế hoạch công tác</h1>
          <div className="mt-2">
            <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)}
              className="w-[70vw] sm:w-[45vw] lg:w-[34vw] max-w-[380px] px-3 py-2 rounded-lg border border-border bg-white text-text-dark text-sm focus:outline-none focus:border-primary">
              <option value="">Tất cả đơn vị</option>
              {orgUnits.filter(u => u.parentId !== null).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-light">Năm học:</span>
            <div className="flex flex-wrap bg-white border border-border rounded-lg overflow-hidden">
              {academicYears.map(ay => (
                <button key={ay.id} onClick={() => setSelectedYearId(ay.id)}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${selectedYearId === ay.id ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>
                  {ay.name}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-primary text-sm flex items-center gap-2"><CalendarDays size={16}/> Lập kế hoạch</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label:'Tổng nhiệm vụ', value: WORK_PLAN.length, icon: CalendarDays, color:'bg-primary' },
          { label:'Công việc phân rã', value: totalItems, icon: Send, color:'bg-accent-yellow' },
          { label:'Đơn vị chủ trì', value: selectedUnitName || 'Phòng Đào tạo', icon: CalendarDays, color:'bg-accent-green' },
        ].map(x => { const Icon=x.icon; return <div key={x.label} className="card p-4 flex items-center justify-between"><div><p className="text-text-light text-xs">{x.label}</p><p className="text-2xl font-heading font-bold text-primary mt-1">{x.value}</p></div><div className={`p-3 rounded-lg ${x.color}`}><Icon size={21} className="text-white"/></div></div>})}
      </div>

      <div className="card">
        <div className="card-header">Danh sách nhiệm vụ</div>
        <div className="p-4">
          <div className="relative w-[70vw] sm:w-[45vw] lg:w-[34vw] max-w-[380px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light"/>
            <input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="Tìm nhiệm vụ, công việc, chủ trì..." className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm"/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-fixed min-w-[1100px]">
            <thead>
              <tr>
                <th className="w-[7%]">STT</th>
                <th className="w-[26%]">Nhiệm vụ</th>
                <th className="w-[9%]">Chủ trì</th>
                <th className="w-[11%]">Phối hợp</th>
                <th className="w-[7%]">ĐVT</th>
                <th className="w-[8%]">Chỉ tiêu KH</th>
                <th className="w-[8%]">Số liệu TT</th>
                <th className="w-[8%]">Tỷ lệ đạt</th>
                <th className="w-[7%]">Loại</th>
                <th className="w-[9%]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => (
                <TaskRows key={task.code} task={task} open={isOpen(task.code)} onToggle={() => toggle(task.code)} />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="text-center text-text-light text-sm py-8">Không tìm thấy nhiệm vụ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LoaiBadge({ loai }: { loai: 'Chung' | 'Riêng' }) {
  return (
    <span className={`badge whitespace-nowrap ${loai === 'Chung' ? 'badge-info' : 'badge-warning'}`}>{loai}</span>
  );
}

function TaskRows({ task, open, onToggle }: { task: WorkPlanTask; open: boolean; onToggle: () => void }) {
  const toNum = (v: number | string): number => {
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''));
    return Number.isNaN(n) ? 0 : n;
  };
  const totalKH = task.children.reduce((s, c) => s + toNum(c.chiTieuKH), 0);
  const totalTT = task.children.reduce((s, c) => s + toNum(c.soLieuTT), 0);
  const totalRatio = totalKH ? totalTT / totalKH : 0;
  const dvt = task.children[0]?.dvt || '';

  return (
    <>
      <tr
        className="bg-bg-cream/60 cursor-pointer hover:bg-bg-cream align-top"
        onClick={onToggle}
      >
        <td className="font-semibold">
          <span className="inline-flex items-center gap-1">
            {open ? <ChevronDown size={16} className="text-text-light shrink-0"/> : <ChevronRight size={16} className="text-text-light shrink-0"/>}
            {task.code}
          </span>
        </td>
        <td className="font-bold text-text-dark">{task.name}</td>
        <td></td>
        <td></td>
        <td className="text-sm font-semibold">{dvt}</td>
        <td className="text-sm font-semibold">{fmtNum(totalKH)}</td>
        <td className="text-sm font-semibold">{fmtNum(totalTT)}</td>
        <td className={`text-sm font-semibold ${totalRatio >= 1 ? 'text-accent-green' : totalRatio > 0 ? 'text-accent-yellow' : 'text-accent-red'}`}>{fmtPct(totalRatio)}</td>
        <td></td>
        <td>
          <button onClick={e => { e.stopPropagation(); alert(`Giao việc: ${task.code} — ${task.name}`); }} className="btn-primary text-xs flex items-center gap-1">
            <Send size={13}/> Giao việc
          </button>
        </td>
      </tr>
      <tr className="m-0 border-0">
        <td colSpan={10} className="m-0 border-0 p-0" style={{ overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateRows: open ? '1fr' : '0fr',
              transition: 'grid-template-rows 0.3s ease',
            }}
          >
            <div style={{ overflow: 'hidden' }}>
              {task.children.map((item, i) => (
                <ChildRow key={item.code} item={item} last={i === task.children.length - 1} />
              ))}
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}

function ChildRow({ item, last }: { item: WorkPlanItem; last: boolean }) {
  return (
    <div className={`flex w-full border-b border-border ${last ? 'border-b-2 border-border' : ''}`}>
      <div className="w-[7%] shrink-0 px-3 py-1 text-text-light text-sm pl-5">{item.code}</div>
      <div className="w-[26%] shrink-0 px-3 py-1 text-text-light text-sm pl-4">{item.name}</div>
      <div className="w-[9%] shrink-0 px-3 py-1 text-sm">{item.chuTri}{item.han ? <span className="text-text-light text-xs block">{item.han}</span> : null}</div>
      <div className="w-[11%] shrink-0 px-3 py-1 text-text-light text-sm">{item.phoiHop}</div>
      <div className="w-[7%] shrink-0 px-3 py-1 text-sm text-text-light">{item.dvt}</div>
      <div className="w-[8%] shrink-0 px-3 py-1 text-sm">{fmtNum(item.chiTieuKH)}</div>
      <div className="w-[8%] shrink-0 px-3 py-1 text-sm">{fmtNum(item.soLieuTT)}</div>
      <div className={`w-[8%] shrink-0 px-3 py-1 text-sm font-semibold ${item.tyLeDat >= 1 ? 'text-accent-green' : item.tyLeDat > 0 ? 'text-accent-yellow' : 'text-accent-red'}`}>{fmtPct(item.tyLeDat)}</div>
      <div className="w-[7%] shrink-0 px-3 py-1"><LoaiBadge loai={item.loai} /></div>
      <div className="w-[9%] shrink-0 px-3 py-1" />
    </div>
  );
}
