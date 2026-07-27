'use client';
import { Inbox, ShieldCheck } from 'lucide-react';

export function LoanApplicationsTable() {
  return (
    <div className="bg-white border border-[#F1F3F4] rounded-xl shadow-sm flex flex-col min-h-[500px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      {/* Table Header */}
      <div className="p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-[16px] font-bold text-[#1F2937] mb-1">Loan Applications</h3>
          <p className="text-[14px] text-[#6B7280]">
            Farmers who applied against your published loan products — via OAN Farmer Profiling System
          </p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700">
          <ShieldCheck size={16} />
          <span className="text-[12px] font-bold">FPS Verified</span>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#00C48C]/20 rounded-full animate-ping opacity-75" style={{ animationDuration: '3s' }}></div>
          <div className="relative w-16 h-16 bg-[#E6F9F3] rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10">
            <Inbox className="w-8 h-8 text-[#00C48C] animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
        </div>
        <h3 className="text-[#1F2937] text-[18px] font-bold mb-2">No applications yet</h3>
        <p className="text-[#6B7280] text-[14px] max-w-[380px] text-center leading-relaxed">
          Farmer loan applications routed through the OAN Farmer Profiling System will appear here once your loan products are active and published.
        </p>
      </div>
    </div>
  );
}
