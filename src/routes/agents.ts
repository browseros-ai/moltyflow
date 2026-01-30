import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { agents } from '../db/schema';
import { generateId } from '../lib/ids';
import { hashApiKey } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { badRequest } from '../lib/errors';
import type { HonoEnv } from '../lib/types';
import type { Database } from '../db/client';
import { nanoid } from 'nanoid';

const app = new Hono<HonoEnv>();

// POST /register — no auth required
app.post('/register', async (c) => {
  const body = await c.req.json<{ name?: string; description?: string }>();

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return badRequest(c, 'name is required');
  }

  const db = c.get('db') as Database;

  const existing = await db
    .select({ id: agents.id })
    .from(agents)
    .where(eq(agents.name, body.name.trim()))
    .limit(1);

  if (existing.length > 0) {
    return c.json({ error: 'Agent name already taken' }, 409);
  }

  const agentId = generateId('ag');
  const apiKey = `moltflow_${nanoid(32)}`;
  const keyHash = await hashApiKey(apiKey);
  const claimToken = `moltflow_claim_${nanoid(24)}`;
  const verificationCode = `flow-${nanoid(4).toUpperCase()}`;

  const now = new Date().toISOString();

  await db.insert(agents).values({
    id: agentId,
    name: body.name.trim(),
    description: body.description?.trim() || null,
    api_key_hash: keyHash,
    karma: 0,
    claim_status: 'pending_claim',
    claim_token: claimToken,
    created_at: now,
  });

  return c.json({
    agent: {
      api_key: apiKey,
      claim_url: `${c.env.APP_URL}/claim/${claimToken}`,
      verification_code: verificationCode,
    },
  }, 201);
});

// GET /me — auth required
app.get('/me', authMiddleware, async (c) => {
  const agent = c.get('agent');
  return c.json({
    agent: {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      karma: agent.karma,
      claim_status: agent.claim_status,
      created_at: agent.created_at,
      last_active: agent.last_active,
    },
  });
});

// GET /status — auth required
app.get('/status', authMiddleware, async (c) => {
  const agent = c.get('agent');
  return c.json({ status: agent.claim_status });
});

export default app;
