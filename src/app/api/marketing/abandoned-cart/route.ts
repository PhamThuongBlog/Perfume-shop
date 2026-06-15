import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/marketing/abandoned-cart - Save abandoned cart (public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, phone, items, cartValue } = body;

    if (!items || !cartValue) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'Thiếu dữ liệu giỏ hàng' } }, { status: 400 });
    }

    // Upsert: update if user already has an abandoned cart
    let existing = null;
    if (userId && /^[a-f\d]{24}$/i.test(userId)) {
      try {
        existing = await prisma.abandonedCart.findFirst({ where: { userId, status: 'PENDING' }, orderBy: { createdAt: 'desc' } });
      } catch { /* invalid ObjectId */ }
    }

    if (existing) {
      const updated = await prisma.abandonedCart.update({
        where: { id: existing.id },
        data: { cartData: JSON.stringify(items), cartValue, updatedAt: new Date() },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const validUserId = userId && /^[a-f\d]{24}$/i.test(userId) ? userId : null;
    const cart = await prisma.abandonedCart.create({
      data: { userId: validUserId, email: email || null, phone: phone || null, cartData: JSON.stringify(items), cartValue },
    });
    return NextResponse.json({ success: true, data: cart }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}

// GET /api/marketing/abandoned-cart - List abandoned carts (admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';

    const carts = await prisma.abandonedCart.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const stats = {
      total: await prisma.abandonedCart.count(),
      pending: await prisma.abandonedCart.count({ where: { status: 'PENDING' } }),
      recovered: await prisma.abandonedCart.count({ where: { status: 'RECOVERED' } }),
      totalValue: (await prisma.abandonedCart.findMany({ where: { status: 'PENDING' }, select: { cartValue: true } })).reduce((s, c) => s + c.cartValue, 0),
      recoveryRate: await prisma.abandonedCart.count().then(async total => {
        const recovered = await prisma.abandonedCart.count({ where: { status: 'RECOVERED' } });
        return total > 0 ? Math.round((recovered / total) * 100) : 0;
      }),
    };

    return NextResponse.json({ success: true, data: { carts, stats } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
