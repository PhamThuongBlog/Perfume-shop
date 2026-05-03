'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(data.message || 'Đăng ký thất bại');
        } else {
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4">
            <div className="w-full max-w-md">

                {/* LOGO */}
                <div className="text-center mb-10">
                    <h1 className="font-serif text-3xl font-bold tracking-widest text-stone-900">
                        AURA <span className="text-rose-400 font-sans text-sm tracking-normal italic">Signature</span>
                    </h1>
                    <p className="text-stone-500 mt-2 text-sm">Tạo tài khoản mới</p>
                </div>

                {/* FORM */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
                    <h2 className="text-xl font-bold text-stone-900 mb-6">Đăng ký</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">
                                Họ tên
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nguyễn Văn A"
                                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors text-stone-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="example@email.com"
                                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors text-stone-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors text-stone-900"
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-stone-900 text-white font-semibold py-3 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-stone-500 mt-6">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="text-rose-400 hover:text-rose-500 font-medium">
                            Đăng nhập
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}