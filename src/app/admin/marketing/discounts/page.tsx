'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Copy, CheckCircle, XCircle } from 'lucide-react';

interface Discount {
  id: string; code: string; description: string; type: string; value: number;
  minOrderValue: number; maxDiscount: number | null; usageLimit: number; usedCount: number;
  perUserLimit: number; isActive: boolean;
  startsAt: string; endsAt: string | null; targetSegment: string;
  _count?: { usages: number };
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [form, setForm] = useState({ code: '', description: '', type: 'PERCENTAGE', value: '', minOrderValue: '', maxDiscount: '', usageLimit: '100', perUserLimit: '1', targetSegment: 'ALL', endsAt: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/marketing/discounts?limit=100');
      const d = await r.json();
      if (d.success) setDiscounts(d.data);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchDiscounts(); }, []);

  const resetForm = () => {
    setForm({ code: '', description: '', type: 'PERCENTAGE', value: '', minOrderValue: '', maxDiscount: '', usageLimit: '100', perUserLimit: '1', targetSegment: 'ALL', endsAt: '' });
    setEditing(null); setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value) return;
    setSaving(true); setMsg('');
    try {
      const url = editing ? `/api/marketing/discounts/${editing.id}` : '/api/marketing/discounts';
      const method = editing ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await r.json();
      if (d.success) { resetForm(); fetchDiscounts(); setMsg(editing ? 'Đã cập nhật!' : 'Đã tạo!'); }
      else setMsg(d.error?.message || 'Lỗi');
    } catch (e) { setMsg('Lỗi kết nối'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa mã này?')) return;
    await fetch(`/api/marketing/discounts/${id}`, { method: 'DELETE' });
    fetchDiscounts();
  };

  const handleToggleActive = async (d: Discount) => {
    await fetch(`/api/marketing/discounts/${d.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !d.isActive }) });
    fetchDiscounts();
  };

  const handleEdit = (d: Discount) => {
    setEditing(d);
    setForm({
      code: d.code, description: d.description || '', type: d.type, value: String(d.value),
      minOrderValue: String(d.minOrderValue), maxDiscount: d.maxDiscount ? String(d.maxDiscount) : '',
      usageLimit: String(d.usageLimit), perUserLimit: String(d.perUserLimit),
      targetSegment: d.targetSegment || 'ALL', endsAt: d.endsAt ? d.endsAt.slice(0, 10) : '',
    });
    setShowForm(true);
  };

  const formatVND = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}tr` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : n.toString();

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{discounts.length} mã giảm giá</p>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Tạo mã mới
        </button>
      </div>

      {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('Lỗi') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{msg}</div>}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold">{editing ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá mới'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mã code *</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: SUMMER2024" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Loại</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED_AMOUNT">Số tiền cố định</option>
                <option value="FREE_SHIP">Miễn phí vận chuyển</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Giá trị *</label>
              <input value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
                type="number" placeholder={form.type === 'PERCENTAGE' ? 'VD: 15 (%)' : 'VD: 50000 (đ)'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Đơn tối thiểu</label>
              <input value={form.minOrderValue} onChange={e => setForm({ ...form, minOrderValue: e.target.value })} type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Giảm tối đa</label>
              <input value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} type="number" placeholder="Không giới hạn" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Lượt sử dụng</label>
              <input value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phân khúc</label>
              <select value={form.targetSegment} onChange={e => setForm({ ...form, targetSegment: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="ALL">Tất cả</option><option value="VIP">VIP</option><option value="NEW">Khách mới</option><option value="INACTIVE">Không hoạt động</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hết hạn</label>
              <input value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mới'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Hủy</button>
          </div>
        </form>
      )}

      {/* Discount list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left"><th className="py-3 px-4">Mã</th><th className="py-3 px-4">Loại</th><th className="py-3 px-4">Giá trị</th><th className="py-3 px-4">Đã dùng</th><th className="py-3 px-4">Phân khúc</th><th className="py-3 px-4">Hết hạn</th><th className="py-3 px-4">TT</th><th className="py-3 px-4"></th></tr></thead>
            <tbody>
              {discounts.map(d => (
                <tr key={d.id} className={`border-t hover:bg-gray-50 ${!d.isActive ? 'opacity-50' : ''}`}>
                  <td className="py-3 px-4 font-mono font-semibold">{d.code}</td>
                  <td className="py-3 px-4">{d.type === 'PERCENTAGE' ? '%' : d.type === 'FIXED_AMOUNT' ? 'Cố định' : 'Free Ship'}</td>
                  <td className="py-3 px-4">{d.type === 'PERCENTAGE' ? `${d.value}%` : formatVND(d.value)}</td>
                  <td className="py-3 px-4">{d.usedCount}/{d.usageLimit}</td>
                  <td className="py-3 px-4"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{d.targetSegment || 'ALL'}</span></td>
                  <td className="py-3 px-4 text-xs">{d.endsAt ? new Date(d.endsAt).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="py-3 px-4">{d.isActive ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-400" />}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(d)} className="p-1.5 hover:bg-gray-100 rounded" title="Sửa"><Edit3 size={14} /></button>
                      <button onClick={() => handleToggleActive(d)} className="p-1.5 hover:bg-gray-100 rounded" title={d.isActive ? 'Vô hiệu' : 'Kích hoạt'}>
                        {d.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(d.code); alert('Đã copy!'); }} className="p-1.5 hover:bg-gray-100 rounded" title="Copy"><Copy size={14} /></button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded" title="Xóa"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {discounts.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400">Chưa có mã giảm giá nào</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
