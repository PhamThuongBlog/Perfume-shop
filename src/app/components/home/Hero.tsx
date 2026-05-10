'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';

const HERO_IMAGES = [
    'https://res.cloudinary.com/doyt6sdfo/image/upload/q_auto/f_auto/v1778386508/ayosjzk4gkpshkuhkbns.webp',
    'https://res.cloudinary.com/doyt6sdfo/image/upload/q_auto/f_auto/v1778386370/owxs96ebvrmiitl8kjhz.webp',
    'https://res.cloudinary.com/doyt6sdfo/image/upload/q_auto/f_auto/v1778389283/csxrt0x7mxghmfu8obec.webp',
    'https://res.cloudinary.com/doyt6sdfo/image/upload/q_auto/f_auto/v1778389009/qmheaffenqnk5a6hka54.webp',
];

interface HeroProps {
    onOpenChat: () => void;
}

export default function Hero({ onOpenChat }: HeroProps) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* BACKGROUND CAROUSEL */}
            <div className="absolute inset-0 z-0">
                {HERO_IMAGES.map((src, index) => (
                    <img
                        key={index}
                        src={src}
                        alt={`Hero ${index + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-2000
                            ${index === current ? 'opacity-100' : 'opacity-0'}
                        `}
                    />
                ))}
                {/* Overlay tối nhẹ để chữ dễ đọc */}
                <div className="absolute inset-0 bg-black/12 z-10" />
            </div>

            {/* CONTENT */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    {/* ĐỔI MÀU CHỮ Ở ĐÂY — text-rose-300, text-white, text-stone-200 */}
                    <h2 className="text-xs uppercase tracking-[0.3em] text-rose-300 font-bold mb-4">Nghệ thuật lưu hương</h2>
                    <h1 className="text-5xl lg:text-7xl font-serif text-white leading-tight mb-8">
                        Bản giao hưởng <br/>
                        <span className="italic text-white">của khứu giác.</span>
                    </h1>
                    <p className="text-lg text-stone-200 mb-10 max-w-lg leading-relaxed">
                        Khám phá bộ sưu tập nước hoa độc bản, được chế tác từ những nguyên liệu quý hiếm nhất, giúp bạn lưu giữ từng khoảnh khắc đáng nhớ.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white text-white text-sm uppercase tracking-widest hover:bg-white hover:text-stone-900 transition-all rounded-sm flex items-center gap-2"
                        >
                            Khám phá ngay <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onOpenChat}
                            className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/60 text-white text-sm uppercase tracking-widest hover:bg-white hover:text-stone-900 transition-all rounded-sm flex items-center gap-2 group"
                        >
                            <Sparkles className="w-4 h-4 text-rose-300 group-hover:animate-pulse" /> Tư vấn AI
                        </button>
                    </div>

                    {/* DOT INDICATORS */}
                    <div className="flex gap-2 mt-10">
                        {HERO_IMAGES.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrent(index)}
                                className={`transition-all duration-300 rounded-full
                                    ${index === current
                                    ? 'w-6 h-2 bg-rose-400'
                                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}