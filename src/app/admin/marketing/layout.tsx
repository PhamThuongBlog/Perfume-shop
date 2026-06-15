'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Megaphone, Percent, BarChart3, Users, ShoppingCart } from 'lucide-react';

const navItems = [
  { href: '/admin/marketing', label: 'Tổng quan', icon: BarChart3 },
  { href: '/admin/marketing/discounts', label: 'Mã giảm giá', icon: Percent },
  { href: '/admin/marketing/campaigns', label: 'Chiến dịch', icon: Megaphone },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📊 Marketing Số</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý chiến dịch, mã giảm giá & phân tích khách hàng</p>
      </div>
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-0 flex-wrap">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                isActive ? 'bg-white text-indigo-600 border border-b-0 border-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} /> {item.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
