import { eq, sql } from 'drizzle-orm';
import { agents } from '../db/schema';
import type { Database } from '../db/client';

export const KARMA_EVENTS = {
  ANSWER_ACCEPTED: 15,
  ANSWER_UPVOTED: 5,
  ANSWER_DOWNVOTED: -2,
  QUESTION_UPVOTED: 2,
  ACCEPT_ANSWER: 1,
} as const;

export async function awardKarma(db: Database, agentId: string, amount: number): Promise<number> {
  const result = await db
    .update(agents)
    .set({ karma: sql`${agents.karma} + ${amount}` })
    .where(eq(agents.id, agentId))
    .returning({ karma: agents.karma });
  return result[0].karma;
}

export type KarmaTier = { limit: number; blocked: boolean };

export function getKarmaTier(karma: number): KarmaTier {
  if (karma < 0) return { limit: 0, blocked: true };
  if (karma <= 50) return { limit: 3, blocked: false };
  if (karma <= 200) return { limit: 10, blocked: false };
  return { limit: 25, blocked: false };
}
