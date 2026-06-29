import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';

import '../config/env';
import { db } from '../db/index';
import { knowledgeDocuments } from '../db/schema';
import { indexDocuments } from './loader';
import { logger, logError } from '@repo/logger';

const KNOWLEDGE_BASE_DIR = path.resolve(process.cwd(), 'knowledge-base');

function getCategoryFromFilename(
  filename: string,
): 'faq' | 'policies' | 'locations' | 'general' {
  const base = path.basename(filename, path.extname(filename)).toLowerCase();
  if (base.includes('faq')) return 'faq';
  if (base.includes('polic')) return 'policies';
  if (base.includes('location')) return 'locations';
  return 'general';
}

async function main() {
  try {
    // Create table + enum if not exists
    logger.info('Creating knowledge_documents table...');
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE knowledge_category AS ENUM ('faq', 'policies', 'locations', 'general');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS knowledge_documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category knowledge_category NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    logger.info('Table created (or already exists).');

    // Read markdown files from knowledge-base/ directory
    if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
      logger.warn(
        `No knowledge-base/ directory found at ${KNOWLEDGE_BASE_DIR}`,
      );
      logger.warn(
        '   Create markdown files there or add content directly via Supabase Dashboard.',
      );
      process.exit(0);
    }

    const files = fs
      .readdirSync(KNOWLEDGE_BASE_DIR)
      .filter((f) => f.endsWith('.md'));

    if (files.length === 0) {
      logger.warn('No .md files found in knowledge-base/');
      process.exit(0);
    }

    // Clear existing data and insert fresh
    logger.info('Clearing existing knowledge documents...');
    await db.delete(knowledgeDocuments);

    logger.info(`Seeding ${files.length} documents from knowledge-base/...`);
    for (const file of files) {
      const filePath = path.join(KNOWLEDGE_BASE_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const category = getCategoryFromFilename(file);
      const title = path.basename(file, '.md');
      const id = `kb-${title}`;

      await db.insert(knowledgeDocuments).values({
        id,
        title,
        content,
        category,
      });

      logger.info(`  Inserted: ${title} (category: ${category})`);
    }

    // Re-index vector store from DB
    logger.info('\nRe-indexing vector store from database...');
    await indexDocuments();

    logger.info(
      '\nSeed complete! Knowledge base is now stored in Supabase DB.',
    );
    logger.info(
      '   You can manage content via Supabase Dashboard → Table Editor → knowledge_documents',
    );
    process.exit(0);
  } catch (error) {
    logError(error, 'Seed failed:');
    process.exit(1);
  }
}

main();
