/**
 * Start MongoDB in-memory → seed database → start Next.js dev server.
 * Usage: npx tsx scripts/dev-with-mongo.ts
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn, execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  // 1. Start MongoDB in-memory
  console.log('🚀 Starting MongoDB in-memory...');
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27017, dbName: 'perfume-shop' },
  });
  const uri = mongod.getUri();
  console.log(`✅ MongoDB ready: ${uri}`);

  // 2. Update .env with real MongoDB URI
  const envPath = join(process.cwd(), '.env');
  let envContent = readFileSync(envPath, 'utf-8');
  envContent = envContent.replace(
    /^DATABASE_URL=.*$/m,
    `DATABASE_URL="${uri}"`
  );
  writeFileSync(envPath, envContent, 'utf-8');

  // 3. Generate Prisma client & seed
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit', cwd: process.cwd() });

  console.log('🌱 Seeding database...');
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', cwd: process.cwd() });

  // 4. Start Next.js dev server
  console.log('⚡ Starting Next.js dev server...');
  const nextDev = spawn('npx', ['next', 'dev'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: true,
  });

  // 5. Cleanup on exit
  const cleanup = async () => {
    console.log('\n🛑 Shutting down...');
    nextDev.kill();
    await mongod.stop();
    console.log('✅ Done.');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  nextDev.on('close', () => cleanup());
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
