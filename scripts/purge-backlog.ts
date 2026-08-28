import { purgeOldDisposedItems } from '../src/lib/purge';

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log(`Starting purge process (dry-run mode: ${isDryRun ? 'ENABLED' : 'DISABLED'})...`);

  try {
    const result = await purgeOldDisposedItems({ dryRun: isDryRun });

    if (isDryRun) {
      console.log(`\nDry run finished. Found ${result.count} eligible items for purge.`);
    } else {
      console.log(
        `\nPurge finished. Deleted ${result.count} items, removed ${result.blobsRemoved} blobs (${result.blobFailures} blob errors).`
      );
    }
    process.exit(0);
  } catch (error) {
    console.error('Error executing purge script:', error);
    process.exit(1);
  }
}

main();
