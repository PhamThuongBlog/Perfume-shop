import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const gender = searchParams.get('gender');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const volume = searchParams.get('volume');
    const q = searchParams.get('q');

    const products = await prisma.product.findMany({
        where: {
            ...(category && { category: { name: category } }),
            ...(gender && { gender }),
            ...(brand && { brand }),
            ...(q && {
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { brand: { contains: q, mode: 'insensitive' } },
                ],
            }),
            ...((minPrice || maxPrice || volume) && {
                variants: {
                    some: {
                        ...(volume && { volume: Number(volume) }),
                        ...((minPrice || maxPrice) && {
                            price: {
                                ...(minPrice && { gte: Number(minPrice) }),
                                ...(maxPrice && { lte: Number(maxPrice) }),
                            },
                        }),
                    },
                },
            }),
        },
        include: {
            category: true,
            variants: { orderBy: { volume: 'asc' } },
        },
        orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(products);
}