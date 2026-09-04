import { NextRequest, NextResponse } from 'next/server';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const taskId: string | undefined = body.taskId;
  let fileName: string | undefined = body.fileName;
  const fileData: string | undefined = body.fileData;

  if (!taskId || !fileName || !fileData) {
    return NextResponse.json({ error: 'Thiếu taskId, fileName hoặc fileData' }, { status: 400 });
  }

  const buffer = Buffer.from(fileData, 'base64');
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: 'File vượt quá 5MB' }, { status: 413 });
  }

  fileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!fileName) return NextResponse.json({ error: 'fileName không hợp lệ' }, { status: 400 });

  const dir = join(process.cwd(), 'public', 'uploads', taskId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, fileName), buffer);

  return NextResponse.json({ url: `/uploads/${taskId}/${fileName}`, fileName }, { status: 201 });
}
