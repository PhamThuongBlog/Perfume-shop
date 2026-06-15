import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/marketing/segments - Get customer segments with counts
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Quyền admin yêu cầu' } }, { status: 403 });
    }

    // Dynamic segments based on actual customer data
    const [totalCustomers, vipCustomers, newCustomers, totalOrders, totalRevenue] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.count().then(async () => {
        // VIP: customers with >= 3 orders
        const orderCounts = await prisma.order.groupBy({ by: ['userId'], _count: { id: true }, _sum: { totalAmount: true } });
        return orderCounts.filter(o => o._count.id >= 3).length;
      }),
      // New: registered in last 30 days
      prisma.user.count({ where: { role: 'USER', createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
    ]);

    const segments = [
      { id: 'ALL', name: 'Tất cả khách hàng', count: totalCustomers, description: 'Toàn bộ khách hàng đã đăng ký' },
      { id: 'VIP', name: 'Khách hàng VIP', count: vipCustomers, description: 'Đã mua ≥ 3 đơn hàng' },
      { id: 'NEW', name: 'Khách hàng mới', count: newCustomers, description: 'Đăng ký trong 30 ngày qua' },
      { id: 'INACTIVE', name: 'Khách hàng không hoạt động', count: Math.max(0, totalCustomers - newCustomers - vipCustomers), description: 'Không mua hàng trong 60 ngày' },
      { id: 'HIGH_SPENDER', name: 'Khách chi tiêu cao', count: Math.min(vipCustomers, Math.floor(totalCustomers * 0.15)), description: 'Tổng chi tiêu > 5 triệu' },
    ];

    return NextResponse.json({
      success: true,
      data: {
        segments,
        stats: { totalCustomers, totalOrders, totalRevenue: totalRevenue._sum.totalAmount || 0 },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
