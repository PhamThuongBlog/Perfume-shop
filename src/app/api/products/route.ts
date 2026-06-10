import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET() {
    const products = await prisma.product.findMany({
        include: { variants: { orderBy: { volume: 'asc' } } },
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
        name, brand, description, imageUrl, images, categoryId, variants,
        concentration, origin, gender, releaseYear, scentGroup, perfumer,
        longevity, sillage, season, occasion, style,
        topNotes, heartNotes, baseNotes, ingredients, longDesc, whenToWear, accords,
    } = await req.json();

    if (!name || !brand || !categoryId || !variants?.length) {
        return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const product = await prisma.product.create({
        data: {
            name,
            brand,
            description,
            imageUrl,
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
            variants: {
                create: variants.map((v: {
                    volume: number;
                    price: number;
                    discountPercent: number;
                    stock: number;
                }) => ({
                    volume: v.volume,
                    price: v.price,
                    discountPercent: v.discountPercent ?? 0,
                    stock: v.stock ?? 0,
                })),
            },
        },
    });

    revalidatePath('/');
    return NextResponse.json({ message: 'Tạo sản phẩm thành công', productId: product.id }, { status: 201 });
}