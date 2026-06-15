'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Play, Pause, Megaphone } from 'lucide-react';

interface Campaign {
  id: string; name: string; description: string; type: string; status: string;
  subject: string; body: string; imageUrl: string; targetSegment: string;
  scheduledAt: string | null; startedAt: string | null; endedAt: string | null;
  totalSent: number; totalOpened: number; totalClicked: number; totalConverted: number; revenueGenerated: number;
  linkedDiscountId: string | null;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState({ name: '', description: '', type: 'EMAIL', subject: '', body: '', imageUrl: '', targetSegment: 'ALL', scheduledAt: '', linkedDiscountId: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/marketing/campaigns');
      const d = await r.json();
      if (d.success) setCampaigns(d.data);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', type: 'EMAIL', subject: '', body: '', imageUrl: '', targetSegment: 'ALL', scheduledAt: '', linkedDiscountId: '' });
    setEditing(null); setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.name) return;
    setSaving(true); setMsg('');
    try {
      const url = editing ? `/api/marketing/campaigns/${editing.id}` : '/api/marketing/campaigns';
      const r = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await r.json();
      if (d.success) { resetForm(); fetchCampaigns(); setMsg(editing ? 'Đã cập nhật!' : 'Đã tạo!'); }
      else setMsg(d.error?.message || 'Lỗi');
    } catch (e) { setMsg('Lỗi kết nối'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa chiến dịch này?')) return;
    await fetch(`/api/marketing/campaigns/${id}`, { method: 'DELETE' });
    fetchCampaigns();
  };

  const handleStatusChange = async (c: Campaign, newStatus: string) => {
    await fetch(`/api/marketing/campaigns/${c.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus, ...(newStatus === 'ACTIVE' ? { startedAt: new Date().toISOString() } : { endedAt: new Date().toISOString() }) }) });
    fetchCampaigns();
  };

  const handleEdit = (c: Campaign) => {
    setEditing(c);
    setForm({
      name: c.name, description: c.description || '', type: c.type, subject: c.subject || '',
      body: c.body || '', imageUrl: c.imageUrl || '', targetSegment: c.targetSegment || 'ALL',
      scheduledAt: c.scheduledAt ? c.scheduledAt.slice(0, 10) : '', linkedDiscountId: c.linkedDiscountId || '',
    });
    setShowForm(true);
  };

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { DRAFT: 'bg-gray-100 text-gray-600', ACTIVE: 'bg-green-100 text-green-700', PAUSED: 'bg-yellow-100 text-yellow-700', ENDED: 'bg-red-100 text-red-600' };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[s] || ''}`}>{s}</span>;
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{campaigns.length} chiến dịch</p>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Tạo chiến dịch
        </button>
      </div>

      {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('Lỗi') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{msg}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold">{editing ? 'Sửa chiến dịch' : 'Tạo chiến dịch mới'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tên chiến dịch *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Flash Sale Hè 2024" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Loại</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="EMAIL">Email</option><option value="SMS">SMS</option><option value="BANNER">Banner</option><option value="PUSH_NOTIFICATION">Push Notification</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tiêu đề</label>
              <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="Tiêu đề email/thông báo" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phân khúc mục tiêu</label>
              <select value={form.targetSegment} onChange={e => setForm({ ...form, targetSegment: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="ALL">Tất cả</option><option value="VIP">VIP</option><option value="NEW">Khách mới</option><option value="INACTIVE">Không hoạt động</option><option value="HIGH_SPENDER">Chi tiêu cao</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Lịch gửi</label>
              <input value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">URL Ảnh banner</label>
              <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nội dung HTML</label>
              <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
                placeholder="<h1>Nội dung email...</h1>" rows={5} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
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

      {/* Campaign grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map(c => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{c.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{c.type} · {c.description || '—'}</p>
              </div>
              {statusBadge(c.status)}
            </div>
            <div className="grid grid-cols-4 gap-3 mb-3 text-center">
              {[
                { label: 'Đã gửi', value: c.totalSent, icon: '📨' },
                { label: 'Mở', value: c.totalOpened, icon: '👁️' },
                { label: 'Click', value: c.totalClicked, icon: '👆' },
                { label: 'Mua', value: c.totalConverted, icon: '✅' },
              ].map(m => (
                <div key={m.label} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold">{m.value}</p>
                  <p className="text-xs text-gray-500">{m.icon} {m.label}</p>
                </div>
              ))}
            </div>
            {c.subject && <p className="text-xs text-gray-500 mb-3">📧 {c.subject}</p>}
            <div className="flex gap-1">
              {c.status === 'DRAFT' && (
                <button onClick={() => handleStatusChange(c, 'ACTIVE')} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"><Play size={12} /> Bắt đầu</button>
              )}
              {c.status === 'ACTIVE' && (
                <button onClick={() => handleStatusChange(c, 'PAUSED')} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"><Pause size={12} /> Tạm dừng</button>
              )}
              {c.status === 'PAUSED' && (
                <button onClick={() => handleStatusChange(c, 'ACTIVE')} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"><Play size={12} /> Tiếp tục</button>
              )}
              <button onClick={() => handleEdit(c)} className="px-3 py-1.5 border rounded text-xs hover:bg-gray-50"><Edit3 size={12} /> Sửa</button>
              <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 border rounded text-xs text-red-500 hover:bg-red-50"><Trash2 size={12} /> Xóa</button>
            </div>
          </div>
        ))}
        {campaigns.length === 0 && (
          <div className="col-span-2 py-12 text-center text-gray-400">
            <Megaphone size={48} className="mx-auto mb-3 opacity-30" />
            <p>Chưa có chiến dịch marketing nào</p>
            <p className="text-sm mt-1">Tạo chiến dịch đầu tiên để bắt đầu tiếp cận khách hàng</p>
          </div>
        )}
      </div>
    </div>
  );
}
