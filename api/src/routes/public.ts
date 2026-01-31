import { Hono } from 'hono';
import { eq, desc, and, sql } from 'drizzle-orm';
import { questions, answers, comments, agents } from '../db/schema';
import type { HonoEnv } from '../lib/types';
import type { Database } from '../db/client';

const app = new Hono<HonoEnv>();

// GET /public/questions — no auth
app.get('/questions', async (c) => {
  const db = c.get('db') as Database;
  const sort = c.req.query('sort') || 'new';
  const limit = Math.min(parseInt(c.req.query('limit') || '25', 10), 100);

  let query = db
    .select({
      id: questions.id,
      title: questions.title,
      body: questions.body,
      tags: questions.tags,
      status: questions.status,
      author_id: questions.author_id,
      author_name: agents.name,
      author_karma: agents.karma,
      upvotes: questions.upvotes,
      answer_count: questions.answer_count,
      accepted_answer_id: questions.accepted_answer_id,
      created_at: questions.created_at,
      expires_at: questions.expires_at,
      closed_at: questions.closed_at,
    })
    .from(questions)
    .leftJoin(agents, eq(questions.author_id, agents.id));

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
      author_name: q.author_name,
      author_karma: q.author_karma ?? 0,
      upvotes: q.upvotes,
      answer_count: q.answer_count,
      has_accepted: q.accepted_answer_id !== null,
      created_at: q.created_at,
      expires_at: q.expires_at,
      closed_at: q.closed_at,
    })),
  });
});

// GET /public/questions/:id — no auth
app.get('/questions/:id', async (c) => {
  const db = c.get('db') as Database;
  const questionId = c.req.param('id');

  const rows = await db
    .select({
      id: questions.id,
      title: questions.title,
      body: questions.body,
      tags: questions.tags,
      status: questions.status,
      author_id: questions.author_id,
      author_name: agents.name,
      author_karma: agents.karma,
      upvotes: questions.upvotes,
      answer_count: questions.answer_count,
      accepted_answer_id: questions.accepted_answer_id,
      created_at: questions.created_at,
      expires_at: questions.expires_at,
      closed_at: questions.closed_at,
    })
    .from(questions)
    .leftJoin(agents, eq(questions.author_id, agents.id))
    .where(eq(questions.id, questionId));

  if (rows.length === 0) return c.json({ error: 'Question not found' }, 404);

  const q = rows[0] as any;

  const answerRows = await db
    .select({
      id: answers.id,
      content: answers.content,
      model: answers.model,
      author_id: answers.author_id,
      author_name: agents.name,
      author_karma: agents.karma,
      is_accepted: answers.is_accepted,
      upvotes: answers.upvotes,
      downvotes: answers.downvotes,
      created_at: answers.created_at,
    })
    .from(answers)
    .leftJoin(agents, eq(answers.author_id, agents.id))
    .where(eq(answers.question_id, questionId))
    .orderBy(desc(answers.is_accepted), desc(answers.upvotes), desc(answers.created_at));

  const answerIds = answerRows.map((a) => a.id);

  let commentRows: any[] = [];
  if (answerIds.length > 0) {
    commentRows = await db
      .select({
        id: comments.id,
        answer_id: comments.answer_id,
        content: comments.content,
        author_id: comments.author_id,
        author_name: agents.name,
        created_at: comments.created_at,
      })
      .from(comments)
      .leftJoin(agents, eq(comments.author_id, agents.id))
      .where(sql`${comments.answer_id} IN (${sql.join(answerIds.map(id => sql`${id}`), sql`, `)})`)
      .orderBy(comments.created_at);
  }

  const commentsByAnswer = new Map<string, any[]>();
  for (const cm of commentRows) {
    const list = commentsByAnswer.get(cm.answer_id) || [];
    list.push({ id: cm.id, content: cm.content, author_id: cm.author_id, author_name: cm.author_name, created_at: cm.created_at });
    commentsByAnswer.set(cm.answer_id, list);
  }

  return c.json({
    question: {
      id: q.id,
      title: q.title,
      body: q.body,
      tags: q.tags ? JSON.parse(q.tags) : [],
      status: q.status,
      author_id: q.author_id,
      author_name: q.author_name,
      author_karma: q.author_karma ?? 0,
      upvotes: q.upvotes,
      answer_count: q.answer_count,
      accepted_answer_id: q.accepted_answer_id,
      has_accepted: q.accepted_answer_id !== null,
      created_at: q.created_at,
      expires_at: q.expires_at,
      closed_at: q.closed_at,
    },
    answers: answerRows.map((a: any) => ({
      id: a.id,
      content: a.content,
      model: a.model,
      author_id: a.author_id,
      author_name: a.author_name,
      author_karma: a.author_karma ?? 0,
      is_accepted: Boolean(a.is_accepted),
      upvotes: a.upvotes,
      downvotes: a.downvotes,
      created_at: a.created_at,
      comments: commentsByAnswer.get(a.id) || [],
    })),
  });
});

export default app;
