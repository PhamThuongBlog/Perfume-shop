import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔥 Bắt đầu dọn dẹp Database cũ...');
    // Xoá theo thứ tự từ con đến cha để không bị lỗi khoá ngoại
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    console.log('✨ Đang tạo Danh mục (Categories)...');
    const catNu = await prisma.category.create({ data: { name: 'Nước hoa Nữ' } });
    const catNam = await prisma.category.create({ data: { name: 'Nước hoa Nam' } });
    const catUnisex = await prisma.category.create({ data: { name: 'Unisex' } });

    console.log('🌹 Đang chế tác 4 siêu phẩm nước hoa Aura...');

    // 1. Midnight Rose
    await prisma.product.create({
        data: {
            name: 'Midnight Rose',
            brand: 'Aura',
            description: 'Sự quyến rũ bí ẩn từ Hồng nhung và Trầm hương. Tuyệt tác dành cho những đêm tiệc sang trọng.',
            imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
            categoryId: catNu.id,
            variants: {
                create: [
                    { volume: 50, price: 2500000, stock: 15, discountPercent: 0 }
                ]
            }
        }
    });

    // 2. Ocean Breeze
    await prisma.product.create({
        data: {
            name: 'Ocean Breeze',
            brand: 'Aura',
            description: 'Bản hòa ca của Hương biển và Cam Bergamot, mang lại cảm giác tự do, phóng khoáng như cơn gió đại dương.',
            imageUrl: 'https://images.unsplash.com/photo-1595425970377-c9703cc48a7e?auto=format&fit=crop&w=800&q=80',
            categoryId: catUnisex.id,
            variants: {
                create: [
                    { volume: 50, price: 1800000, stock: 30, discountPercent: 10 } // Đang giảm giá 10%
                ]
            }
        }
    });

    // 3. Vanilla Sky
    await prisma.product.create({
        data: {
            name: 'Vanilla Sky',
            brand: 'Aura',
            description: 'Ngọt ngào và ấm áp với Vani nguyên bản kết hợp cùng Hổ phách. Lưu hương suốt ngày dài.',
            imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
            categoryId: catNu.id,
            variants: {
                create: [
                    { volume: 50, price: 2200000, stock: 20, discountPercent: 0 }
                ]
            }
        }
    });

    // 4. Mystic Wood
    await prisma.product.create({
        data: {
            name: 'Mystic Wood',
            brand: 'Aura',
            description: 'Bản lĩnh phái mạnh được khẳng định qua nốt hương Gỗ tuyết tùng và Tiêu đen cay nồng.',
            imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
            categoryId: catNam.id,
            variants: {
                create: [
                    { volume: 100, price: 2800000, stock: 5, discountPercent: 0 } // Chai bự, số lượng có hạn
                ]
            }
        }
    });

    console.log('✅ Chúc mừng Sếp! Database đã được bơm đầy dữ liệu xịn xò!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });