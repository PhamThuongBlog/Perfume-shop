import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// POST — tạo session mới
export async function POST() {
    let userId: string | null = null;

    try {
        const session = await Promise.race([
            auth(),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
        ]);
        userId = session?.user?.id ?? null;
    } catch {
        userId = null;
    }

    // Nếu đã đăng nhập → tìm session cũ nhất còn dùng được
    if (userId) {
        const existing = await prisma.chatSession.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        if (existing) {
            return NextResponse.json({ sessionId: existing.id });
        }
    }

    // Tạo session mới
    const chatSession = await prisma.chatSession.create({
        data: { userId }
    });

    return NextResponse.json({ sessionId: chatSession.id });
}

// GET — lấy lịch sử tin nhắn
export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (!sessionId) return NextResponse.json({ messages: [] });

    const chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
            messages: { orderBy: { createdAt: 'asc' } }
        }
    });

    if (!chatSession) return NextResponse.json({ messages: [] });

    return NextResponse.json({
        messages: chatSession.messages.map(m => ({
            role: m.role,
            text: m.text
        }))
    });
}