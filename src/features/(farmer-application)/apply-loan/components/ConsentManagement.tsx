"use client";
import { useModalA11y } from '@/hooks/useModalA11y';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import SignedConsentForm from './SignedConsentForm';

const ConsentItem = ({ label, initialChecked }: { label: string; initialChecked: boolean }) => {
  const [checked, setChecked] = useState(initialChecked);

  return (
    <div
      onClick={() => setChecked(!checked)}
      className={`flex items-center gap-3 border p-4 rounded-xl cursor-pointer transition-all duration-300 ${checked ? 'border-[#16A34A]' : 'border-[#22c55e]/40 hover:border-[#16A34A]'
        }`}
    >
      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all duration-300 border-2 ${checked ? 'bg-[#16A34A] border-[#16A34A] text-white' : 'bg-white border-gray-200'
        }`}>
        <Check className={`w-3.5 h-3.5 transition-transform duration-300 ${checked ? 'scale-100' : 'scale-0'}`} strokeWidth={3} />
      </div>
      <span className={`text-sm font-medium transition-colors duration-300 ${checked ? 'text-gray-800' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  );
};

export default function ConsentManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(false);

  const handleToggle = () => {
    if (!isConsentChecked) {
      setIsConsentChecked(true);
      setIsModalOpen(true);
    } else {
      setIsConsentChecked(false);
    }
  };

  const handleModalSubmit = () => {
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsConsentChecked(false);
    setIsModalOpen(false);
  };

  const dialogRef = useModalA11y<HTMLDivElement>(isModalOpen, handleModalClose);

  return (
    <>
      <div className="bg-white rounded-2xl p-6 mb-6 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
        <div className="border-b border-gray-200 pb-4 mb-6 -mx-6 px-6">
          <h3 className="text-lg font-bold text-gray-900">Consent Management</h3>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <label htmlFor="apply-loan-farmer-id" className="block text-sm font-medium text-gray-700 mb-2">Farmer ID</label>
            <input
              id="apply-loan-farmer-id"
              type="text"
              value="12233441122"
              readOnly
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-600 focus:outline-none"
            />

            <div className="mt-6 flex items-start gap-3">
              <button
                type="button"
                onClick={handleToggle}
                className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all duration-300 border-2 ${isConsentChecked
                  ? 'bg-[#16A34A] border-[#16A34A] text-white'
                  : 'bg-white border-gray-300 hover:border-[#16A34A]'
                  }`}
              >
                <Check className={`w-3.5 h-3.5 transition-transform duration-300 ${isConsentChecked ? 'scale-100' : 'scale-0'}`} strokeWidth={3} />
              </button>
              <p className="text-sm text-gray-500 leading-relaxed cursor-pointer" onClick={handleToggle}>
                I hereby confirm my agreement to share personal data with the specified bank(s) for purposes of obtaining credit services on the platform.
              </p>
            </div>
          </div>

          <div>
            <SignedConsentForm />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-review-modal-title"
            tabIndex={-1}
            className="bg-white rounded-xl shadow-2xl w-[550px] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 id="consent-review-modal-title" className="text-lg font-bold text-gray-900">Consent</h2>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5 hover:text-red-500 hover:rotate-90 hover:scale-110 transition-transform duration-200" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-sm font-bold text-gray-900 mb-6">Data shared as part of Agri Loan consent:</p>

              <div className="grid grid-cols-2 gap-4">
                <ConsentItem label="Basic Profile" initialChecked={true} />
                <ConsentItem label="Land Information" initialChecked={true} />
                <ConsentItem label="Crop and Livestock Information" initialChecked={true} />
                <ConsentItem label="Socio Economic Information" initialChecked={true} />
                <ConsentItem label="Agronomic Data" initialChecked={false} />
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleModalSubmit}
                  className="bg-[#16A34A] hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-bold text-sm transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
