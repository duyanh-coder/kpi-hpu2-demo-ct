'use client';

import { useState, useEffect } from 'react';
import { ClipboardCheck, Send, Save } from 'lucide-react';
import { apiGet, apiPut } from '@/lib/api';
import type { UnitWorkTask } from '@/types';

const statusMeta: Record<UnitWorkTask['status'], { label: string; cls: string }> = {
  assigned: { label: 'Đã giao', cls: 'badge-info' },
  in_progress: { label: 'Đang thực hiện', cls: 'badge-warning' },
  done: { label: 'Hoàn thành', cls: 'badge-success' },
};

export default function MyWorkPlanPage() {
  const [tasks, setTasks] = useState<UnitWorkTask[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Kế hoạch cá nhân</h1>
          <p className="text-sm text-text-light mt-1">Danh sách công việc được phân công và theo dõi kết quả thực hiện.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Công việc được giao', value: total, icon: Send, color: 'bg-primary' },
          { label: 'Đang thực hiện', value: inProgress, icon: ClipboardCheck, color: 'bg-accent-yellow' },
          { label: 'Hoàn thành', value: doneCount, icon: ClipboardCheck, color: 'bg-accent-green' },
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
        <div className="card-header">Công việc của tôi</div>
        <div className="p-0">
          {loading ? <div className="p-8 text-center text-text-light">Đang tải...</div> :
            tasks.length === 0 ? <div className="p-8 text-center text-text-light">Chưa có công việc được phân công</div> : (
            <div className="divide-y divide-border">
              {tasks.map(task => (
                <TaskRow key={task.id} task={task} onSaved={() => load()} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, onSaved }: { task: UnitWorkTask; onSaved: () => void }) {
  const [result, setResult] = useState(task.result || '');
  const [status, setStatus] = useState<UnitWorkTask['status']>(task.status);
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    setSaving(true);
    await apiPut(`/api/unit-work-plans/${task.id}`, { result, status });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex-1 min-w-[200px]">
          <p className="font-semibold text-text-dark">{task.title}</p>
          <p className="text-xs text-text-light mt-1">Nhiệm vụ gốc: {task.taskName}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
            {task.chiTieu && <span className="text-xs font-medium text-accent-green">Chỉ tiêu: {task.chiTieu}</span>}
            {task.dueDate && <span className="text-xs text-text-light">Hạn: {task.dueDate}</span>}
            <span className={`badge ${statusMeta[task.status].cls}`}>{statusMeta[task.status].label}</span>
          </div>
          {task.note && <p className="text-xs text-text-light mt-2">Ghi chú: {task.note}</p>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-text-light mb-1">Kết quả thực hiện</label>
          <input value={result} onChange={e => setResult(e.target.value)}
            placeholder="VD: 100% | 80/80 | Đã hoàn thành"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="w-[200px]">
          <label className="block text-xs font-medium text-text-light mb-1">Trạng thái</label>
          <select value={status} onChange={e => setStatus(e.target.value as UnitWorkTask['status'])}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary">
            <option value="in_progress">Đang thực hiện</option>
            <option value="done">Hoàn thành</option>
          </select>
        </div>
        <button onClick={handle} disabled={saving} className="btn-primary text-xs flex items-center gap-1">
          <Save size={13}/> {saving ? 'Đang lưu...' : 'Lưu báo cáo'}
        </button>
      </div>
    </div>
  );
}
