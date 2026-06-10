'use client';

import { ShoppingBag, LogOut, User, Heart } from 'lucide-react';
import SearchBar from './SearchBar';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

export default function Header() {
    const { data: session } = useSession();
    const { openCart, clearCart } = useCartStore();
    const cartCount = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0));

    return (
        <nav className="relative w-full z-40 top-0 transition-all duration-300 bg-[#FDFBF7] shadow-[0_4px_24px_rgba(0,0,0,0.08)] border-b border-stone-200/40">

            {/* ── TẦNG 1: Logo · Search · Icons ── */}
            <div className="w-full px-6 lg:px-12">
                <div className="flex items-center justify-between h-16 gap-6">

                    {/* LOGO */}
                    <Link href="/" className="flex-shrink-0 font-serif text-2xl font-bold tracking-widest text-stone-900 hover:opacity-80 transition-opacity">
                        AURA <span className="text-rose-400 font-sans text-sm tracking-normal italic font-medium">Signature</span>
                    </Link>

                    {/* SEARCH BAR — giữa */}
                    <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md">
                        <SearchBar />
                    </div>

                    {/* RIGHT ICONS */}
                    <div className="flex items-center gap-1 flex-shrink-0">

                        {/* WISHLIST */}
                        <button
                            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500 hover:text-rose-400"
                            title="Wishlist"
                        >
                            <Heart className="w-5 h-5" />
                        </button>

                        {/* GIỎ HÀNG */}
                        <button
                            onClick={openCart}
                            className="p-2 hover:bg-stone-100 rounded-full relative transition-colors text-stone-500 hover:text-stone-900"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* AUTH */}
                        {session ? (
                            <div className="flex items-center gap-1 ml-1">
                                <Link
                                    href="/profile"
                                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-stone-600 hover:text-rose-500 hover:bg-stone-100 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="font-medium">{session.user?.name ?? session.user?.email}</span>
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
                                    onClick={() => { clearCart(); signOut({ callbackUrl: '/' }); }}
                                    className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-red-400"
                                    title="Đăng xuất"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="ml-1 text-sm font-medium text-stone-600 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-100"
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ── TẦNG 2: Navigation Links ── */}
            <div className="hidden md:block">
                <div className="w-full px-6 lg:px-12">
                    <div className="flex items-center justify-center h-12 gap-8">
                        {[
                            { label: 'Trang chủ', href: '/' },
                            { label: 'Cửa hàng', href: '/shop' },
                            { label: 'Hàng mới về', href: '/shop' },
                            { label: 'Nước hoa nam', href: '/shop?category=Nước Hoa Nam' },
                            { label: 'Nước hoa nữ', href: '/shop?category=Nước Hoa Nữ' },
                            { label: 'Nước hoa Unisex', href: '/shop?category=Nước Hoa Unisex' },
                            { label: 'Gift Sets', href: '/shop?category=gift' },
                            { label: 'Tư vấn AI', href: '#', isAI: true },
                        ].map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={item.isAI ? (e) => {
                                    e.preventDefault();
                                    document.querySelector<HTMLButtonElement>('[data-chat-toggle]')?.click();
                                } : undefined}
                                className={`text-[12px] uppercase tracking-widest font-medium transition-colors whitespace-nowrap
                                    ${item.isAI
                                    ? 'text-rose-400 hover:text-rose-600 flex items-center gap-1'
                                    : 'text-stone-500 hover:text-stone-900'
                                }`}
                            >
                                {item.isAI && <span className="text-[10px]">✦</span>}
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

        </nav>
    );
}