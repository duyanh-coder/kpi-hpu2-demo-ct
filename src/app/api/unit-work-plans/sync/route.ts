import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { UnitWorkTask } from '@/types';

interface SoftwareSource { id: string; name: string; description?: string; status?: string; }
interface SyncLog {
  id: string; apiConfigId: string; systemType: string;
  syncType: 'manual' | 'scheduled'; status: 'running' | 'success' | 'partial' | 'error';
  startedAt: string; completedAt?: string;
  recordsTotal: number; recordsSuccess: number; recordsFailed: number;
  errors: { record: string; message: string }[]; createdBy: string;
}

export async function POST(request: NextRequest) {
  const { taskId, sourceId } = await request.json();
  if (!taskId || !sourceId) {
    return NextResponse.json({ error: 'Thiếu taskId hoặc sourceId' }, { status: 400 });
  }

  const tasks = readDb<UnitWorkTask>('unit-work-plans');
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return NextResponse.json({ error: 'Không tìm thấy công việc' }, { status: 404 });

  const sources = readDb<SoftwareSource>('software-catalog');
  const source = sources.find(s => s.id === sourceId);
  if (!source) return NextResponse.json({ error: 'Không tìm thấy nguồn dữ liệu' }, { status: 404 });

  const now = new Date();
  const records = Math.floor(Math.random() * 80) + 20;
  const iso = now.toISOString();
  const result = buildSyncedResult(tasks[idx].chiTieu, source.name, records);

  tasks[idx] = {
    ...tasks[idx],
    result,
    resultSource: 'sync',
    syncInfo: { sourceId: source.id, sourceName: source.name, syncedAt: iso },
    status: 'in_progress',
    updatedAt: iso,
  };
  writeDb('unit-work-plans', tasks);

  const logs = readDb<SyncLog>('sync-logs');
  const log: SyncLog = {
    id: `sl${generateId()}`,
    apiConfigId: sourceId,
    systemType: 'other',
    syncType: 'manual',
    status: 'success',
    startedAt: iso,
    completedAt: iso,
    recordsTotal: records,
    recordsSuccess: records,
    recordsFailed: 0,
    errors: [],
    createdBy: tasks[idx].primaryUserId,
  };
  logs.push(log);
  writeDb('sync-logs', logs);

  return NextResponse.json({ task: tasks[idx], syncedRecords: records, sourceName: source.name });
}

function buildSyncedResult(raw: string | undefined, sourceName: string, records: number): string {
  const chiTieu = (raw || '').trim();
  if (chiTieu.includes('%')) {
    const pct = Math.floor(Math.random() * 40) + 60;
    return `${pct}%`;
  }
  const m = chiTieu.match(/^(\d+)\s*(.*)$/);
  if (m) {
    const target = parseInt(m[1], 10);
    const unit = m[2].trim();
    const value = Math.max(1, Math.round(target * (0.4 + Math.random() * 0.5)));
    return unit ? `${value} ${unit}` : `${value}`;
  }
  return `Đồng bộ ${records} bản ghi từ ${sourceName}`;
}
