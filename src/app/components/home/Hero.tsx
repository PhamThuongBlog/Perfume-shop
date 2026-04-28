import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';

interface HeroProps {
    onOpenChat: () => void;
}

export default function Hero({ onOpenChat }: HeroProps) {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-[#FDFBF7]/80 to-transparent z-10" />
                <img
                    src="https://images.unsplash.com/photo-1616949755610-8c9bac08c7bb?auto=format&fit=crop&w=1600&q=80"
                    alt="Hero Perfume"
                    className="w-full h-full object-cover object-right-top opacity-60"
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <h2 className="text-xs uppercase tracking-[0.3em] text-rose-500 font-bold mb-4">Nghệ thuật lưu hương</h2>
                    <h1 className="text-5xl lg:text-7xl font-serif text-stone-900 leading-tight mb-8">
                        Bản giao hưởng <br/>
                        <span className="italic text-stone-600">của khứu giác.</span>
                    </h1>
                    <p className="text-lg text-stone-600 mb-10 max-w-lg leading-relaxed">
                        Khám phá bộ sưu tập nước hoa độc bản, được chế tác từ những nguyên liệu quý hiếm nhất, giúp bạn lưu giữ từng khoảnh khắc đáng nhớ.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button className="px-8 py-4 bg-stone-900 text-white text-sm uppercase tracking-widest hover:bg-stone-800 transition-all rounded-sm flex items-center gap-2">
                            Khám phá ngay <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onOpenChat} /* Thay đổi ở đây: Gọi đường dây liên lạc */
                            className="px-8 py-4 bg-white border border-stone-200 text-stone-900 text-sm uppercase tracking-widest hover:border-rose-300 hover:text-rose-600 transition-all rounded-sm flex items-center gap-2 group"
                        >
                            <Sparkles className="w-4 h-4 text-rose-400 group-hover:animate-pulse" /> Tư vấn AI
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}