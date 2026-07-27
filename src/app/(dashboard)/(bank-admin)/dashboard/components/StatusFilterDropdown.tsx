export const STATUS_OPTIONS = ['In Review', 'Pending', 'In Underwriting', 'Approved', 'Rejected'];

interface StatusFilterDropdownProps {
  isOpen: boolean;
  selectedStatuses: string[];
  onToggleAll: () => void;
  onToggleStatus: (status: string) => void;
}

export function StatusFilterDropdown({
  isOpen,
  selectedStatuses,
  onToggleAll,
  onToggleStatus
}: StatusFilterDropdownProps) {
  if (!isOpen) return null;

  const isAllSelected = selectedStatuses.length === STATUS_OPTIONS.length;

  return (
    <div className="absolute right-10 top-full mt-1 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-xl z-50 py-2">
      <label className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer group">
        <div className="relative flex items-center justify-center mr-3">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onToggleAll}
            className="peer appearance-none w-5 h-5 border border-gray-300 rounded bg-white checked:bg-[#00C48C] checked:border-[#00C48C] transition-all duration-300 cursor-pointer"
          />
          <svg
            className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 peer-checked:scale-100 scale-50 transition-all duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span className="text-[14px] text-[#4B5563] normal-case group-hover:text-[#1F2937] transition-colors">All</span>
      </label>
      <div className="h-px bg-gray-100 my-1"></div>
      {STATUS_OPTIONS.map(status => (
        <label key={status} className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer group">
          <div className="relative flex items-center justify-center mr-3">
            <input
              type="checkbox"
              checked={selectedStatuses.includes(status)}
              onChange={() => onToggleStatus(status)}
              className="peer appearance-none w-5 h-5 border border-gray-300 rounded bg-white checked:bg-[#00C48C] checked:border-[#00C48C] transition-all duration-300 cursor-pointer"
            />
            <svg
              className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 peer-checked:scale-100 scale-50 transition-all duration-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span className="text-[14px] text-[#4B5563] normal-case group-hover:text-[#1F2937] transition-colors">
            {status === 'In Review' ? 'Review' : status}
          </span>
        </label>
      ))}
    </div>
  );
}
