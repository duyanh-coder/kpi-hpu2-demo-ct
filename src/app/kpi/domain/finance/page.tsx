'use client';

import { DollarSign } from 'lucide-react';
import DomainKPIPage from '@/components/kpi/DomainKPIPage';

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-light rounded-lg"><DollarSign size={24} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý KPI tài chính</h1>
        </div>
      </div>
      <DomainKPIPage config={{
        title: 'KPI tài chính',
        description: 'Nhập kết quả thực tế cho các chỉ tiêu tài chính',
        keywords: ['tài chính', 'thu', 'biên độ', 'tăng trưởng'],
      }} />
    </div>
  );
}
