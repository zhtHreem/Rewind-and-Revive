// Live check of the stylist chatbot: real Gemini call, real product database.
//
//   npm run test:chatbot
//
// It starts a tiny throwaway server with only the chatbot route (not your whole
// backend), sends one text question and one photo, and prints what came back.
// The API key is never printed, and anything that looks like a key is scrubbed.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import chatbotRoute from '../src/routes/chatbot.js';

const key = (process.env.GEMINI_API_KEY || '').trim();

// Anything printed passes through here: the exact key value (whatever its format)
// and the classic "AIza..." shape are both replaced.
const scrub = (value) => {
  let text = String(value);
  if (key) text = text.split(key).join('[key hidden]');
  return text.replace(/AIza[0-9A-Za-z_-]{20,}/g, '[key hidden]');
};
const say = (...parts) => console.log(scrub(parts.join(' ')));

if (!key) {
  say('GEMINI_API_KEY is empty. Save it in backend/.env (GEMINI_API_KEY=...) and run this again.');
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const photo = path.join(here, '..', '..', 'frontend', 'public', 'images', 'people', 'hanger-smile.jpg');

let failures = 0;
const check = (ok, label, detail = '') => {
  if (!ok) failures += 1;
  say(ok ? 'PASS' : 'FAIL', '-', label, detail ? `(${detail})` : '');
};

const post = async (base, fields, imagePath) => {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  if (imagePath) form.append('image', new Blob([fs.readFileSync(imagePath)], { type: 'image/jpeg' }), 'photo.jpg');
  const res = await fetch(`${base}/api/chatbot/chat`, { method: 'POST', body: form });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};

await connectDB();
const app = express();
app.use('/api/chatbot', chatbotRoute);
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

try {
  say('\n1) Text question: "what goes with wide leg pants?"');
  const t = await post(base, { user_query: 'what goes with wide leg pants?', history: '[]' });
  say('   status:', t.status, '| reply:', JSON.stringify(t.body.reply || t.body.error));
  say('   products:', (t.body.products || []).map((p) => p.name).join(', ') || 'none');
  check(t.status === 200 && typeof t.body.reply === 'string' && t.body.reply.length > 5, 'Gemini answered a text question');
  check(Array.isArray(t.body.products) && t.body.products.length > 0, 'real products were suggested');

  say('\n2) Photo of a top (should suggest bottoms)');
  const i = await post(base, { user_query: 'what would go with this?', history: '[]' }, photo);
  say('   status:', i.status, '| reply:', JSON.stringify(i.body.reply || i.body.error));
  say('   products:', (i.body.products || []).map((p) => `${p.name} [${p.product_link}]`).join(', ') || 'none');
  check(i.status === 200 && typeof i.body.reply === 'string' && i.body.reply.length > 5, 'Gemini answered a photo question');
  check(!/^TYPE:/im.test(i.body.reply || ''), 'the internal TYPE line is not shown to the customer');

  say('\n3) Follow-up that depends on memory');
  const history = JSON.stringify([
    { role: 'user', text: 'I love sky blue colours' },
    { role: 'bot', text: 'Sky blue is lovely with white and tan.' },
  ]);
  const f = await post(base, { user_query: 'which of my colours should I pick for jeans?', history });
  say('   status:', f.status, '| reply:', JSON.stringify(f.body.reply || f.body.error));
  check(f.status === 200 && typeof f.body.reply === 'string', 'a follow-up with history worked');
} catch (err) {
  failures += 1;
  say('FAIL - unexpected error:', err && err.message);
} finally {
  server.close();
  await mongoose.disconnect();
}

say(failures ? `\n${failures} check(s) failed.` : '\nAll checks passed. The chatbot is working.');
process.exit(failures ? 1 : 0);
