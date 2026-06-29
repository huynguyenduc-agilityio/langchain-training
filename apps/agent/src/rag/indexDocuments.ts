import '../config/env';
import { logger, logError } from '@repo/logger';
import { indexDocuments } from './loader';

async function main() {
  try {
    await indexDocuments();
    logger.info(
      '\nRe-indexing complete. Vector store is now up-to-date with database content.',
    );
    process.exit(0);
  } catch (error) {
    logError(error, 'Re-indexing failed:');
    process.exit(1);
  }
}

main();
