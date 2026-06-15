'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, Users, Percent, Megaphone, ShoppingCart, DollarSign, BarChart3, Target } from 'lucide-react';

interface Analytics {
  overview: { totalRevenue: number; totalOrders: number; activeDiscounts: number; activeCampaigns: number; conversionRate: string };
  revenueByDay: { date: string; revenue: number }[];
  discountStats: { totalCodes: number; activeCodes: number; totalUsages: number; totalDiscounted: number; discountConversion: number };
  funnel: { views: number; addToCart: number; checkout: number; purchases: number };
  campaigns: { id: string; name: string; type: string; status: string; totalSent: number; totalOpened: number; totalConverted: number; openRate: number }[];
  discountCodes: { id: string; code: string; type: string; value: number; usedCount: number; usageLimit: number; usageRate: number }[];
}

function formatVND(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} tỷ`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} triệu`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toString();
}

export default function MarketingDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetch(`/api/marketing/analytics?period=${period}`)
      .then(r => r.json()).then(d => { if (d.success) setData(d.data); else setError(d.error?.message || 'Lỗi'); })
      .catch(() => setError('Không thể tải dữ liệu analytics'))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>;
  if (!data) return null;

  const maxRevenue = Math.max(...data.revenueByDay.map(d => d.revenue), 1);
  const funnelMax = Math.max(data.funnel.views, data.funnel.addToCart, data.funnel.checkout, data.funnel.purchases, 1);

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {['7d', '30d', '90d'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium ${period === p ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >{p === '7d' ? '7 ngày' : p === '30d' ? '30 ngày' : '90 ngày'}</button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Doanh thu', value: formatVND(data.overview.totalRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Đơn hàng', value: data.overview.totalOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Mã giảm giá', value: data.overview.activeDiscounts, icon: Percent, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Chiến dịch', value: data.overview.activeCampaigns, icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Chuyển đổi', value: `${data.overview.conversionRate}%`, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${kpi.bg}`}><kpi.icon size={18} className={kpi.color} /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{typeof kpi.value === 'number' ? kpi.value.toLocaleString('vi-VN') : kpi.value}</p>
            <p className="text-sm text-gray-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart (text-based bar chart) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 size={18} /> Doanh thu theo ngày</h3>
          <div className="space-y-1 max-h-[250px] overflow-y-auto">
            {data.revenueByDay.slice(-14).map(d => (
              <div key={d.date} className="flex items-center gap-2 text-xs">
                <span className="w-20 text-gray-500 text-right shrink-0">{d.date.slice(5)}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded relative overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded transition-all" style={{ width: `${(d.revenue / maxRevenue) * 100}%` }} />
                </div>
                <span className="w-24 text-gray-700 font-medium shrink-0">{formatVND(d.revenue)}</span>
              </div>
            ))}
            {data.revenueByDay.length === 0 && <p className="text-gray-400 text-sm py-4 text-center">Chưa có dữ liệu doanh thu</p>}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Target size={18} /> Phễu chuyển đổi</h3>
          {[
            { label: 'Xem SP', value: data.funnel.views, color: 'bg-blue-400', icon: '👁️' },
            { label: 'Thêm giỏ hàng', value: data.funnel.addToCart, color: 'bg-teal-400', icon: '🛒' },
            { label: 'Checkout', value: data.funnel.checkout, color: 'bg-orange-400', icon: '📋' },
            { label: 'Mua hàng', value: data.funnel.purchases, color: 'bg-green-500', icon: '✅' },
          ].map((step, i) => (
            <div key={step.label} className="mb-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{step.icon} {step.label}</span>
                <span className="font-semibold">{step.value}</span>
              </div>
              <div className="h-6 bg-gray-100 rounded overflow-hidden">
                <div className={`h-full ${step.color} rounded transition-all flex items-center justify-center text-white text-xs font-medium`}
                  style={{ width: `${(step.value / funnelMax) * 100}%`, minWidth: step.value > 0 ? '40px' : '0' }}>
                  {i > 0 && data.funnel.views > 0 ? `${((step.value / data.funnel.views) * 100).toFixed(1)}%` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discount codes performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Percent size={18} /> Hiệu suất mã giảm giá</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Tổng mã', value: data.discountStats.totalCodes },
            { label: 'Đang hoạt động', value: data.discountStats.activeCodes },
            { label: 'Lượt sử dụng', value: data.discountStats.totalUsages },
            { label: 'Tiền đã giảm', value: formatVND(data.discountStats.totalDiscounted) },
          ].map(s => (
            <div key={s.label} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-gray-900">{typeof s.value === 'number' ? s.value.toLocaleString('vi-VN') : s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
        {data.discountCodes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left"><th className="py-2 pr-4">Mã</th><th className="py-2 pr-4">Loại</th><th className="py-2 pr-4">Giá trị</th><th className="py-2 pr-4">Đã dùng</th><th className="py-2">Tỉ lệ</th></tr></thead>
              <tbody>
                {data.discountCodes.slice(0, 8).map(d => (
                  <tr key={d.id} className="border-b">
                    <td className="py-2 pr-4 font-mono font-semibold">{d.code}</td>
                    <td className="py-2 pr-4">{d.type === 'PERCENTAGE' ? '%' : d.type === 'FIXED_AMOUNT' ? 'Cố định' : 'Free Ship'}</td>
                    <td className="py-2 pr-4">{d.type === 'PERCENTAGE' ? `${d.value}%` : formatVND(d.value)}</td>
                    <td className="py-2 pr-4">{d.usedCount}/{d.usageLimit}</td>
                    <td className="py-2"><div className="h-2 bg-gray-100 rounded w-24"><div className="h-2 bg-indigo-500 rounded" style={{ width: `${d.usageRate}%` }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaigns */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Megaphone size={18} /> Chiến dịch gần đây</h3>
        {data.campaigns.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">Chưa có chiến dịch nào</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.campaigns.map(c => (
              <div key={c.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{c.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : c.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{c.type}</p>
                <div className="flex gap-4 text-xs text-gray-600">
                  <span>📨 {c.totalSent}</span>
                  <span>👁️ {c.openRate}%</span>
                  <span>✅ {c.totalConverted}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
