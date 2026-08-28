'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

export interface CrudField {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'color' | 'select' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface CrudColumn {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => ReactNode;
}

interface CrudTableProps {
  title: string;
  endpoint: string;
  columns: CrudColumn[];
  fields: CrudField[];
  description?: string;
  extraSelects?: Record<string, { value: string; label: string }[]>;
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${status === 'active' ? 'badge-success' : 'badge-danger'}`}>{status === 'active' ? 'Đang dùng' : 'Ngừng'}</span>;
}

export default function CrudTable({ title, endpoint, columns, fields, description, extraSelects = {} }: CrudTableProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await apiGet<Record<string, unknown>[]>(`/api/${endpoint}`));
    } catch { /* empty */ } finally { setLoading(false); }
  }, [endpoint]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    const f: Record<string, string> = {};
    fields.forEach(x => { f[x.key] = x.type === 'number' ? '0' : ''; });
    setForm(f);
    setEditItem(null);
    setShowModal(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    const f: Record<string, string> = {};
    fields.forEach(x => {
      const v = row[x.key];
      f[x.key] = v === null || v === undefined ? '' : String(v);
    });
    setForm(f);
    setEditItem(row);
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload: Record<string, unknown> = {};
    fields.forEach(x => {
      const v = form[x.key] ?? '';
      if (x.type === 'number') { payload[x.key] = v === '' ? 0 : Number(v); }
      else if (x.type === 'color' && v === '') { payload[x.key] = '#4caf50'; }
      else { payload[x.key] = v; }
    });
    if (editItem) {
      await apiPut(`/api/${endpoint}/${editItem.id}`, payload);
    } else {
      await apiPost(`/api/${endpoint}`, payload);
    }
    setShowModal(false);
    setEditItem(null);
    load();
  };

  const allSelects: Record<string, { value: string; label: string }[]> = {};
  fields.forEach(f => {
    if (f.type === 'select') allSelects[f.key] = [...(extraSelects[f.key] || []), ...(f.options || [])];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">{title}</h1>
          {description && <p className="text-text-light mt-1">{description}</p>}
        </div>
        <button onClick={openCreate} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm mới
        </button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">{title}</h3></div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-text-light">Đang tải...</div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-text-light">Chưa có dữ liệu</div>
          ) : (
            <table className="table">
              <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}<th>Thao tác</th></tr></thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={String(row.id)}>
                    {columns.map(c => (
                      <td key={c.key}>{c.render ? c.render(row) : (row[c.key] !== null && row[c.key] !== undefined ? String(row[c.key]) : '—')}</td>
                    ))}
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(row)} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button>
                        <button onClick={async () => { if (!confirm('Xóa mục này?')) return; await apiDelete(`/api/${endpoint}/${row.id}`); load(); }} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button>
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
        <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4">
          {fields.map(f => {
            const base = 'w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary';
            if (f.type === 'textarea') {
              return <div key={f.key}><label className="block text-sm font-medium mb-1">{f.label}</label><textarea value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className={`${base} h-20`} /></div>;
            }
            if (f.type === 'color') {
              return <div key={f.key}><label className="block text-sm font-medium mb-1">{f.label}</label><input type="color" value={form[f.key] || '#4caf50'} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full h-9 px-1 py-1 border rounded-lg" /></div>;
            }
            if (f.type === 'select') {
              return (
                <div key={f.key}><label className="block text-sm font-medium mb-1">{f.label}</label>
                  <select value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className={base}>
                    <option value="">— Chọn —</option>
                    {(allSelects[f.key] || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              );
            }
            return <div key={f.key}><label className="block text-sm font-medium mb-1">{f.label}{f.required && ' *'}</label><input type={f.type === 'number' ? 'number' : 'text'} value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className={base} required={f.required} /></div>;
          })}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setEditItem(null); }} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg-cream">Hủy</button>
            <button type="submit" className="btn-primary text-xs">Lưu</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}