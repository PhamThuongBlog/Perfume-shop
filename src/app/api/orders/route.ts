import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { address, phone, items } = await req.json();

    if (!address || !phone || !items?.length) {
        return NextResponse.json({ error: 'Thiếu thông tin đơn hàng' }, { status: 400 });
    }

    // Tính tổng tiền và validate stock
    let totalAmount = 0;
    const orderItemsData: { variantId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
        const variant = await prisma.productVariant.findUnique({
            where: { id: item.variantId },
        });

        if (!variant) {
            return NextResponse.json({ error: `Sản phẩm không tồn tại` }, { status: 400 });
        }

        if (variant.stock < item.quantity) {
            return NextResponse.json(
                { error: `Sản phẩm ${item.productName} ${item.volume}ml không đủ hàng` },
                { status: 400 }
            );
        }

        // Kiểm tra nghiệp vụ Flash Sale: stock < 5 thì không áp dụng discount
        const applyDiscount = variant.stock >= 5 ? variant.discountPercent : 0;
        const finalPrice = applyDiscount > 0
            ? variant.price * (1 - applyDiscount / 100)
            : variant.price;

        totalAmount += finalPrice * item.quantity;

        orderItemsData.push({
            variantId: item.variantId,
            quantity: item.quantity,
            price: finalPrice,
        });
    }

    // Tạo đơn hàng + trừ stock trong 1 transaction
    const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
            data: {
                userId: session.user.id,
                totalAmount,
                address,
                phone,
                status: 'PENDING',
                orderItems: { create: orderItemsData },
            },
        });

        // Trừ stock từng variant
        for (const item of items) {
            await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } },
            });
        }

        return newOrder;
    });

    return NextResponse.json({ message: 'Đặt hàng thành công', orderId: order.id }, { status: 201 });
}