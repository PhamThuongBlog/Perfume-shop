import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import VariantSelector from './VariantSelector';
import ImageGallery from './ImageGallery';
import ProductTabs from './ProductTabs';
import RelatedProducts from './RelatedProducts';
import Breadcrumb from '@/app/components/layout/Breadcrumb';
import Link from 'next/link';

const WHEN_TO_WEAR_ICONS: Record<string, string> = {
    'Xuân': '🌸', 'Hè': '☀️', 'Thu': '🍂', 'Đông': '❄️',
    'Ngày': '🌤️', 'Đêm': '🌙',
};

const LONGEVITY_LEVELS: Record<string, number> = {
    '1-3 tiếng': 1, '3-6 tiếng': 2, '6-8 tiếng': 3, '8-12 tiếng': 4, '12+ tiếng': 5,
};

const SILLAGE_LEVELS: Record<string, number> = {
    'Nhẹ': 1, 'Vừa phải': 2, 'Mạnh': 3, 'Rất mạnh': 4,
};

const GENDER_POSITION: Record<string, number> = {
    'Nữ': 0, 'Unisex': 50, 'Nam': 100,
};

const ACCORD_COLORS: Record<string, { bg: string; text: string }> = {
    'Cam chanh':   { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    'Hoa cỏ':     { bg: 'bg-pink-100',   text: 'text-pink-700' },
    'Gỗ thơm':    { bg: 'bg-amber-100',  text: 'text-amber-800' },
    'Xạ hương':   { bg: 'bg-stone-100',  text: 'text-stone-600' },
    'Tươi mát':   { bg: 'bg-teal-100',   text: 'text-teal-700' },
    'Ngọt ngào':  { bg: 'bg-rose-100',   text: 'text-rose-700' },
    'Cay nồng':   { bg: 'bg-orange-100', text: 'text-orange-700' },
    'Thảo mộc':   { bg: 'bg-green-100',  text: 'text-green-700' },
    'Phấn hoa':   { bg: 'bg-purple-100', text: 'text-purple-700' },
    'Phương Đông':{ bg: 'bg-red-100',    text: 'text-red-800' },
    'Biển cả':    { bg: 'bg-blue-100',   text: 'text-blue-700' },
    'Đất ẩm':     { bg: 'bg-lime-100',   text: 'text-lime-800' },
    'Da thuộc':   { bg: 'bg-yellow-50',  text: 'text-yellow-900' },
    'Bánh ngọt':  { bg: 'bg-orange-50',  text: 'text-orange-800' },
};

export default async function ProductDetailPage({
                                                    params,
                                                }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            variants: { orderBy: { volume: 'asc' } },
            category: true,
            reviews: { orderBy: { createdAt: 'desc' } },
        },
    });

    if (!product) notFound();

    const related = await prisma.product.findMany({
        where: { categoryId: product.categoryId, id: { not: product.id } },
        include: { variants: { orderBy: { price: 'asc' }, take: 1 } },
        take: 4,
    });

    const avgRating = product.reviews.length
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : null;

    const longevityLevel = product.longevity ? LONGEVITY_LEVELS[product.longevity] ?? 0 : 0;
    const sillageLevel = product.sillage ? SILLAGE_LEVELS[product.sillage] ?? 0 : 0;
    const genderPos = product.gender ? GENDER_POSITION[product.gender] ?? 50 : 50;

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            {/* BREADCRUMB */}
            <div className="max-w-7xl mx-auto px-6 pt-6">
                <Breadcrumb items={[
                    { label: 'Trang chủ', href: '/' },
                    { label: 'Cửa hàng', href: '/shop' },
                    { label: product.name },
                ]} />
            </div>

            {/* MAIN */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* LEFT */}
                    <ImageGallery
                        imageUrl={product.imageUrl}
                        images={product.images ?? []}
                        name={product.name}
                    />

                    {/* RIGHT */}
                    <div className="lg:sticky lg:top-8 space-y-5">

                        {/* Brand + Name */}
                        <div>
                            <Link
                                href={`/shop?brand=${encodeURIComponent(product.brand)}`}
                                className="text-sm tracking-[0.2em] uppercase text-stone-400 font-medium hover:text-rose-400 transition-colors"
                            >
                                {product.brand}
                            </Link>
                            <h1 className="text-4xl font-bold text-stone-900 leading-tight mt-1">
                                {product.name}
                            </h1>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {[1,2,3,4,5].map(i => (
                                    <svg key={i} className={`w-4 h-4 fill-current ${avgRating && i <= Math.round(avgRating) ? 'text-amber-400' : 'text-stone-200'}`} viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                    </svg>
                                ))}
                            </div>
                            <span className="text-sm text-stone-500">
                                {product.reviews.length > 0
                                    ? `${avgRating?.toFixed(1)} · ${product.reviews.length} đánh giá`
                                    : 'Chưa có đánh giá'}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-stone-600 text-base leading-relaxed pb-5 border-b border-stone-100">
                            {product.description ?? 'Hương thơm quyến rũ, tinh tế và đầy cá tính.'}
                        </p>

                        {/* Visual block chính */}
                        {(longevityLevel > 0 || sillageLevel > 0 || product.gender || product.whenToWear?.length > 0) && (
                            <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-5">

                                {/* ACCORDS */}
                                {product.accords?.length > 0 && (
                                    <div>
                                        <span className="text-sm text-stone-400 font-semibold block mb-2">Nhóm hương chính</span>
                                        <div className="flex flex-wrap gap-2">
                                            {product.accords.map(accord => {
                                                const color = ACCORD_COLORS[accord] ?? { bg: 'bg-stone-100', text: 'text-stone-600' };
                                                return (
                                                    <span key={accord} className={`text-xs px-3 py-1 rounded-full font-semibold ${color.bg} ${color.text}`}>
                                                        {accord}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* When to wear */}
                                {(product.whenToWear?.length > 0 || product.gender) && (
                                    <div>
                                        <div className="flex items-start gap-4">
                                            {/* When to wear */}
                                            {product.whenToWear?.length > 0 && (
                                                <div className="flex-1">
                                                    <span className="text-sm text-stone-400 font-semibold block mb-3">Phù hợp</span>
                                                    <div className="flex gap-3">
                                                        {['Xuân','Hè','Thu','Đông','Ngày','Đêm'].map(item => {
                                                            const active = product.whenToWear?.includes(item);
                                                            return (
                                                                <div key={item} className={`flex flex-col items-center gap-1 transition-opacity ${active ? 'opacity-100' : 'opacity-20'}`}>
                                                                    <span className="text-xl">{WHEN_TO_WEAR_ICONS[item]}</span>
                                                                    <span className="text-[10px] text-stone-500 font-medium">{item}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Vách ngăn */}
                                            {product.whenToWear?.length > 0 && product.gender && (
                                                <div className="w-px bg-stone-100 mx-2" style={{minHeight: '70px'}} />
                                            )}

                                            {/* Gender spectrum */}
                                            {product.gender && (
                                                <div className="w-65">
                                                    <span className="text-sm text-stone-400 font-semibold block mb-3">Giới tính</span>
                                                    <div className="flex justify-between text-[10px] text-stone-400 mb-1.5">
                                                        <span>Nữ</span>
                                                        <span>Unisex</span>
                                                        <span>Nam</span>
                                                    </div>
                                                    <div className="h-1.5 bg-stone-100 rounded-full relative">
                                                        <div
                                                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-stone-800 rounded-full border-2 border-white shadow"
                                                            style={{ left: `calc(${genderPos}% - 10px)` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Longevity */}
                                {longevityLevel > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-stone-400 font-semibold">Độ lưu hương</span>
                                            <span className="text-sm font-semibold text-stone-600">{product.longevity}</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {[1,2,3,4,5].map(i => (
                                                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= longevityLevel ? 'bg-stone-800' : 'bg-stone-100'}`} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sillage */}
                                {sillageLevel > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-stone-400 font-semibold">Độ toả hương</span>
                                            <span className="text-sm font-semibold text-stone-600">{product.sillage}</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= sillageLevel ? 'bg-rose-400' : 'bg-stone-100'}`} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}

                        {/* Variant Selector */}
                        <VariantSelector
                            variants={product.variants}
                            productId={product.id}
                            productName={product.name}
                            brand={product.brand}
                            imageUrl={product.imageUrl}
                        />

                        {/* Trust badges */}
                        {/* Trust badges */}
                        <div className="mt-8 flex items-center gap-6 pt-6 border-t border-stone-100">
                            <div className="flex items-center gap-2 text-sm text-stone-500">
                                <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                </svg>
                                Freeship toàn quốc
                            </div>
                            <div className="flex items-center gap-2 text-sm text-stone-500">
                                <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                </svg>
                                Chính hãng 100%
                            </div>
                            <div className="flex items-center gap-2 text-sm text-stone-500">
                                <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"/>
                                </svg>
                                Đổi trả miễn phí
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="max-w-7xl mx-auto px-6 pb-16">
                <ProductTabs product={product} reviews={product.reviews} />
            </div>

            {/* CHI TIẾT SẢN PHẨM */}
            {(product.brand || product.origin || product.releaseYear || product.concentration || product.scentGroup || product.style?.length || product.occasion?.length) && (
                <div className="max-w-7xl mx-auto px-6 py-12 border-t border-stone-100">
                    <h2 className="text-2xl font-bold text-stone-900 mb-6">Chi tiết về sản phẩm</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0 max-w-3xl">
                        {[
                            { label: 'Thương hiệu', value: product.brand, href: `/shop?brand=${encodeURIComponent(product.brand)}` },
                            { label: 'Xuất xứ', value: product.origin },
                            { label: 'Năm phát hành', value: product.releaseYear?.toString() },
                            { label: 'Nồng độ', value: product.concentration },
                            { label: 'Nhóm hương', value: product.scentGroup },
                            { label: 'Giới tính', value: product.gender },
                            { label: 'Phong cách', value: product.style?.join(', ') },
                            { label: 'Dịp sử dụng', value: product.occasion?.join(', ') },
                        ].filter(row => row.value).map(({ label, value, href }) => (
                            <div key={label} className="flex gap-4 py-3 border-b border-stone-100">
                                <span className="w-36 flex-shrink-0 text-sm font-semibold text-stone-700">{label}:</span>
                                {href ? (
                                    <Link href={href} className="text-sm text-rose-400 hover:text-rose-500 transition-colors">{value}</Link>
                                ) : (
                                    <span className="text-sm text-stone-500">{value}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    {product.longDesc && (
                        <div className="mt-8 max-w-3xl">
                            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{product.longDesc}</p>
                        </div>
                    )}
                </div>
            )}

            {/* RELATED */}
            {related.length > 0 && (
                <div className="border-t border-stone-100 py-16">
                    <RelatedProducts products={related} />
                </div>
            )}
        </div>
    );
}