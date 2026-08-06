'use client';

import { ChevronDown, Flower, Leaf, TrendingDown, TrendingUp, Wheat } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CropFilter from './CropFilter';
import GradeFilter from './GradeFilter';

export default function HarvestRecordsTable() {
  const allRecords = Array.from({ length: 25 }, (_, i) => {
    const isMaize = i % 2 === 0;
    return {
      id: i + 1,
      year: isMaize ? '2023/24' : '2022/23',
      crop: isMaize ? 'Maize' : 'Sorghum',
      icon: isMaize ? <Leaf className="w-4 h-4 text-green-600" /> : <Wheat className="w-4 h-4 text-orange-600" />,
      yieldVal: isMaize ? (4.0 + (i % 5) * 0.2).toFixed(1) : (3.0 + (i % 4) * 0.1).toFixed(1),
      trend: isMaize ? 'up' : 'down',
      grade: isMaize ? (i % 3 === 0 ? 'A' : 'A -') : (i % 3 === 0 ? 'B +' : 'B'),
      gradeColor: isMaize ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
    };
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isPaginationOpen, setIsPaginationOpen] = useState(false);
  const paginationRef = useRef<HTMLDivElement>(null);

  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (paginationRef.current && !paginationRef.current.contains(event.target as Node)) {
        setIsPaginationOpen(false);
      }
    }
    if (isPaginationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPaginationOpen]);

  const filteredRecords = allRecords.filter(record => {
    const cropMatch = selectedCrops.length === 0 || selectedCrops.includes(record.crop);
    const gradeMatch = selectedGrades.length === 0 || selectedGrades.includes(record.grade);
    return cropMatch && gradeMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all">
      <div className="px-6 py-6 border-b border-gray-200 flex items-center min-h-[72px]">
        <h3 className="text-lg font-bold text-gray-900">Harvest Records</h3>
      </div>

      <div className="flex-1 overflow-x-auto min-h-[340px]">
        <table className="w-full text-left border-collapse min-w-[600px] table-fixed">
          <thead className="bg-[#F8FAFC]">
            <tr className="border-b border-gray-100">
              <th className="py-4 px-6 text-xs font-bold text-gray-500 w-[15%] whitespace-nowrap">S. No.</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 w-[20%]">Year</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 w-[25%]">
                <CropFilter
                  selectedCrops={selectedCrops}
                  onChange={(selected) => {
                    setSelectedCrops(selected);
                    setCurrentPage(1);
                  }}
                />
              </th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 w-[20%]">Yield</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 w-[20%]">
                <GradeFilter
                  selectedGrades={selectedGrades}
                  onChange={(selected) => {
                    setSelectedGrades(selected);
                    setCurrentPage(1);
                  }}
                />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">{row.id}</td>
                  <td className="py-4 px-6 text-sm text-gray-900 font-medium">{row.year}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${row.gradeColor.includes('green') ? 'bg-green-50' : 'bg-orange-50'}`}>
                        {row.icon}
                      </div>
                      {row.crop}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    <div className="flex items-center gap-1.5 font-bold">
                      {row.yieldVal} <span className="font-normal text-gray-400 text-xs">t/ha</span>
                      {row.trend === 'up' ? (
                        <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-orange-500" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold min-w-[36px] ${row.gradeColor}`}>
                      {row.grade}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="h-[265px] text-center border-b-0 align-middle">
                  <div className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                    <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                      <Flower className="w-8 h-8 text-pink-500 animate-[spin_4s_linear_infinite]" />
                    </div>
                    <p className="text-gray-900 font-bold text-base mb-1">No harvest records found</p>
                    <p className="text-gray-500 text-sm max-w-[250px] mx-auto">
                      We couldn't find any data matching your current filters.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredRecords.length > 0 && (
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
            Showing
            <div className="relative" ref={paginationRef}>
              <button
                onClick={() => setIsPaginationOpen(!isPaginationOpen)}
                className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white hover:border-gray-300 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 font-medium"
              >
                {itemsPerPage}
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isPaginationOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPaginationOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-full min-w-[70px] bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {[5, 10, 20].map(val => (
                    <div
                      key={val}
                      onClick={() => {
                        setItemsPerPage(val);
                        setCurrentPage(1);
                        setIsPaginationOpen(false);
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center ${val === itemsPerPage ? 'text-[#16A34A] font-bold bg-[#16A34A]/5' : 'text-gray-700 font-medium'}`}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              )}
            </div>
            of {filteredRecords.length} entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors rounded"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${currentPage === page
                  ? 'bg-[#16A34A] text-white font-bold shadow-sm'
                  : 'hover:bg-gray-100 text-gray-600 font-bold'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
