import CrudTable from '@/components/admin/CrudTable';

export const metadata = { title: 'Danh mục Lĩnh vực công tác' };

export default function LinhVucCongTacPage() {
  return (
    <CrudTable
      title="Danh mục Lĩnh vực công tác"
      description="Các nhóm lĩnh vực hoạt động của đơn vị"
      endpoint="kpi-groups"
      columns={[
        { key: 'code', label: 'Mã' },
        { key: 'name', label: 'Tên lĩnh vực' },
        { key: 'description', label: 'Mô tả' },
        {
          key: 'status', label: 'Trạng thái',
          render: (row) => <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{row.status === 'active' ? 'Đang dùng' : 'Ngừng'}</span>,
        },
      ]}
      fields={[
        { key: 'code', label: 'Mã', required: true },
        { key: 'name', label: 'Tên lĩnh vực', required: true },
        { key: 'description', label: 'Mô tả', type: 'textarea' },
      ]}
    />
  );
}