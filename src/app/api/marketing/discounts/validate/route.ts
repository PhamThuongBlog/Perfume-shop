import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/marketing/discounts/validate
// Public endpoint — validate discount code at checkout
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, cartTotal, userId, productIds } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'Vui lòng nhập mã giảm giá' } }, { status: 400 });
    }

    const discount = await prisma.discountCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!discount) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Mã giảm giá không tồn tại' } }, { status: 404 });
    }

    // Validate active status
    if (!discount.isActive) {
      return NextResponse.json({ success: false, error: { code: 'INACTIVE', message: 'Mã giảm giá đã bị vô hiệu hóa' } }, { status: 400 });
    }

    // Validate expiry
    if (discount.endsAt && new Date() > discount.endsAt) {
      return NextResponse.json({ success: false, error: { code: 'EXPIRED', message: 'Mã giảm giá đã hết hạn' } }, { status: 400 });
    }

    // Validate start date
    if (new Date() < discount.startsAt) {
      return NextResponse.json({ success: false, error: { code: 'NOT_STARTED', message: 'Mã giảm giá chưa có hiệu lực' } }, { status: 400 });
    }

    // Validate usage limit
    if (discount.usedCount >= discount.usageLimit) {
      return NextResponse.json({ success: false, error: { code: 'USAGE_EXCEEDED', message: 'Mã giảm giá đã hết lượt sử dụng' } }, { status: 400 });
    }

    // Validate per-user limit (only if userId is a valid ObjectId)
    if (userId && /^[a-f\d]{24}$/i.test(userId)) {
      try {
        const userUsage = await prisma.discountUsage.count({ where: { discountCodeId: discount.id, userId } });
        if (userUsage >= discount.perUserLimit) {
          return NextResponse.json({ success: false, error: { code: 'USER_LIMIT', message: 'Bạn đã sử dụng mã này quá số lần cho phép' } }, { status: 400 });
        }
      } catch { /* ignore invalid ObjectId */ }
    }

    // Validate minimum order
    const orderTotal = cartTotal || 0;
    if (orderTotal < discount.minOrderValue) {
      return NextResponse.json({ success: false, error: { code: 'MIN_ORDER', message: `Đơn tối thiểu ${discount.minOrderValue.toLocaleString('vi-VN')}đ để dùng mã này` } }, { status: 400 });
    }

    // Validate product applicability
    if (discount.applicableProducts?.length > 0 && productIds?.length > 0) {
      const hasMatch = productIds.some((pid: string) => discount.applicableProducts.includes(pid));
      if (!hasMatch) {
        return NextResponse.json({ success: false, error: { code: 'PRODUCT_EXCLUDED', message: 'Mã này không áp dụng cho sản phẩm trong giỏ' } }, { status: 400 });
      }
    }

    // Tính số tiền giảm
    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = orderTotal * (discount.value / 100);
      if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount;
      }
    } else if (discount.type === 'FIXED_AMOUNT') {
      discountAmount = Math.min(discount.value, orderTotal);
    } else if (discount.type === 'FREE_SHIP') {
      discountAmount = 30000; // Free shipping ~30k
    }

    return NextResponse.json({
      success: true,
      data: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount: Math.round(discountAmount),
        finalTotal: Math.round(orderTotal - discountAmount),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
