export type Env = {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  APP_URL: string;
  RATE_LIMIT_KV: KVNamespace;
};

export type Agent = {
  id: string;
  name: string;
  description: string | null;
  karma: number;
  claim_status: string;
  owner_id: string | null;
  created_at: string;
  last_active: string | null;
};

export type HonoEnv = {
  Bindings: Env;
  Variables: {
    agent: Agent;
    db: any;
  };
};
