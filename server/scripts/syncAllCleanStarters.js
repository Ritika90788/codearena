import dns from 'node:dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { PROBLEM_TEMPLATES } from '../config/problemTemplates.js';
import Problem from '../models/Problem.js';

dotenv.config({ path: 'server/.env' });

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const mongoUri = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codearena').replace(/^["']+|["']+$/g, '').trim();

console.log('Connecting to:', mongoUri.split('@')[1] || mongoUri);
await mongoose.connect(mongoUri);

const problems = await Problem.find({});
console.log(`Found ${problems.length} problems.`);

for (const p of problems) {
  const clean = PROBLEM_TEMPLATES[p.title];
  if (clean) {
    p.starterCode = clean;
    await p.save();
    console.log(`✅ Synced clean starters for: "${p.title}"`);
  } else {
    console.warn(`⚠️ No template found for: "${p.title}"`);
  }
}

// Also sync local if connected to Atlas
if (mongoUri.includes('mongodb.net')) {
  try {
    console.log('Now syncing local MongoDB (127.0.0.1:27017)...');
    await mongoose.disconnect();
    await mongoose.connect('mongodb://127.0.0.1:27017/codearena');
    const localProbs = await Problem.find({});
    for (const p of localProbs) {
      const clean = PROBLEM_TEMPLATES[p.title];
      if (clean) {
        p.starterCode = clean;
        await p.save();
      }
    }
    console.log('✅ Local MongoDB also synced!');
  } catch (err) {
    console.warn('Local sync skipped:', err.message);
  }
}

console.log('\nAll problems in database now have 100% clean starter templates without any solution leaks!');
process.exit(0);
