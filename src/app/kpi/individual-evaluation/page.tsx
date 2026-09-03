'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle, ClipboardList, UserRound, CalendarDays, Target, Save, FilePlus2, AlertTriangle, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { WORK_PLAN, type WorkPlanItem } from '@/data/annual-work-plan';
import usersData from '@/data/users.json';
import unitsData from '@/data/units.json';

interface IndividualEvaluation {
  id: string;
  unitId: string;
  unitName: string;
  cycleName: string;
  level?: string;
  personId?: string;
  personName?: string;
  positionCode?: string;
  personUnitId?: string;
  selfScore: number | null;
  selfComment: string;
  managerScore: number | null;
  managerComment: string;
  councilScore: number | null;
  councilComment: string;
  finalScore: number | null;
  grade: string | null;
  status: string;
  selfEvaluatedAt?: string;
  managerReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const CYCLE_NAME = 'Năm học 2026-2027';
const UNIT_ID = 'u101';

const staffMap: Record<string, string> = {};
(usersData as { id: string; fullName: string; unitId: string }[]).forEach(u => { staffMap[u.id] = u.fullName; });

const assignment: Record<string, string> = {
  'ĐT-01.1': 'u003',
  'ĐT-01.2': 'u007',
  'ĐT-01.3': 'u008',
  'ĐT-01.4': 'u003',
};

function gradeFor(score: number | null): string | null {
  if (score === null) return null;
  if (score >= 90) return 'Xuất sắc';
  if (score >= 80) return 'Tốt';
  if (score >= 70) return 'Đạt';
  return 'Cần cải thiện';
}

function computeFinal(self: number | null, manager: number | null): number | null {
  if (self === null && manager === null) return null;
  if (self !== null && manager !== null) return Math.round((self + manager) / 2);
  return self !== null ? self : manager;
}

export default function IndividualEvaluationPage() {
  const task = WORK_PLAN[0];
  const [evals, setEvals] = useState<IndividualEvaluation[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [initStatus, setInitStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [openIntro, setOpenIntro] = useState(true);

  const load = useCallback(async () => {
    try {
      const all = await apiGet<IndividualEvaluation[]>('/api/evaluation/individual');
      const filtered = all.filter(e =>
        (e.unitId === UNIT_ID || e.personUnitId === UNIT_ID) && e.cycleName === CYCLE_NAME
      );
      setEvals(filtered);
      setSubmitted(filtered.some(e => e.finalScore !== null));
    } catch { /* empty */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => {
    return task?.children.map(item => {
      const personId = assignment[item.code] || '';
      const rec = evals.find(e => e.personId === personId && e.cycleName === CYCLE_NAME) || null;
      return { item, personId, personName: staffMap[personId] || '—', rec };
    }) || [];
  }, [task, evals]);

  const assignedCount = useMemo(() => new Set(Object.values(assignment)).size, []);
  const evaluated = rows.filter(r => r.rec && (r.rec.selfScore !== null || r.rec.managerScore !== null)).length;

  const handleInit = async () => {
    setInitStatus('loading');
    try {
      const seen = new Set<string>();
      for (const r of rows) {
        if (!r.personId || seen.has(r.personId)) continue;
        seen.add(r.personId);
        await apiPost('/api/evaluation/individual', {
          personId: r.personId,
          personName: r.personName,
          unitId: UNIT_ID,
          unitName: 'Phòng Đào tạo',
          personUnitId: UNIT_ID,
          cycleName: CYCLE_NAME,
          positionCode: 'CV',
        });
      }
      setInitStatus('done');
      await load();
    } catch {
      setInitStatus('error');
    }
  };

  const saveScores = async (r: { rec: IndividualEvaluation | null; personId: string }) => {
    if (!r.rec) return;
    const finalScore = computeFinal(r.rec.selfScore, r.rec.managerScore);
    const grade = gradeFor(finalScore);
    const next: Record<string, unknown> = {
      selfScore: r.rec.selfScore,
      selfComment: r.rec.selfComment,
      managerScore: r.rec.managerScore,
      managerComment: r.rec.managerComment,
      finalScore,
      grade,
      status: 'manager_review',
    };
    if (!r.rec.selfEvaluatedAt && r.rec.selfScore !== null) next.selfEvaluatedAt = new Date().toISOString();
    if (r.rec.managerScore !== null) next.managerReviewedAt = new Date().toISOString();
    await apiPut(`/api/evaluation/individual/${r.rec.id}`, next);
    await load();
  };

  const updateRec = (id: string, field: 'selfScore' | 'selfComment' | 'managerScore' | 'managerComment', value: string | number) => {
    setEvals(prev => prev.map(e => {
      if (e.id !== id) return e;
      if (field === 'selfScore' || field === 'managerScore') {
        const n = value === '' ? null : Number(value);
        return { ...e, [field]: n };
      }
      return { ...e, [field]: String(value) };
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-dark">Đánh giá cá nhân</h1>
        <p className="text-sm text-text-light mt-1">Đánh giá mức độ hoàn thành của cá nhân theo nhiệm vụ Kế hoạch công tác.</p>
      </div>

      {task && (
        <section className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
          <button onClick={() => setOpenIntro(o => !o)}
            className="w-full bg-primary px-5 py-4 text-white flex items-center gap-3 text-left">
            <ClipboardList size={20} />
            <div className="flex-1">
              <div className="text-white/75 text-xs uppercase tracking-wide">Nhiệm vụ STT {task.code} · Kế hoạch công tác</div>
              <div className="font-semibold leading-snug">{task.name}</div>
            </div>
            {openIntro ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {openIntro && (
            <div className="p-4 border-t border-border grid sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2"><Building2 size={16} className="text-primary" /> <span className="text-text-light">Đơn vị:</span> <b>{unitsData.find(u => u.id === UNIT_ID)?.name || 'Phòng Đào tạo'}</b></div>
              <div className="flex items-center gap-2"><UserRound size={16} className="text-primary" /> <span className="text-text-light">Cá nhân phụ trách:</span> <b>{assignedCount} người</b></div>
              <div className="flex items-center gap-2"><Target size={16} className="text-accent-yellow" /> <span className="text-text-light">Công việc con:</span> <b>{task.children.length}</b></div>
            </div>
          )}
        </section>
      )}

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <div className="text-sm text-text-light">Trạng thái đánh giá</div>
          <div className="text-lg font-heading font-bold text-primary">{evaluated}/{rows.length} khởi tạo</div>
        </div>
        {submitted && (
          <div className="flex items-center gap-2 text-accent-green text-sm">
            <CheckCircle size={16} /> Đã có bản ghi đánh giá
          </div>
        )}
        <button onClick={handleInit} disabled={initStatus === 'loading'}
          className="btn-primary text-sm flex items-center gap-2">
          <FilePlus2 size={16} />
          {initStatus === 'loading' ? 'Đang khởi tạo...' : 'Khởi tạo đánh giá'}
        </button>
        {initStatus === 'done' && <span className="text-sm text-accent-green">Đã khởi tạo bản ghi cho cá nhân được giao</span>}
        {initStatus === 'error' && <span className="text-sm text-accent-red flex items-center gap-1"><AlertTriangle size={14} /> Có lỗi</span>}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-white">Đánh giá mức độ hoàn thành — Nhiệm vụ STT {task?.code}</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="table min-w-[1180px]">
            <thead>
              <tr>
                <th className="w-20">Công việc</th>
                <th className="w-56">Nội dung công việc</th>
                <th>Người phụ trách</th>
                <th className="w-28">Hạn</th>
                <th className="w-32">Tự chấm (self)</th>
                <th className="w-32">Quản lý chấm</th>
                <th className="w-24">Kết quả</th>
                <th className="w-28">Xếp loại</th>
                <th className="w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.item.code}>
                  <td className="text-primary font-medium">{r.item.code}</td>
                  <td>
                    <div className="font-medium">{r.item.name}</div>
                    <div className="text-xs text-text-light mt-0.5">Chỉ tiêu: {r.item.chiTieuKH} {r.item.dvt} · Phối hợp: {r.item.phoiHop}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-primary/10 text-primary"><UserRound size={15} /></span>
                      <div>
                        <div className="font-medium">{r.personName}</div>
                        <div className="text-xs text-text-light">{r.personId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm"><div className="flex items-center gap-1"><CalendarDays size={14} className="text-text-light" /> {r.item.han}</div></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <input type="number" min={0} max={100} value={r.rec?.selfScore ?? ''} placeholder="0-100"
                        onChange={e => r.rec && updateRec(r.rec.id, 'selfScore', e.target.value)}
                        className="w-20 px-2 py-1 border border-border rounded text-sm text-center" />
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <input type="number" min={0} max={100} value={r.rec?.managerScore ?? ''} placeholder="0-100"
                        onChange={e => r.rec && updateRec(r.rec.id, 'managerScore', e.target.value)}
                        className="w-20 px-2 py-1 border border-border rounded text-sm text-center" />
                    </div>
                  </td>
                  <td className="text-center font-heading font-bold text-primary">
                    {r.rec?.finalScore ?? '—'}
                  </td>
                  <td>
                    {r.rec?.grade ? (
                      <span className={`badge ${r.rec.grade === 'Xuất sắc' ? 'badge-success' : r.rec.grade === 'Tốt' || r.rec.grade === 'Đạt' ? 'badge-info' : 'badge-warning'}`}>{r.rec.grade}</span>
                    ) : <span className="text-text-light text-sm">—</span>}
                  </td>
                  <td>
                    <button onClick={() => saveScores(r)} disabled={!r.rec}
                      className="btn-primary text-xs flex items-center gap-1 disabled:opacity-40">
                      <Save size={13} /> Lưu
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={9} className="text-center text-text-light py-8">Không có công việc nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4 text-sm">
        <div className="font-semibold text-primary">Ghi chú cách tính</div>
        <ul className="mt-2 text-text-light space-y-1 list-disc list-inside">
          <li>Điểm từ 0–100 thể hiện mức độ hoàn thành công việc.</li>
          <li>Kết quả = trung bình (tự chấm + quản lý chấm) nếu cả hai đã nhập; ngược lại lấy điểm đã có.</li>
          <li>Xếp loại: ≥90 Xuất sắc · ≥80 Tốt · ≥70 Đạt · còn lại Cần cải thiện.</li>
          <li>Nhấn <b>Khởi tạo đánh giá</b> để tạo bản ghi cho từng cá nhân được giao (không trùng), sau đó nhập điểm và bấm <b>Lưu</b>.</li>
        </ul>
      </div>
    </div>
  );
}
