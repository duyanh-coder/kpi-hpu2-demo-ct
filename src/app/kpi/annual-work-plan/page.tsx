'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Send, Search, ChevronRight, ChevronDown } from 'lucide-react';
import { WORK_PLAN, type WorkPlanTask } from '@/data/annual-work-plan';

export default function AnnualWorkPlanPage() {
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return WORK_PLAN;
    return WORK_PLAN
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
  }, [keyword]);

  const totalItems = WORK_PLAN.reduce((n, t) => n + t.children.length, 0);
  const isOpen = (code: string) => open[code] !== undefined ? open[code] === true : Number(code) <= 3;
  const toggle = (code: string) => setOpen(o => ({ ...o, [code]: !isOpen(code) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Kế hoạch công tác</h1>
        </div>
        <button className="btn-primary text-sm flex items-center gap-2"><CalendarDays size={16}/> Lập kế hoạch</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label:'Tổng nhiệm vụ', value: WORK_PLAN.length, icon: CalendarDays, color:'bg-primary' },
          { label:'Công việc phân rã', value: totalItems, icon: Send, color:'bg-accent-yellow' },
          { label:'Đơn vị chủ trì', value: 'Phòng Đào tạo', icon: CalendarDays, color:'bg-accent-green' },
        ].map(x => { const Icon=x.icon; return <div key={x.label} className="card p-4 flex items-center justify-between"><div><p className="text-text-light text-xs">{x.label}</p><p className="text-2xl font-heading font-bold text-primary mt-1">{x.value}</p></div><div className={`p-3 rounded-lg ${x.color}`}><Icon size={21} className="text-white"/></div></div>})}
      </div>

      <div className="card">
        <div className="card-header">Danh sách nhiệm vụ</div>
        <div className="p-4">
          <div className="relative max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light"/><input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="Tìm nhiệm vụ, công việc, chủ trì..." className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm"/></div>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-fixed min-w-[820px]">
            <thead>
              <tr>
                <th className="w-[9%]">STT</th>
                <th className="w-[49%]">Nhiệm vụ</th>
                <th className="w-[13%]">Chủ trì</th>
                <th className="w-[17%]">Phối hợp</th>
                <th className="w-[12%]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => (
                <TaskRows key={task.code} task={task} open={isOpen(task.code)} onToggle={() => toggle(task.code)} />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center text-text-light text-sm py-8">Không tìm thấy nhiệm vụ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TaskRows({ task, open, onToggle }: { task: WorkPlanTask; open: boolean; onToggle: () => void }) {
  return (
    <>
      <tr className="bg-bg-cream/60 cursor-pointer hover:bg-bg-cream" onClick={onToggle}>
        <td className="font-semibold">
          <span className="inline-flex items-center gap-1">
            {open ? <ChevronDown size={16} className="text-text-light shrink-0"/> : <ChevronRight size={16} className="text-text-light shrink-0"/>}
            {task.code}
          </span>
        </td>
        <td className="font-bold text-text-dark">{task.name}</td>
        <td></td>
        <td></td>
        <td>
          <button onClick={e => { e.stopPropagation(); alert(`Giao việc: ${task.code} — ${task.name}`); }} className="btn-primary text-xs flex items-center gap-1">
            <Send size={13}/> Giao việc
          </button>
        </td>
      </tr>
      {open && task.children.map((item, i) => (
        <tr key={item.code} className={`bg-white [&>td]:py-1 ${i === task.children.length - 1 ? 'border-b-2 border-border' : ''}`}>
          <td className="text-text-light text-sm pl-5">{item.code}</td>
          <td className="text-text-light text-sm pl-9">{item.name}</td>
          <td className="text-sm">{item.chuTri}{item.han ? <span className="text-text-light text-xs block">{item.han}</span> : null}</td>
          <td className="text-text-light text-sm">{item.phoiHop}</td>
          <td></td>
        </tr>
      ))}
    </>
  );
}
