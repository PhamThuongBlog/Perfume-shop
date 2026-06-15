import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/marketing/campaigns/[id] - Update campaign
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Quyền admin yêu cầu' } }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const updateData: any = {};
    const fields = ['name', 'description', 'type', 'subject', 'body', 'imageUrl', 'targetSegment', 'status', 'totalSent', 'totalOpened', 'totalClicked', 'totalConverted', 'revenueGenerated'];
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    if (body.scheduledAt) updateData.scheduledAt = new Date(body.scheduledAt);
    if (body.startedAt) updateData.startedAt = new Date(body.startedAt);
    if (body.endedAt) updateData.endedAt = new Date(body.endedAt);
    if (body.linkedDiscountId !== undefined) updateData.linkedDiscountId = body.linkedDiscountId;

    const campaign = await prisma.campaign.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, data: campaign });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}

// DELETE /api/marketing/campaigns/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Quyền admin yêu cầu' } }, { status: 403 });
  }
  try {
    const { id } = await params;
    await prisma.campaign.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Đã xóa' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
