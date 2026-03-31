import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedPayload } from '@/lib/admin';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

const disposedWhere = {
  OR: [{ status: 'DISPOSED' as const }, { isDisposed: true }],
};

export async function GET(request: NextRequest) {
  const guard = await requireAuthenticatedPayload(request);

  if (guard) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const count = await prisma.item.count({ where: disposedWhere });
  return NextResponse.json({ count });
}

export async function POST(request: NextRequest) {
  const owner = await requireAuthenticatedPayload(request);

  if (!owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const count = await prisma.item.count({ where: disposedWhere });
  const result = await prisma.item.deleteMany({ where: disposedWhere });

  await createAuditLog({
    userId: owner.userId,
    action: 'OWNER_CLEARED_DISPOSED_ITEMS',
    entityType: 'OWNER',
    entityId: owner.userId,
    details: {
      requestedCount: count,
      deletedCount: result.count,
    },
    request,
  });

  return NextResponse.json({
    message: `Deleted ${result.count} disposed item(s).`,
    count: result.count,
  });
}
