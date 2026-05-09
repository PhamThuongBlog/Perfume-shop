import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import VariantSelector from './VariantSelector';

export default async function ProductDetailPage({
                                                    params,
                                                }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: { variants: { orderBy: { volume: 'asc' } } },
    });

    if (!product) notFound();

    return (
        <div className="max-w-6xl mx-auto p-6 mt-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* ẢNH SẢN PHẨM */}
                <div className="bg-gray-100 rounded-2xl h-[500px] flex items-center justify-center overflow-hidden shadow-sm">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="object-cover h-full w-full"
                        />
                    ) : (
                        <span className="text-gray-400 font-medium">Chưa có ảnh sản phẩm</span>
                    )}
                </div>

                {/* THÔNG TIN SẢN PHẨM */}
                <div className="flex flex-col justify-center">
                    <h2 className="text-sm text-gray-500 uppercase tracking-widest font-semibold">
                        {product.brand}
                    </h2>
                    <h1 className="text-4xl font-bold mt-2 text-gray-900 leading-tight">
                        {product.name}
                    </h1>
                    <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                        {product.description ?? 'Hương thơm quyến rũ chưa có lời mô tả...'}
                    </p>

                    {/* VARIANT SELECTOR — Client Component */}
                    <VariantSelector
                        variants={product.variants}
                        productId={product.id}
                        productName={product.name}
                        brand={product.brand}
                        imageUrl={product.imageUrl}
                    />
                </div>

            </div>
        </div>
    );
}