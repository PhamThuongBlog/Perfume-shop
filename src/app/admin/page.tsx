import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
    const [productCount, orderCount, userCount] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.user.count(),
    ]);

    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
    });

    return (
        <div>
            <h1 className="text-2xl font-bold text-stone-900 mb-8">Tổng quan</h1>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                    <p className="text-sm text-stone-500 font-medium">Sản phẩm</p>
                    <p className="text-4xl font-bold text-stone-900 mt-2">{productCount}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                    <p className="text-sm text-stone-500 font-medium">Đơn hàng</p>
                    <p className="text-4xl font-bold text-stone-900 mt-2">{orderCount}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                    <p className="text-sm text-stone-500 font-medium">Người dùng</p>
                    <p className="text-4xl font-bold text-stone-900 mt-2">{userCount}</p>
                </div>
            </div>

            {/* ĐƠN HÀNG GẦN ĐÂY */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                <h2 className="text-lg font-bold text-stone-900 mb-4">Đơn hàng gần đây</h2>
                {recentOrders.length === 0 ? (
                    <p className="text-stone-400 text-sm">Chưa có đơn hàng nào</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-left text-stone-400 border-b border-stone-100">
                            <th className="pb-3 font-medium">Khách hàng</th>
                            <th className="pb-3 font-medium">Tổng tiền</th>
                            <th className="pb-3 font-medium">Trạng thái</th>
                            <th className="pb-3 font-medium">Ngày đặt</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                        {recentOrders.map((order) => (
                            <tr key={order.id}>
                                <td className="py-3 text-stone-700">
                                    {order.user.name ?? order.user.email}
                                </td>
                                <td className="py-3 font-medium text-stone-900">
                                    {order.totalAmount.toLocaleString('vi-VN')} ₫
                                </td>
                                <td className="py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                            ${{
                                            PENDING:   'bg-yellow-50 text-yellow-600',
                                            SHIPPING:  'bg-blue-50 text-blue-600',
                                            SHIPPED:   'bg-green-50 text-green-600',
                                            CANCELLED: 'bg-red-50 text-red-500',
                                            REFUNDED:  'bg-purple-50 text-purple-500',
                                        }[order.status] ?? 'bg-stone-50 text-stone-500'}
                                        `}>
                                            {{
                                            PENDING:   'Chờ xử lý',
                                            SHIPPING:  'Đang giao',
                                            SHIPPED:   'Đã giao',
                                            CANCELLED: 'Đã hủy',
                                            REFUNDED:  'Hoàn tiền',
                                        }[order.status] ?? order.status}
                                        </span>
                                </td>
                                <td className="py-3 text-stone-400">
                                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}