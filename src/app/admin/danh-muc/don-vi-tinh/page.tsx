import CrudTable from '@/components/admin/CrudTable';

export const metadata = { title: 'Danh mục đơn vị tính' };

export default function DonViTinhPage() {
  return (
    <CrudTable
      title="Danh mục đơn vị tính"
      description="Đơn vị đo lường dùng cho chỉ tiêu KPI"
      endpoint="measurement-units"
      columns={[
        { key: 'code', label: 'Mã' },
        { key: 'name', label: 'Tên đơn vị tính' },
        {
          key: 'status', label: 'Trạng thái',
          render: (row) => <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{row.status === 'active' ? 'Đang dùng' : 'Ngừng'}</span>,
        },
      ]}
      fields={[
        { key: 'code', label: 'Mã', required: true },
        { key: 'name', label: 'Tên đơn vị tính', required: true },
        { key: 'description', label: 'Mô tả', type: 'textarea' },
      ]}
    />
  );
}