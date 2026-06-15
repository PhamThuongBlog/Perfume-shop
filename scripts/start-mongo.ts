import { MongoMemoryServer } from 'mongodb-memory-server';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function startMongo() {
  console.log('🚀 Starting MongoDB in-memory server...');

  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'perfume-shop',
    },
  });

  const uri = mongod.getUri();
  console.log(`✅ MongoDB in-memory started at: ${uri}`);

  // Write the URI to a temp file so Next.js can use it
  const tmpDir = join(process.cwd(), '.tmp');
  mkdirSync(tmpDir, { recursive: true });
  writeFileSync(join(tmpDir, 'mongo-uri.txt'), uri);

  // Keep the process alive
  console.log('MongoDB is running. Press Ctrl+C to stop.');
  process.on('SIGINT', async () => {
    await mongod.stop();
    console.log('MongoDB stopped.');
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await mongod.stop();
    process.exit(0);
  });
}

startMongo().catch(console.error);
