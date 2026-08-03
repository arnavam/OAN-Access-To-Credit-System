import { History, Phone, User, UserCheck } from 'lucide-react';

export default function AuditHistory() {
  return (
    <div className="bg-white rounded-2xl p-6 sticky top-6 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      <div className="border-b border-gray-200 pb-4 mb-6 -mx-6 px-6 flex items-center gap-2">
        <History className="w-5 h-5 text-gray-900" />
        <h3 className="text-lg font-bold text-gray-900">Audit History</h3>
      </div>

      <div className="relative pl-3 mt-8">
        {/* Vertical Line */}
        <div className="absolute left-[1.35rem] top-2 bottom-6 w-px bg-gray-200"></div>

        {/* Node 1 */}
        <div className="relative mb-8">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0 relative z-10">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 pt-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-gray-900">Loan Applications Created</h4>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">May 20, 2026</span>
              </div>
              <p className="text-xs text-gray-500">Imported from Bishoftu Cooperative List</p>
            </div>
          </div>
        </div>

        {/* Node 2 */}
        <div className="relative mb-8">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-white border border-blue-900 text-blue-900 flex items-center justify-center shrink-0 relative z-10">
              <Phone className="w-4 h-4" />
            </div>
            <div className="flex-1 pt-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-gray-900">Initial Contact</h4>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">May 22, 2026</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Called to verify interest in Fertilizer Campaign.</p>
              <span className="inline-block bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Node 3 */}
        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-green-500 text-green-500 flex items-center justify-center shrink-0 relative z-10">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 pt-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-gray-900">Assigned to Owner</h4>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">Today, 09:15 AM</span>
              </div>
              <p className="text-xs text-gray-500">Assigned to Abebe Kebede</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
