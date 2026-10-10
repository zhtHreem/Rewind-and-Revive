// Gives the accounts that own the demo products international display names, so the
// shop reads like a real marketplace. Login is by email, so this does not affect sign-in.
//
//   node scripts/rename-demo-sellers.js            rename (writes a backup first)
//   node scripts/rename-demo-sellers.js --revert   restore the names from the backup
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';

// current username -> new display name
const RENAMES = {
  Hareem: 'Elena Marchetti',
  AfifaT: 'Noah Lindqvist',
  'afeefa khaliq': 'Amara Okafor',
  'Afifa Maryam': 'Mateo Alvarez',
};

const here = path.dirname(fileURLToPath(import.meta.url));
const backupFile = path.join(here, '..', 'backups', 'seller-usernames-before-rename.json');

const run = async () => {
  await connectDB();
  const users = mongoose.connection.db.collection('users');

  if (process.argv.includes('--revert')) {
    const saved = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    for (const { _id, username } of saved) {
      await users.updateOne({ _id: new mongoose.Types.ObjectId(_id) }, { $set: { username } });
    }
    console.log(`Restored ${saved.length} username(s) from ${backupFile}`);
    await mongoose.disconnect();
    return;
  }

  const targets = await users.find({ username: { $in: Object.keys(RENAMES) } }).project({ username: 1 }).toArray();
  if (!targets.length) {
    console.log('No matching accounts found (already renamed?).');
    await mongoose.disconnect();
    return;
  }

  fs.mkdirSync(path.dirname(backupFile), { recursive: true });
  if (!fs.existsSync(backupFile)) {
    fs.writeFileSync(backupFile, JSON.stringify(targets.map((u) => ({ _id: String(u._id), username: u.username })), null, 2));
    console.log(`Backed up ${targets.length} username(s) to ${backupFile}`);
  }

  for (const u of targets) {
    await users.updateOne({ _id: u._id }, { $set: { username: RENAMES[u.username] } });
    console.log(`  ${u.username}  ->  ${RENAMES[u.username]}`);
  }
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Rename failed:', err.message);
  process.exit(1);
});
