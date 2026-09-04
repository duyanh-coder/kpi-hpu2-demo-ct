'use client';

import { useState, useEffect, useMemo } from 'react';
import { Send, ClipboardCheck, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { apiGet, apiPut } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import type { UnitWorkTask } from '@/types';

const statusMeta: Record<UnitWorkTask['status'], { label: string; cls: string }> = {
  assigned: { label: 'Đã giao', cls: 'badge-info' },
  in_progress: { label: 'Đang thực hiện', cls: 'badge-warning' },
  done: { label: 'Hoàn thành', cls: 'badge-success' },
};

const progressByStatus: Record<UnitWorkTask['status'], number> = {
  assigned: 10,
  in_progress: 70,
  done: 100,
};

const statusOrder: Array<UnitWorkTask['status'] | 'all'> = ['all', 'assigned', 'in_progress', 'done'];

function parseDueDate(value: string): Date {
  const [d, m, y] = value.split('/').map(Number);
  return new Date(y, m - 1, d);
}

function isOverdue(task: UnitWorkTask): boolean {
  if (task.status === 'done' || !task.dueDate) return false;
  return parseDueDate(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
}

function progressColor(pct: number): string {
  if (pct >= 80) return '#4caf50';
  if (pct >= 40) return '#ffc107';
  return '#9e9e9e';
}

export default function MyWorkPlanPage() {
  const [tasks, setTasks] = useState<UnitWorkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<UnitWorkTask['status'] | 'all'>('all');
  const [reportJob, setReportJob] = useState<UnitWorkTask | null>(null);

  const load = async () => {
    const data = await apiGet<UnitWorkTask[]>('/api/unit-work-plans');
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const total = tasks.length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const overdueCount = tasks.filter(isOverdue).length;

  const filtered = useMemo(
    () => (filter === 'all' ? tasks : tasks.filter(t => t.status === filter)),
    [tasks, filter],
  );

  const filterTabs: Array<{ key: UnitWorkTask['status'] | 'all'; label: string }> = [
    { key: 'all', label: `Tất cả (${total})` },
    { key: 'assigned', label: `Đã giao (${tasks.filter(t => t.status === 'assigned').length})` },
    { key: 'in_progress', label: `Đang thực hiện (${inProgress})` },
    { key: 'done', label: `Hoàn thành (${doneCount})` },
  ];

  const stats = [
    { label: 'Công việc được giao', value: total, icon: Send, color: 'bg-primary' },
    { label: 'Đang thực hiện', value: inProgress, icon: ClipboardCheck, color: 'bg-accent-yellow' },
    { label: 'Hoàn thành', value: doneCount, icon: CheckCircle, color: 'bg-accent-green' },
    { label: 'Quá hạn', value: overdueCount, icon: AlertTriangle, color: 'bg-accent-red' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Kế hoạch cá nhân</h1>
          <p className="text-sm text-text-light mt-1">Danh sách công việc được phân công, theo dõi tiến độ và báo cáo kết quả.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(x => { const Icon = x.icon; return (
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
        <div className="card-header">Công việc của tôi</div>

        <div className="p-4 flex flex-wrap gap-2">
          {filterTabs.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === t.key ? 'bg-primary text-white' : 'bg-bg-cream text-text-dark hover:bg-primary-light'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="table table-fixed min-w-[1000px]">
            <thead>
              <tr>
                <th className="w-[26%]">Công việc</th>
                <th className="w-[12%]">Chỉ tiêu</th>
                <th className="w-[9%]">Hạn</th>
                <th className="w-[16%]">Tiến độ</th>
                <th className="w-[14%]">Kết quả</th>
                <th className="w-[10%]">Trạng thái</th>
                <th className="w-[9%]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => {
                const pct = progressByStatus[task.status];
                const overdue = isOverdue(task);
                return (
                  <tr key={task.id} className="align-top">
                    <td>
                      <p className="font-semibold text-text-dark">{task.title}</p>
                      <p className="text-xs text-text-light mt-0.5 line-clamp-2" title={task.taskName}>{task.taskName}</p>
                      {task.note && <p className="text-xs text-text-light mt-0.5 italic">Ghi chú: {task.note}</p>}
                    </td>
                    <td className="text-xs font-medium text-accent-green">{task.chiTieu || '—'}</td>
                    <td className={`text-sm ${overdue ? 'text-accent-red font-semibold' : ''}`}>
                      {task.dueDate || '—'}
                      {overdue && <span className="block text-[10px] text-accent-red">Quá hạn</span>}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar flex-1">
                          <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: progressColor(pct) }} />
                        </div>
                        <span className="text-xs font-mono font-bold">{pct}%</span>
                      </div>
                    </td>
                    <td className="text-sm text-text-dark">{task.result || <span className="text-text-light">—</span>}</td>
                    <td><span className={`badge ${statusMeta[task.status].cls}`}>{statusMeta[task.status].label}</span></td>
                    <td>
                      <button onClick={() => setReportJob(task)} className="btn-secondary text-xs flex items-center gap-1">
                        <ClipboardCheck size={13}/> Báo cáo
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-text-light text-sm py-8">Không có công việc nào</td></tr>
              )}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center text-text-light">Đang tải...</div>}
        </div>
      </div>

      <ReportModal job={reportJob} isOpen={!!reportJob} onClose={() => setReportJob(null)}
        onSaved={() => { load(); setReportJob(null); }} />
    </div>
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
            {job.dueDate && <p className="text-xs text-text-light mt-1">Hạn hoàn thành: {job.dueDate}</p>}
            {job.note && <p className="text-xs text-text-light mt-1">Ghi chú: {job.note}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kết quả thực hiện</label>
            <input value={result} onChange={e => setResult(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
              placeholder="VD: 100% | 80/80 | Đã hoàn thành" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select value={status} onChange={e => setStatus(e.target.value as UnitWorkTask['status'])}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
              <option value="in_progress">Đang thực hiện</option>
              <option value="done">Hoàn thành</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1">
              <Save size={14}/> {saving ? 'Đang lưu...' : 'Lưu báo cáo'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
