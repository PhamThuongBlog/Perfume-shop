import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import OrderActionButton from './OrderActionButton';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    PENDING:   { label: 'Chờ xử lý',          className: 'bg-yellow-50 text-yellow-600' },
    SHIPPING:  { label: 'Đang giao',           className: 'bg-blue-50 text-blue-600' },
    SHIPPED:   { label: 'Đã giao',             className: 'bg-green-50 text-green-600' },
    CANCELLED: { label: 'Đã hủy',              className: 'bg-red-50 text-red-500' },
    REFUNDED:  { label: 'Trả hàng/Hoàn tiền',  className: 'bg-purple-50 text-purple-500' },
};

export default async function ProfilePage() {
    const session = await auth();
    if (!session) redirect('/login');

    const orders = await prisma.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            orderItems: {
                include: {
                    variant: {
                        include: { product: { select: { name: true, imageUrl: true } } },
                    },
                },
            },
        },
    });

    return (
        <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-stone-900 mb-8">Tài khoản của tôi</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* THÔNG TIN TÀI KHOẢN */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-2xl font-bold text-stone-400 mb-4">
                                {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                            </div>
                            <h2 className="font-bold text-stone-900 text-lg">
                                {session.user?.name ?? 'Khách hàng'}
                            </h2>
                            <p className="text-stone-400 text-sm mt-1">{session.user?.email}</p>

                            <div className="mt-6 pt-6 border-t border-stone-100 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500">Tổng đơn hàng</span>
                                    <span className="font-semibold text-stone-900">{orders.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500">Đã giao thành công</span>
                                    <span className="font-semibold text-green-600">
                                        {orders.filter(o => o.status === 'SHIPPED').length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LỊCH SỬ ĐƠN HÀNG */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="font-semibold text-stone-900">Lịch sử đơn hàng</h2>

                        {orders.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
                                <p className="text-4xl mb-3">📦</p>
                                <p className="text-stone-400 mb-4">Bạn chưa có đơn hàng nào</p>
                                <Link
                                    href="/"
                                    className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
                                >
                                    Mua sắm ngay
                                </Link>
                            </div>
                        ) : (
                            orders.map((order) => {
                                const { label, className } = STATUS_MAP[order.status] ?? STATUS_MAP['PENDING'];
                                return (
                                    <div key={order.id} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
                                        {/* HEADER ĐƠN */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-xs text-stone-400">
                                                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                                <p className="text-sm text-stone-500 mt-0.5">📍 {order.address}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
                                                    {label}
                                                </span>
                                                <p className="font-bold text-stone-900 mt-1.5">
                                                    {order.totalAmount.toLocaleString('vi-VN')} ₫
                                                </p>
                                            </div>
                                        </div>

                                        {/* SẢN PHẨM */}
                                        <div className="space-y-3 border-t border-stone-50 pt-3">
                                            {order.orderItems.map((item) => (
                                                <div key={item.id} className="flex gap-3 items-center">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                                        {item.variant.product.imageUrl ? (
                                                            <img
                                                                src={item.variant.product.imageUrl}
                                                                alt={item.variant.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">N/A</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-stone-900">
                                                            {item.variant.product.name} — {item.variant.volume}ml
                                                        </p>
                                                        <p className="text-xs text-stone-400">
                                                            × {item.quantity} · {item.price.toLocaleString('vi-VN')} ₫/sp
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <OrderActionButton orderId={order.id} status={order.status} />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}