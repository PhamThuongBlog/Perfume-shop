import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const u = await p.user.findUnique({ where: { email: 'admin@aura.com' } });
  console.log('Found:', u?.email, 'role:', u?.role);
  if (u) {
    await p.user.update({ where: { email: 'admin@aura.com' }, data: { role: 'ADMIN' } });
    console.log('UPDATED -> ADMIN');
  } else {
    await p.user.create({ data: { name: 'Admin AURA', email: 'admin@aura.com', password: 'temp_hashed_pw', role: 'ADMIN' } });
    console.log('CREATED new admin');
  }
  const c = await p.user.findUnique({ where: { email: 'admin@aura.com' } });
  console.log('Result role:', c?.role);
  await p.$disconnect();
}
main().catch(e => console.error(e));
