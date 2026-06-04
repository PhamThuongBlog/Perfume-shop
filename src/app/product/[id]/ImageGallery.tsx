'use client';

import { useState } from 'react';

type Props = {
    imageUrl: string | null;
    images: string[];
    name: string;
};

export default function ImageGallery({ imageUrl, images, name }: Props) {
    const allImages = images?.length ? images : (imageUrl ? [imageUrl] : []);
    const [current, setCurrent] = useState(allImages[0] ?? '');

    return (
        <div className="space-y-3">
            <div className="bg-gray-100 rounded-2xl h-[500px] overflow-hidden shadow-sm flex items-center justify-center">
                {current ? (
                    <img src={current} alt={name} className="object-cover h-full w-full" />
                ) : (
                    <span className="text-gray-400 font-medium">Chưa có ảnh sản phẩm</span>
                )}
            </div>

            {allImages.length > 1 && (
                <div className="flex gap-2">
                    {allImages.map((url, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(url)}
                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors flex-shrink-0
                                ${current === url ? 'border-stone-900' : 'border-transparent hover:border-stone-400'}`}
                        >
                            <img src={url} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}