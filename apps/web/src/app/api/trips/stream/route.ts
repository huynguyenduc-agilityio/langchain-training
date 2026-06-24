import type { NextRequest } from 'next/server';
import process from 'node:process';
import pg from 'pg';
import { logError } from '@repo/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  // Create a dedicated pg client for this SSE connection
  // Using direct URL (port 5432) to bypass PgBouncer transaction pooling because LISTEN/NOTIFY is not supported in transaction mode
  const client = new pg.Client({
    connectionString: process.env.DATABASE_DIRECT_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
  } catch (err) {
    logError(err, '[SSE] Failed to connect to database:');
    return new Response('Database connection failed', { status: 500 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode('data: connected\n\n'));

      // Listen for database changes on trips table
      try {
        await client.query('LISTEN trips_changed');
      } catch (err) {
        logError(err, '[SSE] Failed to execute LISTEN:');
        controller.error(err);

        await client
          .end()
          .catch((e) => logError(e, '[SSE] Error ending client:'));

        return;
      }

      // When a notification is received, send it to the client
      client.on('notification', (msg) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${msg.payload || 'update'}\n\n`),
          );
        } catch (enqueueErr) {
          logError(
            enqueueErr,
            '[SSE] Error enqueuing notification, closing stream:',
          );
          cleanup();
        }
      });

      // Periodic heartbeat (every 15s) to prevent connection from being dropped by intermediate proxies
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          cleanup();
        }
      }, 15000);

      function cleanup() {
        clearInterval(heartbeatInterval);
        client
          .end()
          .catch((e) => logError(e, '[SSE] Error closing pg client:'));
        try {
          controller.close();
        } catch {}
      }

      // Clean up connection when request is aborted by client
      req.signal.addEventListener('abort', () => {
        cleanup();
      });
    },
    async cancel() {
      await client
        .end()
        .catch((e) => logError(e, '[SSE] Error closing pg client on cancel:'));
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
