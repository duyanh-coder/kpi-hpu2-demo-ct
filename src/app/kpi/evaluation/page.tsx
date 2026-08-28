'use client';

import { Fragment, useState, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle, Clock, Search, Award, Eye, Lock, Star, MessageSquare, RefreshCw } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPut, apiPost } from '@/lib/api';
import unitKpisData from '@/data/unit-kpis.json';
import academicYears from '@/data/academic-years.json';

interface CycleRecord {
  id: string;
  academicYearId: string;
  name: string;
}

interface Evaluation {
  id: string;
  planId: string;
  evaluatorId: string;
  evaluationType: string;
  comment: string;
  status: string;
  level?: string;
  personId?: string;
  personName?: string;
  positionCode?: string;
  unitName?: string;
  createdAt: string;
  updatedAt: string;
}

interface PlanRecord {
  id: string;
  cycleId: string;
  ownerType: string;
  ownerId: string;
  status: string;
}

interface PlanItemSubTask {
  id: string;
  name: string;
  owner: string;
  dueDate: string;
  evidence: string;
  ratio: number | null;
  status: 'ĐẠT' | 'CHƯA ĐẠT';
}

interface PlanItemRecord {
  id: string;
  planId: string;
  indicatorId: string | null;
  name?: string;
  targetValue: number;
  weight: number;
  dueDate: string;
  children?: PlanItemSubTask[];
}

interface ScoreRecord {
  id: string;
  planItemId: string;
  selfScore: number | null;
  managerScore: number | null;
  councilScore: number | null;
  finalScore: number | null;
}

interface UnitKpi {
  id: string;
  name: string;
  code: string;
  kpis: { id: string; name: string; indicatorId: string | null }[];
}

interface EnrichedEvaluation extends Evaluation {
  unitName: string;
  cycleId: string;
  yearId: string;
}

// Dữ liệu plans.json dùng chu kỳ legacy (c001..c004), không có trong cycles.json.
// Map sang năm học hiện tại của HPU2; c002/c003 thuộc 2024-2025 nên không hiển thị tab.
const LEGACY_CYCLE_YEAR_MAP: Record<string, string> = {
  c001: 'ay_hpu2_2025_2026',
  c004: 'ay_hpu2_2026_2027',
};

const STATUS_OPTIONS = ['all', 'pending', 'submitted', 'approved'];

function getUnitName(unitId: string): string {
  const unit = (unitKpisData as UnitKpi[]).find(u => u.id === unitId);
  return unit?.name || unitId;
}

function getYearName(yearId: string): string {
  const ay = academicYears.find(a => a.id === yearId);
  return ay?.name ?? yearId;
}

function gradeForScore(score: number): string {
  if (score >= 90) return 'Xuất sắc';
  if (score >= 75) return 'Tốt';
  if (score >= 60) return 'Đạt';
  if (score >= 40) return 'Cần cải thiện';
  return 'Không đạt';
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Chưa bắt đầu', color: '#9e9e9e', icon: Clock },
  submitted: { label: 'Đã nộp', color: '#2196f3', icon: Star },
  approved: { label: 'Đã phê duyệt', color: '#4caf50', icon: CheckCircle },
};

const gradeConfig: Record<string, { color: string; bg: string }> = {
  'Xuất sắc': { color: '#4caf50', bg: '#e8f5e9' },
  'Tốt': { color: '#2196f3', bg: '#e3f2fd' },
  'Đạt': { color: '#ff9800', bg: '#fff3e0' },
  'Cần cải thiện': { color: '#ffc107', bg: '#fffde7' },
  'Không đạt': { color: '#f44336', bg: '#ffebee' },
};

export default function EvaluationPage() {
  const [selectedYearId, setSelectedYearId] = useState(() => academicYears[0]?.id ?? 'ay_hpu2_2025_2026');
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [planItems, setPlanItems] = useState<PlanItemRecord[]>([]);
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [complaintContent, setComplaintContent] = useState('');
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [editScores, setEditScores] = useState<Record<string, { selfScore: number; managerScore: number; councilScore: number }>>({});
  const [editChildren, setEditChildren] = useState<Record<string, PlanItemSubTask[]>>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [evalsData, plansData, planItemsData, scoresData] = await Promise.all([
        apiGet<Evaluation[]>('/api/evaluation?level=unit'),
        apiGet<PlanRecord[]>('/api/plans'),
        apiGet<PlanItemRecord[]>('/api/plan-items'),
        apiGet<ScoreRecord[]>('/api/scores'),
      ]);
      setEvaluations(evalsData);
      setPlans(plansData);
      setPlanItems(planItemsData);
      setScores(scoresData);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetch('/api/cycles')
      .then(r => r.json())
      .then(data => setCycles(data))
      .catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const cycleYearMap = useMemo(() => {
    const map = new Map<string, string>();
    cycles.forEach(c => map.set(c.id, c.academicYearId));
    Object.entries(LEGACY_CYCLE_YEAR_MAP).forEach(([cycleId, yearId]) => {
      if (!map.has(cycleId)) map.set(cycleId, yearId);
    });
    return map;
  }, [cycles]);

  const planMap = new Map(plans.map(p => [p.id, p]));
  const planItemMap = new Map(planItems.map(pi => [pi.id, pi]));
  const planItemsByPlan = useMemo(() => {
    const m = new Map<string, PlanItemRecord[]>();
    planItems.forEach(pi => {
      const list = m.get(pi.planId) ?? [];
      list.push(pi);
      m.set(pi.planId, list);
    });
    return m;
  }, [planItems]);

  const enrichedEvals: EnrichedEvaluation[] = useMemo(() => evaluations.map(ev => {
    const plan = planMap.get(ev.planId);
    const cycleId = plan?.cycleId ?? '';
    return {
      ...ev,
      unitName: plan ? getUnitName(plan.ownerId) : ev.unitName ?? '',
      cycleId,
      yearId: cycleYearMap.get(cycleId) ?? '',
    };
  }), [evaluations, plans, cycleYearMap]);

  const yearFilteredEvals = useMemo(() => enrichedEvals.filter(ev => ev.yearId === selectedYearId), [enrichedEvals, selectedYearId]);

  const filtered = useMemo(() => yearFilteredEvals.filter(ev => {
    const matchesSearch = ev.unitName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ev.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [yearFilteredEvals, searchTerm, statusFilter]);

  const itemScore = useCallback((score: ScoreRecord): number | null => {
    if (score.finalScore != null) return score.finalScore;
    if (score.councilScore != null) return score.councilScore;
    if (score.managerScore != null) return score.managerScore;
    if (score.selfScore != null) return score.selfScore;
    return null;
  }, []);

  const unitAvgScore = useCallback((ev: EnrichedEvaluation): number | null => {
    const items = planItemsByPlan.get(ev.planId) ?? [];
    const itemIds = new Set(items.map(i => i.id));
    const values = scores
      .filter(s => itemIds.has(s.planItemId))
      .map(itemScore)
      .filter((v): v is number => v != null);
    if (values.length === 0) return null;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }, [scores, planItemsByPlan, itemScore]);

  const handleOpenScoreModal = (ev: Evaluation) => {
    setSelectedEval(ev);
    const items = planItemsByPlan.get(ev.planId) ?? [];
    const itemIds = new Set(items.map(i => i.id));
    const modalScores = scores.filter(s => itemIds.has(s.planItemId));
    const initEditScores: Record<string, { selfScore: number; managerScore: number; councilScore: number }> = {};
    const initEditChildren: Record<string, PlanItemSubTask[]> = {};
    modalScores.forEach(s => {
      initEditScores[s.planItemId] = {
        selfScore: s.selfScore ?? 0,
        managerScore: s.managerScore ?? 0,
        councilScore: s.councilScore ?? 0,
      };
      const pi = planItemMap.get(s.planItemId);
      if (pi?.children) initEditChildren[s.planItemId] = pi.children;
    });
    setEditScores(initEditScores);
    setEditChildren(initEditChildren);
    setShowScoreModal(true);
  };

  const handleSaveScores = async () => {
    if (!selectedEval) return;
    const items = planItemsByPlan.get(selectedEval.planId) ?? [];
    const itemIds = new Set(items.map(i => i.id));
    const modalScores = scores.filter(s => itemIds.has(s.planItemId));
    for (const score of modalScores) {
      const edits = editScores[score.planItemId];
      if (edits) {
        const payload: Record<string, number | null> = {};
        const isSelf = selectedEval.evaluationType === 'self' || selectedEval.status === 'pending';
        const isManager = selectedEval.evaluationType === 'manager' || selectedEval.status === 'submitted';
        const isCouncil = selectedEval.evaluationType === 'council' || selectedEval.status === 'approved';
        if (edits.selfScore !== score.selfScore && (isSelf || score.selfScore !== null || edits.selfScore !== 0)) payload.selfScore = edits.selfScore;
        if (edits.managerScore !== score.managerScore && (isManager || score.managerScore !== null || edits.managerScore !== 0)) payload.managerScore = edits.managerScore;
        if (edits.councilScore !== score.councilScore && (isCouncil || score.councilScore !== null || edits.councilScore !== 0)) payload.councilScore = edits.councilScore;
        if (Object.keys(payload).length > 0) {
          await apiPut(`/api/scores/${score.id}`, payload);
        }
      }
    }
    for (const [planItemId, children] of Object.entries(editChildren)) {
      await apiPut(`/api/plan-items/${planItemId}`, { children });
    }
    setShowScoreModal(false);
    setSelectedEval(null);
    loadData();
  };

  const handleLock = async () => {
    if (!selectedEval) return;
    await apiPut(`/api/evaluation/${selectedEval.id}`, { status: 'approved' });
    setShowLock(false);
    setSelectedEval(null);
    loadData();
  };

  const totalEval = yearFilteredEvals.length;
  const lockedCount = yearFilteredEvals.filter(e => e.status === 'approved').length;
  const pendingCount = yearFilteredEvals.filter(e => e.status === 'pending').length;
  const avgScores = yearFilteredEvals.map(unitAvgScore).filter((v): v is number => v != null);
  const avgTotal = avgScores.length > 0 ? (avgScores.reduce((sum, v) => sum + v, 0) / avgScores.length).toFixed(1) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-bold text-text-dark">Đánh giá KPI Đơn vị</h1>
            <button
              type="button"
              title="Cập nhật thông tin kết quả đánh giá"
              aria-label="Cập nhật thông tin kết quả đánh giá"
              className="inline-flex p-1 text-primary hover:bg-primary-light rounded-lg cursor-pointer"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          <p className="text-text-light mt-1">Tự đánh giá → Cấp trên → Hội đồng → Khóa</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap bg-white border border-border rounded-lg overflow-hidden">
            {academicYears.map(ay => (
              <button key={ay.id} onClick={() => setSelectedYearId(ay.id)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${selectedYearId === ay.id ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>
                {ay.name}
              </button>
            ))}
          </div>
          <a href="/kpi/evaluation/individual" className="btn-secondary text-sm">Đánh giá cá nhân →</a>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><Award size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng đánh giá</p><p className="text-xl font-bold">{totalEval}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><Lock size={20} className="text-accent-green" /></div>
            <div><p className="text-text-light text-sm">Đã phê duyệt</p><p className="text-xl font-bold">{lockedCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><Clock size={20} className="text-accent-yellow" /></div>
            <div><p className="text-text-light text-sm">Chưa hoàn thành</p><p className="text-xl font-bold">{pendingCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-red/20 rounded-lg"><Star size={20} className="text-accent-red" /></div>
            <div><p className="text-text-light text-sm">Điểm TB</p><p className="text-xl font-bold">{avgTotal ?? '-'}</p></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === status ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>
              {status === 'all' ? 'Tất cả' : (statusConfig[status]?.label ?? status)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Kết quả đánh giá</h3></div>
        <div className="p-0">
          <div className="overflow-x-auto"><table className="table">
            <thead>
              <tr><th>STT</th><th>Đơn vị</th><th>Năm học</th><th>Điểm</th><th>Xếp loại</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center text-text-light py-6">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-text-light py-6">Không có dữ liệu</td></tr>
              ) : filtered.map((ev, idx) => {
                const status = statusConfig[ev.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const avg = unitAvgScore(ev);
                const grade = avg != null ? gradeForScore(avg) : null;
                return (
                  <tr key={ev.id}>
                    <td className="text-text-light">{idx + 1}</td>
                    <td className="font-medium">{ev.unitName}</td>
                    <td className="text-sm">{ev.yearId ? getYearName(ev.yearId) : '—'}</td>
                    <td className={`text-sm font-bold ${avg != null ? 'text-primary' : 'text-text-light'}`}>{avg != null ? avg.toFixed(1) : '-'}</td>
                    <td>
                      {grade ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ color: gradeConfig[grade]?.color ?? '#333', backgroundColor: gradeConfig[grade]?.bg ?? 'transparent' }}>
                          {grade}
                        </span>
                      ) : <span className="text-text-light text-sm">-</span>}
                    </td>
                    <td>
                      <span className="badge flex items-center gap-1 w-fit" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                        <StatusIcon size={12} />{status.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => handleOpenScoreModal(ev)} className="inline-flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-primary-light rounded border border-primary/30" title="Đánh giá"><Eye size={12} /> Đánh giá</button>
                        {ev.status !== 'approved' && (
                          <button onClick={() => { setSelectedEval(ev); setShowLock(true); }} className="inline-flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-primary-light rounded border border-primary/30" title="Phê duyệt"><Lock size={12} /> Phê duyệt</button>
                        )}
                        <button onClick={() => { setSelectedEval(ev); setComplaintContent(''); setShowComplaint(true); }} className="inline-flex items-center gap-1 px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 rounded border border-orange-300" title="Khiếu nại"><MessageSquare size={12} /> Khiếu nại</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      </div>

      <Modal isOpen={showScoreModal} onClose={() => { setShowScoreModal(false); setSelectedEval(null); }} title="Đánh giá chi tiết" maxWidth="max-w-4xl">
        {selectedEval && (() => {
          const plan = planMap.get(selectedEval.planId);
          const items = planItemsByPlan.get(selectedEval.planId) ?? [];
          const itemIds = new Set(items.map(i => i.id));
          const modalScores = scores.filter(s => itemIds.has(s.planItemId));
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-light">{getUnitName(plan?.ownerId ?? '')} • {plan ? getYearName(cycleYearMap.get(plan.cycleId) ?? '') || plan.cycleId : selectedEval.planId}</span>
              </div>
              <div className="overflow-x-auto"><table className="table">
                <thead>
                  <tr><th>Chỉ tiêu & Nhiệm vụ con</th><th>Tự ĐG</th><th>Cấp trên</th><th>Hội đồng</th><th>Tổng</th><th>Tỷ lệ đạt</th></tr>
                </thead>
                <tbody>
                  {modalScores.map((score) => {
                    const pi = planItemMap.get(score.planItemId);
                    const edits = editScores[score.planItemId] || { selfScore: 0, managerScore: 0, councilScore: 0 };
                    const children = editChildren[score.planItemId];
                    const total = itemScore(score);
                    const doneCount = (pi?.children ?? []).filter(c => c.status === 'ĐẠT').length;
                    const ratioPct = pi?.children?.length ? `${Math.round((doneCount / pi.children.length) * 100)}%` : '-';
                    return (
                      <Fragment key={score.id}>
                        <tr>
                          <td className="font-medium text-sm">{pi?.name || pi?.indicatorId || score.planItemId}</td>
                          <td>
                            <input type="number" value={edits.selfScore} onChange={(e) => setEditScores(prev => ({ ...prev, [score.planItemId]: { ...prev[score.planItemId], selfScore: Number(e.target.value) } }))}
                              className="w-20 px-2 py-1 rounded border border-border text-sm text-center" min={0} max={120} />
                          </td>
                          <td>
                            <input type="number" value={edits.managerScore} onChange={(e) => setEditScores(prev => ({ ...prev, [score.planItemId]: { ...prev[score.planItemId], managerScore: Number(e.target.value) } }))}
                              className="w-20 px-2 py-1 rounded border border-border text-sm text-center" min={0} max={120} />
                          </td>
                          <td>
                            <input type="number" value={edits.councilScore} onChange={(e) => setEditScores(prev => ({ ...prev, [score.planItemId]: { ...prev[score.planItemId], councilScore: Number(e.target.value) } }))}
                              className="w-20 px-2 py-1 rounded border border-border text-sm text-center" min={0} max={120} />
                          </td>
                          <td className="text-center font-bold text-primary">{total != null ? total : '-'}</td>
                          <td className="text-center text-text-light text-xs">{ratioPct}</td>
                        </tr>
                        {children?.map((child, idx) => (
                          <tr key={child.id} className="bg-bg-cream/40">
                            <td colSpan={5} className="text-xs pl-6 pr-2 align-top">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                <span className="font-medium text-text-dark">{child.id}</span>
                                <span className="text-text-dark">{child.name}</span>
                                <span className="text-text-light">• {child.owner}</span>
                                <span className="text-text-light">• hạn {child.dueDate}</span>
                                {child.evidence && <span className="text-primary/80 max-w-xs truncate" title={child.evidence}>• {child.evidence}</span>}
                              </div>
                            </td>
                            <td className="text-xs align-top">
                              <div className="flex items-center gap-1.5">
                                <input type="number" value={child.ratio ?? ''} min={0} max={2} step={0.01}
                                  onChange={(e) => { const ratio = e.target.value === '' ? null : Number(e.target.value); setEditChildren(prev => ({ ...prev, [score.planItemId]: (prev[score.planItemId] || []).map((c, i) => i === idx ? { ...c, ratio, status: ratio !== null && ratio >= 1 ? 'ĐẠT' : 'CHƯA ĐẠT' } : c) })); }}
                                  className="w-16 px-1 py-0.5 rounded border border-border text-sm text-center" />
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${child.status === 'ĐẠT' ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-red/20 text-accent-red'}`}>{child.status}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table></div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button onClick={() => { setShowScoreModal(false); setSelectedEval(null); }} className="btn-secondary">Hủy</button>
                <button onClick={handleSaveScores} className="btn-primary">Lưu điểm số</button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal isOpen={showLock} onClose={() => { setShowLock(false); setSelectedEval(null); }} title="Phê duyệt kết quả đánh giá">
        <div className="space-y-4">
          <div className="p-4 bg-bg-cream rounded-lg border border-border">
            <div className="font-medium text-sm mb-2">Xác nhận phê duyệt kết quả</div>
            <div className="text-xs text-text-light">Sau khi phê duyệt, kết quả chuyển trạng thái Đã phê duyệt.</div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => { setShowLock(false); setSelectedEval(null); }} className="btn-secondary">Hủy</button>
            <button onClick={handleLock} className="btn-primary flex items-center gap-2"><Lock size={14} /> Phê duyệt</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showComplaint} onClose={() => { setShowComplaint(false); setSelectedEval(null); }} title="Gửi khiếu nại / Giải trình">
        <div className="space-y-4">
          <div className="p-3 bg-bg-cream rounded-lg border border-border text-sm">
            <div className="font-medium">Đơn vị: {selectedEval?.unitName}</div>
            <div className="text-xs text-text-light mt-1">Mã đánh giá: {selectedEval?.id}</div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Nội dung khiếu nại *</label><textarea value={complaintContent} onChange={e => setComplaintContent(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" rows={4} placeholder="Mô tả lý do khiếu nại..." required /></div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={() => { setShowComplaint(false); setSelectedEval(null); }} className="px-4 py-2 border border-border rounded-lg text-sm">Hủy</button>
            <button onClick={async () => {
              if (!complaintContent.trim()) { alert('Vui lòng nhập nội dung khiếu nại'); return; }
              await apiPost('/api/complaints', { title: `Khiếu nại đánh giá ${selectedEval?.id}`, content: complaintContent, unitName: selectedEval?.unitName || '', priority: 'medium', status: 'pending', code: `CMP${Date.now()}` });
              setShowComplaint(false); setSelectedEval(null);
            }} className="btn-primary flex items-center gap-1"><MessageSquare size={14} /> Gửi khiếu nại</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}