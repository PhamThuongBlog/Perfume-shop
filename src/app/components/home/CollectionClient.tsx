'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';

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
    images: string[];
    category: { id: string; name: string };
    variants: Variant[];
};

type Props = {
    products: Product[];
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function CollectionClient({ products }: Props) {
    const carouselRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftRef = useRef(0);
    const animRef = useRef<number | null>(null);
    const [wishlist, setWishlist] = useState<Set<string>>(new Set());
    const isScrolling = useRef(false);
    const hasDragged = useRef(false);

    const CARD_WIDTH = useRef(0);

    useEffect(() => {
        const el = carouselRef.current;
        if (!el || products.length === 0) return;
        const firstCard = el.firstElementChild as HTMLElement;
        if (firstCard) {
            CARD_WIDTH.current = firstCard.offsetWidth + 24; // gap-6 = 24px
            // Khởi tạo ở giữa (set thứ 2) để có thể scroll cả 2 chiều
            el.scrollLeft = CARD_WIDTH.current * products.length;
        }
    }, [products.length]);

    const smoothScrollBy = (distance: number) => {
        if (isScrolling.current) return;
        const el = carouselRef.current;
        if (!el) return;
        isScrolling.current = true;
        if (animRef.current) cancelAnimationFrame(animRef.current);

        const start = el.scrollLeft;
        const duration = 800;
        const startTime = performance.now();

        const easeInOutCubic = (t: number) =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            el.scrollLeft = start + distance * easeInOutCubic(progress);
            if (progress < 1) {
                animRef.current = requestAnimationFrame(animate);
            } else {
                isScrolling.current = false;
            }
        };
        animRef.current = requestAnimationFrame(animate);
    };

    const scroll = (dir: 'left' | 'right') => {
        smoothScrollBy(dir === 'left' ? -CARD_WIDTH.current : CARD_WIDTH.current);
    };

    const handleScroll = useCallback(() => {
        const el = carouselRef.current;
        if (!el || products.length === 0 || CARD_WIDTH.current === 0) return;
        const setWidth = CARD_WIDTH.current * products.length;
        if (el.scrollLeft < setWidth * 0.3) {
            el.scrollLeft += setWidth;
        } else if (el.scrollLeft > setWidth * 2) {
            el.scrollLeft -= setWidth;
        }
    }, [products.length]);

    useEffect(() => {
        const el = carouselRef.current;
        if (!el) return;
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const onMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        hasDragged.current = false;
        startX.current = e.pageX - (carouselRef.current?.offsetLeft ?? 0);
        scrollLeftRef.current = carouselRef.current?.scrollLeft ?? 0;
        if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !carouselRef.current) return;
        e.preventDefault();
        const x = e.pageX - carouselRef.current.offsetLeft;
        const delta = x - startX.current;
        if (Math.abs(delta) > 4) hasDragged.current = true;
        carouselRef.current.scrollLeft = scrollLeftRef.current - delta;
    };
    const onMouseUp = () => { isDragging.current = false; };

    const loopedProducts = [...products, ...products, ...products];

    return (
        <section id="collection" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="text-sm uppercase tracking-widest text-rose-500 font-semibold mb-3">
                            Bộ sưu tập nổi bật
                        </h2>
                        <h3 className="text-4xl font-serif text-stone-900">
                            Những Mùi Hương <span className="italic text-stone-500">Kinh Điển</span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0">
                        <Link href="/shop" className="text-sm text-stone-500 hover:text-rose-500 transition-colors flex items-center gap-1 font-medium">
                            Xem tất cả <ChevronRight className="w-4 h-4" />
                        </Link>
                        <div className="flex gap-2">
                            <button onClick={() => scroll('left')} className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors text-stone-600">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => scroll('right')} className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors text-stone-600">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 text-stone-400">
                        <p className="text-4xl mb-3">🔍</p>
                        <p>Chưa có sản phẩm nào</p>
                    </div>
                ) : (
                    /* FIX: Wrapper overflow-hidden ngăn card bị clip bởi section padding,
                       đồng thời dùng -mx + px để carousel scroll sát edge nhưng nội dung vẫn căn đúng */
                    <div className="overflow-hidden">
                        <div
                            ref={carouselRef}
                            onMouseDown={onMouseDown}
                            onMouseMove={onMouseMove}
                            onMouseUp={onMouseUp}
                            onMouseLeave={onMouseUp}
                            className="flex gap-6 overflow-x-auto pb-4 cursor-grab active:cursor-grabbing select-none"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                /* FIX: padding đầu + cuối để card không bị clip khi ở position đầu/cuối viewport */
                                paddingLeft: '2px',
                                paddingRight: '2px',
                            }}
                        >
                            {loopedProducts.map((product, index) => {
                                const firstVariant = product.variants[0];
                                const discountedPrice = firstVariant
                                    ? firstVariant.price * (1 - firstVariant.discountPercent / 100)
                                    : 0;

                                return (
                                    <Link
                                        href={`/product/${product.id}`}
                                        key={`${product.id}-${index}`}
                                        className="group flex-shrink-0 w-[calc((100%-96px)/5)] flex flex-col snap-start"
                                        draggable={false}
                                        onClick={(e) => { if (hasDragged.current) e.preventDefault(); }}
                                    >
                                        <div
                                            className="relative w-full aspect-[4/5] bg-stone-100 overflow-hidden rounded-xl mb-4"
                                            onMouseEnter={() => setWishlist(prev => new Set([...prev, `hover-${product.id}-${index}`]))}
                                            onMouseLeave={() => setWishlist(prev => { const next = new Set(prev); next.delete(`hover-${product.id}-${index}`); return next; })}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={product.images?.[1] && wishlist.has(`hover-${product.id}-${index}`)
                                                    ? product.images[1]
                                                    : (product.imageUrl || 'https://via.placeholder.com/400x500')}
                                                alt={product.name}
                                                draggable={false}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setWishlist(prev => {
                                                        const next = new Set(prev);
                                                        next.has(product.id) ? next.delete(product.id) : next.add(product.id);
                                                        return next;
                                                    });
                                                }}
                                                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Heart className={`w-4 h-4 transition-colors ${wishlist.has(product.id) ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                                            </button>
                                            {firstVariant?.discountPercent > 0 && (
                                                <div className="absolute top-3 right-3">
                                                    <span className="px-2.5 py-1 bg-rose-500 text-white text-xs font-bold rounded-full">
                                                        -{firstVariant.discountPercent}%
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                                                <span className="text-white text-xs uppercase tracking-widest font-medium">
                                                    Xem chi tiết
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col flex-1">
                                            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">{product.brand}</p>
                                            <h4 className="text-base font-serif text-stone-900 mb-2 group-hover:text-rose-500 transition-colors leading-snug">
                                                {product.name}
                                            </h4>
                                            <div className="mt-auto flex items-center gap-2">
                                                {firstVariant ? (
                                                    <>
                                                        <span className="font-semibold text-stone-900 text-sm">
                                                            {formatPrice(discountedPrice)}
                                                        </span>
                                                        {firstVariant.discountPercent > 0 && (
                                                            <span className="text-xs text-stone-400 line-through">
                                                                {formatPrice(firstVariant.price)}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-stone-400 italic">Đang cập nhật</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-stone-400 mt-1">{firstVariant?.volume}ml</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}