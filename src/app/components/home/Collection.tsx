import React from 'react';
import { PrismaClient } from '@prisma/client';

// Khởi tạo Prisma Client (Trong thực tế đồ án, anh có thể import từ file lib/prisma của anh)
const prisma = new PrismaClient();

// Đổi function sang async để có thể gọi thẳng Database
export default async function Collection() {
    // 🔥 HÚT DỮ LIỆU TỪ MONGODB LÊN
    // Lấy toàn bộ sản phẩm, KÈM THEO biến thể (để lấy giá) và danh mục (để lấy phân loại)
    const products = await prisma.product.findMany({
        include: {
            category: true,
            variants: true
        },
        orderBy: {
            createdAt: 'desc' // Lấy chai mới nhất lên đầu
        }
    });

    // Hàm tiện ích format tiền tệ (VND)
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Tiêu đề */}
                <div className="text-center mb-16">
                    <h2 className="text-sm uppercase tracking-widest text-rose-500 font-semibold mb-3">
                        Bộ sưu tập nổi bật
                    </h2>
                    <h3 className="text-4xl font-serif text-stone-900">
                        Những Mùi Hương <span className="italic text-stone-500">Kinh Điển</span>
                    </h3>
                </div>

                {/* Lưới sản phẩm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {products.map((product) => {
                        // Lấy biến thể đầu tiên của chai nước hoa để hiển thị giá và dung tích
                        const firstVariant = product.variants[0];

                        return (
                            <div key={product.id} className="group cursor-pointer flex flex-col">
                                {/* Khối Hình ảnh */}
                                <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden mb-6 rounded-sm">
                                    <img
                                        src={product.imageUrl || 'https://via.placeholder.com/400x500'}
                                        alt={product.name}
                                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />

                                    {/* Tag Danh mục */}
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs uppercase tracking-wider text-stone-800 rounded-full">
                                            {product.category?.name}
                                        </span>
                                    </div>

                                    {/* Nhãn Giảm giá (nếu có) */}
                                    {firstVariant?.discountPercent > 0 && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full">
                                                -{firstVariant.discountPercent}%
                                            </span>
                                        </div>
                                    )}

                                    {/* 🎯 LỚP OVERLAY BÊ NGUYÊN TỪ MOCKDATA CỦA SẾP VÀO ĐÂY */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                                        <button className="translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-stone-900 px-6 py-3 text-xs uppercase tracking-widest hover:bg-stone-900 hover:text-white rounded-sm shadow-md font-medium">
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>

                                {/* Khối Thông tin */}
                                <div className="text-center flex-1 flex flex-col">
                                    <h4 className="text-lg font-serif text-stone-900 mb-2 group-hover:text-rose-600 transition-colors">
                                        {product.name}
                                    </h4>

                                    {/* Khối Giá tiền */}
                                    <div className="mt-auto flex items-center justify-center gap-3">
                                        {firstVariant ? (
                                            <>
                                                <span className="font-medium text-stone-900">
                                                    {formatPrice(firstVariant.price * (1 - firstVariant.discountPercent / 100))}
                                                </span>
                                                {firstVariant.discountPercent > 0 && (
                                                    <span className="text-sm text-stone-400 line-through">
                                                        {formatPrice(firstVariant.price)}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-sm text-stone-400 italic">Đang cập nhật giá</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-stone-400 mt-2">
                                        {firstVariant?.volume}ml - Hãng: {product.brand}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}