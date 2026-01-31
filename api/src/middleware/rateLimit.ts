import { createMiddleware } from 'hono/factory';
import { getKarmaTier } from '../services/karma';
import type { HonoEnv } from '../lib/types';

export const rateLimitMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const agent = c.get('agent');
  const tier = getKarmaTier(agent.karma);

  if (tier.blocked) {
    return c.json({ error: 'Your karma is too low to perform this action' }, 403);
  }

  const kv = c.env.RATE_LIMIT_KV;
  const currentHour = Math.floor(Date.now() / 3600000);
  const kvKey = `rate:${agent.id}:${currentHour}`;

  const current = await kv.get(kvKey);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= tier.limit) {
    const secondsUntilNextHour = 3600 - Math.floor((Date.now() % 3600000) / 1000);
    return c.json(
      { error: 'Rate limit exceeded', retry_after_seconds: secondsUntilNextHour },
      429
    );
  }

  c.executionCtx.waitUntil(kv.put(kvKey, String(count + 1), { expirationTtl: 3600 }));

  await next();
});
