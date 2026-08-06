import { Award, FileText, Users, XCircle } from 'lucide-react';

export default function ApplicationSummary({ activeTab: _activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {/* Total Card */}
      <div
        onClick={() => onTabChange('total')}
        className={`bg-white rounded-xl p-5 flex items-center justify-between border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
      >
        <div>
          <p className="text-md text-gray-500 font-semibold mb-1">Total</p>
          <h2 className="text-3xl font-bold text-gray-900">5</h2>
        </div>
        <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-200 transition-all duration-300">
          <Users className="w-8 h-8 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
        </div>
      </div>

      {/* Under Review Card */}
      <div
        onClick={() => onTabChange('review')}
        className={`bg-white rounded-xl p-5 flex items-center justify-between border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
      >
        <div>
          <p className="text-md text-gray-500 font-semibold mb-1">Under Review</p>
          <h2 className="text-3xl font-bold text-gray-900">2</h2>
        </div>
        <div className="w-16 h-16 rounded-xl bg-cyan-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-cyan-200 transition-all duration-300">
          <FileText className="w-8 h-8 text-cyan-600 group-hover:-rotate-12 transition-transform duration-300" />
        </div>
      </div>

      {/* Disbursed Card */}
      <div
        onClick={() => onTabChange('disbursed')}
        className={`bg-white rounded-xl p-5 flex items-center justify-between border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
      >
        <div>
          <p className="text-md text-gray-500 font-semibold mb-1">Disbursed</p>
          <h2 className="text-3xl font-bold text-gray-900">2</h2>
        </div>
        <div className="w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-green-200 transition-all duration-300">
          <Award className="w-8 h-8 text-green-600 group-hover:rotate-12 transition-transform duration-300" />
        </div>
      </div>

      {/* Rejected Card */}
      <div
        onClick={() => onTabChange('rejected')}
        className={`bg-white rounded-xl p-5 flex items-center justify-between border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
      >
        <div>
          <p className="text-md text-gray-500 font-semibold mb-1">Rejected</p>
          <h2 className="text-3xl font-bold text-gray-900">1</h2>
        </div>
        <div className="w-16 h-16 rounded-xl bg-red-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-red-200 transition-all duration-300">
          <XCircle className="w-8 h-8 text-red-600 group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );
}
