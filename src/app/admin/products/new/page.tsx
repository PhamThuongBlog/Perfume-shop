'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '../ImageUpload';

type Variant = {
    volume: number;
    price: number;
    discountPercent: number;
    stock: number;
};

const DEFAULT_VARIANT: Variant = {
    volume: 50,
    price: 0,
    discountPercent: 0,
    stock: 0,
};

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [variants, setVariants] = useState<Variant[]>([{ ...DEFAULT_VARIANT }]);

    const addVariant = () => setVariants([...variants, { ...DEFAULT_VARIANT }]);

    const removeVariant = (index: number) => {
        if (variants.length === 1) return;
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof Variant, value: number) => {
        setVariants(variants.map((v, i) => i === index ? { ...v, [field]: value } : v));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!categoryId) {
            setError('Vui lòng chọn danh mục');
            return;
        }

        setLoading(true);

        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, brand, description, imageUrl, categoryId, variants }),
        });

        setLoading(false);

        if (res.ok) {
            router.push('/admin/products');
            router.refresh();
        } else {
            const data = await res.json();
            setError(data.error || 'Thêm sản phẩm thất bại');
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-stone-900">Thêm sản phẩm mới</h1>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-red-400 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                >
                    ← Quay lại
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* THÔNG TIN CƠ BẢN */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">
                    <h2 className="font-semibold text-stone-900 mb-2">Thông tin cơ bản</h2>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Tên sản phẩm *</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="VD: Midnight Rose"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Thương hiệu *</label>
                        <input
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            required
                            placeholder="VD: Aura, Dior, Chanel..."
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Danh mục *</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors bg-white"
                        >
                            <option value="">-- Chọn danh mục --</option>
                            <option value="69ec81e2d31e53bf0fc271e5">Nước hoa Nữ</option>
                            <option value="69ec81e3d31e53bf0fc271e6">Nước hoa Nam</option>
                            <option value="69ec81e3d31e53bf0fc271e7">Unisex</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Mô tả</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Mô tả hương thơm, đặc điểm nổi bật..."
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Link ảnh</label>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Ảnh sản phẩm</label>
                            <ImageUpload value={imageUrl} onChange={setImageUrl} />
                        </div>
                    </div>
                </div>

                {/* BIẾN THỂ */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-stone-900">Dung tích & Giá</h2>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="text-sm text-stone-500 hover:text-stone-900 border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
                        >
                            + Thêm dung tích
                        </button>
                    </div>

                    <div className="space-y-3">
                        {variants.map((variant, index) => (
                            <div key={index} className="grid grid-cols-4 gap-3 items-center p-4 bg-stone-50 rounded-xl">
                                <div>
                                    <label className="block text-xs text-stone-500 mb-1">Dung tích (ml)</label>
                                    <input
                                        type="number"
                                        value={variant.volume}
                                        onChange={(e) => updateVariant(index, 'volume', Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-stone-400 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-stone-500 mb-1">Giá (₫)</label>
                                    <input
                                        type="number"
                                        value={variant.price}
                                        onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-stone-400 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-stone-500 mb-1">Giảm giá (%)</label>
                                    <input
                                        type="number"
                                        value={variant.discountPercent}
                                        onChange={(e) => updateVariant(index, 'discountPercent', Number(e.target.value))}
                                        min={0}
                                        max={100}
                                        className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-stone-400 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-stone-500 mb-1">Tồn kho</label>
                                    <div className="flex gap-1">
                                        <input
                                            type="number"
                                            value={variant.stock}
                                            onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                                            className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-stone-400 text-sm"
                                        />
                                        {variants.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeVariant(index)}
                                                className="px-2 text-red-400 hover:text-red-600"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-stone-900 text-white font-semibold py-4 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Đang lưu...' : 'Thêm sản phẩm'}
                </button>

            </form>
        </div>
    );
}