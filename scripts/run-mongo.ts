import { MongoMemoryReplSet } from 'mongodb-memory-server';

async function main() {
  console.log('🚀 Starting MongoDB replica set on port 27017...');
  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
    instanceOpts: [{ port: 27017 }],
  });
  const uri = replSet.getUri('perfume-shop');
  console.log(`✅ MongoDB replica set ready: ${uri}`);

  // Keep alive
  process.on('SIGINT', async () => { await replSet.stop(); process.exit(0); });
  process.on('SIGTERM', async () => { await replSet.stop(); process.exit(0); });
}
main().catch(e => { console.error(e); process.exit(1); });
