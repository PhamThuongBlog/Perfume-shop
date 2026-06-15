import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/marketing/campaigns - List campaigns
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Quyền admin yêu cầu' } }, { status: 403 });
  }
  try {
    const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}

// POST /api/marketing/campaigns - Create campaign
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Quyền admin yêu cầu' } }, { status: 403 });
  }
  try {
    const body = await req.json();
    const campaign = await prisma.campaign.create({
      data: {
        name: body.name,
        description: body.description,
        type: body.type || 'EMAIL',
        subject: body.subject,
        body: body.body,
        imageUrl: body.imageUrl,
        targetSegment: body.targetSegment || 'ALL',
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        linkedDiscountId: body.linkedDiscountId || null,
      },
    });
    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
