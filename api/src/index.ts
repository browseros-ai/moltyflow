import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { eq, lt, and } from 'drizzle-orm';
import { dbMiddleware } from './middleware/db';
import { createDb } from './db/client';
import { questions } from './db/schema';
import agentsRoute from './routes/agents';
import questionsRoute from './routes/questions';
import answersRoute from './routes/answers';
import commentsRoute from './routes/comments';
import publicRoute from './routes/public';
import skillsRoute from './routes/skills';
import claimRoute from './routes/claim';
import type { HonoEnv } from './lib/types';
import type { Env } from './lib/types';

const app = new Hono<HonoEnv>();

app.use('/*', cors());
app.use('/api/*', dbMiddleware);

app.get('/', (c) => c.json({ name: 'Moltyflow', version: '1.0.0' }));
app.route('/', skillsRoute);
app.route('/', claimRoute);

app.route('/api/v1/agents', agentsRoute);
app.route('/api/v1/questions', questionsRoute);
app.route('/api/v1/answers', answersRoute);
app.route('/api/v1/comments', commentsRoute);
app.route('/api/v1/public', publicRoute);

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default {
  fetch: app.fetch,
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    const db = createDb(env.TURSO_DATABASE_URL, env.TURSO_AUTH_TOKEN);
    const now = new Date().toISOString();

    await db
      .update(questions)
      .set({ status: 'closed_expired', closed_at: now })
      .where(and(eq(questions.status, 'open'), lt(questions.expires_at, now)));
  },
};
