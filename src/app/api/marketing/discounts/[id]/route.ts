import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/marketing/discounts/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Quyền admin yêu cầu' } }, { status: 403 });
  }
  try {
    const { id } = await params;
    const discount = await prisma.discountCode.findUnique({
      where: { id },
      include: { usages: { take: 50, orderBy: { createdAt: 'desc' } }, _count: { select: { usages: true } } },
    });
    if (!discount) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }, { status: 404 });
    return NextResponse.json({ success: true, data: discount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}

// PUT /api/marketing/discounts/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Quyền admin yêu cầu' } }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const updateData: any = {};
    const fields = ['description', 'type', 'value', 'minOrderValue', 'maxDiscount', 'usageLimit', 'perUserLimit', 'isActive', 'targetSegment', 'applicableProducts', 'applicableCategories'];
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    if (body.startsAt) updateData.startsAt = new Date(body.startsAt);
    if (body.endsAt !== undefined) updateData.endsAt = body.endsAt ? new Date(body.endsAt) : null;

    const discount = await prisma.discountCode.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, data: discount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}

// DELETE /api/marketing/discounts/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Quyền admin yêu cầu' } }, { status: 403 });
  }
  try {
    const { id } = await params;
    await prisma.discountCode.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Đã xóa' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
