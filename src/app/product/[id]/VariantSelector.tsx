'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';

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

    const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
    const [quantity, setQuantity] = useState(1);

    // Tính giá sau giảm
    const discountedPrice =
        selected.discountPercent > 0
            ? selected.price * (1 - selected.discountPercent / 100)
            : null;

    const handleAddToCart = () => {
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
    };

    return (
        <div className="mt-8">
            {/* CHỌN DUNG TÍCH */}
            <h3 className="text-md font-semibold text-gray-900 mb-4">Chọn dung tích:</h3>
            <div className="flex flex-wrap gap-4">
                {variants.map((variant) => {
                    const isSelected = variant.id === selectedId;
                    const isSoldOut = variant.stock === 0;

                    return (
                        <button
                            key={variant.id}
                            onClick={() => { if (!isSoldOut) { setSelectedId(variant.id); setQuantity(1); } }}
                            disabled={isSoldOut}
                            className={`border-2 rounded-xl p-4 min-w-30 flex flex-col items-center transition-all
                                ${isSelected
                                ? 'border-black bg-gray-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-400'
                            }
                                ${isSoldOut ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <span className="font-bold text-lg">{variant.volume} ml</span>
                            <span className="text-gray-500 text-sm mt-1 line-through">
                                {variant.discountPercent > 0
                                    ? `${variant.price.toLocaleString('vi-VN')} ₫`
                                    : ''}
                            </span>
                            {variant.discountPercent > 0 && (
                                <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full mt-1">
                                    -{variant.discountPercent}%
                                </span>
                            )}
                            {variant.stock > 0 && variant.stock < 5 && (
                                <span className="text-xs text-orange-500 font-medium mt-1">
                                    Còn {variant.stock} chai
                                </span>
                            )}
                            {isSoldOut && (
                                <span className="text-xs text-red-400 font-medium mt-1">
                                    Hết hàng
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* GIÁ HIỂN THỊ */}
            <div className="mt-6 flex items-baseline gap-3">
    <span className="text-3xl font-bold text-gray-900">
        {((discountedPrice ?? selected.price) * quantity).toLocaleString('vi-VN')} ₫
    </span>
                {discountedPrice && (
                    <span className="text-lg text-gray-400 line-through">
            {(selected.price * quantity).toLocaleString('vi-VN')} ₫
        </span>
                )}
            </div>

            {/* SỐ LƯỢNG */}
            <div className="mt-4 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors text-lg"
                    >
                        −
                    </button>
                    <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">
            {quantity}
        </span>
                    <button
                        type="button"
                        onClick={() => setQuantity(q => Math.min(selected.stock, q + 1))}
                        disabled={quantity >= selected.stock}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors text-lg disabled:opacity-30"
                    >
                        +
                    </button>
                </div>
                <span className="text-xs text-gray-400">Còn {selected.stock} sản phẩm</span>
            </div>

            {/* NÚT THÊM GIỎ HÀNG */}
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
                className={`mt-6 w-full text-lg font-semibold py-4 px-8 rounded-xl transition-colors shadow-lg
        ${selected.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
            >
                {selected.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </button>
        </div>
    );
}