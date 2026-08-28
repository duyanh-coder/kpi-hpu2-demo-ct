import CrudTable from '@/components/admin/CrudTable';

export const metadata = { title: 'Danh mục điều kiện đánh giá' };

export default function DieuKienDanhGiaPage() {
  return (
    <CrudTable
      title="Danh mục điều kiện đánh giá"
      description="Các mức xếp loại chất lượng theo điểm số"
      endpoint="grading-levels"
      columns={[
        { key: 'code', label: 'Mã' },
        { key: 'name', label: 'Mức xếp loại' },
        { key: 'minScore', label: 'Điểm tối thiểu' },
        { key: 'maxScore', label: 'Điểm tối đa' },
        {
          key: 'color', label: 'Màu',
          render: (row) => <span className="inline-block w-5 h-5 rounded" style={{ backgroundColor: String(row.color || '#ccc') }} title={String(row.color)} />,
        },
        {
          key: 'status', label: 'Trạng thái',
          render: (row) => <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{row.status === 'active' ? 'Đang dùng' : 'Ngừng'}</span>,
        },
      ]}
      fields={[
        { key: 'code', label: 'Mã', required: true },
        { key: 'name', label: 'Tên mức xếp loại', required: true },
        { key: 'minScore', label: 'Điểm tối thiểu', type: 'number', required: true },
        { key: 'maxScore', label: 'Điểm tối đa', type: 'number', required: true },
        { key: 'color', label: 'Màu', type: 'color' },
        { key: 'description', label: 'Mô tả', type: 'textarea' },
      ]}
    />
  );
}