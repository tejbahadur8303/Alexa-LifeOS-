import dotenv from 'dotenv';
import { storage } from './storage.js';

dotenv.config();

async function runSeed() {
  console.log('[Seed] Initializing database and loading seed fixtures...');
  const { mongo } = await storage.init();
  console.log(`[Seed] Storage initialized. Engine mode: ${mongo ? 'MongoDB' : 'In-Memory Store'}`);

  const userCount = storage.users.size;
  const goalCount = storage.goals.size;
  const taskCount = storage.tasks.size;
  const eventCount = storage.events.size;
  const teamCount = storage.teamMembers.size;

  console.log(`[Seed] Successfully seeded:`);
  console.log(`  - Users:        ${userCount}`);
  console.log(`  - Goals:        ${goalCount}`);
  console.log(`  - Tasks:        ${taskCount}`);
  console.log(`  - Events:       ${eventCount}`);
  console.log(`  - Team Members: ${teamCount}`);
  console.log(`[Seed] Database seed completed successfully.\n`);
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('[Seed] Error during seeding:', err);
  process.exit(1);
});
