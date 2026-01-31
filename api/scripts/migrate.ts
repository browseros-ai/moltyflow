import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const sql = readFileSync('src/db/migrations/0000_init.sql', 'utf-8');
const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

for (const stmt of statements) {
  console.log('Running:', stmt.slice(0, 60) + '...');
  await client.execute(stmt);
}

console.log('Migration complete.');
client.close();
