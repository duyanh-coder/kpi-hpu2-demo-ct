'use client';

import { useEffect, useMemo, useState } from 'react';
import { Send, Search, ChevronRight, ChevronDown, ClipboardList, ClipboardCheck } from 'lucide-react';
import { apiGet, apiPut } from '@/lib/api';
import AssignTaskModal from '@/components/forms/AssignTaskModal';
import Modal from '@/components/ui/Modal';
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
  const [reportJob, setReportJob] = useState<UnitWorkTask | null>(null);

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
                <th className="w-[5%]">STT</th>
                <th className="w-[24%]">Nhiệm vụ</th>
                <th className="w-[10%]">Chủ trì</th>
                <th className="w-[10%]">Phối hợp</th>
                <th className="w-[8%]">Mã KPI</th>
                <th className="w-[13%]">Chỉ tiêu</th>
                <th className="w-[14%]">Sản phẩm/KQ</th>
                <th className="w-[7%]">Thời hạn</th>
                <th className="w-[9%]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => {
                const jobs = workByTask[task.id] || [];
                const rowOpen = isOpen(task.id);
                return (
                  <TaskGroup key={task.id} task={task} jobs={jobs} open={rowOpen} onToggle={() => toggle(task.id)}
                    onAssign={() => setAssignTask(task)} onReport={setReportJob} />
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center text-text-light text-sm py-8">Không có nhiệm vụ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AssignTaskModal task={assignTask} orgUnits={orgUnits} isOpen={!!assignTask} onClose={() => setAssignTask(null)}
        onAssigned={() => { load(); setAssignTask(null); }} />

      <ReportModal job={reportJob} isOpen={!!reportJob} onClose={() => setReportJob(null)} onSaved={() => { load(); setReportJob(null); }} />
    </div>
  );
}

function TaskGroup({ task, jobs, open, onToggle, onAssign, onReport }: {
  task: KHCTTask;
  jobs: UnitWorkTask[];
  open: boolean;
  onToggle: () => void;
  onAssign: () => void;
  onReport: (job: UnitWorkTask) => void;
}) {
  const kpiCodes = task.kpiCodes.split(';').map(c => c.trim()).filter(Boolean).filter(c => c !== '—');
  const doneCount = jobs.filter(j => j.status === 'done').length;
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
        <td className="text-xs font-medium text-accent-green break-words">{task.chiTieu || '—'}</td>
        <td className="text-text-light text-sm">{task.deliverable}</td>
        <td className="text-sm">{task.deadline}</td>
        <td>
          {jobs.length > 0 && <div className="text-[10px] text-text-light">{doneCount}/{jobs.length} CV</div>}
          <button onClick={e => { e.stopPropagation(); onAssign(); }} className="btn-primary text-xs flex items-center gap-1">
            <Send size={13}/> Phân giao
          </button>
        </td>
      </tr>
      <tr className="m-0 border-0">
        <td colSpan={9} className="m-0 border-0 p-0" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease' }}>
            <div style={{ overflow: 'hidden' }}>
              {jobs.length === 0 && (
                <div className="px-4 py-2 text-xs text-text-light border-b border-border">Chưa phân giao công việc</div>
              )}
              {jobs.map((job, i) => (
                <div key={job.id} className={`flex w-full items-center border-b border-border ${i === jobs.length - 1 ? 'border-b-2 border-border' : ''}`}>
                  <div className="w-[5%] shrink-0 px-3 py-1" />
                  <div className="w-[24%] shrink-0 px-3 py-1 pl-4 text-sm text-text-dark">{job.title}</div>
                  <div className="w-[10%] shrink-0 px-3 py-1 text-sm font-medium text-primary">{job.primaryUserName}</div>
                  <div className="w-[10%] shrink-0 px-3 py-1" />
                  <div className="w-[8%] shrink-0 px-3 py-1" />
                  <div className="w-[13%] shrink-0 px-3 py-1 text-xs font-medium text-accent-green">{job.chiTieu || '—'}</div>
                  <div className="w-[14%] shrink-0 px-3 py-1 text-text-light text-xs">
                    {job.result ? <span className="text-accent-green">Kết quả: {job.result}</span> : <span>—</span>}
                  </div>
                  <div className="w-[7%] shrink-0 px-3 py-1 text-sm">{job.dueDate}</div>
                  <div className="w-[9%] shrink-0 px-3 py-1">
                    <span className={`badge ${statusMeta[job.status].cls}`}>{statusMeta[job.status].label}</span>
                    <button onClick={e => { e.stopPropagation(); onReport(job); }} className="btn-secondary text-[10px] mt-1 flex items-center gap-1">
                      <ClipboardCheck size={12}/> Báo cáo
                    </button>
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

function ReportModal({ job, isOpen, onClose, onSaved }: {
  job: UnitWorkTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [result, setResult] = useState('');
  const [status, setStatus] = useState<UnitWorkTask['status']>('in_progress');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && job) {
      setResult(job.result || '');
      setStatus(job.status && job.status !== 'done' ? job.status : 'done');
      setSaving(false);
    }
  }, [isOpen, job?.id]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setSaving(true);
    await apiPut(`/api/unit-work-plans/${job.id}`, { result, status });
    setSaving(false);
    onSaved?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Báo cáo công việc" maxWidth="max-w-lg">
      {job && (
        <form onSubmit={handle} className="space-y-4">
          <div className="p-3 bg-bg-cream rounded-lg">
            <p className="text-sm font-semibold text-text-dark">{job.title}</p>
            <p className="text-xs text-text-light mt-1">Người phụ trách: <span className="font-medium text-text-dark">{job.primaryUserName}</span></p>
            {job.chiTieu && <p className="text-xs text-accent-green mt-1">Chỉ tiêu: {job.chiTieu}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kết quả thực hiện</label>
            <input value={result} onChange={e => setResult(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" placeholder="VD: 100% | 80/80 | Đã hoàn thành" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select value={status} onChange={e => setStatus(e.target.value as UnitWorkTask['status'])} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
              <option value="in_progress">Đang thực hiện</option>
              <option value="done">Hoàn thành</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Đang lưu...' : 'Lưu báo cáo'}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
