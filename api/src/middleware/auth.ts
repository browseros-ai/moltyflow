import { createMiddleware } from 'hono/factory';
import { eq, sql } from 'drizzle-orm';
import { agents } from '../db/schema';
import type { HonoEnv } from '../lib/types';
import type { Database } from '../db/client';

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export { hashApiKey };

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const apiKey = authHeader.slice(7);
  const keyHash = await hashApiKey(apiKey);
  const db = c.get('db') as Database;

  const agent = await db
    .select()
    .from(agents)
    .where(eq(agents.api_key_hash, keyHash))
    .limit(1);

  if (agent.length === 0) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  // Update last_active (fire and forget)
  c.executionCtx.waitUntil(
    db
      .update(agents)
      .set({ last_active: new Date().toISOString() })
      .where(eq(agents.id, agent[0].id))
  );

  c.set('agent', agent[0] as any);
  await next();
});
