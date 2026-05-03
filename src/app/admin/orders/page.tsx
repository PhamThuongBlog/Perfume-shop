import { prisma } from '@/lib/prisma';
import OrderStatusButton from './OrderStatusButton';

export default async function AdminOrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } },
            orderItems: {
                include: {
                    variant: {
                        include: { product: { select: { name: true } } },
                    },
                },
            },
        },
    });

    return (
        <div>
            <h1 className="text-2xl font-bold text-stone-900 mb-8">Đơn hàng</h1>

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-16 text-center text-stone-400">
                    <p className="text-4xl mb-3">📦</p>
                    <p>Chưa có đơn hàng nào</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                            <div className="flex justify-between items-start mb-4">
                                {/* THÔNG TIN KHÁCH */}
                                <div>
                                    <p className="font-semibold text-stone-900">
                                        {order.user.name ?? order.user.email}
                                    </p>
                                    <p className="text-sm text-stone-400">{order.user.email}</p>
                                    <p className="text-sm text-stone-500 mt-1">📍 {order.address}</p>
                                    <p className="text-sm text-stone-500">📞 {order.phone}</p>
                                </div>

                                {/* TRẠNG THÁI + TỔNG TIỀN */}
                                <div className="text-right flex flex-col items-end gap-2">
                                    <p className="text-lg font-bold text-stone-900">
                                        {order.totalAmount.toLocaleString('vi-VN')} ₫
                                    </p>
                                    <OrderStatusButton orderId={order.id} currentStatus={order.status} />
                                    <p className="text-xs text-stone-400">
                                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* CHI TIẾT SẢN PHẨM */}
                            <div className="border-t border-stone-50 pt-4 space-y-2">
                                {order.orderItems.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-stone-600">
                                            {item.variant.product.name} — {item.variant.volume}ml × {item.quantity}
                                        </span>
                                        <span className="font-medium text-stone-900">
                                            {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}