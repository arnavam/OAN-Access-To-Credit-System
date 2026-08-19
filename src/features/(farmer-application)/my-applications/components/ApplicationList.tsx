"use client";
import type { FarmerLoanApplication } from '../../types';
import ApplicationCard, { ApplicationStatus } from './ApplicationCard';

export default function ApplicationList({ activeTab, onTabChange, applications }: { activeTab: string, onTabChange: (tab: string) => void, applications: FarmerLoanApplication[] }) {
  
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
            Total <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{applications.length}</span>
          </button>
          <button
            onClick={() => onTabChange('Draft')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${activeTab === 'Draft' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Draft <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{applications.filter(a => a.status === 'Draft').length}</span>
          </button>
          <button
            onClick={() => onTabChange('Processing')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${activeTab === 'Processing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Processing <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{applications.filter(a => a.status === 'Processing').length}</span>
          </button>
          <button
            onClick={() => onTabChange('Approved')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${activeTab === 'Approved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Approved <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{applications.filter(a => a.status === 'Approved').length}</span>
          </button>
          <button
            onClick={() => onTabChange('Rejected')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${activeTab === 'Rejected' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Rejected <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{applications.filter(a => a.status === 'Rejected').length}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {filteredApplications.map((app) => (
          <ApplicationCard
            key={app.application_id}
            status={app.status as ApplicationStatus}
            title={app.loan_product_name}
            subtitle={`Created on ${app.creation.split(' ')[0]}`}
            maxAmount={`ETB ${app.requested_amount.toLocaleString()}`}
            interest={app.bank}
            tenure={app.status}
            repayment="-"
          />
        ))}
      </div>
    </div>
  );
}
