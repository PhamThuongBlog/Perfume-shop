'use client';

import { useState } from 'react';

type Props = {
    value: string;
    onChange: (url: string) => void;
};

export default function ImageUpload({ value, onChange }: Props) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        setUploading(false);

        if (res.ok) {
            const data = await res.json();
            onChange(data.url);
        } else {
            alert('Upload thất bại, thử lại.');
        }
    };

    return (
        <div className="space-y-3">
            {/* PREVIEW */}
            {value && (
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value} alt="Preview" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* UPLOAD BUTTON */}
            <label className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors
                ${uploading
                ? 'border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed'
                : 'border-stone-300 hover:border-stone-400 hover:bg-stone-50 text-stone-500'
            }`}
            >
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                />
                {uploading ? (
                    <span className="text-sm">Đang upload...</span>
                ) : (
                    <span className="text-sm">{value ? '🔄 Đổi ảnh' : '📷 Chọn ảnh'}</span>
                )}
            </label>
        </div>
    );
}