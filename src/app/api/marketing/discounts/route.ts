import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/marketing/discounts - List all discount codes
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Quyền admin yêu cầu' } }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // active | expired | all

    const where: any = {};
    if (status === 'active') {
      where.isActive = true;
      where.OR = [{ endsAt: null }, { endsAt: { gt: new Date() } }];
    } else if (status === 'expired') {
      where.endsAt = { lt: new Date() };
    }

    const [discounts, total] = await Promise.all([
      prisma.discountCode.findMany({
        where,
        include: { _count: { select: { usages: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.discountCode.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: discounts,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}

// POST /api/marketing/discounts - Create discount code
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Quyền admin yêu cầu' } }, { status: 403 });
  }
  const body = await req.json();
  const { code, description, type, value, minOrderValue, maxDiscount, usageLimit, perUserLimit, startsAt, endsAt, targetSegment, applicableProducts, applicableCategories } = body;
  if (!code || !type || value === undefined) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'Thiếu code, type hoặc value' } }, { status: 400 });
  }
  const codeUpper = code.toUpperCase();

  try {
    const discount = await prisma.discountCode.create({
      data: {
        code: codeUpper,
        description, type, value: parseFloat(value),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : 100,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
        startsAt: startsAt ? new Date(startsAt) : new Date(),
        endsAt: endsAt ? new Date(endsAt) : null,
        targetSegment: targetSegment || 'ALL',
        applicableProducts: applicableProducts || [],
        applicableCategories: applicableCategories || [],
      },
    });
    return NextResponse.json({ success: true, data: discount }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: { code: 'DUPLICATE', message: `Mã "${codeUpper}" đã tồn tại` } }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
