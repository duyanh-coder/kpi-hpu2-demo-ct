import type { UnitWorkTask } from '@/types';

export const progressByStatus: Record<UnitWorkTask['status'], number> = {
  assigned: 10,
  in_progress: 70,
  done: 100,
};

export function parseDueDate(value: string): Date {
  const [d, m, y] = value.split('/').map(Number);
  return new Date(y, m - 1, d);
}

export function isOverdue(task: UnitWorkTask): boolean {
  if (task.status === 'done' || !task.dueDate) return false;
  return parseDueDate(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
}

export function progressColor(pct: number): string {
  if (pct >= 80) return '#4caf50';
  if (pct >= 40) return '#ffc107';
  return '#9e9e9e';
}

/** Ưu tiên: done > progress nhập tay > fallback theo trạng thái. */
export function getProgress(task: UnitWorkTask): number {
  if (task.status === 'done') return 100;
  if (task.progress != null) return task.progress;
  return progressByStatus[task.status];
}