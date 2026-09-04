'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import {
  UNDERGRADUATE_TIMETABLE,
  GRADUATE_TIMETABLE,
  type Abbreviation,
} from '@/data/training-plan';

const fieldCls = 'w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary';

interface Entry {
  week: number;
  cohort: string;
  activity: string;
}

export default function TimetableModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entries: { type: 'undergrad' | 'grad'; entries: Entry[] }) => void;
}) {
  const [type, setType] = useState<'undergrad' | 'grad'>('undergrad');
  const [week, setWeek] = useState<number>(1);
  const [cohort, setCohort] = useState('k52');
  const [activity, setActivity] = useState('');
  const [draft, setDraft] = useState<Entry[]>([]);
  const [error, setError] = useState('');

  const abbrs: Abbreviation[] = useMemo(
    () => (type === 'undergrad'
      ? [
          { abbr: 'HK', full: 'Học kỳ' },
          { abbr: 'KTGHK', full: 'Kiểm tra giữa học kỳ' },
          { abbr: 'TTSP', full: 'Thực tập sư phạm' },
          { abbr: 'TTCN', full: 'Thực tập chuyên ngành' },
          { abbr: 'KLTN', full: 'Khóa luận tốt nghiệp' },
          { abbr: 'GDQP&AN', full: 'Giáo dục quốc phòng và An ninh' },
        ]
      : [
          { abbr: 'KTGHK', full: 'Kiểm tra giữa học kỳ' },
          { abbr: 'TQĐC', full: 'Thông qua đề cương' },
          { abbr: 'DT', full: 'Dự trữ' },
        ]),
    [type],
  );

  const maxWeek = type === 'undergrad' ? UNDERGRADUATE_TIMETABLE.length : GRADUATE_TIMETABLE.length;

  const cohortLabel =
    type === 'undergrad'
      ? { k52: 'K52', k51: 'K51', k50: 'K50', k49: 'K49' }
      : { k30Dot1: 'Thạc sĩ K30 (Đợt 1)', k30Dot2: 'Thạc sĩ K30 (Đợt 2)', k29: 'Thạc sĩ K29', phd: 'Tiến sĩ (NCS)' };
  const cohortKeys = type === 'undergrad' ? ['k52', 'k51', 'k50', 'k49'] : ['k30Dot1', 'k30Dot2', 'k29', 'phd'];

  const addToDraft = () => {
    if (!activity.trim()) {
      setError('Vui lòng nhập hoạt động.');
      return;
    }
    setError('');
    setDraft(prev => [...prev, { week, cohort, activity: activity.trim() }]);
    setActivity('');
  };

  const handleSubmit = () => {
    if (draft.length === 0) {
      setError('Chưa có mục nào. Hãy thêm hoạt động vào danh sách.');
      return;
    }
    onAdd({ type, entries: draft });
    setDraft([]);
    setActivity('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo thời khóa biểu" maxWidth="max-w-3xl">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loại thời khóa biểu</label>
            <select value={type} onChange={(e) => {
              const t = e.target.value as 'undergrad' | 'grad';
              setType(t);
              setCohort(t === 'undergrad' ? 'k52' : 'k30Dot1');
              setDraft(prev => prev.map(d => ({ ...d, cohort: t === 'undergrad' ? 'k52' : 'k30Dot1' })));
            }} className={fieldCls}>
              <option value="undergrad">Đại học chính quy</option>
              <option value="grad">Thạc sĩ - Tiến sĩ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tuần (1 - {maxWeek})</label>
            <input type="number" min={1} max={maxWeek}
              value={week}
              onChange={(e) => setWeek(Math.min(maxWeek, Math.max(1, Number(e.target.value))))}
              className={fieldCls} />
          </div>
        </div>

        <div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Đối tượng (Khóa)</label>
              <select value={cohort} onChange={(e) => setCohort(e.target.value)} className={fieldCls}>
                {cohortKeys.map(k => <option key={k} value={k}>{cohortLabel[k as keyof typeof cohortLabel]}</option>)}
              </select>
            </div>
            <div className="flex-[2]">
              <label className="block text-sm font-medium mb-1">Hoạt động</label>
              <div className="flex gap-2">
                <input value={activity} onChange={(e) => setActivity(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToDraft(); } }}
                  placeholder={abbrs.map(a => a.abbr).join(', ')} className={fieldCls} />
                <button type="button" onClick={addToDraft} className="btn-primary text-xs flex items-center gap-1 shrink-0"><Plus size={14}/> Thêm</button>
              </div>
            </div>
          </div>
        </div>

        {draft.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Danh sách sẽ thêm ({draft.length})</label>
            <div className="border border-border rounded-lg divide-y divide-border">
              {draft.map((d, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div>
                    <span className="badge badge-info mr-2">Tuần {d.week}</span>
                    <span className="font-medium">{cohortLabel[d.cohort as keyof typeof cohortLabel]}</span>
                    <span className="text-text-light ml-2">{d.activity}</span>
                  </div>
                  <button type="button" onClick={() => setDraft(draft.filter((_, idx) => idx !== i))}
                    className="p-1.5 rounded-lg border border-accent-red text-accent-red hover:bg-accent-red/10" aria-label="Xóa">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-accent-red">{error}</p>}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
          <button type="button" onClick={handleSubmit} className="btn-primary">Tạo thời khóa biểu</button>
        </div>
      </div>
    </Modal>
  );
}
