"use client";
import { useMemo } from 'react';
import { NO_VALUE, formatRate, formatTenure } from '../../format';
import type { FarmerLoanApplication } from '../../types';
import { countByStatus, type ApplicationTab } from '../counts';
import ApplicationCard, { ApplicationStatus } from './ApplicationCard';

const TABS: ReadonlyArray<{ value: ApplicationTab; label: string }> = [
  { value: 'total', label: 'Total' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

export default function ApplicationList({ activeTab, onTabChange, applications }: { activeTab: string, onTabChange: (tab: string) => void, applications: FarmerLoanApplication[] }) {

  const counts = useMemo(() => countByStatus(applications), [applications]);

  const filteredApplications = activeTab === 'total'
    ? applications
    : applications.filter(app => app.status === activeTab);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Status</h2>
        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onTabChange(value)}
              aria-pressed={activeTab === value}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${activeTab === value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {label} <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{counts[value]}</span>
            </button>
          ))}
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
            // The application's own snapshotted terms — never the product's
            // current ones, and never a stand-in pulled from another field.
            // These two slots used to be filled with `app.bank` and a second
            // copy of `app.status`, so every card advertised its bank's name as
            // an interest rate.
            interest={formatRate(app.interest_rate)}
            tenure={formatTenure(app.tenure_months)}
            // No repayment schedule is stored on an application yet. A dash says
            // so; anything else here would be invented.
            repayment={NO_VALUE}
          />
        ))}
      </div>
    </div>
  );
}
