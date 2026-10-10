// One-time conversion of stored prices from PKR to USD.
//
//   node scripts/convert-pkr-to-usd.js            dry run: prints what would change
//   node scripts/convert-pkr-to-usd.js --apply    back up, convert, and record a marker
//
// Rate: 280 PKR per USD. Amounts are rounded to friendly dollar values. Sample
// lots are skipped (the seed script writes them in dollars). A marker document
// stops the conversion from running twice.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';

const RATE = 280;

const toUsd = (pkr) => {
  const v = Number(pkr) / RATE;
  if (!Number.isFinite(v) || v <= 0) return 0;
  if (v < 50) return Math.max(1, Math.round(v));
  if (v < 500) return Math.round(v / 5) * 5;
  return Math.round(v / 10) * 10;
};
const toUsdExact = (pkr) => Math.round((Number(pkr) / RATE) * 100) / 100;

const apply = process.argv.includes('--apply');

const run = async () => {
  await connectDB();
  const db = mongoose.connection.db;

  const marker = await db.collection('migrations').findOne({ name: 'pkr-to-usd' });
  if (marker) {
    console.log(`Already converted on ${marker.at.toISOString()}. Nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  const products = await db.collection('products').find({}).toArray();
  const lots = await db.collection('bidproducts').find({ isSample: { $ne: true } }).toArray();
  const lotIds = new Set(lots.map((l) => String(l._id)));
  const bids = (await db.collection('biddings').find({}).toArray()).filter((b) => lotIds.has(String(b.productId)));
  const payments = await db.collection('payments').find({}).toArray();
  const users = await db.collection('users').find({}).toArray();

  const plan = [];
  for (const p of products) plan.push({ c: 'products', id: p._id, set: { price: toUsd(p.price) }, note: `${p.name}: ${p.price} -> ${toUsd(p.price)}` });
  const lotStart = new Map();
  for (const l of lots) {
    const set = { startingPrice: toUsd(l.startingPrice) };
    if (l.estimateLow) set.estimateLow = toUsd(l.estimateLow);
    if (l.estimateHigh) set.estimateHigh = toUsd(l.estimateHigh);
    if (l.soldFor) set.soldFor = toUsd(l.soldFor);
    lotStart.set(String(l._id), set.startingPrice);
    plan.push({ c: 'bidproducts', id: l._id, set, note: `${l.name}: start ${l.startingPrice} -> ${set.startingPrice}` });
  }
  for (const b of bids) {
    const floor = lotStart.get(String(b.productId)) || 1;
    plan.push({ c: 'biddings', id: b._id, set: { bidAmount: Math.max(toUsd(b.bidAmount), floor) }, note: `bid ${b.bidAmount} -> ${Math.max(toUsd(b.bidAmount), floor)}` });
  }
  for (const pay of payments) plan.push({ c: 'payments', id: pay._id, set: { amount: toUsd(pay.amount), currency: 'usd' }, note: `payment ${pay.amount} -> ${toUsd(pay.amount)}` });
  for (const u of users) {
    const st = u.stats || {};
    if (st.totalSpent || st.totalEarned) {
      plan.push({
        c: 'users', id: u._id,
        set: { 'stats.totalSpent': toUsdExact(st.totalSpent || 0), 'stats.totalEarned': toUsdExact(st.totalEarned || 0) },
        note: `user ${u.username}: spent ${st.totalSpent || 0}, earned ${st.totalEarned || 0}`,
      });
    }
  }

  const byCollection = plan.reduce((a, x) => ({ ...a, [x.c]: (a[x.c] || 0) + 1 }), {});
  console.log('Planned changes:', byCollection);
  plan.slice(0, 12).forEach((x) => console.log('  ', x.note));
  if (plan.length > 12) console.log(`   ... and ${plan.length - 12} more`);

  if (!apply) {
    console.log('\nDry run only. Re-run with --apply to back up and convert.');
    await mongoose.disconnect();
    return;
  }

  const here = path.dirname(fileURLToPath(import.meta.url));
  const dir = path.join(here, '..', 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const backup = { products, bidproducts: lots, biddings: bids, payments, users: users.map((u) => ({ _id: u._id, username: u.username, stats: u.stats })) };
  const file = path.join(dir, `before-usd-conversion-${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`Backup written to ${file}`);

  for (const x of plan) await db.collection(x.c).updateOne({ _id: x.id }, { $set: x.set });
  await db.collection('migrations').insertOne({ name: 'pkr-to-usd', rate: RATE, at: new Date(), changed: plan.length });
  console.log(`Converted ${plan.length} document(s) to USD.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Conversion failed:', err.message);
  process.exit(1);
});
