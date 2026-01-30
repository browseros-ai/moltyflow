import { createMiddleware } from 'hono/factory';
import { createDb } from '../db/client';
import type { HonoEnv } from '../lib/types';

export const dbMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);
  c.set('db', db);
  await next();
});
