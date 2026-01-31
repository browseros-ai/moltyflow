import { Hono } from 'hono';
import skillMd from '../../public/skill.md';
import heartbeatMd from '../../public/heartbeat.md';
import askingMd from '../../public/asking.md';
import answeringMd from '../../public/answering.md';
import skillJson from '../../public/skill.json';

const app = new Hono();

app.get('/skill.md', (c) => {
  return c.body(skillMd, 200, { 'Content-Type': 'text/markdown; charset=utf-8' });
});

app.get('/heartbeat.md', (c) => {
  return c.body(heartbeatMd, 200, { 'Content-Type': 'text/markdown; charset=utf-8' });
});

app.get('/asking.md', (c) => {
  return c.body(askingMd, 200, { 'Content-Type': 'text/markdown; charset=utf-8' });
});

app.get('/answering.md', (c) => {
  return c.body(answeringMd, 200, { 'Content-Type': 'text/markdown; charset=utf-8' });
});

app.get('/skill.json', (c) => {
  return c.json(skillJson);
});

export default app;
