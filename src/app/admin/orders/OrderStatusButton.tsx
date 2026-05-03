'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    PENDING:   { label: 'Chờ xử lý',       className: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
    SHIPPING:  { label: 'Đang giao',        className: 'bg-blue-50 text-blue-600 border-blue-200' },
    SHIPPED:   { label: 'Đã giao',          className: 'bg-green-50 text-green-600 border-green-200' },
    CANCELLED: { label: 'Đã hủy',           className: 'bg-red-50 text-red-500 border-red-200' },
    REFUNDED:  { label: 'Trả hàng/Hoàn tiền', className: 'bg-purple-50 text-purple-500 border-purple-200' },
};

export default function OrderStatusButton({
                                              orderId,
                                              currentStatus,
                                          }: {
    orderId: string;
    currentStatus: string;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(currentStatus);
    const [open, setOpen] = useState(false);

    const { label, className } = STATUS_MAP[status] ?? STATUS_MAP['PENDING'];

    const handleUpdate = async (newStatus: string) => {
        if (newStatus === status) { setOpen(false); return; }
        setLoading(true);
        setOpen(false);

        const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });

        setLoading(false);

        if (res.ok) {
            setStatus(newStatus);
            router.refresh();
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                disabled={loading}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors hover:opacity-80 ${className}`}
            >
                {loading ? '...' : label}
                <span className="text-[10px]">▾</span>
            </button>

            {open && (
                <>
                    {/* Overlay đóng dropdown khi click ra ngoài */}
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-stone-100 py-1 min-w-[180px]">
                        {Object.entries(STATUS_MAP).map(([key, { label: optLabel, className: optClass }]) => (
                            <button
                                key={key}
                                onClick={() => handleUpdate(key)}
                                className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-stone-50 transition-colors flex items-center gap-2
                                    ${key === status ? 'opacity-40 cursor-default' : ''}
                                `}
                            >
                                <span className={`px-2 py-0.5 rounded-full border ${optClass}`}>{optLabel}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}