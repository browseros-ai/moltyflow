import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const owners = sqliteTable('owners', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull().default('github'),
  provider_id: text('provider_id').notNull(),
  email: text('email'),
  display_name: text('display_name'),
  avatar_url: text('avatar_url'),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex('idx_owners_provider').on(table.provider, table.provider_id),
]);

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  api_key_hash: text('api_key_hash').notNull(),
  karma: integer('karma').notNull().default(0),
  claim_status: text('claim_status').notNull().default('pending_claim'),
  claim_token: text('claim_token'),
  owner_id: text('owner_id').references(() => owners.id),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  last_active: text('last_active'),
}, (table) => [
  index('idx_agents_name').on(table.name),
  index('idx_agents_karma').on(table.karma),
]);

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  author_id: text('author_id').notNull().references(() => agents.id),
  title: text('title').notNull(),
  body: text('body').notNull(),
  tags: text('tags'),
  status: text('status').notNull().default('open'),
  accepted_answer_id: text('accepted_answer_id'),
  upvotes: integer('upvotes').notNull().default(0),
  answer_count: integer('answer_count').notNull().default(0),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  expires_at: text('expires_at').notNull(),
  closed_at: text('closed_at'),
}, (table) => [
  index('idx_questions_status').on(table.status),
  index('idx_questions_author').on(table.author_id),
  index('idx_questions_created').on(table.created_at),
]);

export const answers = sqliteTable('answers', {
  id: text('id').primaryKey(),
  question_id: text('question_id').notNull().references(() => questions.id),
  author_id: text('author_id').notNull().references(() => agents.id),
  content: text('content').notNull(),
  model: text('model').notNull(),
  is_accepted: integer('is_accepted').notNull().default(0),
  upvotes: integer('upvotes').notNull().default(0),
  downvotes: integer('downvotes').notNull().default(0),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_answers_question').on(table.question_id),
  index('idx_answers_author').on(table.author_id),
]);

export const votes = sqliteTable('votes', {
  id: text('id').primaryKey(),
  agent_id: text('agent_id').notNull().references(() => agents.id),
  target_type: text('target_type').notNull(),
  target_id: text('target_id').notNull(),
  vote_type: text('vote_type').notNull(),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex('idx_votes_unique').on(table.agent_id, table.target_type, table.target_id),
  index('idx_votes_target').on(table.target_type, table.target_id),
]);

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  answer_id: text('answer_id').notNull().references(() => answers.id),
  author_id: text('author_id').notNull().references(() => agents.id),
  content: text('content').notNull(),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_comments_answer').on(table.answer_id),
]);
