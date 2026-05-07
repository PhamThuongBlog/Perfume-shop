'use client';

import { ShoppingBag, Menu, LogOut, User, Search } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
    const { data: session } = useSession();
    const { totalItems, openCart, clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
    }, []);

    return (
        <nav className="fixed w-full z-40 top-0 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-stone-200/50">
            <div className="w-full px-6 lg:px-12">
                <div className="flex justify-between items-center h-20">

                    {/* LOGO */}
                    <div className="flex items-center gap-4">
                        <button className="p-2 -ml-2 hover:bg-stone-100 rounded-full md:hidden">
                            <Menu className="w-5 h-5" />
                        </button>
                        <Link href="/" className="font-serif text-2xl font-bold tracking-widest text-stone-900">
                            AURA <span className="text-rose-400 font-sans text-sm tracking-normal italic">Signature</span>
                        </Link>
                    </div>

                    {/* NAV */}
                    <div className="hidden md:flex items-center space-x-8 text-sm uppercase tracking-widest font-medium text-stone-500">
                        <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-stone-900 hover:text-rose-500 transition-colors">Trang chủ</Link>
                        <Link href="/#collection" className="hover:text-rose-500 transition-colors">Bộ sưu tập</Link>
                        <a href="#about" className="hover:text-rose-500 transition-colors">Về chúng tôi</a>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-3">

                        {/* Thêm nút này trước nút ShoppingBag */}
                        <button
                            onClick={() => {
                                document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                                setTimeout(() => document.querySelector<HTMLInputElement>('input[placeholder="Tìm kiếm sản phẩm..."]')?.focus(), 600);
                            }}
                            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* GIỎ HÀNG */}

                        <button
                            onClick={openCart}
                            className="p-2 hover:bg-stone-100 rounded-full relative transition-colors"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {mounted && totalItems() > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {totalItems()}
                                </span>
                            )}
                        </button>

                        {/* AUTH */}
                        {session ? (
                            <div className="flex items-center gap-2">
                                <Link href="/profile" className="hidden md:flex items-center gap-1.5 text-sm text-stone-600 hover:text-rose-500 transition-colors">
                                    <User className="w-4 h-4" />
                                    <span>{session.user?.name ?? session.user?.email}</span>
                                </Link>
                                {session.user?.role === 'ADMIN' && (
                                    <Link
                                        href="/admin"
                                        className="text-xs font-medium text-rose-400 hover:text-rose-500 border border-rose-200 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        clearCart();
                                        signOut({ callbackUrl: '/' });
                                    }}
                                    className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500 hover:text-red-400"
                                    title="Đăng xuất"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm font-medium text-stone-600 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-100"
                            >
                                Đăng nhập
                            </Link>
                        )}

                    </div>
                </div>
            </div>
        </nav>
    );
}