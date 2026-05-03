'use client';

import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
    const totalPrice = useCartStore((state) => state.totalPrice);
    const router = useRouter();

    const handleCheckout = () => {
        closeCart();
        router.push('/checkout');
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 transition-opacity"
                    onClick={closeCart}
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-50 shadow-2xl flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                <div className="flex items-center justify-between px-6 py-5 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Giỏ hàng</h2>
                    <button onClick={closeCart} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                            <span className="text-5xl">🛒</span>
                            <p className="text-lg font-medium">Giỏ hàng trống</p>
                        </div>
                    ) : (
                        items.map((item) => {
                            const finalPrice = item.discountPercent > 0
                                ? item.price * (1 - item.discountPercent / 100)
                                : item.price;

                            return (
                                <div key={item.variantId} className="flex gap-4 items-start">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">{item.brand}</p>
                                        <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                                        <p className="text-sm text-gray-500">{item.volume} ml</p>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2 border rounded-lg overflow-hidden">
                                                <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors">−</button>
                                                <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} disabled={item.quantity >= item.stock} className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30">+</button>
                                            </div>
                                            <p className="font-bold text-gray-900">{(finalPrice * item.quantity).toLocaleString('vi-VN')} ₫</p>
                                        </div>
                                    </div>

                                    <button onClick={() => removeItem(item.variantId)} className="text-gray-300 hover:text-red-400 transition-colors mt-1 flex-shrink-0">🗑</button>
                                </div>
                            );
                        })
                    )}
                </div>

                {items.length > 0 && (
                    <div className="border-t px-6 py-5 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Tổng cộng</span>
                            <span className="text-2xl font-bold text-gray-900">{items.reduce((sum, item) => {
                                const finalPrice = item.discountPercent > 0
                                    ? item.price * (1 - item.discountPercent / 100)
                                    : item.price;
                                return sum + finalPrice * item.quantity;
                            }, 0).toLocaleString('vi-VN')} ₫</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-black text-white font-semibold py-4 rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            Tiến hành thanh toán
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}