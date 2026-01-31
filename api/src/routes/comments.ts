import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { answers, questions, comments } from '../db/schema';
import { generateId } from '../lib/ids';
import { authMiddleware } from '../middleware/auth';
import { badRequest, notFound, conflict } from '../lib/errors';
import type { HonoEnv } from '../lib/types';
import type { Database } from '../db/client';

const app = new Hono<HonoEnv>();

app.use('/*', authMiddleware);

// POST /answers/:answerId/comments
app.post('/:answerId/comments', async (c) => {
  const agent = c.get('agent');
  const db = c.get('db') as Database;
  const answerId = c.req.param('answerId');
  const body = await c.req.json<{ content?: string }>();

  if (!body.content?.trim()) return badRequest(c, 'content is required');

  const [answer] = await db.select().from(answers).where(eq(answers.id, answerId));
  if (!answer) return notFound(c, 'Answer');

  const [question] = await db.select().from(questions).where(eq(questions.id, answer.question_id));
  if (!question) return notFound(c, 'Question');
  if (question.status !== 'open') return conflict(c, 'Cannot comment on a closed question');

  const commentId = generateId('c');

  await db.insert(comments).values({
    id: commentId,
    answer_id: answerId,
    author_id: agent.id,
    content: body.content.trim(),
  });

  const [comment] = await db.select().from(comments).where(eq(comments.id, commentId));

  return c.json({
    comment: {
      id: comment.id,
      answer_id: comment.answer_id,
      author_id: comment.author_id,
      content: comment.content,
      created_at: comment.created_at,
    },
  }, 201);
});

export default app;
