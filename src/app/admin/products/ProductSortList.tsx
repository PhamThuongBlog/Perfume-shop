'use client';

import { useState } from 'react';
import Link from 'next/link';
import DeleteProductButton from './DeleteProductButton';

type Variant = { id: string; volume: number; stock: number };
type Product = {
    id: string;
    name: string;
    brand: string;
    imageUrl: string | null;
    sortOrder: number;
    category: { name: string };
    variants: Variant[];
};

export default function ProductSortList({ products: initial }: { products: Product[] }) {
    const [products, setProducts] = useState(initial);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleDragStart = (i: number) => setDragIndex(i);
    const handleDragOver = (e: React.DragEvent, i: number) => {
        e.preventDefault();
        setOverIndex(i);
    };
    const handleDrop = (e: React.DragEvent, i: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === i) return;
        const next = [...products];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(i, 0, moved);
        setProducts(next);
        setDragIndex(null);
        setOverIndex(null);
        setSaved(false);
    };
    const handleDragEnd = () => {
        setDragIndex(null);
        setOverIndex(null);
    };

    const handleSave = async () => {
        setSaving(true);
        await fetch('/api/products/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(products.map((p, i) => ({ id: p.id, sortOrder: i }))),
        });
        setSaving(false);
        setSaved(true);
    };

    return (
        <div>
            {/* SAVE BAR */}
            <div className="flex justify-end mb-3 h-8">
                {!saved && products !== initial && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-1.5 bg-stone-900 text-white text-sm rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Đang lưu...' : '💾 Lưu thứ tự'}
                    </button>
                )}
                {saved && <span className="text-sm text-green-500 self-center">✓ Đã lưu</span>}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-left text-stone-400 border-b border-stone-100 bg-stone-50">
                        <th className="px-3 py-4 w-8"></th>
                        <th className="px-6 py-4 font-medium">Sản phẩm</th>
                        <th className="px-6 py-4 font-medium">Danh mục</th>
                        <th className="px-6 py-4 font-medium">Biến thể</th>
                        <th className="px-6 py-4 font-medium">Tồn kho</th>
                        <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                    {products.map((product, index) => (
                        <tr
                            key={product.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`transition-colors
                                    ${dragIndex === index ? 'opacity-40' : ''}
                                    ${overIndex === index && dragIndex !== index ? 'bg-stone-100' : 'hover:bg-stone-50'}
                                `}
                        >
                            <td className="px-3 py-4 cursor-grab text-stone-300 hover:text-stone-500">⠿</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                        {product.imageUrl
                                            ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">N/A</div>
                                        }
                                    </div>
                                    <div>
                                        <p className="font-semibold text-stone-900">{product.name}</p>
                                        <p className="text-stone-400 text-xs">{product.brand}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-stone-600">{product.category.name}</td>
                            <td className="px-6 py-4">
                                <div className="flex gap-1 flex-wrap">
                                    {product.variants.map((v) => (
                                        <span key={v.id} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full text-xs">{v.volume}ml</span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {product.variants.map((v) => (
                                    <div key={v.id} className="text-xs text-stone-500">
                                        {v.volume}ml: <span className={v.stock < 5 ? 'text-red-500 font-medium' : 'text-stone-700'}>{v.stock}</span>
                                    </div>
                                ))}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                    <Link href={`/admin/products/${product.id}/edit`} className="px-3 py-1.5 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">Sửa</Link>
                                    <DeleteProductButton productId={product.id} productName={product.name} />
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {products.length === 0 && (
                    <div className="text-center py-16 text-stone-400">
                        <p className="text-4xl mb-3">🧴</p>
                        <p>Chưa có sản phẩm nào</p>
                    </div>
                )}
            </div>
        </div>
    );
}