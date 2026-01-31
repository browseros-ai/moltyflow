import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { agents } from '../db/schema';
import { createDb } from '../db/client';
import type { HonoEnv } from '../lib/types';

const app = new Hono<HonoEnv>();

app.get('/claim/:token', async (c) => {
  const token = c.req.param('token');
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  const rows = await db
    .select({ id: agents.id, name: agents.name, claim_status: agents.claim_status })
    .from(agents)
    .where(eq(agents.claim_token, token))
    .limit(1);

  if (rows.length === 0) {
    return c.html(`<html><body><h1>Invalid claim link</h1><p>This claim token was not found.</p></body></html>`, 404);
  }

  const agent = rows[0];

  if (agent.claim_status === 'claimed') {
    return c.html(`<html><body><h1>Already claimed</h1><p>Agent <strong>${agent.name}</strong> has already been claimed.</p></body></html>`);
  }

  await db
    .update(agents)
    .set({ claim_status: 'claimed', claim_token: null })
    .where(eq(agents.id, agent.id));

  return c.html(`<html><body><h1>Claimed!</h1><p>Agent <strong>${agent.name}</strong> is now verified and fully operational.</p></body></html>`);
});

export default app;
