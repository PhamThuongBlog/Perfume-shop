import React from 'react';
import { ShoppingBag, Menu } from 'lucide-react';

export default function Header() {
    return (
        <nav className="fixed w-full z-40 top-0 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-stone-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-4">
                        <button className="p-2 -ml-2 hover:bg-stone-100 rounded-full md:hidden">
                            <Menu className="w-5 h-5" />
                        </button>
                        <span className="font-serif text-2xl font-bold tracking-widest text-stone-900">
                            AURA <span className="text-rose-400 font-sans text-sm tracking-normal italic">by Mochi</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8 text-sm uppercase tracking-widest font-medium text-stone-500">
                        <a href="#" className="text-stone-900 hover:text-rose-500 transition-colors">Trang chủ</a>
                        <a href="#collection" className="hover:text-rose-500 transition-colors">Bộ sưu tập</a>
                        <a href="#about" className="hover:text-rose-500 transition-colors">Về chúng tôi</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-stone-100 rounded-full relative transition-colors">
                            <ShoppingBag className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-400 rounded-full"></span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}