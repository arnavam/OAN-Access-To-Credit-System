import { Landmark } from 'lucide-react';
import { OrganisationDocumentsCard } from './OrganisationDocumentsCard';
import { OrganizationContactsCard } from './OrganizationContactsCard';

export const KycComplianceContent = () => {
  return (
    <div className="w-full mx-auto space-y-6">

      {/* Header Card */}
      <div className="bg-white p-6 flex items-center gap-4 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
          <Landmark size={24} />
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">Commercial Bank of Ethiopia</h2>
          <p className="text-[14px] text-gray-500">Bank Admin Portal - Loan Product Management</p>
        </div>
      </div>

      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <OrganisationDocumentsCard />
        <OrganizationContactsCard />
      </div>

    </div>
  );
};
