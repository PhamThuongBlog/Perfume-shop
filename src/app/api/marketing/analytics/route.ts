import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/marketing/analytics - Marketing dashboard data
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Quyền admin yêu cầu' } }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30d';
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      orders, totalOrders, totalRevenue,
      discountCodes, activeDiscounts,
      discountUsages,
      campaigns,
      recentEvents,
    ] = await Promise.all([
      prisma.order.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: 'asc' } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.discountCode.findMany({ include: { _count: { select: { usages: true } } } }),
      prisma.discountCode.count({ where: { isActive: true, OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] } }),
      prisma.discountUsage.findMany({ where: { createdAt: { gte: since } }, include: { discountCode: { select: { code: true, type: true } } } }),
      prisma.campaign.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.marketingEvent.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: 'desc' }, take: 100 }),
    ]);

    // Revenue by day
    const revenueByDay: Record<string, number> = {};
    for (const o of orders) {
      const day = o.createdAt.toISOString().split('T')[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + o.totalAmount;
    }

    // Conversion events
    const viewEvents = recentEvents.filter(e => e.event === 'VIEW').length;
    const cartEvents = recentEvents.filter(e => e.event === 'ADD_TO_CART').length;
    const checkoutEvents = recentEvents.filter(e => e.event === 'CHECKOUT').length;
    const purchaseEvents = recentEvents.filter(e => e.event === 'PURCHASE').length;

    // Discount performance
    const totalDiscounted = discountUsages.reduce((sum, u) => sum + u.discountAmount, 0);
    const discountConversion = discountUsages.length > 0
      ? (discountUsages.length / Math.max(orders.length, 1) * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          totalOrders,
          activeDiscounts,
          activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
          conversionRate: viewEvents > 0 ? ((purchaseEvents / viewEvents) * 100).toFixed(1) : '0',
        },
        revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue })),
        discountCodes: discountCodes.map(d => ({
          id: d.id, code: d.code, type: d.type, value: d.value,
          usedCount: d.usedCount, usageLimit: d.usageLimit,
          isActive: d.isActive,
          usageRate: d.usageLimit > 0 ? Math.round((d.usedCount / d.usageLimit) * 100) : 0,
        })),
        discountStats: {
          totalCodes: discountCodes.length,
          activeCodes: activeDiscounts,
          totalUsages: discountUsages.length,
          totalDiscounted,
          discountConversion: parseFloat(discountConversion),
        },
        funnel: {
          views: viewEvents,
          addToCart: cartEvents,
          checkout: checkoutEvents,
          purchases: purchaseEvents,
        },
        campaigns: campaigns.map(c => ({
          id: c.id, name: c.name, type: c.type, status: c.status,
          totalSent: c.totalSent, totalOpened: c.totalOpened,
          totalConverted: c.totalConverted,
          openRate: c.totalSent > 0 ? Math.round((c.totalOpened / c.totalSent) * 100) : 0,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
