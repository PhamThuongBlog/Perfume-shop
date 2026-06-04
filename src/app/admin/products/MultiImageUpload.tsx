'use client';

import { useState } from 'react';

type Props = {
    values: string[];
    onChange: (urls: string[]) => void;
    max?: number;
};

export default function MultiImageUpload({ values, onChange, max = 5 }: Props) {
    const [uploading, setUploading] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        setUploading(true);
        const uploaded: string[] = [];
        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                uploaded.push(data.url);
            }
        }
        setUploading(false);
        onChange([...values, ...uploaded].slice(0, max));
    };

    const remove = (index: number) => onChange(values.filter((_, i) => i !== index));

    const handleDragStart = (i: number) => setDragIndex(i);
    const handleDragOver = (e: React.DragEvent, i: number) => {
        e.preventDefault();
        setOverIndex(i);
    };
    const handleDrop = (e: React.DragEvent, i: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === i) return;
        const next = [...values];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(i, 0, moved);
        onChange(next);
        setDragIndex(null);
        setOverIndex(null);
    };
    const handleDragEnd = () => {
        setDragIndex(null);
        setOverIndex(null);
    };

    return (
        <div className="space-y-3">
            {values.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {values.map((url, i) => (
                        <div
                            key={url}
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragOver={(e) => handleDragOver(e, i)}
                            onDrop={(e) => handleDrop(e, i)}
                            onDragEnd={handleDragEnd}
                            className={`relative group rounded-xl overflow-hidden bg-stone-100 aspect-square cursor-grab transition-all
                                ${overIndex === i && dragIndex !== i ? 'ring-2 ring-stone-900 scale-95' : ''}
                                ${dragIndex === i ? 'opacity-40' : ''}
                            `}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`img-${i}`} className="w-full h-full object-cover pointer-events-none" />

                            {i === 0 && (
                                <span className="absolute top-1.5 left-1.5 bg-stone-900 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    Chính
                                </span>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => remove(i)}
                                    className="w-7 h-7 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* DRAG HINT */}
                            <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-[10px] bg-black/50 px-1.5 py-0.5 rounded-full">⠿ kéo</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {values.length < max && (
                <label className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors
                    ${uploading
                    ? 'border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed'
                    : 'border-stone-300 hover:border-stone-400 hover:bg-stone-50 text-stone-500'
                }`}
                >
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={uploading} className="hidden" />
                    {uploading
                        ? <span className="text-sm">Đang upload...</span>
                        : <span className="text-sm">📷 Thêm ảnh ({values.length}/{max})</span>
                    }
                </label>
            )}
        </div>
    );
}