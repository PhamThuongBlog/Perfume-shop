'use client';

import { useState } from 'react';

const TABS = ['Tầng Hương', 'Cách Dùng', 'Đánh Giá'] as const;
type Tab = typeof TABS[number];

type Review = {
    id: string;
    name: string;
    rating: number;
    text: string;
    createdAt: Date;
};

type Product = {
    topNotes: string[];
    heartNotes: string[];
    baseNotes: string[];
    ingredients: string | null;
    longDesc: string | null;
    reviews?: Review[];
};

type Props = {
    product: Product;
    reviews: Review[];
};

function timeAgo(date: Date) {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Hôm nay';
    if (days < 7) return `${days} ngày trước`;
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
    return `${Math.floor(days / 30)} tháng trước`;
}

export default function ProductTabs({ product, reviews }: Props) {
    const [active, setActive] = useState<Tab>('Tầng Hương');

    const hasNotes = product.topNotes?.length || product.heartNotes?.length || product.baseNotes?.length;

    return (
        <div className="mt-16">
            {/* Tab bar */}
            <div className="flex border-b border-stone-200 gap-8">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActive(tab)}
                        className={`pb-3 text-sm font-semibold tracking-wide transition-all duration-200 border-b-2 -mb-px
                            ${active === tab
                            ? 'border-stone-900 text-stone-900'
                            : 'border-transparent text-stone-400 hover:text-stone-600'
                        }`}
                    >
                        {tab}
                        {tab === 'Đánh Giá' && reviews.length > 0 && (
                            <span className="ml-1.5 text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">
                                {reviews.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="py-10">

                {/* HƯƠNG ĐIỆU */}
                {active === 'Tầng Hương' && (
                    hasNotes ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'Hương Đầu', icon: '🌿', desc: 'Ấn tượng đầu tiên. Tươi sáng, bay bổng và cuốn hút.', tags: product.topNotes },
                                { label: 'Hương Giữa', icon: '🌸', desc: 'Linh hồn của hương thơm. Nở rộ khi hương đầu tan đi.', tags: product.heartNotes },
                                { label: 'Hương Cuối', icon: '🪵', desc: 'Nốt hương lưu bền. Đồng hành cùng bạn suốt 8+ giờ.', tags: product.baseNotes },
                            ].map((note) => (
                                <div key={note.label} className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{note.icon}</span>
                                        <h4 className="text-xs uppercase tracking-widest font-bold text-stone-500">
                                            {note.label}
                                        </h4>
                                    </div>
                                    <p className="text-sm text-stone-500 leading-relaxed">{note.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {note.tags?.length ? note.tags.map((tag) => (
                                            <span key={tag} className="text-xs px-3 py-1 bg-stone-100 text-stone-600 rounded-full font-medium">
                                                {tag}
                                            </span>
                                        )) : (
                                            <span className="text-xs text-stone-300">Chưa có thông tin</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-stone-400">Chưa có thông tin hương điệu.</p>
                    )
                )}

                {/* CÁCH DÙNG */}
                {active === 'Cách Dùng' && (
                    <div className="max-w-xl space-y-6">
                        {[
                            { step: '01', text: 'Xịt cách da 15–20cm, vào các điểm mạch máu: cổ, cổ tay, sau tai.' },
                            { step: '02', text: 'Không chà xát sau khi xịt — để hương tự nở và bám trên da.' },
                            { step: '03', text: 'Dùng sau khi tắm khi da còn ẩm nhẹ để hương lưu lâu hơn.' },
                            { step: '04', text: 'Bảo quản nơi khô ráo, tránh ánh sáng trực tiếp và nhiệt độ cao.' },
                        ].map(({ step, text }) => (
                            <div key={step} className="flex gap-4 items-start">
                                <span className="text-xs font-bold text-stone-300 mt-0.5 w-6 flex-shrink-0">{step}</span>
                                <p className="text-sm text-stone-600 leading-relaxed">{text}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ĐÁNH GIÁ */}
                {active === 'Đánh Giá' && (
                    <div className="space-y-6 max-w-2xl">
                        {reviews.length === 0 ? (
                            <p className="text-sm text-stone-400">Chưa có đánh giá nào.</p>
                        ) : (
                            reviews.map((r) => (
                                <div key={r.id} className="border-b border-stone-100 pb-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-500">
                                                {r.name[0]}
                                            </div>
                                            <span className="text-sm font-semibold text-stone-700">{r.name}</span>
                                        </div>
                                        <span className="text-xs text-stone-400">{timeAgo(r.createdAt)}</span>
                                    </div>
                                    <div className="flex gap-0.5 mb-2 ml-11">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <svg key={i} className={`w-3 h-3 fill-current ${i < r.rating ? 'text-amber-400' : 'text-stone-200'}`} viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-sm text-stone-500 leading-relaxed ml-11">{r.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}