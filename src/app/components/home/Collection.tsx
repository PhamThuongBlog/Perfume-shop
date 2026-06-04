// src/app/components/home/Collection.tsx
import { prisma } from '@/lib/prisma';
import CollectionClient from './CollectionClient';

export const revalidate = 0;
export default async function Collection() {
    const products = await prisma.product.findMany({
        include: { category: true, variants: true },
        orderBy: { sortOrder: 'asc' },
    });

    // Thêm dòng này trước return:
    console.log('images check:', products[0]?.images);
    return <CollectionClient products={products} />;
}