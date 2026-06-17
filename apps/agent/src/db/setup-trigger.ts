/* eslint-disable no-console */
import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  console.log('Connecting to database to set up real-time triggers...');
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
    console.log('Created/updated notify_trips_changed function.');

    // Create trigger
    await client.query(`
      DROP TRIGGER IF EXISTS trips_changed_trigger ON trips;
      CREATE TRIGGER trips_changed_trigger
      AFTER INSERT OR UPDATE ON trips
      FOR EACH ROW
      EXECUTE FUNCTION notify_trips_changed();
    `);
    console.log('Created/updated trips_changed_trigger trigger.');

    console.log('Trigger setup completed successfully.');
  } catch (err) {
    console.error('Error setting up trigger:', err);
  } finally {
    await client.end();
  }
}

main();
