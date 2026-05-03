import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = ['PENDING', 'SHIPPING', 'SHIPPED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 });
    }

    // Lấy đơn hàng để kiểm tra quyền
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });

    // ADMIN: toàn quyền
    // USER: chỉ được hủy đơn PENDING hoặc trả hàng SHIPPED của chính mình
    if (session.user.role !== 'ADMIN') {
        if (order.userId !== session.user.id) {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }
        const allowedUserActions: Record<string, string> = {
            PENDING: 'CANCELLED',
            SHIPPED: 'REFUNDED',
        };
        if (allowedUserActions[order.status] !== status) {
            return NextResponse.json({ error: 'Thao tác không hợp lệ' }, { status: 400 });
        }
    }

    const updated = await prisma.order.update({
        where: { id },
        data: { status },
    });

    return NextResponse.json(updated);
}