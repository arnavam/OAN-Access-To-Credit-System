"use client";
import ApplicationCard, { ApplicationStatus } from './ApplicationCard';

export default function ApplicationList({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const applications = [
    {
      id: 1,
      status: 'review' as ApplicationStatus,
      title: 'Under Review',
      subtitle: 'Decision by June 25, 2026',
      maxAmount: 'ETB 200,000',
      interest: '10.5%',
      tenure: '6 months',
      repayment: 'ETB 6,420',
    },
    {
      id: 2,
      status: 'review' as ApplicationStatus,
      title: 'Under Review',
      subtitle: 'Decision by June 25, 2026',
      maxAmount: 'ETB 50,000',
      interest: '7.5%',
      tenure: '2 months',
      repayment: 'ETB 1,800',
    },
    {
      id: 3,
      status: 'disbursed' as ApplicationStatus,
      title: 'Loan Disbursed!',
      subtitle: 'Accept by June 20, 2026',
      maxAmount: 'ETB 120,000',
      interest: '8.5%',
      tenure: '3 months',
      repayment: 'ETB 3,780',
    },
    {
      id: 4,
      status: 'disbursed' as ApplicationStatus,
      title: 'Loan Disbursed!',
      subtitle: 'Accept by June 22, 2026',
      maxAmount: 'ETB 85,000',
      interest: '9.0%',
      tenure: '2 months',
      repayment: 'ETB 2,950',
    },
    {
      id: 5,
      status: 'rejected' as ApplicationStatus,
      title: 'Loan Rejected',
      subtitle: 'Rejected on June 5, 2026',
      maxAmount: 'ETB 300,000',
      interest: '11.0%',
      tenure: '3 months',
      repayment: 'ETB 9,200',
    }
  ];

  const filteredApplications = activeTab === 'total'
    ? applications
    : applications.filter(app => app.status === activeTab);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Status</h2>
        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
          <button
            onClick={() => onTabChange('total')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${activeTab === 'total' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Total <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">5</span>
          </button>
          <button
            onClick={() => onTabChange('review')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${activeTab === 'review' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Under Review <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
          </button>
          <button
            onClick={() => onTabChange('disbursed')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${activeTab === 'disbursed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Disbursed <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
          </button>
          <button
            onClick={() => onTabChange('rejected')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${activeTab === 'rejected' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Rejected <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">1</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {filteredApplications.map(app => (
          <ApplicationCard key={app.id} {...app} />
        ))}
      </div>
    </div>
  );
}
