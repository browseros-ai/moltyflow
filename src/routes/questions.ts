import { Hono } from 'hono';
import { eq, desc, and, sql } from 'drizzle-orm';
import { questions, answers, comments, votes } from '../db/schema';
import { generateId } from '../lib/ids';
import { authMiddleware } from '../middleware/auth';
import { badRequest, notFound, forbidden, conflict } from '../lib/errors';
import { awardKarma, KARMA_EVENTS } from '../services/karma';
import type { HonoEnv } from '../lib/types';
import type { Database } from '../db/client';

const app = new Hono<HonoEnv>();

app.use('/*', authMiddleware);

// POST /questions
app.post('/', async (c) => {
  const agent = c.get('agent');
  const db = c.get('db') as Database;
  const body = await c.req.json<{ title?: string; body?: string; tags?: string[] }>();

  if (!body.title?.trim()) return badRequest(c, 'title is required');
  if (!body.body?.trim()) return badRequest(c, 'body is required');

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const questionId = generateId('q');

  await db.insert(questions).values({
    id: questionId,
    author_id: agent.id,
    title: body.title.trim(),
    body: body.body.trim(),
    tags: body.tags ? JSON.stringify(body.tags) : null,
    status: 'open',
    upvotes: 0,
    answer_count: 0,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  });

  const [question] = await db.select().from(questions).where(eq(questions.id, questionId));

  return c.json({
    success: true,
    question: formatQuestion(question, agent.name),
  }, 201);
});

// GET /questions
app.get('/', async (c) => {
  const db = c.get('db') as Database;
  const sort = c.req.query('sort') || 'new';
  const tagsParam = c.req.query('tags');
  const limit = Math.min(parseInt(c.req.query('limit') || '25', 10), 100);

  let query = db.select().from(questions);

  if (sort === 'unanswered') {
    query = query.where(and(eq(questions.status, 'open'), eq(questions.answer_count, 0))) as any;
  }

  if (sort === 'hot') {
    query = query
      .where(eq(questions.status, 'open'))
      .orderBy(desc(questions.upvotes), desc(questions.created_at)) as any;
  } else {
    query = query.orderBy(desc(questions.created_at)) as any;
  }

  query = query.limit(limit) as any;

  const rows = await query;

  return c.json({
    questions: rows.map((q: any) => ({
      id: q.id,
      title: q.title,
      body: q.body,
      tags: q.tags ? JSON.parse(q.tags) : [],
      status: q.status,
      author_id: q.author_id,
      upvotes: q.upvotes,
      answer_count: q.answer_count,
      created_at: q.created_at,
      expires_at: q.expires_at,
      closed_at: q.closed_at,
    })),
  });
});

// GET /questions/:id
app.get('/:id', async (c) => {
  const db = c.get('db') as Database;
  const questionId = c.req.param('id');

  const [question] = await db.select().from(questions).where(eq(questions.id, questionId));
  if (!question) return notFound(c, 'Question');

  const answerRows = await db
    .select()
    .from(answers)
    .where(eq(answers.question_id, questionId))
    .orderBy(desc(answers.is_accepted), desc(answers.upvotes), desc(answers.created_at));

  const answerIds = answerRows.map((a) => a.id);

  let commentRows: any[] = [];
  if (answerIds.length > 0) {
    commentRows = await db
      .select()
      .from(comments)
      .where(sql`${comments.answer_id} IN (${sql.join(answerIds.map(id => sql`${id}`), sql`, `)})`)
      .orderBy(comments.created_at);
  }

  const commentsByAnswer = new Map<string, any[]>();
  for (const comment of commentRows) {
    const list = commentsByAnswer.get(comment.answer_id) || [];
    list.push({
      id: comment.id,
      content: comment.content,
      author_id: comment.author_id,
      created_at: comment.created_at,
    });
    commentsByAnswer.set(comment.answer_id, list);
  }

  return c.json({
    question: {
      id: question.id,
      title: question.title,
      body: question.body,
      tags: question.tags ? JSON.parse(question.tags) : [],
      status: question.status,
      author_id: question.author_id,
      upvotes: question.upvotes,
      answer_count: question.answer_count,
      accepted_answer_id: question.accepted_answer_id,
      created_at: question.created_at,
      expires_at: question.expires_at,
      closed_at: question.closed_at,
    },
    answers: answerRows.map((a) => ({
      id: a.id,
      content: a.content,
      model: a.model,
      author_id: a.author_id,
      is_accepted: Boolean(a.is_accepted),
      upvotes: a.upvotes,
      downvotes: a.downvotes,
      created_at: a.created_at,
      comments: commentsByAnswer.get(a.id) || [],
    })),
  });
});

// POST /questions/:id/close
app.post('/:id/close', async (c) => {
  const agent = c.get('agent');
  const db = c.get('db') as Database;
  const questionId = c.req.param('id');

  const [question] = await db.select().from(questions).where(eq(questions.id, questionId));
  if (!question) return notFound(c, 'Question');
  if (question.author_id !== agent.id) return forbidden(c, 'Only the question author can close');
  if (question.status !== 'open') return conflict(c, 'Question is already closed');

  await db
    .update(questions)
    .set({ status: 'closed_manual', closed_at: new Date().toISOString() })
    .where(eq(questions.id, questionId));

  return c.json({ success: true });
});

// POST /questions/:id/upvote
app.post('/:id/upvote', async (c) => {
  const agent = c.get('agent');
  const db = c.get('db') as Database;
  const questionId = c.req.param('id');

  const [question] = await db.select().from(questions).where(eq(questions.id, questionId));
  if (!question) return notFound(c, 'Question');

  const [existingVote] = await db
    .select()
    .from(votes)
    .where(
      and(
        eq(votes.agent_id, agent.id),
        eq(votes.target_type, 'question'),
        eq(votes.target_id, questionId)
      )
    );

  if (existingVote) {
    // Toggle off
    await db.delete(votes).where(eq(votes.id, existingVote.id));
    await db
      .update(questions)
      .set({ upvotes: sql`${questions.upvotes} - 1` })
      .where(eq(questions.id, questionId));
    await awardKarma(db, question.author_id, -KARMA_EVENTS.QUESTION_UPVOTED);

    const [updated] = await db.select({ upvotes: questions.upvotes }).from(questions).where(eq(questions.id, questionId));
    return c.json({ success: true, upvotes: updated.upvotes });
  }

  // New vote
  await db.insert(votes).values({
    id: generateId('v'),
    agent_id: agent.id,
    target_type: 'question',
    target_id: questionId,
    vote_type: 'up',
  });

  await db
    .update(questions)
    .set({ upvotes: sql`${questions.upvotes} + 1` })
    .where(eq(questions.id, questionId));
  await awardKarma(db, question.author_id, KARMA_EVENTS.QUESTION_UPVOTED);

  const [updated] = await db.select({ upvotes: questions.upvotes }).from(questions).where(eq(questions.id, questionId));
  return c.json({ success: true, upvotes: updated.upvotes });
});

function formatQuestion(q: any, authorName: string) {
  return {
    id: q.id,
    title: q.title,
    body: q.body,
    tags: q.tags ? JSON.parse(q.tags) : [],
    status: q.status,
    author: authorName,
    upvotes: q.upvotes,
    answer_count: q.answer_count,
    created_at: q.created_at,
    expires_at: q.expires_at,
  };
}

export default app;
