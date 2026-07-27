'use client';
import { BarChart3, Check, LucideIcon, Package, PawPrint, Sprout, X as XIcon } from 'lucide-react';
import { useState } from 'react';
import { ApproveProductModal } from './ApproveProductModal';
import { RejectProductModal } from './RejectProductModal';

export interface ApprovalItem {
  id: string;
  title: string;
  category: string;
  status: string;
  amount: string;
  interest: string;
  tenure: string;
  applicants: number;
  submittedBy: string;
  agentId: string;
  date: string;
}

const categoryStyles: Record<string, { bg: string, text: string, border: string, icon: LucideIcon, pillBg: string, cardBg: string }> = {
  seed: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-100', icon: Sprout, pillBg: 'bg-green-100', cardBg: 'bg-gradient-to-r from-green-50/80 to-white border-green-100' },
  input: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-100', icon: Package, pillBg: 'bg-blue-100', cardBg: 'bg-gradient-to-r from-blue-50/80 to-white border-blue-100' },
  livestock: { bg: 'bg-orange-100', text: 'text-orange-500', border: 'border-orange-100', icon: PawPrint, pillBg: 'bg-orange-100', cardBg: 'bg-gradient-to-r from-orange-50/80 to-white border-orange-100' },
  equipment: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-100', icon: BarChart3, pillBg: 'bg-purple-100', cardBg: 'bg-gradient-to-r from-purple-50/80 to-white border-purple-100' }
};

const statusStyles: Record<string, { text: string, border: string, dot: string, bg: string }> = {
  'Active': { text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', bg: 'bg-green-100' },
  'Pending Approved': { text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', bg: 'bg-orange-100' },
  'Inactive': { text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500', bg: 'bg-gray-100' }
};

export const ProductApprovalCard = ({ item }: { item: ApprovalItem }) => {
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const defaultCategoryStyle = { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-100', icon: BarChart3, pillBg: 'bg-purple-100', cardBg: 'bg-gradient-to-r from-purple-50/80 to-white border-purple-100' };
  const defaultStatusStyle = { text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', bg: 'bg-orange-100' };
  const styles = categoryStyles[item.category] || categoryStyles['equipment'] || defaultCategoryStyle;
  const sStyles = statusStyles[item.status] || statusStyles['Pending Approved'] || defaultStatusStyle;
  const Icon = styles.icon;

  return (
    <>
      <div className={`${styles.cardBg} p-5 flex items-center justify-between border shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${styles.bg} ${styles.text}`}>
            <Icon size={24} />
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <h3 className="text-[16px] font-bold text-gray-900">{item.title}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${styles.pillBg} ${styles.text}`}>
                {item.category}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold border flex items-center gap-1.5 ${sStyles.bg} ${sStyles.border} ${sStyles.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sStyles.dot}`}></span>
                {item.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[14px]">
              <span className="font-bold text-gray-900">{item.amount}</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span><span className="font-bold text-gray-900">{item.interest}</span> <span className="text-gray-500">p.a.</span></span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span><span className="font-bold text-gray-900">{item.tenure}</span> <span className="text-gray-500">tenure</span></span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span><span className="font-bold text-gray-900">{item.applicants}</span> <span className="text-gray-500">applicants</span></span>
            </div>
            <div className="text-[14px] text-gray-500">
              Submitted by <span className="font-semibold text-gray-700">{item.submittedBy}</span> · {item.agentId} · {item.date}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRejectModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <XIcon size={16} />
            <span>Reject</span>
          </button>
          <button
            onClick={() => setIsApproveModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] hover:bg-[#15803d] text-white rounded-lg text-[14px] font-bold transition-colors shadow-sm"
          >
            <Check size={16} strokeWidth={2.5} />
            <span>Approve</span>
          </button>
        </div>
      </div>

      <ApproveProductModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        product={item}
      />

      <RejectProductModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        product={item}
      />
    </>
  );
};
