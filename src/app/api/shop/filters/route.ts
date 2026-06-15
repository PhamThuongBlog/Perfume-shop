import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const [categories, brands, variants] = await Promise.all([
        prisma.category.findMany({ select: { id: true, name: true } }),
        prisma.product.findMany({ distinct: ['brand'], select: { brand: true } }),
        prisma.productVariant.findMany({ distinct: ['volume'], select: { volume: true }, orderBy: { volume: 'asc' } }),
    ]);

    const genders = await prisma.product.findMany({ distinct: ['gender'], select: { gender: true } });

    return NextResponse.json({
        categories,
        brands: brands.map((b) => b.brand),
        volumes: variants.map((v) => v.volume),
        genders: genders.map(g => g.gender).filter(Boolean),
    });
}