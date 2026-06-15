/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

function AccordionSection({ title, defaultOpen = false, children }: {
    title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-stone-100 pb-3">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex justify-between items-center py-3 text-sm font-semibold text-stone-800 hover:text-stone-900 transition-colors"
            >
                {title}
                <ChevronDown size={15} className={`text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div className="pb-2">{children}</div>}
        </div>
    );
}

const RADIO = 'w-4 h-4 rounded-full border-2 border-stone-300 flex items-center justify-center shrink-0 mt-0.5';
const RADIO_ACTIVE = 'w-4 h-4 rounded-full border-2 border-stone-900 flex items-center justify-center shrink-0 mt-0.5';
const DOT = 'w-2 h-2 rounded-full bg-stone-900';

const MIN = 100000;
const MAX = 30000000;

export default function ShopFilters({ categories, brands, volumes, genders, searchParams, onUpdate, onUpdatePrice }: {
    categories: { id: string; name: string }[];
    brands: string[];
    volumes: number[];
    genders: string[];
    searchParams: Record<string, string>;
    onUpdate: (key: string, value: string | null) => void;
    onUpdatePrice: (min: number | null, max: number | null) => void;
}) {
    const activeCat = searchParams.category ?? null;
    const activeBrand = searchParams.brand ?? null;
    const activeVolume = searchParams.volume ?? null;
    const activeGender = searchParams.gender ?? null;

    const initMin = searchParams.minPrice ? Number(searchParams.minPrice) : MIN;
    const initMax = searchParams.maxPrice ? Number(searchParams.maxPrice) : MAX;

    const [localMin, setLocalMin] = useState(initMin);
    const [localMax, setLocalMax] = useState(initMax);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setLocalMin(initMin); }, [searchParams.minPrice]);
    useEffect(() => { setLocalMax(initMax); }, [searchParams.maxPrice]);

    function commitPrice(min: number, max: number) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onUpdatePrice(
                min > MIN ? min : null,
                max < MAX ? max : null,
            );
        }, 400);
    }

    const fmt = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + ' đ';

    const thumbClass = [
        '[&::-webkit-slider-thumb]:appearance-none',
        '[&::-webkit-slider-thumb]:w-4',
        '[&::-webkit-slider-thumb]:h-4',
        '[&::-webkit-slider-thumb]:rounded-full',
        '[&::-webkit-slider-thumb]:bg-white',
        '[&::-webkit-slider-thumb]:border-2',
        '[&::-webkit-slider-thumb]:border-stone-900',
        '[&::-webkit-slider-thumb]:cursor-pointer',
        '[&::-webkit-slider-thumb]:shadow-sm',
        '[&::-webkit-slider-thumb]:pointer-events-auto',
    ].join(' ');

    return (
        <div className="text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 mb-1">Bộ lọc</p>

            {/* Thương hiệu */}
            <AccordionSection title="Thương hiệu" defaultOpen>
                <ul className="space-y-2">
                    {brands.map(b => (
                        <li key={b}>
                            <button
                                onClick={() => onUpdate('brand', activeBrand === b ? null : b)}
                                className="flex items-start gap-2.5 w-full text-left text-stone-600 hover:text-stone-900 transition-colors"
                            >
                                <span className={activeBrand === b ? RADIO_ACTIVE : RADIO}>
                                    {activeBrand === b && <span className={DOT} />}
                                </span>
                                {b}
                            </button>
                        </li>
                    ))}
                </ul>
            </AccordionSection>

            {/* Mức giá */}
            <AccordionSection title="Mức giá">
                <div className="px-1 pt-2 pb-1">
                    <div className="relative h-6 flex items-center">
                        <div className="absolute w-full h-1 bg-stone-200 rounded-full pointer-events-none" />
                        <div
                            className="absolute h-1 bg-stone-900 rounded-full pointer-events-none"
                            style={{
                                left: `${((localMin - MIN) / (MAX - MIN)) * 100}%`,
                                right: `${100 - ((localMax - MIN) / (MAX - MIN)) * 100}%`,
                            }}
                        />
                        <input
                            type="range" min={MIN} max={MAX} step={50000}
                            value={localMin}
                            onChange={e => {
                                const v = Math.min(Number(e.target.value), localMax - 50000);
                                setLocalMin(v);
                                commitPrice(v, localMax);
                            }}
                            className={`absolute w-full h-1 appearance-none bg-transparent pointer-events-none z-20 ${thumbClass}`}
                        />
                        <input
                            type="range" min={MIN} max={MAX} step={50000}
                            value={localMax}
                            onChange={e => {
                                const v = Math.max(Number(e.target.value), localMin + 50000);
                                setLocalMax(v);
                                commitPrice(localMin, v);
                            }}
                            className={`absolute w-full h-1 appearance-none bg-transparent pointer-events-none z-20 ${thumbClass}`}
                        />
                    </div>
                    <p className="text-xs text-stone-500 mt-3">
                        Từ {fmt(localMin)} – {fmt(localMax)}
                    </p>
                </div>
            </AccordionSection>

            {/* Size */}
            <AccordionSection title="Size">
                <ul className="space-y-2">
                    <li>
                        <button
                            onClick={() => onUpdate('volume', null)}
                            className="flex items-start gap-2.5 w-full text-left text-stone-600 hover:text-stone-900 transition-colors"
                        >
                            <span className={!activeVolume ? RADIO_ACTIVE : RADIO}>
                                {!activeVolume && <span className={DOT} />}
                            </span>
                            Tất cả
                        </button>
                    </li>
                    {volumes.map(v => (
                        <li key={v}>
                            <button
                                onClick={() => onUpdate('volume', activeVolume === String(v) ? null : String(v))}
                                className="flex items-start gap-2.5 w-full text-left text-stone-600 hover:text-stone-900 transition-colors"
                            >
                                <span className={activeVolume === String(v) ? RADIO_ACTIVE : RADIO}>
                                    {activeVolume === String(v) && <span className={DOT} />}
                                </span>
                                {v}ml
                            </button>
                        </li>
                    ))}
                </ul>
            </AccordionSection>

            {/* Gioi tinh */}
            <AccordionSection title="Gioi tinh">
                <ul className="space-y-2">
                    <li>
                        <button
                            onClick={() => onUpdate('gender', null)}
                            className="flex items-start gap-2.5 w-full text-left text-stone-600 hover:text-stone-900 transition-colors"
                        >
                            <span className={!activeGender ? RADIO_ACTIVE : RADIO}>
                                {!activeGender && <span className={DOT} />}
                            </span>
                            Tat ca
                        </button>
                    </li>
                    {genders.map(g => (
                        <li key={g}>
                            <button
                                onClick={() => onUpdate('gender', activeGender === g ? null : g)}
                                className="flex items-start gap-2.5 w-full text-left text-stone-600 hover:text-stone-900 transition-colors"
                            >
                                <span className={activeGender === g ? RADIO_ACTIVE : RADIO}>
                                    {activeGender === g && <span className={DOT} />}
                                </span>
                                {g === 'Nu' ? 'Nuoc hoa Nu' : g === 'Nam' ? 'Nuoc hoa Nam' : 'Unisex'}
                            </button>
                        </li>
                    ))}
                </ul>
            </AccordionSection>

            {/* Danh mục */}
            <AccordionSection title="Danh mục">
                <ul className="space-y-2">
                    <li>
                        <button
                            onClick={() => onUpdate('category', null)}
                            className="flex items-start gap-2.5 w-full text-left text-stone-600 hover:text-stone-900 transition-colors"
                        >
                            <span className={!activeCat ? RADIO_ACTIVE : RADIO}>
                                {!activeCat && <span className={DOT} />}
                            </span>
                            Tất cả
                        </button>
                    </li>
                    {categories.map(c => (
                        <li key={c.id}>
                            <button
                                onClick={() => onUpdate('category', activeCat === c.name ? null : c.name)}
                                className="flex items-start gap-2.5 w-full text-left text-stone-600 hover:text-stone-900 transition-colors"
                            >
                                <span className={activeCat === c.name ? RADIO_ACTIVE : RADIO}>
                                    {activeCat === c.name && <span className={DOT} />}
                                </span>
                                {c.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </AccordionSection>
        </div>
    );
}