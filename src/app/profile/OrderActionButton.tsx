'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
    orderId: string;
    status: string;
};

export default function OrderActionButton({ orderId, status }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const canCancel = status === 'PENDING';
    const canRefund = status === 'SHIPPED';

    if (!canCancel && !canRefund) return null;

    const handleAction = async (newStatus: string, confirmMsg: string) => {
        if (!confirm(confirmMsg)) return;
        setLoading(true);

        const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });

        setLoading(false);

        if (res.ok) {
            router.refresh();
        } else {
            alert('Thao tác thất bại, thử lại sau.');
        }
    };

    return (
        <div className="mt-3 pt-3 border-t border-stone-50 flex gap-2">
            {canCancel && (
                <button
                    onClick={() => handleAction('CANCELLED', 'Bạn có chắc muốn hủy đơn hàng này không?')}
                    disabled={loading}
                    className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? '...' : 'Hủy đơn hàng'}
                </button>
            )}
            {canRefund && (
                <button
                    onClick={() => handleAction('REFUNDED', 'Bạn có chắc muốn yêu cầu trả hàng/hoàn tiền không?')}
                    disabled={loading}
                    className="text-xs text-purple-400 hover:text-purple-600 border border-purple-200 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? '...' : 'Trả hàng / Hoàn tiền'}
                </button>
            )}
        </div>
    );
}