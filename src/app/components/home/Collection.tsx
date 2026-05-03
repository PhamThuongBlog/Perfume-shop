import { prisma } from '@/lib/prisma';
import CollectionClient from './CollectionClient';

export default async function Collection() {
    const [products, categories] = await Promise.all([
        prisma.product.findMany({
            include: { category: true, variants: true },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.category.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return <CollectionClient products={products} categories={categories} />;
}