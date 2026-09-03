'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Search, ChevronRight, ChevronDown, Award, CheckCircle, AlertTriangle, Paperclip, Eye } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { KPI_EVALUATION, type EvaluationTask, type EvaluationSubTask } from '@/data/kpi-evaluation';
import unitsData from '@/data/units.json';
import academicYears from '@/data/academic-years.json';

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
  const [unitFilter, setUnitFilter] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<EvaluationTask | null>(null);
  const [selectedYearId, setSelectedYearId] = useState(academicYears[0]?.id || '');

  const responsibleToUnit: Record<string, string> = {
    'Quản lý chương trình đào tạo': 'u101',
    'Quản lý kết quả học tập': 'u101',
    'Quản lý xét tốt nghiệp': 'u101',
    'Quản lý xếp thời khóa biểu': 'u101',
    'Tiếp nhận sinh viên nhập học': 'u107',
  };
  const unitIdMap = (row: { responsible: string }) =>
    responsibleToUnit[row.responsible] ?? '';

  const unitOptions = useMemo(
    () =>
      (unitsData as { id: string; name: string; parentId: string | null }[])
        .filter(u => u.parentId !== null)
        .map(u => ({ id: u.id, name: u.name })),
    [],
  );

  const selectedUnitName =
    unitOptions.find(u => u.id === unitFilter)?.name || '';

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return KPI_EVALUATION
      .map(task => {
        let children = task.children;
        if (unitFilter) {
          children = children.filter(c => unitIdMap(c) === unitFilter);
        }
        if (kw) {
          children = children.filter(c =>
            `${c.code} ${c.name} ${c.responsible} ${c.kpiCode}`.toLowerCase().includes(kw)
          );
        }
        const taskMatch =
          (unitFilter ? unitIdMap(task) === unitFilter : true) &&
          (!kw || `${task.code} ${task.name} ${task.responsible} ${task.kpiCode}`.toLowerCase().includes(kw));
        if (taskMatch) return task;
        return children.length ? { ...task, children } : null;
      })
      .filter((t): t is EvaluationTask => t !== null);
  }, [keyword, unitFilter]);

  const totalSubtasks = KPI_EVALUATION.reduce((n, t) => n + t.children.length, 0);

  const allRecords = [
    ...KPI_EVALUATION.map(({ children, ...task }) => task),
    ...KPI_EVALUATION.flatMap(t => t.children),
  ];
  const achieved = allRecords.filter(r =>
    ['ĐẠT', 'HOÀN THÀNH'].includes(r.status),
  ).length;
  const notAchieved = allRecords.length - achieved;

  const isOpen = (code: string) => open[code] !== undefined ? open[code] === true : Number(code) <= 3;
  const toggle = (code: string) => setOpen(o => ({ ...o, [code]: !isOpen(code) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Đánh giá KPI</h1>
          <div className="mt-2">
            <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)}
              className="w-[70vw] sm:w-[45vw] lg:w-[34vw] max-w-[380px] px-3 py-2 rounded-lg border border-border bg-white text-text-dark text-sm focus:outline-none focus:border-primary">
              <option value="">Tất cả đơn vị</option>
              {unitOptions.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>
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
        <div className="card-header">Bảng đánh giá và phân rã KPI{selectedUnitName ? ` - ${selectedUnitName}` : ''}</div>
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
                <TaskRows key={task.code} task={task} open={isOpen(task.code)} onToggle={() => toggle(task.code)} onDetail={() => setSelectedTask(task)} />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="text-center text-text-light text-sm py-8">Không có số liệu đánh giá</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EvaluationDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}

function TaskRows({ task, open, onToggle, onDetail }: { task: EvaluationTask; open: boolean; onToggle: () => void; onDetail: () => void }) {
  return (
    <>
      <tr className="bg-bg-cream/60 cursor-pointer hover:bg-bg-cream align-middle" onClick={onToggle}>
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
        <td className="text-center">
          <div className="flex justify-center items-center w-full">
            <button
              onClick={e => { e.stopPropagation(); onDetail(); }}
              title="Xem chi tiết"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-primary hover:bg-primary hover:text-white transition-colors text-xs font-medium"
            >
              <Eye size={14} /> Chi tiết
            </button>
          </div>
        </td>
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

function DetailLabel({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-text-light mb-0.5">{label}</div>
      <div className="text-sm text-text-dark leading-snug">{value}</div>
    </div>
  );
}

function EvaluationDetailModal({ task, onClose }: { task: EvaluationTask | null; onClose: () => void }) {
  if (!task) return null;
  return (
    <Modal isOpen={!!task} onClose={onClose} title={`Chi tiết nhiệm vụ ${task.code}`} maxWidth="max-w-3xl">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailLabel label="Mã nhiệm vụ" value={<span className="badge badge-info">{task.code}</span>} />
          <DetailLabel label="Mã KPI" value={<span className="badge badge-info">{task.kpiCode}</span>} />
          <DetailLabel label="Phân hệ / Trách nhiệm" value={task.responsible} />
          <DetailLabel label="Trạng thái" value={<StatusBadge status={task.status} />} />
        </div>
        <DetailLabel label="Nhiệm vụ chính" value={task.name} />
        <DetailLabel label="Nội dung chỉ số KPI chính thức" value={task.kpiName} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <DetailLabel label="ĐVT" value={task.unit} />
          <DetailLabel label="Chỉ tiêu KH" value={fmtNum(task.target)} />
          <DetailLabel label="Số liệu TT" value={fmtNum(task.actual)} />
          <DetailLabel label="Tỷ lệ đạt" value={<span className="font-semibold">{fmtPct(task.ratio)}</span>} />
        </div>
        <DetailLabel label="Hồ sơ minh chứng / Sản phẩm" value={task.evidence} />

        {task.children.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wide text-text-light mb-2">Công việc phân rã ({task.children.length})</div>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="table table-auto w-full text-sm">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Công việc</th>
                    <th>Trách nhiệm</th>
                    <th>Chỉ tiêu KH</th>
                    <th>Số liệu TT</th>
                    <th>Tỷ lệ</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {task.children.map(item => (
                    <tr key={item.code}>
                      <td className="text-xs text-text-light">{item.code}</td>
                      <td className="text-xs text-text-dark">{item.name}</td>
                      <td className="text-xs text-text-light">{item.responsible}</td>
                      <td className="text-xs text-right font-mono">{fmtNum(item.target)}</td>
                      <td className="text-xs text-right font-mono">{fmtNum(item.actual)}</td>
                      <td className="text-xs text-right font-mono">{fmtPct(item.ratio)}</td>
                      <td className="text-center"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
