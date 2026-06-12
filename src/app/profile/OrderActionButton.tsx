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

    if (status !== 'PENDING') return null;

    const handleCancel = async () => {
        if (!confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;
        setLoading(true);

        const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CANCELLED' }),
        });

        setLoading(false);
        if (res.ok) router.refresh();
        else alert('Thao tác thất bại, thử lại sau.');
    };

    return (
        <button
            onClick={handleCancel}
            disabled={loading}
            className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
            {loading ? '...' : 'Hủy đơn hàng'}
        </button>
    );
}