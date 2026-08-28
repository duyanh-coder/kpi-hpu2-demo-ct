import CrudTable from '@/components/admin/CrudTable';

export const metadata = { title: 'Danh mục Lĩnh vực KPI' };

const targetLevelOptions = [
  { value: 'school', label: 'Trường' },
  { value: 'unit', label: 'Đơn vị' },
  { value: 'individual', label: 'Cá nhân' },
];

export default function LinhVucKpiPage() {
  return (
    <CrudTable
      title="Danh mục Lĩnh vực KPI"
      description="Phân loại KPI theo lĩnh vực hoạt động"
      endpoint="kpi-group-catalog"
      columns={[
        { key: 'code', label: 'Mã' },
        { key: 'name', label: 'Tên lĩnh vực' },
        { key: 'defaultWeight', label: 'Trọng số mặc định' },
        {
          key: 'targetLevel', label: 'Cấp áp dụng',
          render: (row) => {
            const t = String(row.targetLevel);
            return targetLevelOptions.find(o => o.value === t)?.label ?? t;
          },
        },
        {
          key: 'status', label: 'Trạng thái',
          render: (row) => <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{row.status === 'active' ? 'Đang dùng' : 'Ngừng'}</span>,
        },
      ]}
      fields={[
        { key: 'code', label: 'Mã', required: true },
        { key: 'name', label: 'Tên lĩnh vực', required: true },
        { key: 'defaultWeight', label: 'Trọng số mặc định', type: 'number', required: true },
        { key: 'targetLevel', label: 'Cấp áp dụng', type: 'select', options: targetLevelOptions },
      ]}
    />
  );
}