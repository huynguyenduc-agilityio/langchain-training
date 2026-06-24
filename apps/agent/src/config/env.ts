import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env variables
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8123),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DATABASE_DIRECT_URL: z
    .string()
    .url('DATABASE_DIRECT_URL must be a valid URL'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  ORS_API_KEY: z.string().min(1, 'ORS_API_KEY is required'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables for Agent:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
