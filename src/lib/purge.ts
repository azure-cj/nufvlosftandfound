import { del } from '@vercel/blob';
import { prisma } from './prisma';

export type PurgeResult = {
  success: boolean;
  dryRun: boolean;
  count: number;
  blobsRemoved: number;
  blobFailures: number;
  cutoffDate: string;
  items: Array<{
    id: string;
    itemCode: string | null;
    imageUrl: string | null;
    updatedAt: Date;
  }>;
};

export async function purgeOldDisposedItems({
  dryRun = false,
}: {
  dryRun?: boolean;
}): Promise<PurgeResult> {
  const cutoffDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const items = await prisma.item.findMany({
    where: {
      status: 'DISPOSED',
      updatedAt: {
        lt: cutoffDate,
      },
    },
    select: {
      id: true,
      itemCode: true,
      imageUrl: true,
      updatedAt: true,
    },
  });

  if (dryRun) {
    console.log(`[DRY RUN] Found ${items.length} disposed items older than 60 days (cutoff: ${cutoffDate.toISOString()}):`);
    for (const item of items) {
      console.log(`  - ID: ${item.id} | Code: ${item.itemCode ?? 'N/A'} | UpdatedAt: ${item.updatedAt.toISOString()} | ImageUrl: ${item.imageUrl ?? 'none'}`);
    }
    console.log('[DRY RUN] No items were deleted or blobs removed.');

    return {
      success: true,
      dryRun: true,
      count: items.length,
      blobsRemoved: 0,
      blobFailures: 0,
      cutoffDate: cutoffDate.toISOString(),
      items,
    };
  }

  let blobsRemoved = 0;
  let blobFailures = 0;

  for (const item of items) {
    if (item.imageUrl) {
      try {
        await del(item.imageUrl);
        blobsRemoved++;
      } catch (error) {
        console.warn(`[Purge] Failed to delete blob for item ${item.id} (${item.imageUrl}):`, error);
        blobFailures++;
      }
    }
  }

  const itemIds = items.map((i) => i.id);
  if (itemIds.length > 0) {
    await prisma.item.deleteMany({
      where: {
        id: {
          in: itemIds,
        },
      },
    });
  }

  console.log(
    `[Purge Script] Successfully purged ${items.length} disposed items older than 60 days (${blobsRemoved} blobs removed, ${blobFailures} blob deletions failed).`
  );

  return {
    success: true,
    dryRun: false,
    count: items.length,
    blobsRemoved,
    blobFailures,
    cutoffDate: cutoffDate.toISOString(),
    items,
  };
}
