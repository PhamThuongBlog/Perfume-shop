import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// GET /api/products/[id] — Lấy chi tiết sản phẩm cho form edit
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: { variants: { orderBy: { volume: 'asc' } } },
    });

    if (!product) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

    return NextResponse.json(product);
}

// PUT /api/products/[id] — Cập nhật sản phẩm + variants
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, brand, description, imageUrl, categoryId, variants } = await req.json();

    // Cập nhật thông tin sản phẩm
    await prisma.product.update({
        where: { id },
        data: { name, brand, description, imageUrl, categoryId },
    });

    // Xóa toàn bộ variants cũ rồi tạo lại — đơn giản và an toàn nhất
    await prisma.productVariant.deleteMany({ where: { productId: id } });

    await prisma.productVariant.createMany({
        data: variants.map((v: {
            volume: number;
            price: number;
            discountPercent: number;
            stock: number;
        }) => ({
            productId: id,
            volume: v.volume,
            price: v.price,
            discountPercent: v.discountPercent ?? 0,
            stock: v.stock ?? 0,
        })),
    });

    revalidatePath('/');
    return NextResponse.json({ message: 'Cập nhật thành công' });
}

// DELETE /api/products/[id] — Xóa sản phẩm
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    revalidatePath('/');

    return NextResponse.json({ message: 'Đã xóa sản phẩm' });
}