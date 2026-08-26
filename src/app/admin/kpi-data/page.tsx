'use client';

import { useMemo, useState } from 'react';
import { Target, Building2, UserRound, Search, CalendarDays, ExternalLink } from 'lucide-react';
import indicatorSets from '@/data/kpi-indicator-sets.json';

type Tab = 'school' | 'unit' | 'individual';
const tabs = [
  { id: 'school' as Tab, label: 'Chỉ tiêu Trường', icon: Target },
  { id: 'unit' as Tab, label: 'KPI đơn vị', icon: Building2 },
  { id: 'individual' as Tab, label: 'KPI cá nhân', icon: UserRound },
];

export default function KPIDataPage() {
  const [tab, setTab] = useState<Tab>('school');
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState('all');

  const rows = useMemo(() => {
    const source = indicatorSets[tab] as any[];
    const q = query.trim().toLowerCase();
    return source.filter(row => {
      const text = Object.values(row).flatMap(v => Array.isArray(v) ? v : [v]).join(' ').toLowerCase();
      const matchText = !q || text.includes(q);
      const matchPosition = tab !== 'individual' || position === 'all' || row.position === position;
      return matchText && matchPosition;
    });
  }, [tab, query, position]);

  const individualPositions = [...new Set((indicatorSets.individual as any[]).map(x => x.position))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-dark">Bộ chỉ tiêu KPI</h1>
        <p className="text-text-light mt-1">
          Bộ chỉ tiêu được tổng hợp từ các nhiệm vụ trong Kế hoạch công tác năm học và phân theo cấp Trường, đơn vị, cá nhân.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          const count = (indicatorSets[t.id] as any[]).length;
          return <button key={t.id} onClick={() => { setTab(t.id); setQuery(''); }}
            className={`flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${active ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-dark'}`}>
            <Icon size={16}/>{t.label}<span className="badge badge-info">{count}</span>
          </button>;
        })}
      </div>

      <div className="card">
        <div className="card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-white">{tabs.find(t => t.id === tab)?.label}</h3>
            <p className="text-white/80 text-xs mt-1">Mỗi dòng có liên kết ngược tới nhiệm vụ nguồn trong Kế hoạch công tác năm.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {tab === 'individual' && <select value={position} onChange={e => setPosition(e.target.value)} className="px-3 py-2 rounded-lg border text-sm bg-white text-text-dark">
              <option value="all">Tất cả đối tượng</option>
              {individualPositions.map(p => <option key={p}>{p}</option>)}
            </select>}
            <div className="relative flex-1 sm:w-72"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm chỉ tiêu, nhiệm vụ..." className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm bg-white text-text-dark"/></div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table min-w-[900px]">
            <thead><tr>
              <th>Mã</th><th>Chỉ tiêu / KPI</th>
              {tab === 'school' ? <><th>Đơn vị chủ trì</th><th>Mã KPI liên quan</th></> : tab === 'unit' ? <><th>Đối tượng áp dụng</th><th>KPI nguồn</th></> : <><th>Đối tượng</th><th>KPI nguồn</th></>}
              <th>Sản phẩm / Kết quả</th><th>Thời hạn</th><th>Nguồn</th>
            </tr></thead>
            <tbody>
              {rows.map((row: any) => <tr key={row.id}>
                <td><span className="font-semibold text-primary">{row.code}</span></td>
                <td><div className="font-medium">{row.task}</div>{row.sourceTaskNo && <div className="text-xs text-text-light mt-1">Phân rã từ nhiệm vụ #{row.sourceTaskNo}</div>}{row.taskNo && <div className="text-xs text-text-light mt-1">Nhiệm vụ #{row.taskNo}</div>}</td>
                {tab === 'school' ? <><td>{row.owner}</td><td>{row.kpiCodes?.join('; ')}</td></> : tab === 'unit' ? <><td>{row.ownerType}</td><td>{row.kpiCode}</td></> : <><td>{row.position}</td><td>{row.kpiCode}</td></>}
                <td>{row.result}</td>
                <td><span className="inline-flex items-center gap-1 text-sm"><CalendarDays size={14}/>{row.deadline}</span></td>
                <td><span className="inline-flex items-center gap-1 text-xs text-text-light"><ExternalLink size={13}/>Kế hoạch công tác</span></td>
              </tr>)}
              {rows.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-text-light">Không tìm thấy dữ liệu phù hợp.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
