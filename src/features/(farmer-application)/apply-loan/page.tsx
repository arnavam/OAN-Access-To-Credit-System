import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Globe } from 'lucide-react';
import { mockLoans } from '@/features/(farmer-application)/discover-loans/data/mockLoans';
import ApplicationHeader from './components/ApplicationHeader';
import ConsentManagement from './components/ConsentManagement';
import CreditInformation from './components/CreditInformation';
import AdditionalNotes from './components/AdditionalNotes';
import AuditHistory from './components/AuditHistory';

interface ApplyLoanPageProps {
  id: string;
}

export default function ApplyLoanPage({ id }: ApplyLoanPageProps) {
  const loan = mockLoans.find(l => l.id === id) || mockLoans[0]; // fallback to first loan if id doesn't match

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">


      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-0">
        <div className="w-full mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/discover-loans" className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>

          <ApplicationHeader loan={loan} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form Content */}
            <div className="lg:col-span-2">
              <ConsentManagement />
              <CreditInformation />
              <AdditionalNotes />
            </div>

            {/* Right Column - Audit History */}
            <div className="lg:col-span-1">
              <AuditHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
