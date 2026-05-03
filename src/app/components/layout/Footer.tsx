import React from 'react';

export default function Footer() {
    return (
        <footer id="about" className="bg-stone-900 text-stone-400 py-16 text-center border-t border-stone-800">
            <div className="max-w-7xl mx-auto px-4">
        <span className="font-serif text-2xl font-bold tracking-widest text-white mb-6 block">
          AURA <span className="text-rose-400 font-sans text-sm tracking-normal italic">Signature</span>
        </span>
                <p className="text-sm tracking-widest uppercase mb-8">Nghệ thuật chế tác hương thơm tinh tế.</p>
                <p className="text-xs text-stone-600">© 2026 AURA Signature. Crafted with ♥ by Siro & Claude.</p>
            </div>
        </footer>
    );
}