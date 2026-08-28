import { NextRequest, NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { purgeOldDisposedItems } from '@/lib/purge';

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  const authorization = request.headers.get('authorization');
  const forwardedSecret = request.headers.get('x-cron-secret');

  return authorization === `Bearer ${secret}` || forwardedSecret === secret;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ message: 'Unauthorized cron request.' }, { status: 401 });
    }

    const dryRunParam = request.nextUrl.searchParams.get('dryRun');
    const dryRun = dryRunParam === 'true';

    const result = await purgeOldDisposedItems({ dryRun });

    if (!dryRun) {
      const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (adminUser) {
        await createAuditLog({
          userId: adminUser.id,
          action: 'SYSTEM_PURGE',
          entityType: 'ITEM',
          details: {
            purgedCount: result.count,
            blobsRemoved: result.blobsRemoved,
            blobFailures: result.blobFailures,
            cutoffDate: result.cutoffDate,
          },
          request,
        });
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      message: dryRun ? 'Purge dry-run completed.' : 'Purge cron completed.',
      itemsPurged: result.count,
      blobsRemoved: result.blobsRemoved,
      blobFailures: result.blobFailures,
      cutoffDate: result.cutoffDate,
      items: result.items,
    });
  } catch (error) {
    console.error('Purge cron failed:', error);
    return NextResponse.json({ message: 'Purge cron failed.' }, { status: 500 });
  }
}
