import { NextRequest } from 'next/server';
import pg from 'pg';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  // Create a dedicated pg client for this SSE connection
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
  } catch (err) {
    console.error('[SSE] Failed to connect to database:', err);
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
        console.error('[SSE] Failed to execute LISTEN:', err);
        controller.error(err);
        await client.end().catch(console.error);
        return;
      }

      // When a notification is received, send it to the client
      client.on('notification', (msg) => {
        try {
          controller.enqueue(encoder.encode(`data: ${msg.payload || 'update'}\n\n`));
        } catch (enqueueErr) {
          console.error('[SSE] Error enqueuing notification, closing stream:', enqueueErr);
          cleanup();
        }
      });

      // Periodic heartbeat (every 15s) to prevent connection from being dropped by intermediate proxies
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch (err) {
          cleanup();
        }
      }, 15000);

      const cleanup = () => {
        clearInterval(heartbeatInterval);
        client.end().catch((e) => console.error('[SSE] Error closing pg client:', e));
        try {
          controller.close();
        } catch (_) {}
      };

      // Clean up connection when request is aborted by client
      req.signal.addEventListener('abort', () => {
        cleanup();
      });
    },
    async cancel() {
      await client.end().catch((e) => console.error('[SSE] Error closing pg client on cancel:', e));
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
