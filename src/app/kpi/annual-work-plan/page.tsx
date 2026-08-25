 'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Plus, Search, CheckCircle, Clock, Building2 } from 'lucide-react';

const initialPlans = [
  { id: 1, field: 'Quản trị, tổ chức, thi đua', task: 'Triển khai văn bản hướng dẫn đánh giá viên chức, người lao động theo KPI tại các đơn vị', unit: 'Phòng Tổ chức Cán bộ', result: 'Văn bản hướng dẫn được ban hành và triển khai đến 100% đơn vị thí điểm', deadline: '8/2026', status: 'Đang thực hiện' },
  { id: 2, field: 'Quản trị, tổ chức, thi đua', task: 'Ban hành kế hoạch triển khai Quyết định số 2371/QĐ-TTg năm học 2026-2027 và hướng dẫn các đơn vị lồng ghép nhiệm vụ vào kế hoạch hành động năm học', unit: 'Ban Chỉ đạo thực hiện Quyết định 2371', result: 'Kế hoạch triển khai và hướng dẫn lồng ghép nhiệm vụ được ban hành', deadline: '8/2026', status: 'Chờ phê duyệt' },
  { id: 3, field: 'Cải cách hành chính', task: 'Xây dựng Danh mục văn bản nội bộ cần rà soát, sửa đổi, bổ sung hoặc ban hành mới trong năm học', unit: 'Phòng Hành chính', result: 'Danh mục văn bản kèm phân công đơn vị chủ trì và tiến độ', deadline: '9/2026', status: 'Đang thực hiện' },
  { id: 4, field: 'Đào tạo, bồi dưỡng', task: 'Xét tốt nghiệp cho sinh viên đại học hệ chính quy và học viên cao học đợt tháng 10', unit: 'Phòng Đào tạo', result: 'Quyết định công nhận tốt nghiệp đợt tháng 10', deadline: '10/2026', status: 'Chưa bắt đầu' },
  { id: 5, field: 'Đào tạo, bồi dưỡng', task: 'Tổ chức Hội thi Nghiệp vụ sư phạm cấp Khoa tại các đơn vị đào tạo', unit: 'Viện Nghiên cứu Sư phạm', result: 'Hội thi được tổ chức tại các đơn vị và danh sách giải thưởng', deadline: '10/2026', status: 'Chưa bắt đầu' },
  { id: 6, field: 'KHCN & HTQT', task: 'Phát động đăng ký đề tài nghiên cứu khoa học sinh viên gắn với chuyển đổi số, đổi mới sáng tạo, giáo dục thông minh và STEM/STEAM', unit: 'Phòng Khoa học Công nghệ và Hợp tác Quốc tế', result: 'Thông báo đăng ký và danh sách đề tài đăng ký', deadline: '10/2026', status: 'Chưa bắt đầu' },
  { id: 7, field: 'KHCN & HTQT', task: 'Tổ chức tọa đàm Công bố quốc tế và xây dựng nhóm nghiên cứu liên ngành trong lĩnh vực khoa học giáo dục', unit: 'Phòng Khoa học Công nghệ và Hợp tác Quốc tế', result: '01 tọa đàm và danh sách nhóm/ý tưởng nghiên cứu liên ngành', deadline: '10/2026', status: 'Chưa bắt đầu' },
  { id: 8, field: 'Chuyển đổi số', task: 'Tổ chức đánh giá giữa kỳ học kỳ II kết hợp phân tích dữ liệu học tập, chuyên cần và mức độ tương tác trên LMS để hỗ trợ sinh viên', unit: 'Phòng Đào tạo', result: 'Báo cáo dữ liệu giữa kỳ và danh sách sinh viên cần hỗ trợ', deadline: '3/2027', status: 'Chưa bắt đầu' },
  { id: 9, field: 'KHCN & HTQT', task: 'Tổ chức seminar liên ngành về giáo dục phát triển bền vững và công nghệ', unit: 'Phòng Đào tạo', result: '01 seminar liên ngành', deadline: '3/2027', status: 'Chưa bắt đầu' },
  { id: 10, field: 'Khảo thí và ĐBCLGD', task: 'Đánh giá chất lượng đào tạo đại học dựa trên phản hồi của nhà sử dụng lao động về mức độ đạt chuẩn đầu ra chương trình đào tạo', unit: 'Trung tâm Khảo thí và Đảm bảo chất lượng giáo dục', result: 'Báo cáo đánh giá chất lượng đào tạo đại học', deadline: '4/2027', status: 'Chưa bắt đầu' },
];

export default function AnnualWorkPlanPage() {
  const [plans, setPlans] = useState(initialPlans);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('Tất cả');

  const filtered = useMemo(() => plans.filter(p =>
    (status === 'Tất cả' || p.status === status) &&
    `${p.field} ${p.task} ${p.unit}`.toLowerCase().includes(keyword.toLowerCase())
  ), [plans, keyword, status]);

  const statusClass = (value: string) =>
    value === 'Đang thực hiện' ? 'badge-info' : value === 'Chờ phê duyệt' ? 'badge-warning' : 'badge-danger';

  return <div className="space-y-6">
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-dark">Kế hoạch công tác năm</h1>
        <p className="text-text-light mt-1">Năm học 2026–2027 · Danh sách nhiệm vụ và kết quả cần thực hiện</p>
      </div>
      <button className="btn-primary text-sm flex items-center gap-2"><Plus size={16}/> Lập kế hoạch</button>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label:'Tổng nhiệm vụ', value: plans.length, icon: CalendarDays, color:'bg-primary' },
        { label:'Đang thực hiện', value: plans.filter(x=>x.status==='Đang thực hiện').length, icon: Clock, color:'bg-accent-yellow' },
        { label:'Chờ phê duyệt', value: plans.filter(x=>x.status==='Chờ phê duyệt').length, icon: Building2, color:'bg-primary' },
        { label:'Hoàn thành', value: 0, icon: CheckCircle, color:'bg-accent-green' },
      ].map(x => { const Icon=x.icon; return <div key={x.label} className="card p-4 flex items-center justify-between"><div><p className="text-text-light text-xs">{x.label}</p><p className="text-2xl font-heading font-bold text-primary mt-1">{x.value}</p></div><div className={`p-3 rounded-lg ${x.color}`}><Icon size={21} className="text-white"/></div></div>})}
    </div>

    <div className="card">
      <div className="card-header">Danh sách kế hoạch công tác</div>
      <div className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light"/><input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="Tìm nhiệm vụ, lĩnh vực, đơn vị..." className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm"/></div>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm"><option>Tất cả</option><option>Đang thực hiện</option><option>Chờ phê duyệt</option><option>Chưa bắt đầu</option></select>
      </div>
      <div className="overflow-x-auto">
        <table className="table min-w-[900px]"><thead><tr><th>STT</th><th>Lĩnh vực</th><th>Nhiệm vụ</th><th>Đơn vị chủ trì</th><th>Kết quả/Sản phẩm</th><th>Thời hạn</th><th>Trạng thái</th></tr></thead>
        <tbody>{filtered.map((p,i)=><tr key={p.id}><td>{i+1}</td><td>{p.field}</td><td className="font-medium">{p.task}</td><td>{p.unit}</td><td>{p.result}</td><td>{p.deadline}</td><td><span className={`badge ${statusClass(p.status)}`}>{p.status}</span></td></tr>)}</tbody></table>
      </div>
    </div>
  </div>
}