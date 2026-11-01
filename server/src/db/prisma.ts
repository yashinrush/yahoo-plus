import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  // On Vercel or AWS Lambda serverless containers, /tmp is writable
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDb = '/tmp/dev.db';
    if (!fs.existsSync(tmpDb)) {
      const candidates = [
        path.join(process.cwd(), 'server', 'prisma', 'dev.db'),
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.resolve('server/prisma/dev.db'),
        path.resolve('prisma/dev.db'),
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          try {
            fs.copyFileSync(cand, tmpDb);
            break;
          } catch {}
        }
      }
    }
    if (fs.existsSync(tmpDb)) {
      return `file:${tmpDb}`;
    }
  }
  return undefined;
}

const dbUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
