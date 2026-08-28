'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface KPIGroup { id: string; code: string; name: string; description: string; status: string; }

export default function LinhVucCongTacPage() {
  const [rows, setRows] = useState<KPIGroup[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<KPIGroup | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await apiGet<KPIGroup[]>('/api/kpi-groups')); }
    catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: KPIGroup) => {
    if (editItem) await apiPut(`/api/kpi-groups/${editItem.id}`, data);
    else await apiPost('/api/kpi-groups', data);
    setShowModal(false); setEditItem(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa mục này?')) return;
    await apiDelete(`/api/kpi-groups/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Danh mục Lĩnh vực công tác</h1>
          <p className="text-text-light mt-1">Các nhóm lĩnh vực hoạt động của đơn vị</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm mới
        </button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Lĩnh vực công tác</h3></div>
        <div className="overflow-x-auto">
          {loading ? <div className="p-8 text-center text-text-light">Đang tải...</div> :
            rows.length === 0 ? <div className="p-8 text-center text-text-light">Chưa có dữ liệu</div> : (
            <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Tên lĩnh vực</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {rows.map((g, i) => (
                  <tr key={g.id}>
                    <td>{i + 1}</td>
                    <td className="font-mono text-xs">{g.code}</td>
                    <td className="font-medium">{g.name}</td>
                    <td className="text-sm text-text-light">{g.description}</td>
                    <td><span className={`badge ${g.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{g.status === 'active' ? 'Đang dùng' : 'Ngừng'}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditItem(g); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button>
                        <button onClick={() => handleDelete(g.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Chỉnh sửa' : 'Thêm mới'}>
        <GroupForm initial={editItem} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditItem(null); }} />
      </Modal>
    </div>
  );
}

function GroupForm({ initial, onSubmit, onCancel }: { initial?: KPIGroup | null; onSubmit: (d: KPIGroup) => void; onCancel: () => void }) {
  const [f, setF] = useState(initial || ({ code: '', name: '', description: '', status: 'active' } as KPIGroup));
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...f, name: f.name.trim() }); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mã *</label>
          <input type="text" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} required className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tên lĩnh vực *</label>
        <input type="text" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Mô tả</label>
        <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm h-20 focus:outline-none focus:border-primary" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg-cream">Hủy</button>
        <button type="submit" className="btn-primary text-xs">Lưu</button>
      </div>
    </form>
  );
}