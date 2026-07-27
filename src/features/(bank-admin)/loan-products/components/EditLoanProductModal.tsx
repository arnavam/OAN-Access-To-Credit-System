'use client';
import { LoanProductCreatedSuccess } from '@/app/(dashboard)/(bank-admin)/dashboard/components/LoanProductCreatedSuccess';
import { LoanTypeDropdown } from '@/app/(dashboard)/(bank-admin)/dashboard/components/LoanTypeDropdown';
import { Portal } from '@/components/Portal';
import { Loader2, Package, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LoanProduct } from './LoanProductCard';

interface EditLoanProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: LoanProduct | null;
}

export function EditLoanProductModal({ isOpen, onClose, product }: EditLoanProductModalProps) {
  const [selectedLoanTypes, setSelectedLoanTypes] = useState<string[]>([]);
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>(['Land Registry', 'Livestock Registry']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [productName, setProductName] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Update form when product changes
  useEffect(() => {
    if (product) {
      setProductName(product.title || '');
      setSelectedLoanTypes(product.category ? [product.category] : []);
      setInterestRate(product.interestValue?.replace(/[^0-9.]/g, '') || '');
      setTenure(product.tenureValue?.replace(/[^0-9]/g, '') || '');
      
      // Try to parse amount string (e.g., "10,000 - 25,000 ETB")
      const amountParts = product.amount?.split('-');
      if (amountParts && amountParts[0] && amountParts[1]) {
        setMinAmount(amountParts[0].replace(/[^0-9,]/g, ''));
        setMaxAmount(amountParts[1].replace(/[^0-9,]/g, ''));
      } else {
        setMinAmount('10,000');
        setMaxAmount('25,000');
      }
    }
  }, [product]);

  const handleSaveData = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  const toggleCriterion = (criterion: string) => {
    if (selectedCriteria.includes(criterion)) {
      setSelectedCriteria(prev => prev.filter(c => c !== criterion));
    } else {
      setSelectedCriteria(prev => [...prev, criterion]);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white rounded-xl shadow-xl w-full flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden transition-all ${isSuccess ? 'max-w-[520px]' : 'max-w-[700px]'}`}>

        {isSuccess ? (
          <LoanProductCreatedSuccess onDone={() => { onClose(); setTimeout(() => setIsSuccess(false), 300); }} />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 shrink-0 aspect-square bg-[#E6F9F3] rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-[#00C48C]" />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-[#1F2937]">Edit Loan Product</h2>
                  <p className="text-[14px] text-[#6B7280]">Products you create are published immediately as Active.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <X className="hover:text-red-500 hover:rotate-90 hover:scale-110 transition-transform duration-200" size={24} />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[14px] font-bold text-[#1F2937]">Product Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter Product Name" 
                  className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C48C] focus:border-[#00C48C] text-[14px]" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] font-bold text-[#1F2937]">Loan Type <span className="text-red-500">*</span></label>
                <LoanTypeDropdown selectedTypes={selectedLoanTypes} onChange={setSelectedLoanTypes} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[14px] font-bold text-[#1F2937]">Interest rate (% p.a.) <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="Enter Interest rate (% p.a.)" 
                    className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C48C] focus:border-[#00C48C] text-[14px]" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[14px] font-bold text-[#1F2937]">Tenure (months)</label>
                  <input 
                    type="text" 
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    placeholder="Enter Tenure (months)" 
                    className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C48C] focus:border-[#00C48C] text-[14px]" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[14px] font-bold text-[#1F2937]">Min amount (ETB)</label>
                  <input 
                    type="text" 
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="Enter Min amount (ETB)" 
                    className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C48C] focus:border-[#00C48C] text-[14px]" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[14px] font-bold text-[#1F2937]">Max amount (ETB)</label>
                  <input 
                    type="text" 
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    placeholder="Enter Max amount (ETB)" 
                    className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C48C] focus:border-[#00C48C] text-[14px]" 
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-[15px] font-bold text-[#1F2937]">Eligibility Criteria — Auto-applied to consented profiles</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    className={`rounded-xl p-4 cursor-pointer transition-all duration-200 border-2 ${selectedCriteria.includes('Land Registry') ? 'bg-[#FEF9C3] border-[#FDE047] shadow-sm transform scale-[1.02]' : 'bg-white border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300'}`}
                    onClick={() => toggleCriterion('Land Registry')}
                  >
                    <div className={`text-[14px] font-bold mb-2 ${selectedCriteria.includes('Land Registry') ? 'text-[#854D0E]' : 'text-gray-600'}`}>Land Registry</div>
                    <div className={`text-[14px] font-mono opacity-90 ${selectedCriteria.includes('Land Registry') ? 'text-[#854D0E]' : 'text-gray-500'}`}>land_holding &gt; 1 ha</div>
                  </div>

                  <div
                    className={`rounded-xl p-4 cursor-pointer transition-all duration-200 border-2 ${selectedCriteria.includes('Crop Registry') ? 'bg-[#ECFDF5] border-[#6EE7B7] shadow-sm transform scale-[1.02]' : 'bg-white border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300'}`}
                    onClick={() => toggleCriterion('Crop Registry')}
                  >
                    <div className={`text-[14px] font-bold mb-2 ${selectedCriteria.includes('Crop Registry') ? 'text-[#047857]' : 'text-gray-600'}`}>Crop Registry</div>
                    <div className={`text-[14px] font-mono opacity-90 ${selectedCriteria.includes('Crop Registry') ? 'text-[#047857]' : 'text-gray-500'}`}>harvest_yield &gt; 3 t/r</div>
                  </div>

                  <div
                    className={`rounded-xl p-4 cursor-pointer transition-all duration-200 border-2 ${selectedCriteria.includes('Livestock Registry') ? 'bg-[#FAF5FF] border-[#D8B4FE] shadow-sm transform scale-[1.02]' : 'bg-white border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300'}`}
                    onClick={() => toggleCriterion('Livestock Registry')}
                  >
                    <div className={`text-[14px] font-bold mb-2 ${selectedCriteria.includes('Livestock Registry') ? 'text-[#6D28D9]' : 'text-gray-600'}`}>Livestock Registry</div>
                    <div className={`text-[14px] font-mono opacity-90 ${selectedCriteria.includes('Livestock Registry') ? 'text-[#6D28D9]' : 'text-gray-500'}`}>livestock_count &gt; 8</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#E5E7EB] flex items-center justify-end space-x-4">
              <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2.5 border border-[#D1D5DB] rounded-lg text-[14px] font-bold text-[#374151] hover:bg-white transition-colors hover:shadow-sm disabled:opacity-50 bg-white">
                Cancel
              </button>
              <button
                onClick={handleSaveData}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white rounded-lg text-[14px] font-bold transition-colors flex items-center space-x-2 disabled:opacity-80 disabled:cursor-not-allowed min-w-[130px] justify-center shadow-sm"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                <span>{isSubmitting ? 'Saving...' : 'Save Data'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </Portal>
  );
}
