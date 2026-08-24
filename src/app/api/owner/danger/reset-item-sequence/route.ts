import { NextRequest, NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/audit';
import { generateItemCode } from '@/lib/itemCode';
import { getOwnerUser, requireOwnerPinAccess } from '@/lib/ownerGuard';

export async function GET(request: NextRequest) {
  // NOTE: requireOwnerPinAccess() returns NULL on SUCCESS (authorized owner with valid PIN session),
  // and returns a NextResponse error object on FAILURE (403, 423, or 428).
  const guard = await requireOwnerPinAccess(request);
  if (guard) {
    return guard;
  }

  const nextItemCode = await generateItemCode();

  return NextResponse.json({
    nextItemCode,
    message: 'Sequence preview generated from the current dataset.',
  });
}

export async function POST(request: NextRequest) {
  // NOTE: requireOwnerPinAccess() returns NULL on SUCCESS (authorized owner with valid PIN session),
  // and returns a NextResponse error object on FAILURE (403, 423, or 428).
  const guard = await requireOwnerPinAccess(request);
  if (guard) {
    return guard;
  }

  const owner = await getOwnerUser(request);
  if (!owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const nextItemCode = await generateItemCode();

  await createAuditLog({
    userId: owner.id,
    action: 'OWNER_RESET_ITEM_CODE_SEQUENCE',
    entityType: 'OWNER',
    entityId: owner.id,
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
