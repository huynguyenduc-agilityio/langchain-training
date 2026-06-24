import pg from 'pg';
import { logger, logError } from '@repo/logger';
import { env } from '../config/env';

async function main() {
  const connectionString = env.DATABASE_URL;

  logger.info('Connecting to database to set up real-time triggers...');
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Create trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION notify_trips_changed()
      RETURNS trigger AS $$
      BEGIN
        PERFORM pg_notify('trips_changed', NEW.id::text);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    logger.info('Created/updated notify_trips_changed function.');

    // Create trigger
    await client.query(`
      DROP TRIGGER IF EXISTS trips_changed_trigger ON trips;
      CREATE TRIGGER trips_changed_trigger
      AFTER INSERT OR UPDATE ON trips
      FOR EACH ROW
      EXECUTE FUNCTION notify_trips_changed();
    `);
    logger.info('Created/updated trips_changed_trigger trigger.');

    logger.info('Trigger setup completed successfully.');
  } catch (err) {
    logError(err, 'Error setting up trigger:');
  } finally {
    await client.end();
  }
}

main();
