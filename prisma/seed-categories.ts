/**
 * SEED: Them san pham vao cac danh muc de moi category co >= 5 sp
 * + Gift Sets collection
 */
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function main() {
  console.log('=== BO SUNG SAN PHAM THEO DANH MUC ===\n');

  // Get categories
  const catNu = await p.category.findFirst({ where: { name: 'Nuoc hoa Nu' } });
  const catNam = await p.category.findFirst({ where: { name: 'Nuoc hoa Nam' } });
  const catUni = await p.category.findFirst({ where: { name: 'Unisex' } });

  if (!catNu || !catNam || !catUni) { console.log('Categories missing!'); return; }

  // Check current counts
  const [nNu, nNam, nUni] = await Promise.all([
    p.product.count({ where: { categoryId: catNu.id } }),
    p.product.count({ where: { categoryId: catNam.id } }),
    p.product.count({ where: { categoryId: catUni.id } }),
  ]);
  console.log(`Truoc: Nu=${nNu}, Nam=${nNam}, Unisex=${nUni}`);

  const created: string[] = [];

  // === NUOC HOA NU (need 5, have 4 -> add 1+) ===
  if (nNu < 5) {
    const nuProducts = [
      { name: 'Rose Glow', brand: 'AURA', desc: 'Huong hoa hong ket hop cung Quyt ngot ngao, danh cho nhung co nang hien dai.', img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800', price: 2100000, vol: 50, stock: 20 },
      { name: 'Jasmine Whisper', brand: 'AURA', desc: 'Hoa nhai va Tra xanh - nhe nhang, tinh te cho moi ngay.', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800', price: 1900000, vol: 50, stock: 18 },
    ];
    for (const prod of nuProducts) {
      const r = await p.product.create({
        data: {
          name: prod.name, brand: prod.brand, description: prod.desc, imageUrl: prod.img,
          categoryId: catNu.id, concentration: 'EDP', origin: 'Phap', gender: 'Nu',
          topNotes: ['Hoa hong','Quyt'], heartNotes: ['Hoa nhai'], baseNotes: ['Xa huong'],
          season: ['Xuan','He'], style: ['Nu tinh','Hien dai'],
          variants: { create: [{ volume: prod.vol, price: prod.price, stock: prod.stock }] }
        }
      });
      created.push(r.name);
      console.log(`  + [Nu] ${r.name}`);
    }
  }

  // === NUOC HOA NAM (need 5, have 2 -> add 3+) ===
  if (nNam < 5) {
    const namProducts = [
      { name: 'Cedar Storm', brand: 'AURA', desc: 'Suc manh cua Go tuyet tung va Chanh vang - lanh lanh va nam tinh.', img: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800', price: 2600000, vol: 100, stock: 15 },
      { name: 'Leather Noir', brand: 'AURA', desc: 'Da thuoc cao cap ket hop Gia vi phuong Dong - quyen luc va bi an.', img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800', price: 3200000, vol: 100, stock: 12 },
      { name: 'Aqua Rush', brand: 'AURA', desc: 'Huong bien tuoi mat cung Huong thao va Bach dau huong - nang dong, the thao.', img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', price: 1800000, vol: 75, stock: 25 },
      { name: 'Spice Fusion', brand: 'AURA', desc: 'Tieu den, Gung va Nhu huong - cay nong, cuon hut day ca tinh.', img: 'https://images.unsplash.com/photo-1595425970377-c9703cc48a7e?w=800', price: 2900000, vol: 100, stock: 10 },
    ];
    for (const prod of namProducts) {
      const r = await p.product.create({
        data: {
          name: prod.name, brand: prod.brand, description: prod.desc, imageUrl: prod.img,
          categoryId: catNam.id, concentration: 'EDT', origin: 'Phap', gender: 'Nam',
          topNotes: ['Cam chanh','Tieu den'], heartNotes: ['Go tuyet tung'], baseNotes: ['Xa huong'],
          season: ['Thu','Dong'], style: ['Manh me','Lich lam'],
          variants: { create: [{ volume: prod.vol, price: prod.price, stock: prod.stock }] }
        }
      });
      created.push(r.name);
      console.log(`  + [Nam] ${r.name}`);
    }
  }

  // === NUOC HOA UNISEX (need 5, have 3 -> add 2+) ===
  if (nUni < 5) {
    const uniProducts = [
      { name: 'Green Tea Elixir', brand: 'AURA', desc: 'Tra xanh va Sen - thanh khiet, thu gian phu hop moi gioi.', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800', price: 1600000, vol: 50, stock: 30 },
      { name: 'Amber Sunset', brand: 'AURA', desc: 'Ho phach am ap cung Cam Bergamot - huong chieu ta day me hoac.', img: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800', price: 2200000, vol: 75, stock: 20 },
      { name: 'White Musk Dream', brand: 'AURA', desc: 'Xa huong trang tinh khiet, nhe nhang nhu dam may - danh cho moi nguoi.', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800', price: 1700000, vol: 50, stock: 35 },
    ];
    for (const prod of uniProducts) {
      const r = await p.product.create({
        data: {
          name: prod.name, brand: prod.brand, description: prod.desc, imageUrl: prod.img,
          categoryId: catUni.id, concentration: 'EDP', origin: 'Y', gender: 'Unisex',
          topNotes: ['Cam Bergamot','Tra xanh'], heartNotes: ['Hoa sen','Ho phach'], baseNotes: ['Xa huong','Vani'],
          season: ['Xuan','He','Thu'], style: ['Thanh lich','Tu nhien'],
          variants: { create: [{ volume: prod.vol, price: prod.price, stock: prod.stock }] }
        }
      });
      created.push(r.name);
      console.log(`  + [Unisex] ${r.name}`);
    }
  }

  // === GIFT SETS ===
  // Create "Gift Sets" collection if not exists
  const existingGift = await p.collection.findFirst({ where: { name: 'Set Qua Tang' } });
  let giftCollection;
  if (!existingGift) {
    giftCollection = await p.collection.create({
      data: { name: 'Set Qua Tang', subtitle: 'Tuyet tac danh tang nguoi thuong', isVisible: true, sortOrder: 10 }
    });
    console.log('\n  + Created "Set Qua Tang" collection');
  } else {
    giftCollection = existingGift;
  }

  // Get all product IDs that already exist
  const allProds = await p.product.findMany({ select: { id: true, name: true } });

  // Add products to Gift Sets (pick diverse ones from each category)
  const giftProducts = allProds.filter(pr => !pr.name.includes('Gift')).slice(0, 8);
  for (let i = 0; i < giftProducts.length; i++) {
    await p.collectionItem.create({
      data: { collectionId: giftCollection.id, productId: giftProducts[i].id, sortOrder: i }
    }).catch(() => {}); // ignore duplicates
  }
  console.log(`  + Added ${giftProducts.length} products to "Set Qua Tang"`);

  // === FINAL CHECK ===
  const [fNu, fNam, fUni] = await Promise.all([
    p.product.count({ where: { categoryId: catNu.id } }),
    p.product.count({ where: { categoryId: catNam.id } }),
    p.product.count({ where: { categoryId: catUni.id } }),
  ]);
  const giftItems = await p.collectionItem.count({ where: { collectionId: giftCollection!.id } });

  console.log('\n=== KET QUA ===');
  console.log(`  Nuoc hoa Nu     : ${fNu} san pham ${fNu >= 5 ? 'OK' : 'NEED MORE'}`);
  console.log(`  Nuoc hoa Nam    : ${fNam} san pham ${fNam >= 5 ? 'OK' : 'NEED MORE'}`);
  console.log(`  Nuoc hoa Unisex : ${fUni} san pham ${fUni >= 5 ? 'OK' : 'NEED MORE'}`);
  console.log(`  Set Qua Tang    : ${giftItems} san pham ${giftItems >= 5 ? 'OK' : 'NEED MORE'}`);

  console.log(`\n  Total created: ${created.length} products`);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
