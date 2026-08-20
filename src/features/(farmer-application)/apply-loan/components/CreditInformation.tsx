"use client";

import { ChevronDown, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function CreditInformation() {
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'Crop Loan':
        return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'Equipment Loan':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Livestock Loan':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const [isLoanTypeOpen, setIsLoanTypeOpen] = useState(false);
  const [selectedLoanType, setSelectedLoanType] = useState('Crop Loan');

  const [isLoanAmountOpen, setIsLoanAmountOpen] = useState(false);
  const [selectedLoanAmount, setSelectedLoanAmount] = useState('350,000');

  const [loanPurpose, setLoanPurpose] = useState('');
  // Starts empty. It used to be seeded with a row describing a meeting at a
  // cooperative office that never happened, shown to every farmer as though it
  // were their own entry.
  //
  // NOTE: nothing on this form is submitted yet — no endpoint is called and the
  // rows live only in this component's state. `farmerApi.startApplication` is
  // what turns a farmer's intent into an A2C Loan Application, and it is not
  // wired up here.
  const [tableData, setTableData] = useState<{ type: string; amount: string; purpose: string }[]>([]);

  const handleAdd = () => {
    if (!loanPurpose.trim()) return;
    setTableData([
      ...tableData,
      {
        type: selectedLoanType,
        amount: selectedLoanAmount.includes('ETB') ? selectedLoanAmount : `ETB ${selectedLoanAmount}`,
        purpose: loanPurpose,
      }
    ]);
    setLoanPurpose('');
  };

  const loanTypeRef = useRef<HTMLDivElement>(null);
  const loanAmountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (loanTypeRef.current && !loanTypeRef.current.contains(event.target as Node)) {
        setIsLoanTypeOpen(false);
      }
      if (loanAmountRef.current && !loanAmountRef.current.contains(event.target as Node)) {
        setIsLoanAmountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="bg-white rounded-2xl p-6 mb-6 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      <div className="border-b border-gray-200 pb-4 mb-6 -mx-6 px-6">
        <h3 className="text-lg font-bold text-gray-900">Credit Information</h3>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-5 mb-8 items-end">
        <div ref={loanTypeRef} className="relative">
          <label id="loan-type-label" className="block text-sm font-medium text-gray-700 mb-2">Loan Type <span className="text-red-500">*</span></label>
          <button
            type="button"
            aria-labelledby="loan-type-label"
            aria-haspopup="listbox"
            aria-expanded={isLoanTypeOpen}
            onClick={() => setIsLoanTypeOpen(!isLoanTypeOpen)}
            className={`w-full bg-white border ${isLoanTypeOpen ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-200'} rounded-lg px-4 py-2.5 text-gray-900 cursor-pointer transition-all flex items-center justify-between`}
          >
            <span>{selectedLoanType}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isLoanTypeOpen ? 'rotate-180' : ''}`} />
          </button>
          {isLoanTypeOpen && (
            <div role="listbox" aria-label="Loan Type" className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
              {['Crop Loan', 'Equipment Loan', 'Livestock Loan'].map((type) => (
                <button
                  key={type}
                  type="button"
                  role="option"
                  aria-selected={selectedLoanType === type}
                  onClick={() => {
                    setSelectedLoanType(type);
                    setIsLoanTypeOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={loanAmountRef} className="relative">
          <label id="loan-amount-label" className="block text-sm font-medium text-gray-700 mb-2">Loan Amount <span className="text-red-500">*</span></label>
          <button
            type="button"
            aria-labelledby="loan-amount-label"
            aria-haspopup="listbox"
            aria-expanded={isLoanAmountOpen}
            onClick={() => setIsLoanAmountOpen(!isLoanAmountOpen)}
            className={`w-full bg-white border ${isLoanAmountOpen ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-200'} rounded-lg px-4 py-2.5 text-gray-900 cursor-pointer transition-all flex items-center justify-between`}
          >
            <span>{selectedLoanAmount}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isLoanAmountOpen ? 'rotate-180' : ''}`} />
          </button>
          {isLoanAmountOpen && (
            <div role="listbox" aria-label="Loan Amount" className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
              {['350,000', '200,000', '150,000', '50,000'].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  role="option"
                  aria-selected={selectedLoanAmount === amount}
                  onClick={() => {
                    setSelectedLoanAmount(amount);
                    setIsLoanAmountOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 transition-colors"
                >
                  {amount}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full">
          <label htmlFor="loan-purpose-input" className="block text-sm font-medium text-gray-700 mb-2">Loan Purpose <span className="text-red-500">*</span></label>
          <input
            id="loan-purpose-input"
            type="text"
            value={loanPurpose}
            onChange={(e) => setLoanPurpose(e.target.value)}
            placeholder="Enter Loan Purpose"
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-green-500 placeholder:text-gray-400 transition-all"
          />
        </div>

        <div>
          <button
            onClick={handleAdd}
            className="bg-[#16A34A] hover:bg-green-700 text-white font-bold h-[44px] px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-sm w-max"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500 w-1/4">Loan Type</th>
              <th className="px-6 py-3 font-medium text-gray-500 w-1/4">Loan Amount</th>
              <th className="px-6 py-3 font-medium text-gray-500 w-1/2">Purpose Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tableData.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400 font-medium">
                  Nothing added yet.
                </td>
              </tr>
            )}
            {tableData.map((row, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getBadgeStyle(row.type)}`}>
                    {row.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {row.amount}
                </td>
                <td className="px-6 py-4 text-gray-500 truncate max-w-[300px]">
                  {row.purpose}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
