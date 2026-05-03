import { prisma } from '@/lib/prisma';
import RevenueChart from './RevenueChart';

export default async function AdminStatsPage() {
    // Doanh thu theo tháng (6 tháng gần nhất)
    const orders = await prisma.order.findMany({
        where: { status: 'SHIPPED' },
        select: { totalAmount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
    });

    // Group theo tháng
    const monthlyMap: Record<string, number> = {};
    orders.forEach((order) => {
        const key = `${order.createdAt.getFullYear()}/${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = (monthlyMap[key] ?? 0) + order.totalAmount;
    });

    const monthlyData = Object.entries(monthlyMap).map(([month, revenue]) => ({
        month,
        revenue,
    }));

    // Top 5 sản phẩm bán chạy
    const topProducts = await prisma.orderItem.groupBy({
        by: ['variantId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
    });

    const topProductsWithName = await Promise.all(
        topProducts.map(async (item) => {
            const variant = await prisma.productVariant.findUnique({
                where: { id: item.variantId },
                include: { product: { select: { name: true, brand: true } } },
            });
            return {
                name: variant?.product.name ?? 'Không rõ',
                brand: variant?.product.brand ?? '',
                volume: variant?.volume ?? 0,
                quantity: item._sum.quantity ?? 0,
            };
        })
    );

    // Tổng doanh thu
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = await prisma.order.count({ where: { status: 'SHIPPED' } });

    return (
        <div>
            <h1 className="text-2xl font-bold text-stone-900 mb-8">Thống kê</h1>

            {/* TỔNG QUAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                    <p className="text-sm text-stone-500 font-medium">Tổng doanh thu</p>
                    <p className="text-3xl font-bold text-stone-900 mt-2">
                        {totalRevenue.toLocaleString('vi-VN')} ₫
                    </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                    <p className="text-sm text-stone-500 font-medium">Đơn hàng thành công</p>
                    <p className="text-3xl font-bold text-stone-900 mt-2">{totalOrders}</p>
                </div>
            </div>

            {/* BIỂU ĐỒ DOANH THU */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-6">
                <h2 className="font-semibold text-stone-900 mb-6">Doanh thu theo tháng</h2>
                {monthlyData.length === 0 ? (
                    <p className="text-stone-400 text-sm text-center py-10">Chưa có dữ liệu</p>
                ) : (
                    <RevenueChart data={monthlyData} />
                )}
            </div>

            {/* TOP SẢN PHẨM */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                <h2 className="font-semibold text-stone-900 mb-4">Top sản phẩm bán chạy</h2>
                {topProductsWithName.length === 0 ? (
                    <p className="text-stone-400 text-sm">Chưa có dữ liệu</p>
                ) : (
                    <div className="space-y-3">
                        {topProductsWithName.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="font-medium text-stone-900 text-sm">
                                        {item.name} — {item.volume}ml
                                    </p>
                                    <p className="text-stone-400 text-xs">{item.brand}</p>
                                </div>
                                <span className="text-sm font-semibold text-stone-700">
                                    {item.quantity} sản phẩm
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}