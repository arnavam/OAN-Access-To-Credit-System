"use client";
import { useMemo } from 'react';
import { NO_VALUE, formatRate, formatTenure } from '../../format';
import type { FarmerLoanApplication } from '../../types';
import { ALL_TAB, filterByTab, type StageTab } from '../counts';
import ApplicationCard from './ApplicationCard';

export default function ApplicationList({
  activeTab,
  onTabChange,
  applications,
  tabs,
  onRefresh,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  applications: FarmerLoanApplication[];
  /** One per stage, from `buildStageTabs`. Never a hardcoded list. */
  tabs: StageTab[];
  onRefresh?: () => void;
}) {
  const filteredApplications = useMemo(
    () => filterByTab(applications, activeTab),
    [applications, activeTab]
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 shrink-0">Status</h2>
        <div className="flex items-center gap-1 overflow-x-auto bg-gray-50 rounded-lg p-1 border border-gray-100">
          <TabButton
            label="Total"
            count={applications.length}
            isActive={activeTab === ALL_TAB}
            onClick={() => onTabChange(ALL_TAB)}
          />
          {tabs.map((tab) => (
            <TabButton
              key={tab.value}
              label={tab.label}
              count={tab.count}
              isActive={activeTab === tab.value}
              onClick={() => onTabChange(tab.value)}
            />
          ))}
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">
          {activeTab === ALL_TAB
            ? 'You have not applied for a loan yet.'
            : `Nothing is at ${activeTab} right now.`}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredApplications.map((app) => (
            <ApplicationCard
              key={app.application_id}
              applicationId={app.application_id}
              application={app}
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
              onApplicationUpdated={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={`flex shrink-0 items-center gap-1.5 px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
    >
      {label}{' '}
      <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
        {count}
      </span>
    </button>
  );
}
