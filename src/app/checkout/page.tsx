'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { items, totalPrice, clearCart } = useCartStore();

    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [discountData, setDiscountData] = useState<any>(null);
    const [discountMsg, setDiscountMsg] = useState('');
    const [applyingDiscount, setApplyingDiscount] = useState(false);

    // Chưa đăng nhập
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <div className="text-center">
                    <p className="text-stone-600 mb-4">Bạn cần đăng nhập để thanh toán</p>
                    <Link href="/login" className="bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-700 transition-colors">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    // Giỏ hàng trống
    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <div className="text-center">
                    <p className="text-5xl mb-4">🛒</p>
                    <p className="text-stone-600 mb-4">Giỏ hàng trống</p>
                    <Link href="/" className="bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-700 transition-colors">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                address, phone, items,
                discountCode: discountData?.code || null,
                discountAmount: discountData?.discountAmount || 0,
            }),
        });

        setLoading(false);

        if (res.ok) {
            clearCart();
            router.push('/checkout/success');
        } else {
            const data = await res.json();
            setError(data.error || 'Đặt hàng thất bại, thử lại sau.');
        }
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;
        setApplyingDiscount(true);
        setDiscountMsg('');
        setDiscountData(null);
        try {
            const r = await fetch('/api/marketing/discounts/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: discountCode.trim(),
                    cartTotal: totalPrice(),
                    userId: (session?.user as any)?.id,
                    productIds: items.map(i => i.productId),
                }),
            });
            const d = await r.json();
            if (d.success) {
                setDiscountData(d.data);
                setDiscountMsg(`Giảm ${d.data.discountAmount.toLocaleString('vi-VN')}đ`);
            } else {
                setDiscountMsg(d.error?.message || 'Mã không hợp lệ');
            }
        } catch (e) {
            setDiscountMsg('Lỗi kiểm tra mã');
        }
        setApplyingDiscount(false);
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-16 px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* FORM THÔNG TIN */}
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 mb-6">Thông tin giao hàng</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Họ tên</label>
                                <input
                                    value={session.user?.name ?? ''}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl border border-stone-100 bg-stone-50 text-stone-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                                <input
                                    value={session.user?.email ?? ''}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl border border-stone-100 bg-stone-50 text-stone-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Số điện thoại *</label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    placeholder="0912 345 678"
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Địa chỉ giao hàng *</label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    rows={3}
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors resize-none"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-stone-900 text-white font-semibold py-4 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'}
                        </button>
                    </form>
                </div>

                {/* TÓM TẮT ĐƠN HÀNG */}
                <div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-6">Đơn hàng của bạn</h2>
                    <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
                        {items.map((item) => {
                            const finalPrice = item.discountPercent > 0
                                ? item.price * (1 - item.discountPercent / 100)
                                : item.price;

                            return (
                                <div key={item.variantId} className="flex gap-4 items-center">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">N/A</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-stone-900 text-sm">{item.productName}</p>
                                        <p className="text-stone-400 text-xs">{item.volume}ml × {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-stone-900 text-sm">
                                        {(finalPrice * item.quantity).toLocaleString('vi-VN')} ₫
                                    </p>
                                </div>
                            );
                        })}

                        {/* Discount Code */}
                        <div className="border-t border-stone-100 pt-4">
                            <p className="text-sm font-medium text-stone-700 mb-2">Mã giảm giá</p>
                            <div className="flex gap-2">
                                <input
                                    value={discountCode}
                                    onChange={e => { setDiscountCode(e.target.value); setDiscountData(null); setDiscountMsg(''); }}
                                    placeholder="Nhập mã giảm giá"
                                    className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-indigo-400"
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyDiscount}
                                    disabled={applyingDiscount || !discountCode.trim()}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {applyingDiscount ? '...' : 'Áp dụng'}
                                </button>
                            </div>
                            {discountMsg && (
                                <p className={`text-xs mt-2 ${discountData ? 'text-green-600' : 'text-red-500'}`}>
                                    {discountData ? '✅' : '❌'} {discountMsg}
                                </p>
                            )}
                        </div>

                        {/* Discount applied */}
                        {discountData && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-green-600">Giảm giá</span>
                                <span className="text-green-600 font-medium">-{discountData.discountAmount.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        )}

                        <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
                            <span className="font-semibold text-stone-900">Tổng cộng</span>
                            <span className="text-xl font-bold text-stone-900">
                                {discountData
                                    ? discountData.finalTotal.toLocaleString('vi-VN')
                                    : totalPrice().toLocaleString('vi-VN')
                                } ₫
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}