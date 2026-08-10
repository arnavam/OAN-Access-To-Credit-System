import AvailableLoanTypes from './components/AvailableLoanTypes';
import FarmerProfileCard from './components/FarmerProfileCard';
import HarvestRecordsTable from './components/HarvestRecordsTable';
import RecentApplicationsList from './components/RecentApplicationsList';
import TopLoanOffersCard from './components/TopLoanOffersCard';

export default function FarmerDashboard() {
  return (
    <div className="space-y-6">

      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FarmerProfileCard />
        </div>
        <div className="lg:col-span-1">
          <TopLoanOffersCard />
        </div>
      </div>

      {/* Middle Row */}
      <AvailableLoanTypes />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HarvestRecordsTable />
        </div>
        <div className="lg:col-span-1">
          <RecentApplicationsList />
        </div>
      </div>

    </div>
  );
}
