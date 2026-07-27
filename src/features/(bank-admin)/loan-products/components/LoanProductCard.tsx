'use client';
import { BarChart3, LucideIcon, Package, PawPrint, Pencil, Sprout, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteLoanProductModal } from './DeleteLoanProductModal';
import { EditLoanProductModal } from './EditLoanProductModal';

export type ProductCategory = 'seed' | 'input' | 'livestock' | 'equipment';
export type ProductStatus = 'Active' | 'Pending Approved' | 'Inactive';

export interface LoanProduct {
  id: string;
  title: string;
  category: ProductCategory;
  status: ProductStatus;
  amount: string;
  interestValue: string;
  interestLabel: string;
  tenureValue: string;
  tenureLabel: string;
  applicantsValue: number;
  applicantsLabel: string;
}

const categoryStyles: Record<ProductCategory, { bg: string, text: string, border: string, icon: LucideIcon, pillBg: string, cardBg: string }> = {
  seed: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-100', icon: Sprout, pillBg: 'bg-green-100', cardBg: 'bg-gradient-to-r from-green-50/80 to-white border-green-100' },
  input: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-100', icon: Package, pillBg: 'bg-blue-100', cardBg: 'bg-gradient-to-r from-blue-50/80 to-white border-blue-100' },
  livestock: { bg: 'bg-orange-100', text: 'text-orange-500', border: 'border-orange-100', icon: PawPrint, pillBg: 'bg-orange-100', cardBg: 'bg-gradient-to-r from-orange-50/80 to-white border-orange-100' },
  equipment: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-100', icon: BarChart3, pillBg: 'bg-purple-100', cardBg: 'bg-gradient-to-r from-purple-50/80 to-white border-purple-100' }
};

const statusStyles: Record<ProductStatus, { text: string, border: string, dot: string, bg: string }> = {
  'Active': { text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', bg: 'bg-green-100' },
  'Pending Approved': { text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', bg: 'bg-orange-100' },
  'Inactive': { text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500', bg: 'bg-gray-100' }
};

export const LoanProductCard = ({ product }: { product: LoanProduct }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const styles = categoryStyles[product.category];
  const sStyles = statusStyles[product.status];
  const Icon = styles.icon;

  return (
    <>
      <div className={`${styles.cardBg} p-4 flex items-center justify-between border shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${styles.bg} ${styles.text}`}>

            <Icon size={24} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-gray-900">{product.title}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles.pillBg} ${styles.text}`}>
                {product.category}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${sStyles.bg} ${sStyles.border} ${sStyles.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sStyles.dot}`}></span>
                {product.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-sm bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1">
                <span className="font-bold text-gray-900">{product.amount}</span>
              </div>
              <div className="flex items-center gap-1 text-sm bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1">
                <span className="font-bold text-gray-900">{product.interestValue}</span>
                <span className="text-gray-500">{product.interestLabel}</span>
              </div>
              <div className="flex items-center gap-1 text-sm bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1">
                <span className="font-bold text-gray-900">{product.tenureValue}</span>
                <span className="text-gray-500">{product.tenureLabel}</span>
              </div>
              <div className="flex items-center gap-1 text-sm bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1">
                <span className="font-bold text-gray-900">{product.applicantsValue}</span>
                <span className="text-gray-500">{product.applicantsLabel}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-8 h-8 rounded-full border border-blue-100 bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-8 h-8 rounded-full border border-red-100 bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <EditLoanProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={product}
      />

      <DeleteLoanProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        product={product}
      />
    </>
  );
};
