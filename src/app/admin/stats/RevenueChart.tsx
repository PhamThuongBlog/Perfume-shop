'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

type Props = {
    data: { month: string; revenue: number }[];
};

const formatVND = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return value.toString();
};

export default function RevenueChart({ data }: Props) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#a8a29e' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tickFormatter={formatVND}
                    tick={{ fontSize: 12, fill: '#a8a29e' }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                            <div className="bg-white border border-stone-200 rounded-xl px-4 py-2 shadow-sm text-sm">
                                <p className="font-medium text-stone-900">
                                    {Number(payload[0].value).toLocaleString('vi-VN')} ₫
                                </p>
                            </div>
                        );
                    }}
                />
                <Bar dataKey="revenue" fill="#1c1917" radius={[6, 6, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}