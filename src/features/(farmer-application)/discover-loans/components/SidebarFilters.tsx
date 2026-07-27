import Button from '@/components/ui/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function SidebarFilters() {
  const [loanAmount, setLoanAmount] = useState<number>(350000);
  const [interestRate, setInterestRate] = useState<number>(12);
  const [selectedTenure, setSelectedTenure] = useState<string>('3 Mon');
  const [loanAmountOpen, setLoanAmountOpen] = useState(true);
  const [interestRateOpen, setInterestRateOpen] = useState(true);
  const [tenureOpen, setTenureOpen] = useState(true);
  const [loanTypesOpen, setLoanTypesOpen] = useState(true);
  const [regionsOpen, setRegionsOpen] = useState(true);

  const tenures = ['1 Mon', '2 Mon', '3 Mon', '6 Mon', '12 Mon'];

  const loanTypes = [
    'Input loan (seeds, agrochemicals)',
    'Agricultural term loan',
    'Smallholder short-term loan',
    'Land loan',
    'Farm equipment loan',
    'Smallholder farmer direct loan'
  ];

  const regions = [
    'Oromia',
    'Amhara',
    'Tigray',
    'South Ethiopia',
    'Central Ethiopia',
    'Gambela',
    'Sidama'
  ];

  return (
    <div className="h-fit bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5 border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <button className="text-sm font-bold text-[#16A34A] hover:text-green-700 transition-colors">
          Reset All
        </button>
      </div>

      <hr className="border-gray-200 -mx-6" />

      {/* Loan Amount */}
      <div>
        <button
          onClick={() => setLoanAmountOpen(!loanAmountOpen)}
          className={`flex items-center justify-between w-full group ${loanAmountOpen ? 'mb-4' : ''}`}
        >
          <h3 className="text-sm font-bold text-gray-900">Loan Amount</h3>
          <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center transition-colors group-hover:border-gray-300">
            {loanAmountOpen ? <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" /> : <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />}
          </div>
        </button>
        {loanAmountOpen && (
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
              <span>ETB<br />0</span>
              <span className="text-right">ETB<br />1,000,000</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000000"
              step="10000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #16A34A 0%, #16A34A ${(loanAmount / 1000000) * 100}%, #E5E7EB ${(loanAmount / 1000000) * 100}%, #E5E7EB 100%)`
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#16A34A]"
            />
            <div className="flex justify-center mt-3">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                ETB {loanAmount.toLocaleString('en-US')}
              </span>
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* Interest Rate */}
      <div>
        <button
          onClick={() => setInterestRateOpen(!interestRateOpen)}
          className={`flex items-center justify-between w-full group ${interestRateOpen ? 'mb-4' : ''}`}
        >
          <h3 className="text-sm font-bold text-gray-900">Interest Rate</h3>
          <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center transition-colors group-hover:border-gray-300">
            {interestRateOpen ? <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" /> : <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />}
          </div>
        </button>
        {interestRateOpen && (
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
              <span>5%</span>
              <span>20%</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="0.5"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #16A34A 0%, #16A34A ${((interestRate - 5) / 15) * 100}%, #E5E7EB ${((interestRate - 5) / 15) * 100}%, #E5E7EB 100%)`
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#16A34A]"
            />
            <div className="flex justify-center mt-3">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                {interestRate}%
              </span>
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* Tenure */}
      <div>
        <button
          onClick={() => setTenureOpen(!tenureOpen)}
          className={`flex items-center justify-between w-full group ${tenureOpen ? 'mb-4' : ''}`}
        >
          <h3 className="text-sm font-bold text-gray-900">Tenure</h3>
          <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center transition-colors group-hover:border-gray-300">
            {tenureOpen ? <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" /> : <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />}
          </div>
        </button>
        {tenureOpen && (
          <div className="flex flex-wrap gap-2">
            {tenures.map(tenure => (
              <button
                key={tenure}
                onClick={() => setSelectedTenure(tenure)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${selectedTenure === tenure
                  ? 'bg-green-100 text-green-900 border-green-300'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {tenure}
              </button>
            ))}
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* Loan Type */}
      <div>
        <button
          onClick={() => setLoanTypesOpen(!loanTypesOpen)}
          className={`flex items-center justify-between w-full group ${loanTypesOpen ? 'mb-4' : ''}`}
        >
          <h3 className="text-sm font-bold text-gray-900">Loan Type</h3>
          <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center transition-colors group-hover:border-gray-300">
            {loanTypesOpen ? <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" /> : <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />}
          </div>
        </button>
        {loanTypesOpen && (
          <div className="flex flex-col gap-3">
            {loanTypes.map(type => (
              <label key={type} className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-5 h-5 border border-gray-300 rounded peer-checked:bg-[#16A34A] peer-checked:border-[#16A34A] group-hover:border-[#16A34A] transition-all duration-200"></div>
                  <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 peer-checked:scale-100 scale-50 transition-all duration-200 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-[15px] font-medium  text-gray-600 group-hover:text-gray-900 transition-colors leading-tight">
                  {type}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* Region */}
      <div>
        <button
          onClick={() => setRegionsOpen(!regionsOpen)}
          className={`flex items-center justify-between w-full group ${regionsOpen ? 'mb-4' : ''}`}
        >
          <h3 className="text-sm font-bold text-gray-900">Region</h3>
          <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center transition-colors group-hover:border-gray-300">
            {regionsOpen ? <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" /> : <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />}
          </div>
        </button>
        {regionsOpen && (
          <div className="flex flex-col gap-3">
            {regions.map(region => (
              <label key={region} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center shrink-0">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-5 h-5 border border-gray-300 rounded peer-checked:bg-[#16A34A] peer-checked:border-[#16A34A] group-hover:border-[#16A34A] transition-all duration-200"></div>
                  <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 peer-checked:scale-100 scale-50 transition-all duration-200 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-[16px] font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  {region}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Apply Button */}
      <div className="pt-2">
        <Button className="w-full text-[15px]" size="lg">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
