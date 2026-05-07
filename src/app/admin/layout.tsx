import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
                                              children,
                                          }: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) redirect('/login');
    if (session.user.role !== 'ADMIN') redirect('/');

    return (
        <div className="min-h-screen bg-stone-100 pt-24 pb-10 px-6">
            <div className="max-w-7xl mx-auto flex gap-6 items-start">

                {/* SIDEBAR */}
                <aside className="w-56 flex-shrink-0 sticky top-24">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                        <div className="px-5 py-5 border-b border-stone-100">
                            <h1 className="font-serif text-lg font-bold tracking-widest text-stone-900">AURA</h1>
                            <p className="text-rose-400 text-xs italic mt-0.5">Admin Dashboard</p>
                        </div>

                        <nav className="px-3 py-3 space-y-1">
                            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors text-sm font-medium">
                                📊 Tổng quan
                            </Link>
                            <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors text-sm font-medium">
                                🧴 Sản phẩm
                            </Link>
                            <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors text-sm font-medium">
                                📦 Đơn hàng
                            </Link>
                            <Link href="/admin/stats" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors text-sm font-medium">
                                📈 Thống kê
                            </Link>
                        </nav>

                        <div className="px-3 py-3 border-t border-stone-100">
                            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors text-sm">
                                ⬅️ Về trang chủ
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>

            </div>
        </div>
    );
}