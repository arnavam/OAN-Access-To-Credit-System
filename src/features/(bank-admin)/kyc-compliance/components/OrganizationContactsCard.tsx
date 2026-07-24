'use client';
import React, { useState } from 'react';
import { UserCheck, Check } from 'lucide-react';

export function OrganizationContactsCard() {
  const [groName, setGroName] = useState('');
  const [groMobile, setGroMobile] = useState('');
  const [opsName, setOpsName] = useState('');
  const [opsMobile, setOpsMobile] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!groName.trim() || !groMobile.trim() || !opsName.trim() || !opsMobile.trim()) {
      setError('Please fill in all fields');
      setIsSaved(false);
      return;
    }
    setError('');
    setIsSaved(true);
    // Optional: Auto-hide success message after 3 seconds
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white flex flex-col w-full h-full border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      <div className="p-6 border-b border-gray-200 flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
          <UserCheck size={20} />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-gray-900">Organization Contacts</h2>
          <p className="text-[14px] text-gray-500">Nominate your Grievance Redressal Officer and Operations contact.</p>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-gray-900">Grievance Redressal Officer (GRO)</label>
              <input
                type="text"
                placeholder="Enter Full Name"
                value={groName}
                onChange={(e) => setGroName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-[14px] transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-gray-900">Mobile No.</label>
              <input
                type="text"
                placeholder="Enter Mobile No."
                value={groMobile}
                onChange={(e) => setGroMobile(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-[14px] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-gray-900">Operations Contact</label>
              <input
                type="text"
                placeholder="Enter Full Name"
                value={opsName}
                onChange={(e) => setOpsName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-[14px] transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-gray-900">Mobile No.</label>
              <input
                type="text"
                placeholder="Enter Mobile No."
                value={opsMobile}
                onChange={(e) => setOpsMobile(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-[14px] transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 mt-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white rounded-lg text-[14px] font-bold transition-colors shadow-sm"
            >
              <Check size={18} strokeWidth={2.5} />
              <span>Save Contacts</span>
            </button>
            {isSaved && (
              <div className="flex items-center gap-2 text-[#16A34A] font-bold text-[14px] animate-in fade-in duration-300">
                <div className="w-2 h-2 rounded-full bg-[#16A34A]"></div>
                Contacts saved
              </div>
            )}
            {error && !isSaved && (
              <div className="text-red-500 font-medium text-[14px] animate-in fade-in duration-300">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
