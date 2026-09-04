'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost } from '@/lib/api';
import type { KHCTTask } from '@/types';

interface OrgUser {
  id: string;
  fullName: string;
  employeeCode: string;
  unitId: string;
}

interface OrgUnitInfo {
  id: string;
  name: string;
}

const fieldCls = 'w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary';

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
}

export default function AssignTaskModal({
  task,
  orgUnits,
  isOpen,
  onClose,
  onAssigned,
}: {
  task: KHCTTask | null;
  orgUnits: OrgUnitInfo[];
  isOpen: boolean;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [title, setTitle] = useState('');
  const [primaryUserId, setPrimaryUserId] = useState('');
  const [chiTieu, setChiTieu] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setTitle('');
      setPrimaryUserId('');
      setChiTieu(task.chiTieu || '');
      setDueDate('');
      setNote('');
      setSaving(false);
      const target = normalizeName(task.responsibleUnit);
      apiGet<OrgUser[]>('/api/users').then(all => {
        const matchedUnitIds = orgUnits
          .filter(u => normalizeName(u.name) === target)
          .map(u => u.id);
        setUsers(all.filter(u => matchedUnitIds.length === 0 || matchedUnitIds.includes(u.unitId)));
      });
    }
  }, [isOpen, task?.id, task?.responsibleUnit]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !primaryUserId) return;
    setSaving(true);
    const user = users.find(u => u.id === primaryUserId);
    const unitId = orgUnits.find(u => normalizeName(u.name) === normalizeName(task.responsibleUnit))?.id || '';
    await apiPost('/api/unit-work-plans', {
      khctTaskId: task.id,
      taskName: task.taskName,
      unitId,
      unitName: task.responsibleUnit,
      title,
      primaryUserId,
      primaryUserName: user?.fullName || '',
      chiTieu,
      dueDate,
      note,
    });
    setSaving(false);
    onAssigned?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Phân giao công việc" maxWidth="max-w-xl">
      {task && (
        <form onSubmit={handle} className="space-y-4">
          <div className="p-3 bg-bg-cream rounded-lg">
            <p className="text-xs text-text-light mb-1">Nhiệm vụ gốc</p>
            <p className="text-sm font-semibold text-text-dark">{task.taskName}</p>
            <p className="text-xs text-text-light mt-1">Đơn vị chủ trì: <span className="font-medium text-text-dark">{task.responsibleUnit}</span></p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tên công việc *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required className={fieldCls} placeholder="VD: Rà soát danh sách sinh viên diện cảnh báo" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chỉ tiêu đo lường</label>
            <input value={chiTieu} onChange={e => setChiTieu(e.target.value)} className={fieldCls} placeholder="VD: 100% | ≥80% | ≥20" />
            <p className="text-xs text-text-light mt-1">Kế thừa từ KPI trường/nhiệm vụ, có thể chỉnh sửa.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Người phụ trách chính *</label>
            <select value={primaryUserId} onChange={e => setPrimaryUserId(e.target.value)} required className={fieldCls}>
              <option value="">-- Chọn người phụ trách --</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.fullName}{u.employeeCode ? ` (${u.employeeCode})` : ''}</option>)}
            </select>
            {users.length === 0 && <p className="text-xs text-text-light mt-1">Không tìm thấy cán bộ thuộc đơn vị chủ trì.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hạn hoàn thành</label>
            <input value={dueDate} onChange={e => setDueDate(e.target.value)} className={fieldCls} placeholder="VD: 10/8/2026" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className={fieldCls} placeholder="Mô tả chi tiết yêu cầu công việc..." />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Đang lưu...' : 'Giao việc'}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
