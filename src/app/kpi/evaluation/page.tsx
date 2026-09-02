'use client';

import { useMemo, useState } from 'react';
import { Search, ChevronRight, ChevronDown, Award, CheckCircle, AlertTriangle, Paperclip } from 'lucide-react';
import { KPI_EVALUATION, type EvaluationTask, type EvaluationSubTask } from '@/data/kpi-evaluation';

function fmtPct(v: number | string): string {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (Number.isNaN(n)) return String(v);
  return `${(n * 100).toFixed(1).replace(/\.0$/, '')}%`;
}

function fmtNum(v: number | string): string {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (Number.isNaN(n)) return String(v);
  return String(n);
}

function StatusBadge({ status }: { status: string }) {
  const ok = ['ĐẠT', 'HOÀN THÀNH'].includes(status);
  return (
    <span className={`badge ${ok ? 'badge-success' : 'badge-danger'} whitespace-nowrap`}>
      {ok ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
      {status}
    </span>
  );
}

export default function EvaluationPage() {
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return KPI_EVALUATION;
    return KPI_EVALUATION
      .map(task => {
        const children = task.children.filter(c =>
          `${c.code} ${c.name} ${c.responsible} ${c.kpiCode}`.toLowerCase().includes(kw)
        );
        if (`${task.code} ${task.name} ${task.responsible} ${task.kpiCode}`.toLowerCase().includes(kw)) {
          return task;
        }
        return children.length ? { ...task, children } : null;
      })
      .filter((t): t is EvaluationTask => t !== null);
  }, [keyword]);

  const totalSubtasks = KPI_EVALUATION.reduce((n, t) => n + t.children.length, 0);
  const achieved = KPI_EVALUATION.filter(t => t.status === 'ĐẠT').length;
  const notAchieved = KPI_EVALUATION.length - achieved;

  const isOpen = (code: string) => open[code] !== undefined ? open[code] === true : Number(code) <= 3;
  const toggle = (code: string) => setOpen(o => ({ ...o, [code]: !isOpen(code) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Đánh giá KPI</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng nhiệm vụ', value: KPI_EVALUATION.length, icon: Award, color: 'bg-primary' },
          { label: 'Công việc phân rã', value: totalSubtasks, icon: CheckCircle, color: 'bg-accent-yellow' },
          { label: 'Đạt', value: achieved, icon: CheckCircle, color: 'bg-accent-green' },
          { label: 'Chưa đạt', value: notAchieved, icon: AlertTriangle, color: 'bg-accent-red' },
        ].map(x => {
          const Icon = x.icon;
          return (
            <div key={x.label} className="card p-4 flex items-center justify-between">
              <div>
                <p className="text-text-light text-xs">{x.label}</p>
                <p className="text-2xl font-heading font-bold text-primary mt-1">{x.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${x.color}`}><Icon size={21} className="text-white" /></div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">Bảng đánh giá và phân rã KPI tháng 8/2026</div>
        <div className="p-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
            <input value={keyword} onChange={e => setKeyword(e.target.value)}
              placeholder="Tìm nhiệm vụ, công việc, phân hệ, mã KPI..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-auto w-full">
            <thead>
              <tr>
                <th>STT</th>
                <th>Nhiệm vụ chính / Công việc</th>
                <th>Phân hệ / Trách nhiệm</th>
                <th>Mã KPI</th>
                <th>Nội dung chỉ số KPI chính thức</th>
                <th>ĐVT</th>
                <th>Chỉ tiêu KH</th>
                <th>Số liệu TT</th>
                <th>Tỷ lệ đạt</th>
                <th>Trạng thái</th>
                <th>Hồ sơ minh chứng / Sản phẩm</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => (
                <TaskRows key={task.code} task={task} open={isOpen(task.code)} onToggle={() => toggle(task.code)} />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="text-center text-text-light text-sm py-8">Không tìm thấy nhiệm vụ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TaskRows({ task, open, onToggle }: { task: EvaluationTask; open: boolean; onToggle: () => void }) {
  return (
    <>
      <tr className="bg-bg-cream/60 cursor-pointer hover:bg-bg-cream align-top" onClick={onToggle}>
        <td className="font-semibold">
          <span className="inline-flex items-center gap-1">
            {open ? <ChevronDown size={16} className="text-text-light shrink-0" /> : <ChevronRight size={16} className="text-text-light shrink-0" />}
            {task.code}
          </span>
        </td>
        <td className="font-bold text-text-dark">{task.name}</td>
        <td className="font-medium text-sm">{task.responsible}</td>
        <td><span className="badge badge-info whitespace-nowrap">{task.kpiCode}</span></td>
        <td className="text-sm text-text-dark leading-snug">{task.kpiName}</td>
        <td className="text-sm">{task.unit}</td>
        <td className="text-sm">{fmtNum(task.target)}</td>
        <td className="text-sm">{fmtNum(task.actual)}</td>
        <td className="font-semibold text-sm">{fmtPct(task.ratio)}</td>
        <td><StatusBadge status={task.status} /></td>
        <td className="text-sm text-text-light leading-snug">{task.evidence}</td>
      </tr>
      {open && task.children.map((item, i) => (
        <ChildRow key={item.code} item={item} last={i === task.children.length - 1} />
      ))}
    </>
  );
}

function ChildRow({ item, last }: { item: EvaluationSubTask; last: boolean }) {
  return (
    <tr className={`bg-white align-top [&>td]:py-1.5 ${last ? 'border-b-2 border-border' : ''}`}>
      <td className="text-text-light text-sm pl-5">{item.code}</td>
      <td className="text-text-light text-sm pl-7">{item.name}</td>
      <td className="text-sm text-text-light">{item.responsible}</td>
      <td><span className="whitespace-nowrap text-xs text-text-light">{item.kpiCode}</span></td>
      <td className="text-xs text-text-light leading-snug">{item.kpiName}</td>
      <td className="text-sm text-text-light">{item.unit}</td>
      <td className="text-sm text-text-light">{fmtNum(item.target)}</td>
      <td className="text-sm text-text-light">{fmtNum(item.actual)}</td>
      <td className="text-sm text-text-light">{fmtPct(item.ratio)}</td>
      <td><StatusBadge status={item.status} /></td>
      <td className="text-xs text-text-light leading-snug">
        <span className="inline-flex items-start gap-1"><Paperclip size={12} className="mt-0.5 shrink-0" />{item.evidence}</span>
      </td>
    </tr>
  );
}
