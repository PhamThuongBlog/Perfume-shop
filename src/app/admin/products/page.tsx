import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ProductSortList from './ProductSortList';

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        include: {
            category: true,
            variants: { orderBy: { volume: 'asc' } },
        },
        orderBy: { sortOrder: 'asc' },
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-stone-900">Sản phẩm</h1>
                <Link
                    href="/admin/products/new"
                    className="bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
                >
                    + Thêm sản phẩm
                </Link>
            </div>

            <ProductSortList products={products} />
        </div>
    );
}