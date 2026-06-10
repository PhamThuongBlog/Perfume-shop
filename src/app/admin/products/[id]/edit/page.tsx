'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MultiImageUpload from '../../MultiImageUpload';

type Variant = {
    id?: string;
    volume: number;
    price: number;
    discountPercent: number;
    stock: number;
};

const EMPTY_VARIANT: Variant = {
    volume: 50,
    price: 0,
    discountPercent: 0,
    stock: 0,
};

export default function EditProductPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [categoryId, setCategoryId] = useState('');
    const [variants, setVariants] = useState<Variant[]>([]);
    // Thông tin hương
    const [concentration, setConcentration] = useState('');
    const [origin, setOrigin] = useState('');
    const [gender, setGender] = useState('');
    const [releaseYear, setReleaseYear] = useState('');
    const [scentGroup, setScentGroup] = useState('');
    const [longevity, setLongevity] = useState('');
    const [sillage, setSillage] = useState('');

// Array fields — dùng string input, split bằng dấu phẩy
    const [season, setSeason] = useState('');
    const [occasion, setOccasion] = useState('');
    const [style, setStyle] = useState('');
    const [topNotes, setTopNotes] = useState('');
    const [heartNotes, setHeartNotes] = useState('');
    const [baseNotes, setBaseNotes] = useState('');

// Nội dung dài
    const [ingredients, setIngredients] = useState('');
    const [longDesc, setLongDesc] = useState('');
    const [whenToWear, setWhenToWear] = useState<string[]>([]);
    const [accords, setAccords] = useState<string[]>([]);

    // Load dữ liệu sản phẩm hiện tại
    useEffect(() => {
        const fetchProduct = async () => {
            const res = await fetch(`/api/products/${id}`);
            if (!res.ok) { router.push('/admin/products'); return; }
            const data = await res.json();
            setName(data.name);
            setBrand(data.brand);
            setDescription(data.description ?? '');
            setImages(data.images ?? (data.imageUrl ? [data.imageUrl] : []));
            setCategoryId(data.categoryId);
            setVariants(data.variants);
            setConcentration(data.concentration ?? '');
            setOrigin(data.origin ?? '');
            setGender(data.gender ?? '');
            setReleaseYear(data.releaseYear?.toString() ?? '');
            setScentGroup(data.scentGroup ?? '');
            setLongevity(data.longevity ?? '');
            setSillage(data.sillage ?? '');
            setWhenToWear(data.whenToWear ?? []);
            setAccords(data.accords ?? []);
            setSeason(data.season?.join(', ') ?? '');
            setOccasion(data.occasion?.join(', ') ?? '');
            setStyle(data.style?.join(', ') ?? '');
            setTopNotes(data.topNotes?.join(', ') ?? '');
            setHeartNotes(data.heartNotes?.join(', ') ?? '');
            setBaseNotes(data.baseNotes?.join(', ') ?? '');
            setIngredients(data.ingredients ?? '');
            setLongDesc(data.longDesc ?? '');
            setFetching(false);
        };
        fetchProduct();
    }, [id, router]);

    const addVariant = () => setVariants([...variants, { ...EMPTY_VARIANT }]);

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
        setLoading(true);

        const res = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name, brand, description,
                imageUrl: images[0] ?? '',
                images, categoryId, variants,
                concentration, origin, gender,
                releaseYear: releaseYear ? Number(releaseYear) : null,
                scentGroup, longevity, sillage,
                season: season.split(',').map(s => s.trim()).filter(Boolean),
                occasion: occasion.split(',').map(s => s.trim()).filter(Boolean),
                style: style.split(',').map(s => s.trim()).filter(Boolean),
                topNotes: topNotes.split(',').map(s => s.trim()).filter(Boolean),
                heartNotes: heartNotes.split(',').map(s => s.trim()).filter(Boolean),
                baseNotes: baseNotes.split(',').map(s => s.trim()).filter(Boolean),
                ingredients, longDesc, whenToWear, accords,
            }),
        });

        setLoading(false);

        if (res.ok) {
            router.push('/admin/products');
            router.refresh();
        } else {
            const data = await res.json();
            setError(data.error || 'Cập nhật thất bại');
        }
    };

    if (fetching) {
        return <div className="text-stone-400 text-sm">Đang tải...</div>;
    }

    return (
        <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-stone-900">Sửa sản phẩm</h1>
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
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Thương hiệu *</label>
                        <input
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            required
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
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Link ảnh</label>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Ảnh sản phẩm</label>
                            <MultiImageUpload values={images} onChange={setImages} />
                        </div>
                    </div>
                </div>

                {/* THÔNG TIN HƯƠNG */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">
                    <h2 className="font-semibold text-stone-900 mb-2">Thông tin hương</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Nồng độ</label>
                            <select value={concentration} onChange={e => setConcentration(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 bg-white">
                                <option value="">-- Chọn --</option>
                                {[
                                    'Eau de Cologne (EDC)',
                                    'Eau de Toilette (EDT)',
                                    'Eau de Parfum (EDP)',
                                    'Extrait de Parfum',
                                ].map(v => <option key={v}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Xuất xứ</label>
                            <input value={origin} onChange={e => setOrigin(e.target.value)}
                                   placeholder="Pháp, Ý, Mỹ..."
                                   className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Giới tính</label>
                            <select value={gender} onChange={e => setGender(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 bg-white">
                                <option value="">-- Chọn --</option>
                                {['Nam', 'Nữ', 'Unisex'].map(v => <option key={v}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Năm phát hành</label>
                            <input type="number" value={releaseYear} onChange={e => setReleaseYear(e.target.value)}
                                   placeholder="2024"
                                   className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Nhóm hương</label>
                            <input value={scentGroup} onChange={e => setScentGroup(e.target.value)}
                                   placeholder="Floral, Woody, Oriental..."
                                   className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Độ lưu hương</label>
                            <select value={longevity} onChange={e => setLongevity(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 bg-white">
                                <option value="">-- Chọn --</option>
                                {['1-3 tiếng', '3-6 tiếng', '6-8 tiếng', '8-12 tiếng', '12+ tiếng'].map(v => <option key={v}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Độ toả hương (Sillage)</label>
                            <select value={sillage} onChange={e => setSillage(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 bg-white">
                                <option value="">-- Chọn --</option>
                                {['Nhẹ', 'Vừa phải', 'Mạnh', 'Rất mạnh'].map(v => <option key={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-stone-700 mb-2">Phù hợp (When to wear)</label>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { label: 'Xuân', icon: '🌸' },
                                    { label: 'Hè', icon: '☀️' },
                                    { label: 'Thu', icon: '🍂' },
                                    { label: 'Đông', icon: '❄️' },
                                    { label: 'Ngày', icon: '🌤️' },
                                    { label: 'Đêm', icon: '🌙' },
                                ].map(({ label, icon }) => {
                                    const checked = whenToWear.includes(label);
                                    return (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => setWhenToWear(prev =>
                                                checked ? prev.filter(v => v !== label) : [...prev, label]
                                            )}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all
                                                ${checked
                                                ? 'border-stone-900 bg-stone-900 text-white'
                                                : 'border-stone-200 text-stone-600 hover:border-stone-400'
                                            }`}
                                        >
                                            <span>{icon}</span>{label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-stone-700 mb-2">Tông hương chính (Accords)</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: 'Cam chanh',    bg: 'bg-yellow-100', text: 'text-yellow-700' },
                                    { label: 'Hoa cỏ',      bg: 'bg-pink-100',   text: 'text-pink-700' },
                                    { label: 'Gỗ thơm',     bg: 'bg-amber-100',  text: 'text-amber-800' },
                                    { label: 'Xạ hương',    bg: 'bg-stone-100',  text: 'text-stone-600' },
                                    { label: 'Tươi mát',    bg: 'bg-teal-100',   text: 'text-teal-700' },
                                    { label: 'Ngọt ngào',   bg: 'bg-rose-100',   text: 'text-rose-700' },
                                    { label: 'Cay nồng',    bg: 'bg-orange-100', text: 'text-orange-700' },
                                    { label: 'Thảo mộc',    bg: 'bg-green-100',  text: 'text-green-700' },
                                    { label: 'Phấn hoa',    bg: 'bg-purple-100', text: 'text-purple-700' },
                                    { label: 'Phương Đông', bg: 'bg-red-100',    text: 'text-red-800' },
                                    { label: 'Biển cả',     bg: 'bg-blue-100',   text: 'text-blue-700' },
                                    { label: 'Đất ẩm',      bg: 'bg-lime-100',   text: 'text-lime-800' },
                                    { label: 'Da thuộc',    bg: 'bg-yellow-50',  text: 'text-yellow-900' },
                                    { label: 'Bánh ngọt',   bg: 'bg-orange-50',  text: 'text-orange-800' },
                                ].map(({ label, bg, text }) => {
                                    const checked = accords.includes(label);
                                    return (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => setAccords(prev =>
                                                checked ? prev.filter(v => v !== label) : [...prev, label]
                                            )}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all
                                                ${checked
                                                ? `${bg} ${text} border-current`
                                                : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Array fields */}
                    <p className="text-xs text-stone-400 mt-2">Các trường bên dưới nhập cách nhau bằng dấu phẩy</p>
                    {[
                        { label: 'Hương đầu (Top Notes)', value: topNotes, onChange: setTopNotes, placeholder: 'Bergamot, Lemon, Black Pepper' },
                        { label: 'Hương giữa (Heart Notes)', value: heartNotes, onChange: setHeartNotes, placeholder: 'Rose, Jasmine, Iris' },
                        { label: 'Hương cuối (Base Notes)', value: baseNotes, onChange: setBaseNotes, placeholder: 'Sandalwood, Musk, Vanilla' },
                        { label: 'Mùa phù hợp', value: season, onChange: setSeason, placeholder: 'Xuân, Hè, Thu, Đông' },
                        { label: 'Dịp sử dụng', value: occasion, onChange: setOccasion, placeholder: 'Công sở, Hẹn hò, Dự tiệc' },
                        { label: 'Phong cách', value: style, onChange: setStyle, placeholder: 'Cozy, Romantic, Fresh' },
                    ].map(({ label, value, onChange, placeholder }) => (
                        <div key={label}>
                            <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
                            <input value={value} onChange={e => onChange(e.target.value)}
                                   placeholder={placeholder}
                                   className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400" />
                        </div>
                    ))}

                    {/* Long text */}
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Thành phần</label>
                        <textarea value={ingredients} onChange={e => setIngredients(e.target.value)}
                                  rows={3} placeholder="Alcohol Denat., Aqua, Parfum..."
                                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 resize-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Mô tả chi tiết (bài viết)</label>
                        <textarea value={longDesc} onChange={e => setLongDesc(e.target.value)}
                                  rows={6} placeholder="Câu chuyện sản phẩm, cảm nhận hương thơm..."
                                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 resize-none" />
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
                            <div key={variant.id ?? index} className="grid grid-cols-4 gap-3 items-center p-4 bg-stone-50 rounded-xl">
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
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </form>
        </div>
    );
}