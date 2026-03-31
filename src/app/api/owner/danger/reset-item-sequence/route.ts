import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedPayload } from '@/lib/admin';
import { createAuditLog } from '@/lib/audit';
import { generateItemCode } from '@/lib/itemCode';

export async function GET(request: NextRequest) {
  const guard = await requireAuthenticatedPayload(request);

  if (guard) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const nextItemCode = await generateItemCode();

  return NextResponse.json({
    nextItemCode,
    message: 'Sequence preview generated from the current dataset.',
  });
}

export async function POST(request: NextRequest) {
  const owner = await requireAuthenticatedPayload(request);

  if (!owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const nextItemCode = await generateItemCode();

  await createAuditLog({
    userId: owner.userId,
    action: 'OWNER_RESET_ITEM_CODE_SEQUENCE',
    entityType: 'OWNER',
    entityId: owner.userId,
    details: {
      nextItemCode,
      note: 'Owner synced the next item code preview to the current dataset.',
    },
    request,
  });

  return NextResponse.json({
    message: 'Item code sequence synced to the next available code.',
    nextItemCode,
  });
}
