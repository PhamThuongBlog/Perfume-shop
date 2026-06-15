'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ProductCard from '@/app/components/home/ProductCard';
import ShopFilters from './ShopFilters';
import { SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';

type Variant = { id: string; volume: number; price: number; discountPercent: number; stock: number };
type Product = {
    id: string; name: string; brand: string; imageUrl: string | null;
    images: string[]; category: { name: string }; variants: Variant[];
};

type SortKey = 'featured' | 'newest' | 'oldest' | 'best_selling' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

function sortProducts(products: Product[], sort: SortKey): Product[] {
    switch (sort) {
        case 'price_asc':   return [...products].sort((a, b) => (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0));
        case 'price_desc':  return [...products].sort((a, b) => (b.variants[0]?.price ?? 0) - (a.variants[0]?.price ?? 0));
        case 'name_asc':    return [...products].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        case 'name_desc':   return [...products].sort((a, b) => b.name.localeCompare(a.name, 'vi'));
        case 'oldest':      return [...products].reverse();
        default:            return products;
    }
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'featured',   label: 'Sản phẩm nổi bật' },
    { value: 'newest',     label: 'Mới nhất' },
    { value: 'oldest',     label: 'Cũ nhất' },
    { value: 'best_selling', label: 'Bán chạy nhất' },
    { value: 'price_asc',  label: 'Giá: Tăng dần' },
    { value: 'price_desc', label: 'Giá: Giảm dần' },
    { value: 'name_asc',   label: 'Tên: A–Z' },
    { value: 'name_desc',  label: 'Tên: Z–A' },
];

export default function ShopClient({
                                       categories, brands, volumes, genders,
                                   }: {
    categories: { id: string; name: string }[];
    brands: string[];
    volumes: number[];
    genders: string[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState<SortKey>('featured');
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const res = await fetch(`/api/shop?${searchParams.toString()}`);
        const data = await res.json();
        setProducts(data);
        setLoading(false);
    }, [searchParams]);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    function updateFilter(key: string, value: string | null) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value); else params.delete(key);
        router.push(`${pathname}?${params.toString()}`);
    }

    function clearAll() {
        router.push(pathname);
    }

    function updatePriceFilter(min: number | null, max: number | null) {
        const params = new URLSearchParams(searchParams.toString());
        if (min) params.set('minPrice', String(min)); else params.delete('minPrice');
        if (max) params.set('maxPrice', String(max)); else params.delete('maxPrice');
        router.push(`${pathname}?${params.toString()}`);
    }

    const sorted = sortProducts(products, sort);

    const activeFilters = (['category', 'brand', 'volume', 'gender'] as const)
        .filter(k => searchParams.get(k))
        .map(k => ({ key: k, value: searchParams.get(k)! }));

    const hasPriceFilter = searchParams.get('minPrice') || searchParams.get('maxPrice');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

            {/* Breadcrumb */}
            <nav className="text-xs text-stone-400 flex items-center gap-2 mb-4 uppercase tracking-widest font-medium">
                <Link href="/" className="hover:text-stone-600 transition-colors">Trang chủ</Link>
                <span className="text-stone-300">›</span>
                <Link href="/shop" className="hover:text-stone-600 transition-colors">Cửa hàng</Link>
                {searchParams.get('category') && (
                    <>
                        <span className="text-stone-300">›</span>
                        <span className="text-stone-700 font-bold">{searchParams.get('category')}</span>
                    </>
                )}
            </nav>

            {/* Header + Sort cùng hàng */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-serif text-stone-900">Nước hoa</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMobileFilterOpen(true)}
                        className="sm:hidden flex items-center gap-1.5 px-3 py-2.5 text-sm border border-stone-200 rounded-xl"
                    >
                        <SlidersHorizontal size={14} /> Lọc
                    </button>
                    <select
                        value={sort}
                        onChange={e => setSort(e.target.value as SortKey)}
                        className="text-sm px-3 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 transition cursor-pointer"
                    >
                        {SORT_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Active filter tags */}
            {(activeFilters.length > 0 || hasPriceFilter) && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {activeFilters.map(f => (
                        <span key={f.key} className="flex items-center gap-1 px-3 py-1 text-xs bg-stone-900 text-white rounded-full">
              {f.key === 'volume' ? `${f.value}ml` : f.key === 'gender' ? (f.value === 'Nu' ? 'Nuoc hoa Nu' : f.value === 'Nam' ? 'Nuoc hoa Nam' : 'Unisex') : f.value}
                            <button onClick={() => updateFilter(f.key, null)}><X size={11} /></button>
            </span>
                    ))}
                    {hasPriceFilter && (
                        <span className="flex items-center gap-1 px-3 py-1 text-xs bg-stone-900 text-white rounded-full">
              {new Intl.NumberFormat('vi-VN').format(Number(searchParams.get('minPrice') ?? 0))}đ
                            {' – '}
                            {new Intl.NumberFormat('vi-VN').format(Number(searchParams.get('maxPrice') ?? 0))}đ
              <button onClick={() => { updateFilter('minPrice', null); updateFilter('maxPrice', null); }}><X size={11} /></button>
            </span>
                    )}
                    <button
                        onClick={clearAll}
                        className="px-3 py-1 text-xs text-stone-500 underline"
                    >
                        Xóa tất cả
                    </button>
                </div>
            )}



            <div className="flex gap-8">
                {/* Sidebar desktop */}
                <aside className="hidden sm:block w-56 shrink-0">
                    <ShopFilters
                        onUpdatePrice={updatePriceFilter}
                        categories={categories}
                        brands={brands}
                        volumes={volumes}
                        genders={genders}
                        searchParams={Object.fromEntries(searchParams.entries())}
                        onUpdate={updateFilter}
                    />
                </aside>

                {/* Mobile overlay */}
                {mobileFilterOpen && (
                    <div className="fixed inset-0 z-50 bg-black/40 sm:hidden" onClick={() => setMobileFilterOpen(false)}>
                        <div className="absolute left-0 top-0 h-full w-72 bg-white p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-semibold text-stone-900">Bộ lọc</span>
                                <button onClick={() => setMobileFilterOpen(false)}><X size={18} /></button>
                            </div>
                            <ShopFilters
                                onUpdatePrice={updatePriceFilter}
                                categories={categories}
                                brands={brands}
                                volumes={volumes}
                                genders={genders}
                                searchParams={Object.fromEntries(searchParams.entries())}
                                onUpdate={(k, v) => { updateFilter(k, v); setMobileFilterOpen(false); }}
                            />
                        </div>
                    </div>
                )}

                {/* Grid — 4 cột */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-400 mb-5">{loading ? '…' : `${sorted.length} sản phẩm`}</p>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="aspect-[4/5] bg-stone-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : sorted.length === 0 ? (
                        <div className="text-center py-24">
                            <p className="text-stone-400 text-sm">Không tìm thấy sản phẩm nào.</p>
                            <button
                                onClick={() => clearAll()}
                                className="mt-3 text-sm text-rose-500 underline"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {sorted.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}