import { z } from 'zod';

// NEXT_PHASE is set to 'phase-production-build' during `next build`.
// Server-side env vars are only needed at runtime, not at build time.
// NEXT_PUBLIC_* vars must be validated at build time as they are baked into the client bundle.
const isBuildPhase =
  process.env.NEXT_PHASE === 'phase-production-build';

// ── Client-side vars (always required — baked into JS bundle at build time) ──
const clientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_API_KEY is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_APP_ID is required'),
});

// ── Server-side vars (only required at runtime, skipped during `next build`) ──
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DATABASE_DIRECT_URL: z
    .string()
    .url('DATABASE_DIRECT_URL must be a valid URL')
    .optional(),
  LANGGRAPH_DEPLOYMENT_URL: z
    .string()
    .url('LANGGRAPH_DEPLOYMENT_URL must be a valid URL'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

// Validate client vars (always)
const clientParsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

if (!clientParsed.success) {
  console.error('❌ Invalid environment variables for Web:');
  console.error(JSON.stringify(clientParsed.error.format(), null, 2));
  throw new Error('Invalid environment variables for Web application');
}

// Validate server vars (runtime only — skip during `next build`)
let serverEnvData: z.infer<typeof serverEnvSchema> = {
  DATABASE_URL: '',
  DATABASE_DIRECT_URL: undefined,
  LANGGRAPH_DEPLOYMENT_URL: '',
  NODE_ENV: 'production',
};

if (!isBuildPhase) {
  const serverParsed = serverEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_DIRECT_URL: process.env.DATABASE_DIRECT_URL,
    LANGGRAPH_DEPLOYMENT_URL: process.env.LANGGRAPH_DEPLOYMENT_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!serverParsed.success) {
    console.error('❌ Invalid server environment variables for Web:');
    console.error(JSON.stringify(serverParsed.error.format(), null, 2));
    throw new Error('Invalid server environment variables for Web application');
  }

  serverEnvData = serverParsed.data;
}

export const env = {
  ...clientParsed.data,
  ...serverEnvData,
};

