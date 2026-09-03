import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

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
  councilReviewedAt?: string;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET() {
  const evaluations = readDb<IndividualEvaluation>('individual-evaluations');
  return NextResponse.json(evaluations);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const evaluations = readDb<IndividualEvaluation>('individual-evaluations');

  const personId = String(body.personId || '');
  const cycleName = String(body.cycleName || 'Năm học 2026-2027');
  const unitId = String(body.unitId || body.personUnitId || '');

  const existing = evaluations.find(
    e => e.personId === personId && e.cycleName === cycleName && (e.unitId === unitId || e.personUnitId === unitId)
  );
  if (existing) {
    return NextResponse.json(existing, { status: 200 });
  }

  const now = new Date().toISOString();
  const created: IndividualEvaluation = {
    id: body.id || `EVL_i_${Date.now()}_${personId.replace(/[^a-zA-Z0-9]/g, '')}`,
    unitId,
    unitName: String(body.unitName || ''),
    cycleName,
    level: 'individual',
    personId,
    personName: String(body.personName || ''),
    positionCode: String(body.positionCode || ''),
    personUnitId: String(body.personUnitId || unitId),
    selfScore: body.selfScore !== undefined ? Number(body.selfScore) : null,
    selfComment: String(body.selfComment || ''),
    managerScore: body.managerScore !== undefined ? Number(body.managerScore) : null,
    managerComment: String(body.managerComment || ''),
    councilScore: body.councilScore !== undefined ? Number(body.councilScore) : null,
    councilComment: String(body.councilComment || ''),
    finalScore: body.finalScore !== undefined ? Number(body.finalScore) : null,
    grade: body.grade !== undefined ? String(body.grade) : null,
    status: 'pending',
    selfEvaluatedAt: body.selfEvaluatedAt,
    createdAt: now,
    updatedAt: now,
  };

  evaluations.push(created);
  writeDb('individual-evaluations', evaluations);
  return NextResponse.json(created, { status: 201 });
}
