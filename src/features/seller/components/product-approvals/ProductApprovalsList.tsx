import { Landmark } from 'lucide-react';
import { ApprovalItem, ProductApprovalCard } from './ProductApprovalCard';

const mockApprovals: ApprovalItem[] = [
  {
    id: '1',
    title: 'CBE Equipment & Irrigation Loan',
    category: 'equipment',
    status: 'Pending Approved',
    amount: 'ETB 50,000–500,000',
    interest: '10.5%',
    tenure: '36m',
    applicants: 21,
    submittedBy: 'Dawit Mengistu',
    agentId: 'AGT-8492',
    date: 'Jul 12, 2026'
  },
  {
    id: '2',
    title: 'CBE Equipment & Irrigation Loan',
    category: 'equipment',
    status: 'Pending Approved',
    amount: 'ETB 50,000–500,000',
    interest: '10.5%',
    tenure: '36m',
    applicants: 21,
    submittedBy: 'Dawit Mengistu',
    agentId: 'AGT-8492',
    date: 'Jul 12, 2026'
  }
];

export const ProductApprovalsList = () => {
  return (
    <div className="w-full mx-auto space-y-6">

      {/* Header Card */}
      <div className="bg-white rounded-xl border-gray-200 p-6 shadow-sm border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Landmark size={24} />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-gray-900">Commercial Bank of Ethiopia</h2>
            <p className="text-[14px] text-gray-500">Bank Admin Portal - Loan Product Management</p>
          </div>
        </div>
        <p className="text-[14px] text-gray-600 border-t border-gray-200 pt-4">
          Loan products created by bank agents require your approval before they are published to farmers.
        </p>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {mockApprovals.map((item) => (
          <ProductApprovalCard key={item.id} item={item} />
        ))}
      </div>

    </div>
  );
};
