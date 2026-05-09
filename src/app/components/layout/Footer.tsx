import React from 'react';

export default function Footer() {
    return (
        <footer id="about" className="bg-gradient-to-b from-stone-900 to-stone-950 text-stone-400 border-t border-stone-800 relative overflow-hidden">
            {/* DECORATIVE */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* CAM KẾT */}
            <div className="border-b border-stone-800 py-10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">🚚</span>
                        <p className="text-sm font-medium text-stone-300">Giao hàng toàn quốc</p>
                        <p className="text-xs text-stone-500">Miễn phí đơn từ 500k</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">🔄</span>
                        <p className="text-sm font-medium text-stone-300">Đổi trả 14 ngày</p>
                        <p className="text-xs text-stone-500">Hoàn tiền 100%</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">✅</span>
                        <p className="text-sm font-medium text-stone-300">Hàng chính hãng</p>
                        <p className="text-xs text-stone-500">Cam kết 100% authentic</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">💬</span>
                        <p className="text-sm font-medium text-stone-300">Hỗ trợ 24/7</p>
                        <p className="text-xs text-stone-500">Tư vấn AI & chăm sóc KH</p>
                    </div>
                </div>
            </div>

            {/* MAIN FOOTER */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

                {/* BRAND */}
                <div>
                    <span className="font-serif text-2xl font-bold tracking-widest text-white block mb-3">
                        AURA <span className="text-rose-400 font-sans text-sm tracking-normal italic">Signature</span>
                    </span>
                    <p className="text-sm leading-relaxed text-stone-500">
                        Nghệ thuật chế tác hương thơm tinh tế. Mỗi chai nước hoa là một câu chuyện, một cảm xúc, một dấu ấn riêng.
                    </p>
                </div>

                {/* LINKS */}
                <div>
                    <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Hỗ trợ</h4>
                    <ul className="space-y-2 text-sm text-stone-500">
                        <li><a href="#" className="hover:text-rose-400 transition-colors">Chính sách bảo mật</a></li>
                        <li><a href="#" className="hover:text-rose-400 transition-colors">Chính sách đổi trả</a></li>
                        <li><a href="#" className="hover:text-rose-400 transition-colors">Hướng dẫn mua hàng</a></li>
                        <li><a href="#" className="hover:text-rose-400 transition-colors">Liên hệ</a></li>
                    </ul>
                </div>

                {/* SOCIAL */}
                <div>
                    <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Theo dõi chúng tôi</h4>
                    <div className="flex gap-3">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                           className="w-10 h-10 rounded-full bg-stone-800 hover:bg-rose-500 flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                           className="w-10 h-10 rounded-full bg-stone-800 hover:bg-rose-500 flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                            </svg>
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                           className="w-10 h-10 rounded-full bg-stone-800 hover:bg-rose-500 flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z"/>
                            </svg>
                        </a>
                    </div>
                    <p className="text-xs text-stone-600 mt-4">Kết nối với chúng tôi để cập nhật<br/>những bộ sưu tập mới nhất.</p>
                </div>
            </div>

            {/* COPYRIGHT */}
            <div className="border-t border-stone-800 py-6 text-center">
                <p className="text-xs text-stone-600">© 2026 AURA Signature. Crafted with ♥ by Siro & Claude.</p>
            </div>

        </footer>
    );
}