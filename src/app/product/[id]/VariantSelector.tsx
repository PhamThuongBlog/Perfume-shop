'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Heart } from 'lucide-react';

type Variant = {
    id: string;
    volume: number;
    price: number;
    discountPercent: number;
    stock: number;
};

type Props = {
    variants: Variant[];
    productId: string;
    productName: string;
    brand: string;
    imageUrl: string | null;
};

export default function VariantSelector({ variants, productId, productName, brand, imageUrl }: Props) {
    const addItem = useCartStore((state) => state.addItem);
    const [selectedId, setSelectedId] = useState<string>(variants[0]?.id ?? '');
    const [quantity, setQuantity] = useState(1);
    const [wishlist, setWishlist] = useState(false);

    const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

    const discountedPrice = selected.discountPercent > 0
        ? selected.price * (1 - selected.discountPercent / 100)
        : null;

    const displayPrice = discountedPrice ?? selected.price;

    return (
        <div className="space-y-6">
            {/* PRICE */}
            <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-stone-900">
                    {(displayPrice * quantity).toLocaleString('vi-VN')} ₫
                </span>
                {discountedPrice && (
                    <span className="text-lg text-stone-400 line-through">
                        {(selected.price * quantity).toLocaleString('vi-VN')} ₫
                    </span>
                )}
                {selected.discountPercent > 0 && (
                    <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full">
                        -{selected.discountPercent}%
                    </span>
                )}
            </div>

            {/* VOLUME SELECT */}
            <div>
                <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-3">
                    Chọn dung tích
                </p>
                <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => {
                        const isSelected = variant.id === selectedId;
                        const isSoldOut = variant.stock === 0;

                        return (
                            <button
                                key={variant.id}
                                onClick={() => { if (!isSoldOut) { setSelectedId(variant.id); setQuantity(1); } }}
                                disabled={isSoldOut}
                                className={`px-5 py-2.5 rounded-full border text-sm font-semibold transition-all duration-200
                                    ${isSelected
                                    ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                                }
                                    ${isSoldOut ? 'opacity-35 cursor-not-allowed line-through' : 'cursor-pointer'}
                                `}
                            >
                                {variant.volume}ml
                            </button>
                        );
                    })}
                </div>

                {/* Tồn kho */}
                {selected.stock > 0 && (
                    <p className="text-xs mt-2 font-medium">
                        {selected.stock < 5
                            ? <span className="text-orange-500">⚠ Chỉ còn {selected.stock} chai</span>
                            : <span className="text-stone-500">Còn {selected.stock} chai</span>
                        }
                    </p>
                )}
            </div>

            {/* QUANTITY + ADD TO CART */}
            <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-stone-200 rounded-full overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-10 h-11 text-stone-600 hover:bg-stone-50 transition-colors flex items-center justify-center text-lg"
                    >
                        −
                    </button>
                        <input
                            type="number"
                            min={1}
                            max={selected.stock}
                            value={quantity}
                            onChange={e => setQuantity(Math.min(selected.stock, Math.max(1, Number(e.target.value))))}
                            className="w-10 text-center font-semibold text-stone-900 text-sm bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    <button
                        type="button"
                        onClick={() => setQuantity(q => Math.min(selected.stock, q + 1))}
                        disabled={quantity >= selected.stock}
                        className="w-10 h-11 text-stone-600 hover:bg-stone-50 transition-colors flex items-center justify-center text-lg disabled:opacity-30"
                    >
                        +
                    </button>
                </div>

                {/* Add to cart */}
                <button
                    onClick={() => {
                        for (let i = 0; i < quantity; i++) {
                            addItem({
                                variantId: selected.id,
                                productId,
                                productName,
                                brand,
                                imageUrl,
                                volume: selected.volume,
                                price: selected.price,
                                discountPercent: selected.discountPercent,
                                stock: selected.stock,
                            });
                        }
                    }}
                    disabled={selected.stock === 0}
                    className={`flex-1 h-11 rounded-full text-sm font-semibold tracking-wide transition-all duration-200
                        ${selected.stock === 0
                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        : 'bg-stone-900 text-white hover:bg-stone-700 shadow-lg hover:shadow-xl active:scale-[0.98]'
                    }`}
                >
                    {selected.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                </button>

                {/* Wishlist */}
                <button
                    onClick={() => setWishlist(w => !w)}
                    className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200
                        ${wishlist
                        ? 'border-red-200 bg-red-50 text-red-500'
                        : 'border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600'
                    }`}
                >
                    <Heart className={`w-4 h-4 ${wishlist ? 'fill-current' : ''}`} />
                </button>
            </div>
        </div>
    );
}