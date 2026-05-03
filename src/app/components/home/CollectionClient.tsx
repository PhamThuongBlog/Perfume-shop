'use client';

import { useState } from 'react';
import Link from 'next/link';

type Variant = {
    id: string;
    volume: number;
    price: number;
    discountPercent: number;
    stock: number;
};

type Product = {
    id: string;
    name: string;
    brand: string;
    imageUrl: string | null;
    category: { id: string; name: string };
    variants: Variant[];
};

type Props = {
    products: Product[];
    categories: { id: string; name: string }[];
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function CollectionClient({ products, categories }: Props) {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [search, setSearch] = useState('');

    const filtered = products.filter((p) => {
        const matchCategory = activeCategory === 'all' || p.category.id === activeCategory;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.brand.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <section id="collection" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* TIÊU ĐỀ */}
                <div className="text-center mb-10">
                    <h2 className="text-sm uppercase tracking-widest text-rose-500 font-semibold mb-3">
                        Bộ sưu tập nổi bật
                    </h2>
                    <h3 className="text-4xl font-serif text-stone-900">
                        Những Mùi Hương <span className="italic text-stone-500">Kinh Điển</span>
                    </h3>
                </div>

                {/* SEARCH + FILTER */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-10">
                    {/* SEARCH */}
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full sm:w-72 px-4 py-2.5 rounded-full border border-stone-200 focus:outline-none focus:border-stone-400 text-sm transition-colors"
                    />

                    {/* FILTER TABS */}
                    <div className="flex gap-2 flex-wrap justify-center">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-colors
                                ${activeCategory === 'all'
                                ? 'bg-stone-900 text-white'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                        >
                            Tất cả
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-colors
                                    ${activeCategory === cat.id
                                    ? 'bg-stone-900 text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* LƯỚI SẢN PHẨM */}
                {filtered.length === 0 ? (
                    <div className="text-center py-20 text-stone-400">
                        <p className="text-4xl mb-3">🔍</p>
                        <p>Không tìm thấy sản phẩm phù hợp</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {filtered.map((product) => {
                            const firstVariant = product.variants[0];
                            return (
                                <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer flex flex-col">
                                    <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden mb-6 rounded-sm">
                                        <img
                                            src={product.imageUrl || 'https://via.placeholder.com/400x500'}
                                            alt={product.name}
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs uppercase tracking-wider text-stone-800 rounded-full">
                                                {product.category?.name}
                                            </span>
                                        </div>
                                        {firstVariant?.discountPercent > 0 && (
                                            <div className="absolute top-4 right-4 z-10">
                                                <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full">
                                                    -{firstVariant.discountPercent}%
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                                            <button className="translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-stone-900 px-6 py-3 text-xs uppercase tracking-widest hover:bg-stone-900 hover:text-white rounded-sm shadow-md font-medium">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-center flex-1 flex flex-col">
                                        <h4 className="text-lg font-serif text-stone-900 mb-2 group-hover:text-rose-600 transition-colors">
                                            {product.name}
                                        </h4>
                                        <div className="mt-auto flex items-center justify-center gap-3">
                                            {firstVariant ? (
                                                <>
                                                    <span className="font-medium text-stone-900">
                                                        {formatPrice(firstVariant.price * (1 - firstVariant.discountPercent / 100))}
                                                    </span>
                                                    {firstVariant.discountPercent > 0 && (
                                                        <span className="text-sm text-stone-400 line-through">
                                                            {formatPrice(firstVariant.price)}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-sm text-stone-400 italic">Đang cập nhật giá</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-stone-400 mt-2">
                                            {firstVariant?.volume}ml - Hãng: {product.brand}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}