import { prisma } from '@/lib/prisma';
import ShopClient from './ShopClient';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
    const [categories, brandsRaw, volumesRaw, gendersRaw] = await Promise.all([
        prisma.category.findMany({ select: { id: true, name: true } }),
        prisma.product.findMany({ distinct: ['brand'], select: { brand: true } }),
        prisma.productVariant.findMany({ distinct: ['volume'], select: { volume: true }, orderBy: { volume: 'asc' } }),
        prisma.product.findMany({ distinct: ['gender'], select: { gender: true } }),
    ]);

    return (
        <ShopClient
            categories={categories}
            brands={brandsRaw.map((b) => b.brand)}
            volumes={volumesRaw.map((v) => v.volume)}
            genders={gendersRaw.map(g => g.gender).filter(Boolean) as string[]}
        />
    );
}
