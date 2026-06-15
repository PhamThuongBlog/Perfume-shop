/**
 * FULL SEED: Admin user + 9 products + collections + users + orders + reviews
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning DB...');
  const models = ['marketingEvent','discountUsage','discountCode','campaign','abandonedCart','customerSegment','collectionItem','collection','review','orderItem','order','message','chatSession','productVariant','product','category','user'];
  for (const m of models) {
    try { await (prisma as any)[m].deleteMany(); } catch {}
  }

  // Admin user
  console.log('Creating admin...');
  const hash = await bcrypt.hash('Admin@123456', 10);
  await prisma.user.create({ data: { name: 'Admin AURA', email: 'admin@aura.com', password: hash, role: 'ADMIN' } });

  // Test users
  const users = ['Nguyen Van A','Tran Thi B','Le Van C','Pham Thi D','Hoang Van E'];
  const userIds: string[] = [];
  for (const name of users) {
    const u = await prisma.user.create({ data: { name, email: name.toLowerCase().replace(/ /g,'') + '@test.com', password: hash, role: 'USER' } });
    userIds.push(u.id);
  }

  // Categories
  const catNu = await prisma.category.create({ data: { name: 'Nuoc hoa Nu' } });
  const catNam = await prisma.category.create({ data: { name: 'Nuoc hoa Nam' } });
  const catUni = await prisma.category.create({ data: { name: 'Unisex' } });

  // 9 Products
  console.log('Creating 9 products...');
  const products = [
    { name: 'Midnight Rose', brand: 'AURA', desc: 'Quyen ru bi an tu Hong nhung va Tram huong.', cat: catNu, img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', variants: [{v:50,p:2500000,s:15}] },
    { name: 'Ocean Breeze', brand: 'AURA', desc: 'Ban hoa ca cua Huong bien va Cam Bergamot.', cat: catUni, img: 'https://images.unsplash.com/photo-1595425970377-c9703cc48a7e?w=800', variants: [{v:50,p:1800000,s:30,d:10}] },
    { name: 'Vanilla Sky', brand: 'AURA', desc: 'Ngot ngao va am ap voi Vani va Ho phach.', cat: catNu, img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800', variants: [{v:50,p:2200000,s:20}] },
    { name: 'Mystic Wood', brand: 'AURA', desc: 'Ban linh phai manh voi Go tuyet tung va Tieu den.', cat: catNam, img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800', variants: [{v:100,p:2800000,s:5}] },
    { name: 'Sakura Dream', brand: 'AURA', desc: 'Huong anh dao Nhat Ban diu dang.', cat: catNu, img: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800', variants: [{v:50,p:1800000,s:25}] },
    { name: 'Dark Oud', brand: 'AURA', desc: 'Manh liet va bi an voi Tram huong.', cat: catNam, img: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800', variants: [{v:100,p:3500000,s:10}] },
    { name: 'Citrus Splash', brand: 'AURA', desc: 'Tuoi mat nhu ly chanh mua he.', cat: catUni, img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800', variants: [{v:75,p:1200000,s:40}] },
    { name: 'Velvet Rose', brand: 'AURA', desc: 'Nong nan va quyen ru, hoa hong velvet.', cat: catNu, img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800', variants: [{v:30,p:2800000,s:8}, {v:75,p:4800000,s:5}] },
    { name: 'Ocean Drift', brand: 'AURA', desc: 'Cam giac tu do cua dai duong.', cat: catUni, img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800', variants: [{v:50,p:1500000,s:30}, {v:100,p:2500000,s:15}] },
  ];

  const prodIds: string[] = [];
  for (const p of products) {
    const prod = await prisma.product.create({
      data: {
        name: p.name, brand: p.brand, description: p.desc, imageUrl: p.img, categoryId: p.cat.id,
        topNotes: ['Hoa hong'], heartNotes: ['Hoa nhai'], baseNotes: ['Xa huong'],
        season: ['Xuan'], style: ['Sang trong'], concentration: 'EDP', origin: 'Phap', gender: p.cat.name === 'Nuoc hoa Nam' ? 'Nam' : p.cat.name === 'Unisex' ? 'Unisex' : 'Nu',
        variants: { create: p.variants.map(v => ({ volume: v.v, price: v.p, stock: v.s, discountPercent: (v as any).d || 0 })) }
      }
    });
    prodIds.push(prod.id);
  }

  // 5 Collections with products
  console.log('Creating 5 collections...');
  const colData = ['Ban Chay Nhat','Hang Moi Ve','Best Seller He','Qua Tang Cao Cap','Flash Sale'];
  for (let i = 0; i < colData.length; i++) {
    const col = await prisma.collection.create({ data: { name: colData[i], subtitle: `${colData[i]} - AURA Signature`, isVisible: true, sortOrder: i } });
    // Add 3-4 products
    for (let j = i*2; j < Math.min(i*2+3, prodIds.length); j++) {
      await prisma.collectionItem.create({ data: { collectionId: col.id, productId: prodIds[j], sortOrder: j } });
    }
  }

  // 6 Orders
  console.log('Creating 6 orders...');
  const addrs = ['123 Nguyen Trai, Q1, HCM','456 Le Loi, Q3, HCM','789 Hai Ba Trung, HN','101 Ly Thuong Kiet, HN','202 Tran Duy Hung, HN','303 Duong Test, TP'];
  for (let i = 0; i < 6; i++) {
    const variants = await prisma.productVariant.findMany({ take: 2, skip: i % 7 });
    const total = variants.reduce((s,v) => s + v.price * 1, 0);
    const order = await prisma.order.create({
      data: {
        userId: userIds[i % 5],
        totalAmount: total,
        status: i < 3 ? 'SHIPPED' : i === 3 ? 'CANCELLED' : 'PENDING',
        address: addrs[i],
        phone: `09${i}1234567`,
        orderItems: { create: variants.map(v => ({ variantId: v.id, quantity: 1, price: v.price })) }
      }
    });
  }

  // 5 Reviews
  console.log('Creating 5 reviews...');
  const reviews = ['Tuyet voi, mui huong rat dep!','Rat hai long ve chat luong','Mui thom lau, dang tien','Chai dep, sang trong','Se mua lai va gioi thieu ban be'];
  for (let i = 0; i < 5; i++) {
    await prisma.review.create({ data: { productId: prodIds[i], userId: userIds[i], name: users[i], rating: i < 3 ? 5 : 4, text: reviews[i] } });
  }

  // 5 Discount codes
  console.log('Creating 5 discounts...');
  await prisma.discountCode.createMany({ data: [
    { code: 'WELCOME10', description: 'Giam 10% cho khach moi', type: 'PERCENTAGE', value: 10, minOrderValue: 200000, usageLimit: 200, targetSegment: 'NEW' },
    { code: 'TET2026', description: 'Giam 50K', type: 'FIXED_AMOUNT', value: 50000, minOrderValue: 500000, usageLimit: 100, targetSegment: 'ALL' },
    { code: 'FREESHIP50', description: 'Mien phi van chuyen', type: 'FREE_SHIP', value: 30000, minOrderValue: 500000, usageLimit: 50, targetSegment: 'ALL' },
    { code: 'BIRTHDAY25', description: 'Giam 25% sinh nhat', type: 'PERCENTAGE', value: 25, minOrderValue: 2000000, maxDiscount: 1000000, usageLimit: 20, targetSegment: 'VIP' },
    { code: 'BLACKFRIDAY', description: 'Black Friday 30%', type: 'PERCENTAGE', value: 30, minOrderValue: 1000000, maxDiscount: 500000, usageLimit: 50, targetSegment: 'ALL' },
  ]});

  // 5 Campaigns
  console.log('Creating 5 campaigns...');
  await prisma.campaign.createMany({ data: [
    { name: 'Flash Sale He 2026', type: 'EMAIL', subject: 'Flash Sale - Giam den 30%', targetSegment: 'ALL', status: 'ACTIVE' },
    { name: 'Chao Mung Thanh Vien', type: 'EMAIL', subject: 'Chao mung den AURA', targetSegment: 'NEW', status: 'ACTIVE' },
    { name: 'Uu Dai VIP Thang 6', type: 'SMS', subject: 'Uu dai VIP', targetSegment: 'VIP', status: 'ACTIVE' },
    { name: 'Banner He 2026', type: 'BANNER', subject: 'Banner mua he', targetSegment: 'ALL', status: 'ACTIVE' },
    { name: 'Winback Khach Cu', type: 'EMAIL', subject: 'Nho ban day!', targetSegment: 'INACTIVE', status: 'DRAFT' },
  ]});

  // 6 Marketing events
  console.log('Creating marketing events...');
  const events = ['VIEW','VIEW','VIEW','ADD_TO_CART','ADD_TO_CART','CHECKOUT','PURCHASE','PURCHASE'];
  for (const ev of events) {
    await (prisma as any).marketingEvent.create({ data: { event: ev, productId: prodIds[events.indexOf(ev) % prodIds.length] } });
  }

  console.log('\nFULL SEED COMPLETE:');
  const counts = [
    ['Users', await prisma.user.count()],
    ['Categories', await prisma.category.count()],
    ['Products', await prisma.product.count()],
    ['ProductVariants', await prisma.productVariant.count()],
    ['Orders', await prisma.order.count()],
    ['Reviews', await prisma.review.count()],
    ['Collections', await prisma.collection.count()],
    ['CollectionItems', await prisma.collectionItem.count()],
    ['DiscountCodes', await prisma.discountCode.count()],
    ['Campaigns', await prisma.campaign.count()],
    ['MarketingEvents', await (prisma as any).marketingEvent.count()],
  ];
  for (const [label, count] of counts) {
    console.log(`  ${label}: ${count}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
