import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export const revalidate = 0;

type Props = {
  title: string;
  subtitle?: string;
  gender: 'Nam' | 'Nu' | 'Unisex';
  categoryName?: string; // alternative: filter by category name
  href: string;
  icon?: string;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default async function CategorySection({ title, subtitle, gender, categoryName, href, icon }: Props) {
  // Fetch products filtered by gender (and optionally category name)
  const where: any = {};
  if (gender) {
    where.gender = gender;
  }
  if (categoryName) {
    where.category = { name: categoryName };
  }

  const products = await prisma.product.findMany({
    where,
    include: { variants: { orderBy: { price: 'asc' }, take: 1 } },
    orderBy: { sortOrder: 'asc' },
    take: 6,
  });

  const displayProducts = products.slice(0, 5);

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif text-stone-900 flex items-center gap-2">
              {icon && <span className="text-2xl">{icon}</span>}
              {title}
            </h2>
            {subtitle && (
              <p className="text-stone-400 text-sm mt-1 italic">{subtitle}</p>
            )}
          </div>
          <Link
            href={href}
            className="text-sm text-stone-500 hover:text-rose-500 transition-colors flex items-center gap-1 font-medium shrink-0"
          >
            Xem tất cả ({products.length})
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Product grid - 5 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {displayProducts.map(product => {
            const variant = product.variants[0];
            const discountedPrice = variant
              ? variant.price * (1 - variant.discountPercent / 100)
              : 0;

            return (
              <Link
                href={`/product/${product.id}`}
                key={product.id}
                className="group flex flex-col"
              >
                {/* Image */}
                <div className="relative w-full aspect-[4/5] bg-stone-100 overflow-hidden rounded-xl mb-3 shadow-sm">
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/400x500'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  {variant?.discountPercent > 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 bg-rose-500 text-white text-[11px] font-bold rounded-full">
                        -{variant.discountPercent}%
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                    <span className="text-white text-[11px] uppercase tracking-wider font-medium">
                      Xem chi tiet
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1">
                  <p className="text-[11px] text-stone-400 uppercase tracking-wider mb-0.5">
                    {product.brand}
                  </p>
                  <h3 className="text-sm font-medium text-stone-900 group-hover:text-rose-500 transition-colors leading-snug line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="mt-auto pt-1 flex items-center gap-2">
                    {variant ? (
                      <>
                        <span className="font-semibold text-stone-900 text-sm">
                          {formatPrice(discountedPrice)}
                        </span>
                        {variant.discountPercent > 0 && (
                          <span className="text-[11px] text-stone-400 line-through">
                            {formatPrice(variant.price)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-stone-400 italic">Dang cap nhat</span>
                    )}
                  </div>
                  {variant && (
                    <p className="text-[11px] text-stone-400 mt-0.5">{variant.volume}ml</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
