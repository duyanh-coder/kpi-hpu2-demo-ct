'use client';

import { useState } from 'react';
import { BookOpen, CalendarDays } from 'lucide-react';
import academicYears from '@/data/academic-years.json';
import TimetableModal from '@/components/forms/timetable-form';
import {
  UNDERGRADUATE_TIMETABLE,
  GRADUATE_TIMETABLE,
  UNDERGRAD_ABBREVIATIONS,
  UNDERGRAD_NOTES,
  GRAD_ABBREVIATIONS,
  GRAD_NOTES,
} from '@/data/training-plan';

type TabKey = 'undergrad' | 'grad';

interface ExtraEntry {
  week: number;
  cohort: string;
  activity: string;
}

const UG_COHORTS = [
  { key: 'k52', label: 'K52' },
  { key: 'k51', label: 'K51' },
  { key: 'k50', label: 'K50' },
  { key: 'k49', label: 'K49' },
] as const;
const UG_ROW = (w: { k52: string; k51: string; k50: string; k49: string }) => [w.k52, w.k51, w.k50, w.k49] as const;

const GR_COHORTS = [
  { key: 'k30Dot1', label: 'K30 Đợt 1' },
  { key: 'k30Dot2', label: 'K30 Đợt 2' },
  { key: 'k29', label: 'K29' },
  { key: 'phd', label: 'Tiến sĩ (NCS)' },
] as const;
const GR_ROW = (w: { k30Dot1: string; k30Dot2: string; k29: string; phd: string }) =>
  [w.k30Dot1, w.k30Dot2, w.k29, w.phd] as const;

const activityColor = (v: string) => {
  const t = v.toLowerCase();
  if (t.includes('thi')) return 'bg-green-50 text-green-700 border-green-300';
  if (t.includes('ktghk')) return 'bg-amber-50 text-amber-700 border-amber-300';
  if (t.includes('nhập học') || t.includes('tết')) return 'bg-red-50 text-red-700 border-red-300';
  if (t.includes('gdqp') || t.includes('ttsp') || t.includes('ttcn') || t.includes('bảo vệ') || t.includes('hội thi')) return 'bg-blue-50 text-blue-700 border-blue-300';
  if (t.includes('học') || t.includes('hk')) return 'bg-teal-50 text-teal-700 border-teal-300';
  if (t.includes('(15t)') || t.includes('dt')) return 'bg-purple-50 text-purple-700 border-purple-300';
  return 'bg-gray-100 text-gray-600 border-gray-200';
};

export default function TrainingProgramPage() {
  const [tab, setTab] = useState<TabKey>('undergrad');
  const [selectedYearId, setSelectedYearId] = useState(academicYears[0]?.id || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [extras, setExtras] = useState<ExtraEntry[]>([]);

  const addExtras = (result: { type: 'undergrad' | 'grad'; entries: ExtraEntry[] }) => {
    setExtras(prev => [...prev, ...result.entries]);
  };

  const undergradRows = UNDERGRADUATE_TIMETABLE;
  const gradRows = GRADUATE_TIMETABLE;

  const selectedYearName = academicYears.find(a => a.id === selectedYearId)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-light rounded-lg"><BookOpen size={24} className="text-primary" /></div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-text-dark">Kế hoạch đào tạo</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
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
          <button onClick={() => setModalOpen(true)} className="btn-primary text-sm flex items-center gap-2">
            <CalendarDays size={16} /> Tạo thời khóa biểu
          </button>
        </div>
      </div>

      <div>
        <div className="inline-flex bg-white border border-border rounded-lg overflow-hidden">
          {([['undergrad', 'Đại học chính quy'], ['grad', 'Thạc sĩ - Tiến sĩ']] as [TabKey, string][]).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-5 py-2 text-sm font-medium transition-colors ${tab === k ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'undergrad' && (
        <TimetableCard
          title={`Thời khóa biểu Đại học chính quy ${selectedYearName}`}
          rows={undergradRows}
          cohorts={UG_COHORTS}
          rowValues={w => UG_ROW(w)}
          extrasFor={week => extras.filter(e => e.week === week && UG_COHORTS.some(c => c.key === e.cohort))}
          abbreviations={UNDERGRAD_ABBREVIATIONS}
          notes={UNDERGRAD_NOTES}
        />
      )}

      {tab === 'grad' && (
        <TimetableCard
          title={`Thời khóa biểu Thạc sĩ - Tiến sĩ ${selectedYearName}`}
          rows={gradRows}
          cohorts={GR_COHORTS}
          rowValues={w => GR_ROW(w)}
          extrasFor={week => extras.filter(e => e.week === week && GR_COHORTS.some(c => c.key === e.cohort))}
          abbreviations={GRAD_ABBREVIATIONS}
          notes={GRAD_NOTES}
        />
      )}

      <TimetableModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAdd={addExtras} />
    </div>
  );
}

function TimetableCard<T extends { week: number; range: string }>({
  title,
  rows,
  cohorts,
  rowValues,
  extrasFor,
  abbreviations,
  notes,
}: {
  title: string;
  rows: T[];
  cohorts: ReadonlyArray<{ key: string; label: string }>;
  rowValues: (w: T) => readonly string[];
  extrasFor: (week: number) => ExtraEntry[];
  abbreviations: { abbr: string; full: string }[];
  notes: string[];
}) {
  return (
    <>
      <div className="card flex flex-col max-h-[60vh]">
        <div className="card-header shrink-0">{title}</div>
        <div className="flex-1 overflow-y-auto overflow-x-auto">
          <table className="table table-fixed min-w-[760px]">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="w-[12%]">Tuần</th>
                <th className="w-[14%]">Từ ngày - đến ngày</th>
                {cohorts.map(c => <th key={c.key} className="w-[18.5%]">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const values = rowValues(row);
                const extra = extrasFor(row.week);
                return (
                  <tr key={row.week} className="align-top">
                    <td className="font-semibold text-center">{row.week}</td>
                    <td className="text-text-light text-xs whitespace-nowrap">{row.range}</td>
                    {cohorts.map((c, i) => {
                      const base = values[i] || '';
                      const extraVal = extra.find(e => e.cohort === c.key)?.activity || '';
                      return (
                        <td key={c.key}>
                          <div className="space-y-1">
                            {base && <span className={`inline-block px-2 py-1 rounded text-xs border ${activityColor(base)}`}>{base}</span>}
                            {extraVal && <span className="inline-block px-2 py-1 rounded text-xs border border-blue-400 bg-blue-50 text-blue-700">{extraVal}</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card p-5 space-y-4">
        <div>
          <h4 className="font-semibold text-text-dark mb-2">Viết tắt</h4>
          <div className="flex flex-wrap gap-2">
            {abbreviations.map(a => (
              <span key={a.abbr} className="inline-flex items-center gap-1.5 text-xs text-text-light">
                <span className="badge badge-info">{a.abbr}</span> {a.full}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-text-dark mb-2">Ghi chú</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-text-light">
            {notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      </div>
    </>
  );
}
