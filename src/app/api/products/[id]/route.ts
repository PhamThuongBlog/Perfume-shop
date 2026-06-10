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
    const {
        name, brand, description, imageUrl, images, categoryId, variants,
        concentration, origin, gender, releaseYear, scentGroup, perfumer,
        longevity, sillage, season, occasion, style,
        topNotes, heartNotes, baseNotes, ingredients, longDesc, whenToWear, accords
    } = await req.json();

    try {
        await prisma.product.update({
            where: { id },
            data: {
                name, brand, description,
                imageUrl: images?.[0] ?? imageUrl,
                images: images ?? [],
                categoryId,
                concentration,
                origin,
                gender,
                releaseYear: releaseYear ? Number(releaseYear) : null,
                scentGroup,
                perfumer,
                longevity,
                sillage,
                season: season ?? [],
                occasion: occasion ?? [],
                style: style ?? [],
                topNotes: topNotes ?? [],
                heartNotes: heartNotes ?? [],
                baseNotes: baseNotes ?? [],
                ingredients,
                longDesc,
                whenToWear: whenToWear ?? [],
                accords: accords ?? [],
            },
        });


        const incomingIds = variants.filter((v: {id?: string}) => v.id).map((v: {id: string}) => v.id);
        await prisma.productVariant.deleteMany({
            where: {
                productId: id,
                id: { notIn: incomingIds },
            },
        });

        for (const v of variants) {
            if (v.id) {
                // Update variant đã có
                await prisma.productVariant.update({
                    where: { id: v.id },
                    data: {
                        volume: v.volume,
                        price: v.price,
                        discountPercent: v.discountPercent ?? 0,
                        stock: v.stock ?? 0,
                    },
                });
            } else {
                // Tạo variant mới
                await prisma.productVariant.create({
                    data: {
                        productId: id,
                        volume: v.volume,
                        price: v.price,
                        discountPercent: v.discountPercent ?? 0,
                        stock: v.stock ?? 0,
                    },
                });
            }
        }

        revalidatePath('/');
        return NextResponse.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        console.error('PUT error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
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