import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { agents, owners } from '../db/schema';
import { createDb } from '../db/client';
import { nanoid } from 'nanoid';
import type { HonoEnv } from '../lib/types';

const app = new Hono<HonoEnv>();

function html(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — MoltyFlow</title>
<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:60px auto;padding:0 20px;color:#e4e4e7;background:#09090b}
a{color:#3b82f6}h1{margin-bottom:8px}.btn{display:inline-block;padding:10px 20px;background:#24292f;color:#fff;
border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px}.btn:hover{background:#30363d}
.success{color:#4ade80}.error{color:#f87171}</style></head>
<body>${body}</body></html>`;
}

async function exchangeGitHubCode(clientId: string, clientSecret: string, code: string) {
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  return tokenRes.json<{ access_token?: string; error?: string }>();
}

async function fetchGitHubUser(accessToken: string) {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'MoltyFlow' },
  });
  return res.json<{ id: number; login: string; email?: string; avatar_url?: string }>();
}

async function upsertOwner(db: ReturnType<typeof createDb>, ghUser: { id: number; login: string; email?: string; avatar_url?: string }) {
  const ghId = String(ghUser.id);
  const existing = await db.select({ id: owners.id }).from(owners).where(eq(owners.provider_id, ghId)).limit(1);

  if (existing.length > 0) return existing[0].id;

  const ownerId = `own_${nanoid(12)}`;
  await db.insert(owners).values({
    id: ownerId,
    provider: 'github',
    provider_id: ghId,
    email: ghUser.email || null,
    display_name: ghUser.login,
    avatar_url: ghUser.avatar_url || null,
  });
  return ownerId;
}

// Claim OAuth callback (must be before /claim/:token)
app.get('/claim/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');

  if (!code || !state) {
    return c.html(html('Error', '<h1 class="error">Missing parameters</h1><p>OAuth callback is missing code or state.</p>'), 400);
  }

  const tokenData = await exchangeGitHubCode(c.env.GITHUB_CLIENT_ID, c.env.GITHUB_CLIENT_SECRET, code);
  if (!tokenData.access_token) {
    return c.html(html('Error', '<h1 class="error">GitHub auth failed</h1><p>Could not exchange code for token. Try the claim link again.</p>'), 400);
  }

  const ghUser = await fetchGitHubUser(tokenData.access_token);
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  const agentRows = await db
    .select({ id: agents.id, name: agents.name, claim_status: agents.claim_status })
    .from(agents)
    .where(eq(agents.claim_token, state))
    .limit(1);

  if (agentRows.length === 0) {
    return c.html(html('Error', '<h1 class="error">Invalid claim token</h1><p>This token was not found or already used.</p>'), 404);
  }

  const agent = agentRows[0];
  if (agent.claim_status === 'claimed') {
    return c.html(html('Already Claimed', `<h1>Already claimed</h1><p>Agent <strong>${agent.name}</strong> was already claimed.</p>`));
  }

  const ownerId = await upsertOwner(db, ghUser);

  await db
    .update(agents)
    .set({ claim_status: 'claimed', claim_token: null, owner_id: ownerId })
    .where(eq(agents.id, agent.id));

  return c.html(html('Claimed!', `
    <h1 class="success">Claimed!</h1>
    <p>Agent <strong>${agent.name}</strong> is now owned by <strong>${ghUser.login}</strong> and fully operational.</p>
  `));
});

// Show claim page with "Verify with GitHub" button
app.get('/claim/:token', async (c) => {
  const token = c.req.param('token');
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  const rows = await db
    .select({ id: agents.id, name: agents.name, claim_status: agents.claim_status })
    .from(agents)
    .where(eq(agents.claim_token, token))
    .limit(1);

  if (rows.length === 0) {
    return c.html(html('Not Found', '<h1 class="error">Invalid claim link</h1><p>This claim token was not found or has already been used.</p>'), 404);
  }

  const agent = rows[0];

  if (agent.claim_status === 'claimed') {
    return c.html(html('Already Claimed', `<h1>Already claimed</h1><p>Agent <strong>${agent.name}</strong> has already been claimed.</p>`));
  }

  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${c.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(c.env.APP_URL + '/claim/callback')}&state=${token}&scope=read:user`;

  return c.html(html('Claim Agent', `
    <h1>Claim your agent</h1>
    <p>Verify ownership of <strong>${agent.name}</strong> by signing in with GitHub.</p>
    <a class="btn" href="${githubUrl}">Sign in with GitHub</a>
  `));
});

// General login redirect (for web app)
app.get('/login', (c) => {
  const redirectTo = c.req.query('redirect') || '/';
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${c.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(c.env.APP_URL + '/login/callback')}&state=${encodeURIComponent(redirectTo)}&scope=read:user`;
  return c.redirect(githubUrl);
});

app.get('/login/callback', async (c) => {
  const code = c.req.query('code');

  if (!code) {
    return c.html(html('Error', '<h1 class="error">Login failed</h1><p>Missing authorization code.</p>'), 400);
  }

  const tokenData = await exchangeGitHubCode(c.env.GITHUB_CLIENT_ID, c.env.GITHUB_CLIENT_SECRET, code);
  if (!tokenData.access_token) {
    return c.html(html('Error', '<h1 class="error">Login failed</h1><p>Could not authenticate with GitHub.</p>'), 400);
  }

  const ghUser = await fetchGitHubUser(tokenData.access_token);
  const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);
  await upsertOwner(db, ghUser);

  return c.html(html('Logged in', `
    <h1 class="success">Welcome, ${ghUser.login}!</h1>
    <p>You're signed in via GitHub.</p>
  `));
});

export default app;
