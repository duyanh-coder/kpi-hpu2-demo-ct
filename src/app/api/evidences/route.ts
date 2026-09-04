import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface EvidenceRecord {
  id: string;
  planItemId?: string;
  unitWorkPlanId?: string;
  evidenceType: 'file' | 'url' | 'system_log' | 'survey' | 'email';
  fileName?: string;
  fileUrl?: string;
  externalUrl?: string;
  status: 'pending' | 'submitted' | 'needs_supplement' | 'valid' | 'invalid' | 'locked';
  reviewerNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
  submittedBy: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const unitWorkPlanId = searchParams.get('unitWorkPlanId');
  const planItemId = searchParams.get('planItemId');
  let items = readDb<EvidenceRecord>('evidences');
  if (unitWorkPlanId) items = items.filter(e => e.unitWorkPlanId === unitWorkPlanId);
  if (planItemId) items = items.filter(e => e.planItemId === planItemId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const evidences = readDb<EvidenceRecord>('evidences');
  const now = new Date().toISOString();
  const newEvidence: EvidenceRecord = {
    id: `EV${generateId()}`,
    planItemId: body.planItemId,
    unitWorkPlanId: body.unitWorkPlanId,
    evidenceType: body.evidenceType,
    fileName: body.fileName,
    fileUrl: body.fileUrl,
    externalUrl: body.externalUrl,
    status: 'pending',
    submittedAt: now,
    submittedBy: body.submittedBy,
  };
  evidences.push(newEvidence);
  writeDb('evidences', evidences);
  return NextResponse.json(newEvidence, { status: 201 });
}
