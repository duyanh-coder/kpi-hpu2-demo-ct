 'use client';

import { useState } from 'react';
import { Plus, Search, Users, Clock, CheckCircle2 } from 'lucide-react';

const tasks = [
  { id:'CV-HPU2-001', title:'Triển khai hướng dẫn đánh giá viên chức, người lao động theo KPI tại các đơn vị', owner:'Phòng Tổ chức Cán bộ', assignee:'Đơn vị thí điểm', due:'31/08/2026', progress:80, status:'Đang thực hiện' },
  { id:'CV-HPU2-002', title:'Ban hành kế hoạch triển khai nhiệm vụ theo Quyết định 2371/QĐ-TTg và hướng dẫn lồng ghép vào kế hoạch năm học', owner:'Ban Chỉ đạo', assignee:'Phòng Đào tạo', due:'31/08/2026', progress:100, status:'Hoàn thành' },
  { id:'CV-HPU2-003', title:'Xây dựng danh mục văn bản nội bộ cần rà soát, sửa đổi, bổ sung hoặc ban hành mới', owner:'Phòng Hành chính', assignee:'Các phòng, trung tâm', due:'30/09/2026', progress:45, status:'Đang thực hiện' },
  { id:'CV-HPU2-004', title:'Nộp minh chứng và cập nhật tiến độ nhiệm vụ trọng tâm theo nguyên tắc 6 rõ', owner:'Ban Giám hiệu', assignee:'Các đơn vị', due:'30/09/2026', progress:20, status:'Chưa bắt đầu' },
];

export default function TaskAssignmentPage(){
  const [keyword,setKeyword]=useState('');
  const data=tasks.filter(x=>`${x.id} ${x.title} ${x.owner} ${x.assignee}`.toLowerCase().includes(keyword.toLowerCase()));
  return <div className="space-y-6">
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div><h1 className="text-2xl font-heading font-bold text-text-dark">Giao việc & Thực hiện</h1><p className="text-text-light mt-1">Theo dõi giao việc, tiếp nhận, tiến độ và kết quả công việc</p></div>
      <button className="btn-primary text-sm flex items-center gap-2"><Plus size={16}/> Giao việc</button>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        ['Tổng công việc',tasks.length,Users,'bg-primary'],['Đang thực hiện',2,Clock,'bg-accent-yellow'],['Hoàn thành',1,CheckCircle2,'bg-accent-green'],['Quá hạn',0,Clock,'bg-accent-red']
      ].map(([label,value,Icon,color]:any)=>{const C=Icon;return <div key={label} className="card p-4 flex items-center justify-between"><div><p className="text-text-light text-xs">{label}</p><p className="text-2xl font-heading font-bold text-primary mt-1">{value}</p></div><div className={`p-3 rounded-lg ${color}`}><C size={21} className="text-white"/></div></div>})}
    </div>

    <div className="card">
      <div className="card-header">Danh sách công việc</div>
      <div className="p-4"><div className="relative max-w-xl"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light"/><input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="Tìm kiếm công việc..." className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm"/></div></div>
      <div className="overflow-x-auto"><table className="table min-w-[850px]"><thead><tr><th>Mã việc</th><th>Công việc</th><th>Đơn vị giao</th><th>Người thực hiện</th><th>Hạn</th><th>Tiến độ</th><th>Trạng thái</th></tr></thead><tbody>{data.map(t=><tr key={t.id}><td className="font-medium">{t.id}</td><td>{t.title}</td><td>{t.owner}</td><td>{t.assignee}</td><td>{t.due}</td><td><div className="min-w-28"><div className="flex justify-between text-xs mb-1"><span>{t.progress}%</span></div><div className="progress-bar"><div className="progress-fill bg-primary" style={{width:`${t.progress}%`}}/></div></div></td><td><span className={`badge ${t.status==='Hoàn thành'?'badge-success':t.status==='Đang thực hiện'?'badge-info':'badge-warning'}`}>{t.status}</span></td></tr>)}</tbody></table></div>
    </div>
  </div>
}