'use client';

import { useEffect, useMemo, useState } from 'react';
import { Send, Search, ChevronRight, ChevronDown, ClipboardList } from 'lucide-react';
import { apiGet } from '@/lib/api';
import AssignTaskModal from '@/components/forms/AssignTaskModal';
import type { KHCTTask, UnitWorkTask } from '@/types';

interface OrgUnit {
  id: string;
  name: string;
  parentId: string | null;
}

const statusMeta: Record<UnitWorkTask['status'], { label: string; cls: string }> = {
  assigned: { label: 'Đã giao', cls: 'badge-info' },
  in_progress: { label: 'Đang thực hiện', cls: 'badge-warning' },
  done: { label: 'Hoàn thành', cls: 'badge-success' },
};

export default function UnitWorkPlanPage() {
  const [tasks, setTasks] = useState<KHCTTask[]>([]);
  const [workTasks, setWorkTasks] = useState<UnitWorkTask[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [unitFilter, setUnitFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [assignTask, setAssignTask] = useState<KHCTTask | null>(null);

  const load = () => {
    apiGet<KHCTTask[]>('/api/khct').then(setTasks);
    apiGet<UnitWorkTask[]>('/api/unit-work-plans').then(setWorkTasks);
  };

  useEffect(() => {
    load();
    apiGet<OrgUnit[]>('/api/units').then(setOrgUnits);
  }, []);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    let base = tasks;
    if (unitFilter) {
      const unitName = orgUnits.find(u => u.id === unitFilter)?.name || '';
      base = base.filter(t => t.responsibleUnit === unitName);
    }
    if (kw) {
      base = base.filter(t =>
        `${t.taskName} ${t.responsibleUnit} ${t.coordinatingUnits}`.toLowerCase().includes(kw)
      );
    }
    return base;
  }, [tasks, unitFilter, keyword, orgUnits]);

  const workByTask = useMemo(() => {
    const map: Record<string, UnitWorkTask[]> = {};
    workTasks.forEach(w => {
      (map[w.khctTaskId] ||= []).push(w);
    });
    return map;
  }, [workTasks]);

  const totalJobs = workTasks.length;
  const doneJobs = workTasks.filter(w => w.status === 'done').length;

  const isOpen = (id: string) => open[id] === true;
  const toggle = (id: string) => setOpen(o => ({ ...o, [id]: !isOpen(id) }));

  const selectedUnitName = orgUnits.find(u => u.id === unitFilter)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Kế hoạch đơn vị</h1>
          <div className="mt-2">
            <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)}
              className="w-[70vw] sm:w-[45vw] lg:w-[34vw] max-w-[380px] px-3 py-2 rounded-lg border border-border bg-white text-text-dark text-sm focus:outline-none focus:border-primary">
              <option value="">Tất cả đơn vị</option>
              {orgUnits.filter(u => u.parentId !== null).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Nhiệm vụ KHCT', value: filtered.length, icon: ClipboardList, color: 'bg-primary' },
          { label: 'Công việc đã giao', value: totalJobs, icon: Send, color: 'bg-accent-yellow' },
          { label: 'Công việc hoàn thành', value: doneJobs, icon: Send, color: 'bg-accent-green' },
        ].map(x => { const Icon = x.icon; return (
          <div key={x.label} className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-text-light text-xs">{x.label}</p>
              <p className="text-2xl font-heading font-bold text-primary mt-1">{x.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${x.color}`}><Icon size={21} className="text-white"/></div>
          </div>
        ); })}
      </div>

      <div className="card">
        <div className="card-header">Danh sách nhiệm vụ{selectedUnitName ? ` — ${selectedUnitName}` : ''}</div>
        <div className="p-4">
          <div className="relative w-[70vw] sm:w-[45vw] lg:w-[34vw] max-w-[380px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light"/>
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Tìm nhiệm vụ, đơn vị..." className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm"/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-fixed min-w-[1100px]">
            <thead>
              <tr>
                <th className="w-[6%]">STT</th>
                <th className="w-[28%]">Nhiệm vụ</th>
                <th className="w-[12%]">Chủ trì</th>
                <th className="w-[12%]">Phối hợp</th>
                <th className="w-[9%]">Mã KPI</th>
                <th className="w-[16%]">Sản phẩm/KQ</th>
                <th className="w-[8%]">Thời hạn</th>
                <th className="w-[9%]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => {
                const jobs = workByTask[task.id] || [];
                const rowOpen = isOpen(task.id);
                return (
                  <TaskGroup key={task.id} task={task} jobs={jobs} open={rowOpen} onToggle={() => toggle(task.id)}
                    onAssign={() => setAssignTask(task)} />
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center text-text-light text-sm py-8">Không có nhiệm vụ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AssignTaskModal task={assignTask} orgUnits={orgUnits} isOpen={!!assignTask} onClose={() => setAssignTask(null)}
        onAssigned={() => { load(); setAssignTask(null); }} />
    </div>
  );
}

function TaskGroup({ task, jobs, open, onToggle, onAssign }: {
  task: KHCTTask;
  jobs: UnitWorkTask[];
  open: boolean;
  onToggle: () => void;
  onAssign: () => void;
}) {
  const kpiCodes = task.kpiCodes.split(';').map(c => c.trim()).filter(Boolean).filter(c => c !== '—');
  return (
    <>
      <tr className="bg-bg-cream/60 cursor-pointer hover:bg-bg-cream align-top" onClick={onToggle}>
        <td className="font-semibold">
          <span className="inline-flex items-center gap-1">
            {open ? <ChevronDown size={16} className="text-text-light shrink-0"/> : <ChevronRight size={16} className="text-text-light shrink-0"/>}
            {task.order}
          </span>
        </td>
        <td className="font-bold text-text-dark">{task.taskName}</td>
        <td className="text-sm">{task.responsibleUnit}</td>
        <td className="text-text-light text-sm">{task.coordinatingUnits}</td>
        <td className="text-xs">
          {kpiCodes.length > 0
            ? <span className="font-mono font-bold text-primary">{kpiCodes.join('; ')}</span>
            : <span className="font-medium text-accent-yellow">Riêng</span>}
        </td>
        <td className="text-text-light text-sm">{task.deliverable}</td>
        <td className="text-sm">{task.deadline}</td>
        <td>
          <button onClick={e => { e.stopPropagation(); onAssign(); }} className="btn-primary text-xs flex items-center gap-1">
            <Send size={13}/> Phân giao
          </button>
        </td>
      </tr>
      <tr className="m-0 border-0">
        <td colSpan={8} className="m-0 border-0 p-0" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease' }}>
            <div style={{ overflow: 'hidden' }}>
              {jobs.length === 0 && (
                <div className="px-4 py-2 text-xs text-text-light border-b border-border">Chưa phân giao công việc</div>
              )}
              {jobs.map((job, i) => (
                <div key={job.id} className={`flex w-full border-b border-border ${i === jobs.length - 1 ? 'border-b-2 border-border' : ''}`}>
                  <div className="w-[6%] shrink-0 px-3 py-1" />
                  <div className="w-[28%] shrink-0 px-3 py-1 pl-4 text-sm text-text-dark">{job.title}</div>
                  <div className="w-[12%] shrink-0 px-3 py-1 text-sm font-medium text-primary">{job.primaryUserName}</div>
                  <div className="w-[12%] shrink-0 px-3 py-1" />
                  <div className="w-[9%] shrink-0 px-3 py-1" />
                  <div className="w-[16%] shrink-0 px-3 py-1 text-text-light text-xs">{job.note}</div>
                  <div className="w-[8%] shrink-0 px-3 py-1 text-sm">{job.dueDate}</div>
                  <div className="w-[9%] shrink-0 px-3 py-1">
                    <span className={`badge ${statusMeta[job.status].cls}`}>{statusMeta[job.status].label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}
