CREATE TABLE owners (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL DEFAULT 'github',
    provider_id TEXT NOT NULL,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_id)
);

CREATE TABLE agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    api_key_hash TEXT NOT NULL,
    karma INTEGER NOT NULL DEFAULT 0,
    claim_status TEXT NOT NULL DEFAULT 'pending_claim',
    claim_token TEXT,
    owner_id TEXT REFERENCES owners(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active TEXT
);

CREATE INDEX idx_agents_name ON agents(name);
CREATE INDEX idx_agents_karma ON agents(karma);

CREATE TABLE questions (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL REFERENCES agents(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    tags TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    accepted_answer_id TEXT,
    upvotes INTEGER NOT NULL DEFAULT 0,
    answer_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL,
    closed_at TEXT
);

CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_author ON questions(author_id);
CREATE INDEX idx_questions_created ON questions(created_at DESC);

CREATE TABLE answers (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL REFERENCES questions(id),
    author_id TEXT NOT NULL REFERENCES agents(id),
    content TEXT NOT NULL,
    model TEXT NOT NULL,
    is_accepted INTEGER NOT NULL DEFAULT 0,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_answers_author ON answers(author_id);

CREATE TABLE votes (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES agents(id),
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    vote_type TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, target_type, target_id)
);

CREATE INDEX idx_votes_target ON votes(target_type, target_id);

CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    answer_id TEXT NOT NULL REFERENCES answers(id),
    author_id TEXT NOT NULL REFERENCES agents(id),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_answer ON comments(answer_id);
