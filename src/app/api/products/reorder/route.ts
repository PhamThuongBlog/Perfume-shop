import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items: { id: string; sortOrder: number }[] = await req.json();

    await Promise.all(
        items.map((item) =>
            prisma.product.update({
                where: { id: item.id },
                data: { sortOrder: item.sortOrder },
            })
        )
    );

    // Thêm trước return:
    revalidatePath('/');
    return NextResponse.json({ message: 'OK' });
}