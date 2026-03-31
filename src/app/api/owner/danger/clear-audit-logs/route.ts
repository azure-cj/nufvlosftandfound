import { subDays } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedPayload } from '@/lib/admin';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

function getCutoffDate() {
  return subDays(new Date(), 90);
}

export async function GET(request: NextRequest) {
  const guard = await requireAuthenticatedPayload(request);

  if (guard) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const cutoff = getCutoffDate();
  const count = await prisma.auditLog.count({
    where: {
      createdAt: {
        lt: cutoff,
      },
    },
  });

  return NextResponse.json({
    count,
    cutoff,
  });
}

export async function POST(request: NextRequest) {
  const owner = await requireAuthenticatedPayload(request);

  if (!owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const cutoff = getCutoffDate();
  const count = await prisma.auditLog.count({
    where: {
      createdAt: {
        lt: cutoff,
      },
    },
  });

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoff,
      },
    },
  });

  await createAuditLog({
    userId: owner.userId,
    action: 'OWNER_CLEARED_OLD_AUDIT_LOGS',
    entityType: 'OWNER',
    entityId: owner.userId,
    details: {
      cutoff: cutoff.toISOString(),
      requestedCount: count,
      deletedCount: result.count,
    },
    request,
  });

  return NextResponse.json({
    message: `Deleted ${result.count} audit log(s) older than 90 days.`,
    count: result.count,
    cutoff,
  });
}
