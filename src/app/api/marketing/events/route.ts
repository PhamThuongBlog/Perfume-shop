import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/marketing/events - Track marketing event (public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, userId, sessionId, productId, metadata, value } = body;
    if (!event) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'Thiếu event type' } }, { status: 400 });

    const validEvents = ['VIEW', 'ADD_TO_CART', 'CHECKOUT', 'PURCHASE', 'DISCOUNT_APPLIED'];
    if (!validEvents.includes(event)) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: `Event không hợp lệ. Hợp lệ: ${validEvents.join(', ')}` } }, { status: 400 });
    }

    await prisma.marketingEvent.create({
      data: { event, userId: userId || null, sessionId: sessionId || null, productId: productId || null, metadata: metadata ? JSON.stringify(metadata) : null, value: value || null },
    });

    return NextResponse.json({ success: true, message: 'Event tracked' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
