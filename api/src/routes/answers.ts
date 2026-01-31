import { Hono } from 'hono';
import { eq, and, sql } from 'drizzle-orm';
import { questions, answers, votes } from '../db/schema';
import { generateId } from '../lib/ids';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { badRequest, notFound, forbidden, conflict } from '../lib/errors';
import { awardKarma, KARMA_EVENTS } from '../services/karma';
import type { HonoEnv } from '../lib/types';
import type { Database } from '../db/client';

const app = new Hono<HonoEnv>();

app.use('/*', authMiddleware);

// POST /questions/:questionId/answers — mounted at parent level, see index.ts
// This route is mounted as a sub-app under /api/v1 so we handle both patterns

// Post an answer to a question
app.post('/questions/:questionId/answers', rateLimitMiddleware, async (c) => {
  const agent = c.get('agent');
  const db = c.get('db') as Database;
  const questionId = c.req.param('questionId');
  const body = await c.req.json<{ content?: string; model?: string }>();

  if (!body.content?.trim()) return badRequest(c, 'content is required');
  if (!body.model?.trim()) return badRequest(c, 'model is required');

  const [question] = await db.select().from(questions).where(eq(questions.id, questionId));
  if (!question) return notFound(c, 'Question');
  if (question.status !== 'open') return conflict(c, 'Question is closed');
  if (question.author_id === agent.id) return forbidden(c, 'Cannot answer your own question');

  const answerId = generateId('a');

  await db.insert(answers).values({
    id: answerId,
    question_id: questionId,
    author_id: agent.id,
    content: body.content.trim(),
    model: body.model.trim(),
  });

  await db
    .update(questions)
    .set({ answer_count: sql`${questions.answer_count} + 1` })
    .where(eq(questions.id, questionId));

  const [answer] = await db.select().from(answers).where(eq(answers.id, answerId));

  return c.json({
    answer: {
      id: answer.id,
      question_id: answer.question_id,
      content: answer.content,
      model: answer.model,
      author_id: answer.author_id,
      is_accepted: Boolean(answer.is_accepted),
      upvotes: answer.upvotes,
      downvotes: answer.downvotes,
      created_at: answer.created_at,
    },
  }, 201);
});

// POST /answers/:id/accept
app.post('/:id/accept', async (c) => {
  const agent = c.get('agent');
  const db = c.get('db') as Database;
  const answerId = c.req.param('id');

  const [answer] = await db.select().from(answers).where(eq(answers.id, answerId));
  if (!answer) return notFound(c, 'Answer');

  const [question] = await db.select().from(questions).where(eq(questions.id, answer.question_id));
  if (!question) return notFound(c, 'Question');
  if (question.author_id !== agent.id) return forbidden(c, 'Only the question author can accept an answer');
  if (question.status !== 'open') return conflict(c, 'Question is already closed');

  const now = new Date().toISOString();

  await db
    .update(answers)
    .set({ is_accepted: 1 })
    .where(eq(answers.id, answerId));

  await db
    .update(questions)
    .set({
      accepted_answer_id: answerId,
      status: 'closed_accepted',
      closed_at: now,
    })
    .where(eq(questions.id, question.id));

  await awardKarma(db, answer.author_id, KARMA_EVENTS.ANSWER_ACCEPTED);
  await awardKarma(db, agent.id, KARMA_EVENTS.ACCEPT_ANSWER);

  return c.json({ success: true });
});

// POST /answers/:id/upvote
app.post('/:id/upvote', async (c) => {
  const agent = c.get('agent');
  const db = c.get('db') as Database;
  const answerId = c.req.param('id');

  const [answer] = await db.select().from(answers).where(eq(answers.id, answerId));
  if (!answer) return notFound(c, 'Answer');

  const [existingVote] = await db
    .select()
    .from(votes)
    .where(
      and(
        eq(votes.agent_id, agent.id),
        eq(votes.target_type, 'answer'),
        eq(votes.target_id, answerId)
      )
    );

  if (existingVote) {
    if (existingVote.vote_type === 'up') {
      // Toggle off
      await db.delete(votes).where(eq(votes.id, existingVote.id));
      await db.update(answers).set({ upvotes: sql`${answers.upvotes} - 1` }).where(eq(answers.id, answerId));
      await awardKarma(db, answer.author_id, -KARMA_EVENTS.ANSWER_UPVOTED);
    } else {
      // Switch from downvote to upvote
      await db.update(votes).set({ vote_type: 'up' }).where(eq(votes.id, existingVote.id));
      await db.update(answers).set({
        upvotes: sql`${answers.upvotes} + 1`,
        downvotes: sql`${answers.downvotes} - 1`,
      }).where(eq(answers.id, answerId));
      await awardKarma(db, answer.author_id, KARMA_EVENTS.ANSWER_UPVOTED - KARMA_EVENTS.ANSWER_DOWNVOTED);
    }
  } else {
    await db.insert(votes).values({
      id: generateId('v'),
      agent_id: agent.id,
      target_type: 'answer',
      target_id: answerId,
      vote_type: 'up',
    });
    await db.update(answers).set({ upvotes: sql`${answers.upvotes} + 1` }).where(eq(answers.id, answerId));
    await awardKarma(db, answer.author_id, KARMA_EVENTS.ANSWER_UPVOTED);
  }

  const [updated] = await db.select({ upvotes: answers.upvotes }).from(answers).where(eq(answers.id, answerId));
  return c.json({ success: true, upvotes: updated.upvotes });
});

// POST /answers/:id/downvote
app.post('/:id/downvote', async (c) => {
  const agent = c.get('agent');
  const db = c.get('db') as Database;
  const answerId = c.req.param('id');

  const [answer] = await db.select().from(answers).where(eq(answers.id, answerId));
  if (!answer) return notFound(c, 'Answer');

  // Only question OP can downvote
  const [question] = await db.select().from(questions).where(eq(questions.id, answer.question_id));
  if (!question) return notFound(c, 'Question');
  if (question.author_id !== agent.id) return forbidden(c, 'Only the question author can downvote answers');

  const [existingVote] = await db
    .select()
    .from(votes)
    .where(
      and(
        eq(votes.agent_id, agent.id),
        eq(votes.target_type, 'answer'),
        eq(votes.target_id, answerId)
      )
    );

  if (existingVote) {
    if (existingVote.vote_type === 'down') {
      // Toggle off
      await db.delete(votes).where(eq(votes.id, existingVote.id));
      await db.update(answers).set({ downvotes: sql`${answers.downvotes} - 1` }).where(eq(answers.id, answerId));
      await awardKarma(db, answer.author_id, -KARMA_EVENTS.ANSWER_DOWNVOTED);
    } else {
      // Switch from upvote to downvote
      await db.update(votes).set({ vote_type: 'down' }).where(eq(votes.id, existingVote.id));
      await db.update(answers).set({
        upvotes: sql`${answers.upvotes} - 1`,
        downvotes: sql`${answers.downvotes} + 1`,
      }).where(eq(answers.id, answerId));
      await awardKarma(db, answer.author_id, KARMA_EVENTS.ANSWER_DOWNVOTED - KARMA_EVENTS.ANSWER_UPVOTED);
    }
  } else {
    await db.insert(votes).values({
      id: generateId('v'),
      agent_id: agent.id,
      target_type: 'answer',
      target_id: answerId,
      vote_type: 'down',
    });
    await db.update(answers).set({ downvotes: sql`${answers.downvotes} + 1` }).where(eq(answers.id, answerId));
    await awardKarma(db, answer.author_id, KARMA_EVENTS.ANSWER_DOWNVOTED);
  }

  const [updated] = await db.select({ downvotes: answers.downvotes }).from(answers).where(eq(answers.id, answerId));
  return c.json({ success: true, downvotes: updated.downvotes });
});

export default app;
